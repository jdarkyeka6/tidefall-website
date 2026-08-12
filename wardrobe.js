const MODERATION_DAYS = 30;
const RECENTLY_DELETED_DAYS = 30;
const BUCKET = 'wardrobe-private';
const sb = window.tidefallSupabase;

const camera = document.getElementById('camera');
const cameraStage = document.getElementById('cameraStage');
const arCanvas = document.getElementById('arCanvas');
const trackingBadge = document.getElementById('trackingBadge');
const startCameraBtn = document.getElementById('startCamera');
const captureBtn = document.getElementById('capturePhoto');
const cameraStatus = document.getElementById('cameraStatus');
const cameraPlaceholder = document.getElementById('cameraPlaceholder');
const captureCanvas = document.getElementById('captureCanvas');
const gallery = document.getElementById('gallery');
const emptyGallery = document.getElementById('emptyGallery');
const toast = document.getElementById('wardrobeToast');
const authGateTitle = document.getElementById('authGateTitle');
const authGateText = document.getElementById('authGateText');
const accountLink = document.getElementById('accountLink');

let stream = null;
let currentGallery = 'active';
let currentOutfit = 'brannor';
let currentUser = null;
let poseLandmarker = null;
let poseInitPromise = null;
let latestPose = null;
let smoothedPose = null;
let lastPoseAt = 0;
let lastDetectAt = 0;
let lastVideoTime = -1;
let trackingRaf = 0;

const outfitStyles = {
  brannor: { top: '#1d536d', bottom: '#081d2a', trim: '#a9e1ee', detail: '#d9f3f8', name: 'BRANNOR' },
  riptide: { top: '#1594b1', bottom: '#06313f', trim: '#d5f8ff', detail: '#74d8ea', name: 'RIPTIDE' },
  proving: { top: '#566179', bottom: '#151a24', trim: '#b2bdd6', detail: '#7f8fac', name: 'PROVING' }
};

function addDays(dateLike, days) {
  return new Date(dateLike).getTime() + days * 86400000;
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__wardrobeToast);
  window.__wardrobeToast = setTimeout(() => toast.classList.remove('show'), 2800);
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit'
  }).format(new Date(value));
}

function daysRemaining(value) {
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86400000));
}

function syncTabs() {
  document.querySelectorAll('.gallery-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.gallery === currentGallery);
  });
}

async function refreshAuth() {
  const { data: { user } } = await sb.auth.getUser();
  currentUser = user || null;
  startCameraBtn.disabled = false;
  if (stream) captureBtn.disabled = false;

  if (currentUser) {
    authGateTitle.textContent = 'Signed in';
    authGateText.textContent = currentUser.email
      ? `Photos will save privately to ${currentUser.email}`
      : 'Photos will save privately to your Tidefall account.';
    accountLink.textContent = 'My Account';
    emptyGallery.textContent = 'No photos here yet.';
  } else {
    authGateTitle.textContent = 'Camera ready';
    authGateText.innerHTML = 'You can try the Wardrobe without an account. <a href="account.html" style="color:#fff;text-decoration:underline">Sign in or create an account</a> to save photos to your Camera Roll.';
    accountLink.textContent = 'Sign In';
    emptyGallery.textContent = 'Sign in to load your Camera Roll.';
  }

  await renderGallery();
}

async function initPoseTracker() {
  if (poseLandmarker) return poseLandmarker;
  if (poseInitPromise) return poseInitPromise;

  poseInitPromise = (async () => {
    const { FilesetResolver, PoseLandmarker } = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/+esm');
    const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
    const options = {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numPoses: 1,
      minPoseDetectionConfidence: 0.55,
      minPosePresenceConfidence: 0.55,
      minTrackingConfidence: 0.55
    };

    try {
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, options);
    } catch (gpuError) {
      options.baseOptions.delegate = 'CPU';
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, options);
    }
    return poseLandmarker;
  })();

  try {
    return await poseInitPromise;
  } catch (error) {
    poseInitPromise = null;
    throw error;
  }
}

function setTrackingBadge(text, locked = false) {
  trackingBadge.textContent = text;
  trackingBadge.classList.add('show');
  trackingBadge.classList.toggle('locked', locked);
}

function stopCamera() {
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null;
  camera.srcObject = null;
  cameraPlaceholder.classList.remove('hidden');
  captureBtn.disabled = true;
  startCameraBtn.textContent = 'Start Camera';
  latestPose = null;
  smoothedPose = null;
  trackingBadge.classList.remove('show', 'locked');
  if (trackingRaf) cancelAnimationFrame(trackingRaf);
  trackingRaf = 0;
  const ctx = arCanvas.getContext('2d');
  ctx.clearRect(0, 0, arCanvas.width, arCanvas.height);
}

async function startCamera() {
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera is not supported in this browser.');

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1600 } },
      audio: false
    });
    camera.srcObject = stream;
    await camera.play().catch(() => {});
    cameraPlaceholder.classList.add('hidden');
    captureBtn.disabled = false;
    startCameraBtn.textContent = 'Camera On';
    setTrackingBadge('Loading body tracking…');
    cameraStatus.textContent = 'Camera ready. Loading body tracking…';

    try {
      await initPoseTracker();
      cameraStatus.textContent = 'Body tracking ready. Keep your shoulders and hips visible for the best fit.';
      startTrackingLoop();
    } catch (trackingError) {
      console.error('Pose tracking failed:', trackingError);
      setTrackingBadge('Body tracking unavailable');
      cameraStatus.textContent = 'Camera works, but body tracking could not load. Refresh and try again.';
    }
  } catch (error) {
    console.error(error);
    cameraStatus.textContent = 'Camera access was blocked or unavailable. Check the camera permission beside the address bar and try again.';
    showToast('Camera could not start.');
  }
}

function smoothLandmarks(next) {
  if (!smoothedPose || smoothedPose.length !== next.length) {
    smoothedPose = next.map(point => ({ ...point }));
    return;
  }
  const alpha = 0.38;
  smoothedPose = next.map((point, i) => ({
    ...point,
    x: smoothedPose[i].x + (point.x - smoothedPose[i].x) * alpha,
    y: smoothedPose[i].y + (point.y - smoothedPose[i].y) * alpha,
    z: smoothedPose[i].z + (point.z - smoothedPose[i].z) * alpha
  }));
}

function poseUsable(pose) {
  if (!pose) return false;
  const required = [11, 12, 23, 24];
  return required.every(i => pose[i] && (pose[i].visibility ?? 1) > 0.42);
}

function resizeArCanvas() {
  const width = Math.max(1, Math.round(cameraStage.clientWidth));
  const height = Math.max(1, Math.round(cameraStage.clientHeight));
  if (arCanvas.width !== width || arCanvas.height !== height) {
    arCanvas.width = width;
    arCanvas.height = height;
  }
}

function videoPoint(landmark) {
  const destW = arCanvas.width;
  const destH = arCanvas.height;
  const srcW = camera.videoWidth || destW;
  const srcH = camera.videoHeight || destH;
  const scale = Math.max(destW / srcW, destH / srcH);
  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const offsetX = (destW - drawW) / 2;
  const offsetY = (destH - drawH) / 2;
  return {
    x: offsetX + (1 - landmark.x) * drawW,
    y: offsetY + landmark.y * drawH
  };
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function length(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function along(a, b, amount) {
  return { x: a.x + (b.x - a.x) * amount, y: a.y + (b.y - a.y) * amount };
}

function outward(point, centre, amount) {
  const dx = point.x - centre.x;
  const dy = point.y - centre.y;
  const mag = Math.hypot(dx, dy) || 1;
  return { x: point.x + dx / mag * amount, y: point.y + dy / mag * amount };
}

function sleevePolygon(shoulder, elbow, centre, shoulderWidth) {
  const end = along(shoulder, elbow, 0.42);
  const dx = end.x - shoulder.x;
  const dy = end.y - shoulder.y;
  const mag = Math.hypot(dx, dy) || 1;
  const px = -dy / mag;
  const py = dx / mag;
  const widthTop = shoulderWidth * 0.16;
  const widthEnd = shoulderWidth * 0.125;
  const outerShoulder = outward(shoulder, centre, shoulderWidth * 0.12);
  return [
    { x: outerShoulder.x + px * widthTop, y: outerShoulder.y + py * widthTop },
    { x: outerShoulder.x - px * widthTop, y: outerShoulder.y - py * widthTop },
    { x: end.x - px * widthEnd, y: end.y - py * widthEnd },
    { x: end.x + px * widthEnd, y: end.y + py * widthEnd }
  ];
}

function pathPolygon(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
}

function drawGarment(ctx, pose, pointMapper, outfitName = currentOutfit) {
  if (!poseUsable(pose)) return false;

  const style = outfitStyles[outfitName] || outfitStyles.brannor;
  const leftShoulder = pointMapper(pose[11]);
  const rightShoulder = pointMapper(pose[12]);
  const leftHip = pointMapper(pose[23]);
  const rightHip = pointMapper(pose[24]);
  const leftElbow = pose[13] ? pointMapper(pose[13]) : leftHip;
  const rightElbow = pose[14] ? pointMapper(pose[14]) : rightHip;
  const shoulderCentre = midpoint(leftShoulder, rightShoulder);
  const hipCentre = midpoint(leftHip, rightHip);
  const shoulderWidth = length(leftShoulder, rightShoulder);
  const torsoLength = length(shoulderCentre, hipCentre);

  if (shoulderWidth < 20 || torsoLength < 25) return false;

  const leftOuter = outward(leftShoulder, shoulderCentre, shoulderWidth * 0.15);
  const rightOuter = outward(rightShoulder, shoulderCentre, shoulderWidth * 0.15);
  const leftHipOuter = outward(leftHip, hipCentre, shoulderWidth * 0.07);
  const rightHipOuter = outward(rightHip, hipCentre, shoulderWidth * 0.07);
  const hemDrop = torsoLength * 0.12;
  const torso = [
    leftOuter,
    rightOuter,
    { x: rightHipOuter.x, y: rightHipOuter.y + hemDrop },
    { x: leftHipOuter.x, y: leftHipOuter.y + hemDrop }
  ];

  const gradient = ctx.createLinearGradient(shoulderCentre.x, shoulderCentre.y, hipCentre.x, hipCentre.y + hemDrop);
  gradient.addColorStop(0, style.top);
  gradient.addColorStop(1, style.bottom);

  ctx.save();
  ctx.globalAlpha = 0.94;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const sleeves = [
    sleevePolygon(leftShoulder, leftElbow, shoulderCentre, shoulderWidth),
    sleevePolygon(rightShoulder, rightElbow, shoulderCentre, shoulderWidth)
  ];
  for (const sleeve of sleeves) {
    pathPolygon(ctx, sleeve);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = style.trim;
    ctx.lineWidth = Math.max(1.4, shoulderWidth * 0.012);
    ctx.stroke();
  }

  pathPolygon(ctx, torso);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = style.trim;
  ctx.lineWidth = Math.max(1.6, shoulderWidth * 0.014);
  ctx.stroke();

  const neckWidth = shoulderWidth * 0.19;
  const neckDepth = torsoLength * 0.11;
  ctx.beginPath();
  ctx.moveTo(shoulderCentre.x - neckWidth, shoulderCentre.y + torsoLength * 0.015);
  ctx.quadraticCurveTo(shoulderCentre.x, shoulderCentre.y + neckDepth, shoulderCentre.x + neckWidth, shoulderCentre.y + torsoLength * 0.015);
  ctx.strokeStyle = style.detail;
  ctx.lineWidth = Math.max(2, shoulderWidth * 0.022);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(shoulderCentre.x, shoulderCentre.y + neckDepth * 1.3);
  ctx.lineTo(hipCentre.x, hipCentre.y + hemDrop * 0.7);
  ctx.strokeStyle = style.detail;
  ctx.globalAlpha = 0.38;
  ctx.lineWidth = Math.max(1, shoulderWidth * 0.009);
  ctx.stroke();

  ctx.globalAlpha = 0.9;
  const badgeX = shoulderCentre.x - shoulderWidth * 0.19;
  const badgeY = shoulderCentre.y + torsoLength * 0.28;
  const badgeR = Math.max(5, shoulderWidth * 0.045);
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
  ctx.strokeStyle = style.detail;
  ctx.lineWidth = Math.max(1.4, shoulderWidth * 0.012);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, badgeR * 0.45, Math.PI * 0.1, Math.PI * 1.5);
  ctx.stroke();

  ctx.font = `700 ${Math.max(9, shoulderWidth * 0.055)}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = style.detail;
  ctx.globalAlpha = 0.78;
  ctx.fillText(style.name, shoulderCentre.x + shoulderWidth * 0.1, shoulderCentre.y + torsoLength * 0.58);

  ctx.restore();
  return true;
}

function renderArFrame() {
  resizeArCanvas();
  const ctx = arCanvas.getContext('2d');
  ctx.clearRect(0, 0, arCanvas.width, arCanvas.height);

  if (smoothedPose && poseUsable(smoothedPose) && Date.now() - lastPoseAt < 650) {
    drawGarment(ctx, smoothedPose, videoPoint, currentOutfit);
    setTrackingBadge('Body locked', true);
  } else if (stream && poseLandmarker) {
    setTrackingBadge('Step back: show shoulders + hips');
  }
}

function startTrackingLoop() {
  if (trackingRaf) cancelAnimationFrame(trackingRaf);

  const loop = () => {
    if (!stream) return;
    const now = performance.now();

    if (poseLandmarker && camera.readyState >= 2 && camera.currentTime !== lastVideoTime && now - lastDetectAt > 65) {
      try {
        const result = poseLandmarker.detectForVideo(camera, now);
        lastVideoTime = camera.currentTime;
        lastDetectAt = now;
        const pose = result?.landmarks?.[0];
        if (pose && poseUsable(pose)) {
          latestPose = pose;
          smoothLandmarks(pose);
          lastPoseAt = Date.now();
        }
      } catch (error) {
        console.warn('Pose frame failed:', error);
      }
    }

    renderArFrame();
    trackingRaf = requestAnimationFrame(loop);
  };

  trackingRaf = requestAnimationFrame(loop);
}

async function uploadPhotoBlob(blob) {
  const photoId = crypto.randomUUID();
  const path = `${currentUser.id}/${photoId}.jpg`;
  const { error: uploadError } = await sb.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/jpeg', upsert: false, cacheControl: '3600'
  });
  if (uploadError) throw uploadError;

  const { error: rowError } = await sb.from('wardrobe_photos').insert({
    id: photoId,
    user_id: currentUser.id,
    storage_path: path,
    outfit: currentOutfit,
    state: 'active',
    posted: false
  });
  if (rowError) {
    await sb.storage.from(BUCKET).remove([path]);
    throw rowError;
  }
  return photoId;
}

async function capturePhoto() {
  if (!stream || !camera.videoWidth) return;
  if (!smoothedPose || !poseUsable(smoothedPose) || Date.now() - lastPoseAt > 800) {
    showToast('Move back until your shoulders and hips are visible.');
    return;
  }
  if (!currentUser) {
    showToast('Sign in to save photos to your Camera Roll.');
    location.href = 'account.html?return=wardrobe.html';
    return;
  }

  captureBtn.disabled = true;
  cameraStatus.textContent = 'Saving securely…';
  try {
    const width = camera.videoWidth;
    const height = camera.videoHeight;
    captureCanvas.width = width;
    captureCanvas.height = height;
    const ctx = captureCanvas.getContext('2d');

    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(camera, 0, 0, width, height);
    ctx.restore();

    drawGarment(ctx, smoothedPose, landmark => ({
      x: (1 - landmark.x) * width,
      y: landmark.y * height
    }), currentOutfit);

    const blob = await new Promise(resolve => captureCanvas.toBlob(resolve, 'image/jpeg', 0.92));
    if (!blob) throw new Error('Could not create photo.');
    await uploadPhotoBlob(blob);
    currentGallery = 'active';
    syncTabs();
    await renderGallery();
    showToast('Saved privately to your Tidefall Camera Roll.');
  } catch (error) {
    console.error(error);
    showToast(`Save failed: ${error.message || 'unknown error'}`);
  } finally {
    captureBtn.disabled = !stream;
    cameraStatus.textContent = 'Body tracking ready. Captured photos are stored privately in your Tidefall account.';
  }
}

async function getPhotos() {
  if (!currentUser) return [];
  const wantedState = currentGallery === 'active' ? 'active' : 'recently_deleted';
  const { data, error } = await sb.from('wardrobe_photos')
    .select('*')
    .eq('state', wantedState)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function signedPhotoUrl(path) {
  const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

async function moveToRecentlyDeleted(photo) {
  const { error } = await sb.from('wardrobe_photos').update({
    state: 'recently_deleted',
    deleted_at: new Date().toISOString(),
    posted: false
  }).eq('id', photo.id);
  if (error) return showToast(error.message);
  await renderGallery();
  showToast('Moved to Recently Deleted.');
}

async function restorePhoto(photo) {
  const { error } = await sb.from('wardrobe_photos').update({
    state: 'active',
    deleted_at: null,
    posted: false
  }).eq('id', photo.id);
  if (error) return showToast(error.message);
  await renderGallery();
  showToast('Photo restored. Moderation clock reset to 30 days.');
}

async function markForShare(photo) {
  const { error } = await sb.from('wardrobe_photos').update({ posted: true }).eq('id', photo.id);
  if (error) return showToast(error.message);
  await renderGallery();
  showToast('Marked for sharing. Public Tidefall posts are the next moderation layer.');
}

async function permanentlyDelete(photo) {
  const { error: storageError } = await sb.storage.from(BUCKET).remove([photo.storage_path]);
  if (storageError) return showToast(storageError.message);
  const { error: rowError } = await sb.from('wardrobe_photos').delete().eq('id', photo.id);
  if (rowError) return showToast(rowError.message);
  await renderGallery();
  showToast('Photo permanently deleted.');
}

async function purgeExpired() {
  if (!currentUser) return;
  const cutoff = new Date(Date.now() - RECENTLY_DELETED_DAYS * 86400000).toISOString();
  const { data, error } = await sb.from('wardrobe_photos')
    .select('id,storage_path,deleted_at')
    .eq('state', 'recently_deleted')
    .lt('deleted_at', cutoff);
  if (error || !data?.length) return;
  for (const photo of data) {
    const { error: storageError } = await sb.storage.from(BUCKET).remove([photo.storage_path]);
    if (!storageError) await sb.from('wardrobe_photos').delete().eq('id', photo.id);
  }
}

async function renderGallery() {
  gallery.innerHTML = '';
  if (!currentUser) {
    emptyGallery.classList.add('show');
    return;
  }
  emptyGallery.classList.remove('show');

  try {
    await purgeExpired();
    const photos = await getPhotos();
    emptyGallery.classList.toggle('show', photos.length === 0);
    if (!photos.length) return;

    for (const photo of photos) {
      const card = document.createElement('article');
      card.className = 'photo-card';
      const img = document.createElement('img');
      img.alt = 'Tidefall Wardrobe photo';
      img.src = await signedPhotoUrl(photo.storage_path);

      let stateText;
      if (photo.state === 'recently_deleted') {
        const purgeAt = addDays(photo.deleted_at, RECENTLY_DELETED_DAYS);
        stateText = `Recently Deleted · ${daysRemaining(purgeAt)} days until permanent deletion`;
      } else if (Date.now() <= new Date(photo.moderation_until).getTime()) {
        stateText = `Moderation storage · ${daysRemaining(photo.moderation_until)} days remaining`;
      } else {
        stateText = 'Private gallery storage';
      }

      const meta = document.createElement('div');
      meta.className = 'photo-meta';
      const title = photo.outfit === 'riptide' ? 'Riptide' : photo.outfit === 'proving' ? 'Proving Ground' : 'Brannor';
      meta.innerHTML = `<strong>${title}</strong><small>${formatDate(photo.created_at)}<br>${stateText}</small><div class="photo-actions"></div>`;
      const actions = meta.querySelector('.photo-actions');

      if (photo.state === 'active') {
        const post = document.createElement('button');
        post.textContent = photo.posted ? 'Post queued' : 'Post';
        post.disabled = photo.posted;
        post.onclick = () => markForShare(photo);
        const remove = document.createElement('button');
        remove.className = 'danger';
        remove.textContent = 'Delete';
        remove.onclick = () => moveToRecentlyDeleted(photo);
        actions.append(post, remove);
      } else {
        const restore = document.createElement('button');
        restore.textContent = 'Restore';
        restore.onclick = () => restorePhoto(photo);
        const remove = document.createElement('button');
        remove.className = 'danger';
        remove.textContent = 'Delete Permanently';
        remove.onclick = () => permanentlyDelete(photo);
        actions.append(restore, remove);
      }

      card.append(img, meta);
      gallery.appendChild(card);
    }
  } catch (error) {
    console.error(error);
    emptyGallery.textContent = 'Could not load your Camera Roll.';
    emptyGallery.classList.add('show');
    showToast(error.message || 'Camera Roll failed to load.');
  }
}

startCameraBtn.addEventListener('click', startCamera);
captureBtn.addEventListener('click', capturePhoto);

document.querySelectorAll('.outfit-choice').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.outfit-choice').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    currentOutfit = button.dataset.outfit;
    renderArFrame();
  });
});

document.querySelectorAll('.gallery-tab').forEach(tab => {
  tab.addEventListener('click', async () => {
    currentGallery = tab.dataset.gallery;
    syncTabs();
    await renderGallery();
  });
});

window.addEventListener('resize', renderArFrame);
sb.auth.onAuthStateChange(() => refreshAuth());
window.addEventListener('beforeunload', stopCamera);
refreshAuth();
