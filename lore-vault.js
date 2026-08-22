const loginView = document.getElementById("loginView");
const vaultView = document.getElementById("vaultView");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("vaultPassword");
const loginError = document.getElementById("loginError");
const notes = document.getElementById("vaultNotes");
const categoryLabel = document.getElementById("categoryLabel");
const saveState = document.getElementById("saveState");
const saveButton = document.getElementById("saveButton");
const clearButton = document.getElementById("clearButton");
const logoutButton = document.getElementById("logoutButton");

let currentCategory = "canon";
const storageKey = category => `tidefall-vault:${category}`;

function showVault() {
  loginView.hidden = true;
  vaultView.hidden = false;
  loadCategory(currentCategory);
}

function showLogin() {
  vaultView.hidden = true;
  loginView.hidden = false;
  passwordInput.value = "";
  passwordInput.focus();
}

async function checkSession() {
  try {
    const response = await fetch("/api/lore-vault-session", { credentials: "same-origin" });
    if (response.ok) showVault();
  } catch (_) {}
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  loginError.textContent = "";
  const password = passwordInput.value;

  try {
    const response = await fetch("/api/lore-vault-login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      loginError.textContent = response.status === 429
        ? "Too many attempts. Try again shortly."
        : "Incorrect vault password.";
      return;
    }

    showVault();
  } catch (_) {
    loginError.textContent = "The vault server could not be reached.";
  }
});

function loadCategory(category) {
  currentCategory = category;
  categoryLabel.textContent = category.replace(/(^|[-_])\w/g, match => match.replace(/[-_]/, "").toUpperCase());
  notes.value = localStorage.getItem(storageKey(category)) || "";
  saveState.textContent = "Saved locally";
}

document.querySelectorAll(".vault-tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".vault-tab").forEach(tab => tab.classList.remove("active"));
    button.classList.add("active");
    loadCategory(button.dataset.category);
  });
});

saveButton.addEventListener("click", () => {
  localStorage.setItem(storageKey(currentCategory), notes.value);
  saveState.textContent = `Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
});

clearButton.addEventListener("click", () => {
  if (!confirm(`Clear the ${currentCategory} section from this browser?`)) return;
  localStorage.removeItem(storageKey(currentCategory));
  notes.value = "";
  saveState.textContent = "Section cleared";
});

logoutButton.addEventListener("click", async () => {
  try {
    await fetch("/api/lore-vault-logout", { method: "POST", credentials: "same-origin" });
  } finally {
    showLogin();
  }
});

notes.addEventListener("input", () => {
  saveState.textContent = "Unsaved changes";
});

checkSession();
