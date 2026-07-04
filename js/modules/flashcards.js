import { allTerms } from '../core/database.js';
import { esc, shuffle } from '../core/ui.js';

let idx = 0;
let show = false;
let onlyFavorites = false;
let shuffledIds = null;

export function renderFlashcards(app) {
  const words = getDeck(app);

  if (!words.length) {
    return `
      <section class="card">
        <h3>Δεν υπάρχουν διαθέσιμοι όροι.</h3>
        <p class="muted">
          ${onlyFavorites ? 'Δεν έχετε αγαπημένους όρους ακόμα.' : 'Προσθέστε όρους στη Διαχείριση Βάσεων.'}
        </p>
      </section>
    `;
  }

  idx = Math.min(idx, words.length - 1);

  const t = words[idx];
  const fav = app.state.favorites?.includes(t.id);
  const progress = Math.round(((idx + 1) / words.length) * 100);

  return `
    <section class="card flash-shell">
      <div class="row between">
        <div>
          <h2>🃏 Flashcards</h2>
          <p class="muted">Πάτησε την κάρτα για να δεις ορισμό, hint και ερώτηση.</p>
        </div>

        <span class="pill">${idx + 1}/${words.length}</span>
      </div>

      <div class="flash-progress">
        <div style="width:${progress}%"></div>
      </div>

      <div class="row between flash-controls">
        <button class="btn secondary" id="prevFlash">← Προηγούμενη</button>

        <div class="row">
          <button class="btn secondary ${onlyFavorites ? 'active' : ''}" id="favOnly">
            ⭐ Μόνο αγαπημένα
          </button>

          <button class="btn secondary" id="shuffleFlash">
            🔀 Shuffle
          </button>
        </div>

        <button class="btn secondary" id="nextFlash">Επόμενη →</button>
      </div>

      <div class="flash-card ${show ? 'revealed' : ''}" id="flipFlash" title="Πάτησε για flip">
        <div class="flash-card-inner">
          <div class="row between">
            <span class="pill">${subjectIcon(t.subject)} ${esc(t.subject)}</span>
            <span class="pill">${esc(t.category)}</span>
          </div>

          <div class="flash-term">
            ${esc(t.term)}
          </div>

          ${
            show
              ? `
                <div class="flash-answer">
                  <h3>💡 Hint</h3>
                  <p>${esc(t.hint || '—')}</p>

                  <h3>📖 Ορισμός</h3>
                  <p>${esc(t.definition || 'Δεν υπάρχει ορισμός.')}</p>

                  <h3>❓ Ερώτηση</h3>
                  <p>${esc(t.quiz || '—')}</p>
                </div>
              `
              : `
                <p class="hint">
                  Πάτησε για αποκάλυψη.
                </p>
              `
          }

          <button class="btn secondary" id="favFlash">
            ${fav ? '⭐ Αγαπημένο' : '☆ Προσθήκη στα αγαπημένα'}
          </button>
        </div>
      </div>

      <p class="muted flash-help">
        Συντομεύσεις: ← / → για αλλαγή κάρτας, Space για flip.
      </p>
    </section>
  `;
}

export function bindFlashcards(app) {
  document.getElementById('prevFlash')?.addEventListener('click', () => {
    move(app, -1);
  });

  document.getElementById('nextFlash')?.addEventListener('click', () => {
    move(app, 1);
  });

  document.getElementById('flipFlash')?.addEventListener('click', e => {
    if (e.target.closest('#favFlash')) return;

    show = !show;
    app.render();
  });

  document.getElementById('favFlash')?.addEventListener('click', () => {
    const words = getDeck(app);
    const t = words[idx];
    if (!t) return;

    app.state.favorites ||= [];

    app.state.favorites = app.state.favorites.includes(t.id)
      ? app.state.favorites.filter(x => x !== t.id)
      : [...app.state.favorites, t.id];

    app.save();

    if (onlyFavorites && !app.state.favorites.includes(t.id)) {
      idx = Math.max(0, idx - 1);
    }

    app.render();
  });

  document.getElementById('favOnly')?.addEventListener('click', () => {
    onlyFavorites = !onlyFavorites;
    idx = 0;
    show = false;
    app.render();
  });

  document.getElementById('shuffleFlash')?.addEventListener('click', () => {
    const ids = allTerms(app.state).map(t => t.id);
    shuffledIds = shuffle(ids);
    idx = 0;
    show = false;
    app.render();
  });

  document.onkeydown = e => {
    const route = app.state.route || '';
    if (route !== 'flashcards') return;

    if (e.key === 'ArrowLeft') {
      move(app, -1);
    }

    if (e.key === 'ArrowRight') {
      move(app, 1);
    }

    if (e.code === 'Space') {
      e.preventDefault();
      show = !show;
      app.render();
    }
  };
}

function move(app, step) {
  const words = getDeck(app);
  if (!words.length) return;

  idx = (idx + step + words.length) % words.length;
  show = false;
  app.render();
}

function getDeck(app) {
  let words = allTerms(app.state);

  if (shuffledIds) {
    const map = new Map(words.map(t => [t.id, t]));
    words = shuffledIds.map(id => map.get(id)).filter(Boolean);
  }

  if (onlyFavorites) {
    const favs = app.state.favorites || [];
    words = words.filter(t => favs.includes(t.id));
  }

  return words;
}

function subjectIcon(subject) {
  if (subject === 'Υγιεινή') return '🩺';
  if (subject === 'Ανατομία') return '🦴';
  return '📚';
}