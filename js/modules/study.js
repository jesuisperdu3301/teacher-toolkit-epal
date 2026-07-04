import { allTerms, categories } from '../core/database.js';
import { esc, modal } from '../core/ui.js';

let currentQuery = '';
let currentSubject = 'all';
let currentCategory = 'all';
let favoritesOnly = false;

export function renderStudy(app) {
  const words = getFilteredWords(app);
  const cats = categories(app.state);
  const subjects = [...new Set(allTerms(app.state).map(t => t.subject))];

  return `
    <div class="grid">
      <section class="card span8">
        <div class="row between">
          <div>
            <h2>📚 Μελέτη όρων</h2>
            <p class="muted">${words.length} αποτελέσματα</p>
          </div>

          <button class="btn secondary" id="randomTerm">🎲 Τυχαίος όρος</button>
        </div>

        <input 
          id="searchBox" 
          class="search" 
          placeholder="Αναζήτηση όρου, ορισμού, ερώτησης, κατηγορίας..." 
          value="${esc(currentQuery)}"
        />

        <br><br>

        <div class="row">
          <button class="btn secondary ${favoritesOnly ? 'active' : ''}" id="toggleFavs">
            ⭐ Αγαπημένα
          </button>

          <button class="btn secondary" id="clearFilters">
            Καθαρισμός φίλτρων
          </button>
        </div>

        <br>

        <div id="results" class="term-list">
          ${list(app, words.slice(0, 80))}
        </div>
      </section>

      <aside class="card span4">
        <h3>Μάθημα</h3>

        <div class="stack">
          <button class="btn secondary ${currentSubject === 'all' ? 'active' : ''}" data-subjectfilter="all">
            Όλα
          </button>

          ${subjects.map(s => `
            <button class="btn secondary ${currentSubject === s ? 'active' : ''}" data-subjectfilter="${esc(s)}">
              ${subjectIcon(s)} ${esc(s)}
            </button>
          `).join('')}
        </div>

        <hr>

        <h3>Κατηγορίες</h3>

        <div class="stack">
          <button class="btn secondary ${currentCategory === 'all' ? 'active' : ''}" data-catfilter="all">
            Όλες
          </button>

          ${cats.map(c => `
            <button class="btn secondary ${currentCategory === c.name ? 'active' : ''}" data-catfilter="${esc(c.name)}">
              ${esc(c.name)} <span class="muted">${c.words.length}</span>
            </button>
          `).join('')}
        </div>
      </aside>
    </div>
  `;
}

export function bindStudy(app) {
  const search = document.getElementById('searchBox');

  search?.addEventListener('input', e => {
    currentQuery = e.target.value.trim();
    app.render();
  });

  document.getElementById('toggleFavs')?.addEventListener('click', () => {
    favoritesOnly = !favoritesOnly;
    app.render();
  });

  document.getElementById('clearFilters')?.addEventListener('click', () => {
    currentQuery = '';
    currentSubject = 'all';
    currentCategory = 'all';
    favoritesOnly = false;
    app.render();
  });

  document.getElementById('randomTerm')?.addEventListener('click', () => {
    const words = getFilteredWords(app);
    if (!words.length) return;

    openTerm(app, words[Math.floor(Math.random() * words.length)]);
  });

  document.querySelectorAll('[data-subjectfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSubject = btn.dataset.subjectfilter;
      currentCategory = 'all';
      app.render();
    });
  });

  document.querySelectorAll('[data-catfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.catfilter;
      app.render();
    });
  });

  bindRows(app);
}

function list(app, words) {
  if (!words.length) {
    return `<p class="hint">Δεν βρέθηκαν αποτελέσματα.</p>`;
  }

  return words.map(t => {
    const fav = app.state.favorites?.includes(t.id);

    return `
      <article class="term-row" data-termid="${t.id}">
        <div>
          <div class="row">
            <strong>${fav ? '⭐ ' : ''}${esc(t.term)}</strong>
            <span class="pill">${subjectIcon(t.subject)} ${esc(t.subject)}</span>
          </div>

          <p class="muted">${esc(t.category)}</p>
          <p>${esc(t.hint || t.definition || '')}</p>
        </div>

        <span>›</span>
      </article>
    `;
  }).join('');
}

function bindRows(app) {
  document.querySelectorAll('[data-termid]').forEach(row => {
    row.addEventListener('click', () => {
      const t = allTerms(app.state).find(x => x.id === row.dataset.termid);
      if (t) openTerm(app, t);
    });
  });
}

function openTerm(app, t) {
  const isFav = app.state.favorites?.includes(t.id);

  const html = `
    <div class="term-modal">
      <div class="row between">
        <div>
          <h2>${esc(t.term)}</h2>
          <p class="pill">${subjectIcon(t.subject)} ${esc(t.subject)} • ${esc(t.category)}</p>
        </div>

        <button class="btn secondary" id="toggleTermFav">
          ${isFav ? '★ Αγαπημένο' : '☆ Αγαπημένο'}
        </button>
      </div>

      <section class="teacher-card">
        <h3>💡 Hint</h3>
        <p>${esc(t.hint || '—')}</p>

        <h3>📖 Ορισμός</h3>
        <p>${esc(t.definition || '—')}</p>

        <h3>❓ Ερώτηση</h3>
        <p>${esc(t.quiz || '—')}</p>
      </section>

      <br>

      <section class="teacher-card">
        <h3>📝 Σημείωση καθηγητή</h3>
        <textarea id="modalNote" rows="5" placeholder="Προσωπικές σημειώσεις για το μάθημα...">${esc(app.state.notes?.[t.id] || '')}</textarea>

        <br><br>

        <button class="btn" id="saveModalNote">Αποθήκευση σημείωσης</button>
      </section>
    </div>
  `;

  const m = modal(html);

  m.querySelector('#toggleTermFav')?.addEventListener('click', () => {
    app.state.favorites ||= [];

    if (app.state.favorites.includes(t.id)) {
      app.state.favorites = app.state.favorites.filter(id => id !== t.id);
    } else {
      app.state.favorites.push(t.id);
    }

    app.save();
    closeAndReopen(app, t);
  });

  m.querySelector('#saveModalNote')?.addEventListener('click', () => {
    app.state.notes ||= {};
    app.state.notes[t.id] = m.querySelector('#modalNote').value.trim();

    app.save();
    app.toast('Η σημείωση αποθηκεύτηκε.');
  });
}

function closeAndReopen(app, t) {
  document.querySelectorAll('.modal-backdrop').forEach(x => x.remove());

  const updated = allTerms(app.state).find(x => x.id === t.id);
  if (updated) openTerm(app, updated);
}

function getFilteredWords(app) {
  let words = allTerms(app.state);

  if (currentSubject !== 'all') {
    words = words.filter(t => t.subject === currentSubject);
  }

  if (currentCategory !== 'all') {
    words = words.filter(t => t.category === currentCategory);
  }

  if (favoritesOnly) {
    const favs = app.state.favorites || [];
    words = words.filter(t => favs.includes(t.id));
  }

  const q = currentQuery.toLowerCase();

  if (q) {
    words = words.filter(t => {
      return [
        t.term,
        t.hint,
        t.definition,
        t.quiz,
        t.category,
        t.subject
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }

  return words;
}

function subjectIcon(subject) {
  if (subject === 'Υγιεινή') return '🩺';
  if (subject === 'Ανατομία') return '🦴';
  return '📚';
}