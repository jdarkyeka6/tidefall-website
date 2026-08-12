const MODERATION_DAYS = 30;
const RECENTLY_DELETED_DAYS = 30;
const BUCKET = 'wardrobe-private';
const sb = window.tidefallSupabase;

const camera = document.getElementById('camera');
const startCameraBtn = document.getElementById('startCamera');
const captureBtn = document.getElementById('capturePhoto');
const cameraStatus = document.getElementById('cameraStatus');
const cameraPlaceholder = document.getElementById('cameraPlaceholder');
const captureCanvas = document.getElementById('captureCanvas');
const gallery = document.getElementById('gallery');
const emptyGallery = document.getElementById('emptyGallery');
const toast = document.getElementById('wardrobeToast');
const outfitOverlay = document.getElementById('outfitOverlay');
const outfitLabel = document.getElementById('outfitLabel');
const authGateTitle = document.getElementById('authGateTitle');
const authGateText = document.getElementById('authGateText');
const accountLink = document.getElementById('accountLink');

let stream = null;
let currentGallery = 'active';
let currentOutfit = 'brannor';
let currentUser = null;

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
  const signedIn = !!currentUser;
  startCameraBtn.disabled = !signedIn;
  if (!signedIn) captureBtn.disabled = true;

  if (signedIn) {
    authGateTitle.textContent = 'Signed in';
    authGateText.textContent = currentUser.email ? `Camera Roll syncing to ${currentUser.email}` : 'Camera Roll syncing to your Tidefall account.';
    accountLink.textContent = 'My Account';
    emptyGallery.textContent = 'No photos here yet.';
  } else {
    authGateTitle.textContent = 'Sign in required';
    authGateText.innerHTML = 'Your Camera Roll is private and tied to your Tidefall account. <a href="account.html" style="color:#fff;text-decoration:underline">Sign in or create an account</a>.';
    accountLink.textContent = 'Sign In';
    emptyGallery.textContent = 'Sign in to load your Camera Roll.';
    stopCamera();
  }

  await renderGallery();
}

function stopCamera() {
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null;
  camera.srcObject = null;
  cameraPlaceholder.classList.remove('hidden');
  captureBtn.disabled = true;
  startCameraBtn.textContent = 'Start Camera';
}

async function startCamera() {
  if (!currentUser) {
    location.href = 'account.html';
    return;
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1600 } },
      audio: false
    });
    camera.srcObject = stream;
    cameraPlaceholder.classList.add('hidden');
    captureBtn.disabled = false;
    startCameraBtn.textContent = 'Camera On';
    cameraStatus.textContent = 'Live camera stays on this device. Captured photos are uploaded privately to your Tidefall Camera Roll.';
  } catch (error) {
    cameraStatus.textContent = 'Camera access was blocked or unavailable.';
    showToast('Camera could not start.');
  }
}

function drawOutfit(ctx, width, height) {
  const cx = width / 2;
  const top = height * .49;
  const bodyW = width * .39;
  const bodyH = height * .39;
  const palettes = {
    brannor: ['#173b52', '#081923'],
    riptide: ['#167d98', '#052c3b'],
    proving: ['#474e60', '#151922']
  };
  const [topColour, bottomColour] = palettes[currentOutfit] || palettes.brannor;
  const gradient = ctx.createLinearGradient(cx, top, cx, top + bodyH);
  gradient.addColorStop(0, topColour);
  gradient.addColorStop(1, bottomColour);
  ctx.save();
  ctx.globalAlpha = .78;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(cx - bodyW * .68, top, bodyW * 1.36, bodyH * .25, 40);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(cx - bodyW / 2, top + bodyH * .08, bodyW, bodyH, 42);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.35)';
  ctx.lineWidth = Math.max(2, width * .003);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.font = `700 ${Math.max(18, width * .025)}px Georgia`;
  ctx.textAlign = 'center';
  ctx.fillText(outfitLabel.textContent, cx, top + bodyH * .58);
  ctx.restore();
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
  if (!currentUser || !stream || !camera.videoWidth) return;
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
    drawOutfit(ctx, width, height);
    const blob = await new Promise(resolve => captureCanvas.toBlob(resolve, 'image/jpeg', .9));
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
    cameraStatus.textContent = 'Live camera stays on this device. Captured photos are stored privately in your Tidefall account.';
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
    outfitOverlay.className = `outfit-overlay outfit-${currentOutfit}`;
    outfitLabel.textContent = button.dataset.label;
  });
});

document.querySelectorAll('.gallery-tab').forEach(tab => {
  tab.addEventListener('click', async () => {
    currentGallery = tab.dataset.gallery;
    syncTabs();
    await renderGallery();
  });
});

sb.auth.onAuthStateChange(() => refreshAuth());
window.addEventListener('beforeunload', stopCamera);
refreshAuth();
