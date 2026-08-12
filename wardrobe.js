const DB_NAME = "tidefall-wardrobe";
const DB_VERSION = 1;
const STORE = "photos";
const MODERATION_DAYS = 30;
const RECENTLY_DELETED_DAYS = 30;

const camera = document.getElementById("camera");
const startCameraBtn = document.getElementById("startCamera");
const captureBtn = document.getElementById("capturePhoto");
const cameraStatus = document.getElementById("cameraStatus");
const cameraPlaceholder = document.getElementById("cameraPlaceholder");
const captureCanvas = document.getElementById("captureCanvas");
const gallery = document.getElementById("gallery");
const emptyGallery = document.getElementById("emptyGallery");
const toast = document.getElementById("wardrobeToast");
const outfitOverlay = document.getElementById("outfitOverlay");
const outfitLabel = document.getElementById("outfitLabel");

let stream = null;
let currentGallery = "active";
let currentOutfit = "brannor";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("state", "state", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore(mode, callback) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const result = callback(store);
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function getAllPhotos() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function putPhoto(photo) {
  return withStore("readwrite", store => store.put(photo));
}

async function deletePhotoPermanently(id) {
  return withStore("readwrite", store => store.delete(id));
}

function addDays(timestamp, days) {
  return timestamp + days * 24 * 60 * 60 * 1000;
}

function resetModeration(photo) {
  const now = Date.now();
  photo.updatedAt = now;
  photo.moderationUntil = addDays(now, MODERATION_DAYS);
  return photo;
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__wardrobeToast);
  window.__wardrobeToast = setTimeout(() => toast.classList.remove("show"), 2600);
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

function daysRemaining(timestamp) {
  return Math.max(0, Math.ceil((timestamp - Date.now()) / (24 * 60 * 60 * 1000)));
}

async function housekeeping() {
  const photos = await getAllPhotos();
  const now = Date.now();
  for (const photo of photos) {
    if (photo.state === "recently_deleted" && photo.deletedAt && now > addDays(photo.deletedAt, RECENTLY_DELETED_DAYS)) {
      await deletePhotoPermanently(photo.id);
    }
  }
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1600 } },
      audio: false
    });
    camera.srcObject = stream;
    cameraPlaceholder.classList.add("hidden");
    captureBtn.disabled = false;
    startCameraBtn.textContent = "Camera On";
    cameraStatus.textContent = "Live camera stays in the browser. Press Take Photo to save a photo to your private Camera Roll.";
  } catch (error) {
    cameraStatus.textContent = "Camera access was blocked or unavailable.";
    showToast("Camera could not start.");
  }
}

function drawOutfit(ctx, width, height) {
  const cx = width / 2;
  const top = height * .49;
  const bodyW = width * .39;
  const bodyH = height * .39;

  const palettes = {
    brannor: ["#173b52", "#081923"],
    riptide: ["#167d98", "#052c3b"],
    proving: ["#474e60", "#151922"]
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
  ctx.strokeStyle = "rgba(255,255,255,.35)";
  ctx.lineWidth = Math.max(2, width * .003);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.font = `700 ${Math.max(18, width * .025)}px Georgia`;
  ctx.textAlign = "center";
  ctx.letterSpacing = "4px";
  ctx.fillText(outfitLabel.textContent, cx, top + bodyH * .58);
  ctx.restore();
}

async function capturePhoto() {
  if (!stream || !camera.videoWidth) return;

  const width = camera.videoWidth;
  const height = camera.videoHeight;
  captureCanvas.width = width;
  captureCanvas.height = height;
  const ctx = captureCanvas.getContext("2d");

  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(camera, 0, 0, width, height);
  ctx.restore();
  drawOutfit(ctx, width, height);

  const blob = await new Promise(resolve => captureCanvas.toBlob(resolve, "image/jpeg", .9));
  if (!blob) return;

  const now = Date.now();
  const photo = resetModeration({
    id: crypto.randomUUID(),
    blob,
    state: "active",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    outfit: currentOutfit,
    posted: false
  });

  await putPhoto(photo);
  currentGallery = "active";
  syncTabs();
  await renderGallery();
  showToast("Saved to your private Tidefall Camera Roll.");
}

async function moveToRecentlyDeleted(id) {
  const photos = await getAllPhotos();
  const photo = photos.find(item => item.id === id);
  if (!photo) return;
  photo.state = "recently_deleted";
  photo.deletedAt = Date.now();
  resetModeration(photo);
  await putPhoto(photo);
  await renderGallery();
  showToast("Moved to Recently Deleted.");
}

async function restorePhoto(id) {
  const photos = await getAllPhotos();
  const photo = photos.find(item => item.id === id);
  if (!photo) return;
  photo.state = "active";
  photo.deletedAt = null;
  resetModeration(photo);
  await putPhoto(photo);
  await renderGallery();
  showToast("Photo restored. 30-day moderation clock reset.");
}

async function markForShare(id) {
  const photos = await getAllPhotos();
  const photo = photos.find(item => item.id === id);
  if (!photo) return;
  photo.posted = true;
  resetModeration(photo);
  await putPhoto(photo);
  await renderGallery();
  showToast("Marked for posting. Public publishing will activate when the Tidefall server is connected.");
}

async function renderGallery() {
  await housekeeping();
  const photos = (await getAllPhotos())
    .filter(photo => currentGallery === "active" ? photo.state === "active" : photo.state === "recently_deleted")
    .sort((a, b) => b.updatedAt - a.updatedAt);

  gallery.innerHTML = "";
  emptyGallery.classList.toggle("show", photos.length === 0);

  for (const photo of photos) {
    const url = URL.createObjectURL(photo.blob);
    const card = document.createElement("article");
    card.className = "photo-card";

    let stateText;
    if (photo.state === "recently_deleted") {
      const purgeAt = addDays(photo.deletedAt, RECENTLY_DELETED_DAYS);
      stateText = `Recently Deleted · ${daysRemaining(purgeAt)} days until permanent deletion`;
    } else if (Date.now() <= photo.moderationUntil) {
      stateText = `Moderation storage · ${daysRemaining(photo.moderationUntil)} days remaining`;
    } else {
      stateText = "Private gallery storage";
    }

    card.innerHTML = `
      <img alt="Tidefall Wardrobe photo" />
      <div class="photo-meta">
        <strong>${photo.outfit === "riptide" ? "Riptide" : photo.outfit === "proving" ? "Proving Ground" : "Brannor"}</strong>
        <small>${formatDate(photo.createdAt)}<br>${stateText}</small>
        <div class="photo-actions"></div>
      </div>`;

    card.querySelector("img").src = url;
    card.querySelector("img").addEventListener("load", () => URL.revokeObjectURL(url), { once: true });
    const actions = card.querySelector(".photo-actions");

    if (photo.state === "active") {
      const post = document.createElement("button");
      post.textContent = photo.posted ? "Post queued" : "Post";
      post.disabled = photo.posted;
      post.addEventListener("click", () => markForShare(photo.id));

      const remove = document.createElement("button");
      remove.className = "danger";
      remove.textContent = "Delete";
      remove.addEventListener("click", () => moveToRecentlyDeleted(photo.id));
      actions.append(post, remove);
    } else {
      const restore = document.createElement("button");
      restore.textContent = "Restore";
      restore.addEventListener("click", () => restorePhoto(photo.id));

      const remove = document.createElement("button");
      remove.className = "danger";
      remove.textContent = "Delete Permanently";
      remove.addEventListener("click", async () => {
        await deletePhotoPermanently(photo.id);
        await renderGallery();
        showToast("Photo permanently deleted from this browser.");
      });
      actions.append(restore, remove);
    }

    gallery.appendChild(card);
  }
}

function syncTabs() {
  document.querySelectorAll(".gallery-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.gallery === currentGallery);
  });
}

startCameraBtn.addEventListener("click", startCamera);
captureBtn.addEventListener("click", capturePhoto);

document.querySelectorAll(".outfit-choice").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".outfit-choice").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    currentOutfit = button.dataset.outfit;
    outfitOverlay.className = `outfit-overlay outfit-${currentOutfit}`;
    outfitLabel.textContent = button.dataset.label;
  });
});

document.querySelectorAll(".gallery-tab").forEach(tab => {
  tab.addEventListener("click", async () => {
    currentGallery = tab.dataset.gallery;
    syncTabs();
    await renderGallery();
  });
});

window.addEventListener("beforeunload", () => {
  if (stream) stream.getTracks().forEach(track => track.stop());
});

renderGallery();
