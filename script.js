const toast = document.getElementById("toast");

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

document.querySelectorAll("[data-coming-soon]").forEach(card => {
  card.addEventListener("click", event => {
    event.preventDefault();
    showToast(`${card.dataset.comingSoon}'s full character page is coming later.`);
  });
});

document.querySelectorAll("[data-toast]").forEach(button => {
  button.addEventListener("click", () => showToast(button.dataset.toast));
});

const revealTargets = document.querySelectorAll(
  ".section-heading, .character-card, .academy-image-wrap, .academy-copy, .spell-intro, .spell-stage, .books-copy, .book-card, .ask-card"
);

revealTargets.forEach(el => el.classList.add("reveal"));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.13 });

revealTargets.forEach(el => observer.observe(el));

document.querySelectorAll("[data-demo-form]").forEach(form => {
  form.addEventListener("submit", event => {
    event.preventDefault();
    form.reset();
    showToast("Message captured in the demo. Backend connection comes next.");
  });
});

const micButton = document.getElementById("micButton");
const spellStatus = document.getElementById("spellStatus");
const heardText = document.getElementById("heardText");
const spellEffect = document.getElementById("spellEffect");

const spells = {
  lumen: "Light answers.",
  unda: "Water rises.",
  vela: "The air moves.",
  aegis: "A shield forms.",
  ember: "Heat gathers.",
  tide: "The Tide heard you."
};

function castSpell(spell) {
  if (!spells[spell] || !spellEffect) return;
  spellStatus.textContent = spells[spell];
  spellEffect.className = `spell-effect active ${spell}`;
  setTimeout(() => spellEffect.className = "spell-effect", 1350);
}

document.querySelectorAll("[data-spell]").forEach(button => {
  button.addEventListener("click", () => castSpell(button.dataset.spell));
});

if (micButton) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!Recognition) {
    spellStatus.textContent = "Voice recognition is not supported in this browser. Click a spell instead.";
  } else {
    const recognition = new Recognition();
    recognition.lang = "en-AU";
    recognition.interimResults = false;
    recognition.continuous = false;

    micButton.addEventListener("click", () => {
      heardText.textContent = "";
      spellStatus.textContent = "Listening...";
      micButton.classList.add("listening");
      recognition.start();
    });

    recognition.addEventListener("result", event => {
      const text = event.results[0][0].transcript.toLowerCase().trim();
      heardText.textContent = `Heard: “${text}”`;

      const spell = Object.keys(spells).find(key => text.includes(key));
      if (spell) {
        castSpell(spell);
      } else {
        spellStatus.textContent = "The magic did not recognise that spell.";
      }
    });

    recognition.addEventListener("end", () => {
      micButton.classList.remove("listening");
    });

    recognition.addEventListener("error", () => {
      micButton.classList.remove("listening");
      spellStatus.textContent = "Mic access failed. You can still click a spell.";
    });
  }
}
