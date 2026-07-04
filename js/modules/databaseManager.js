import { packDatabases, normalizePack, uid } from '../core/database.js';
import { esc, download, modal, closeModals } from '../core/ui.js';

export function renderDatabase(app) {
  return `
    <div class="grid">
      <section class="card span12 row">
        <button class="btn" id="newDb">➕ Νέα βάση</button>
        <button class="btn secondary" id="importBtn">📂 Import</button>
        <button class="btn secondary" id="exportAll">💾 Export Backup</button>
      </section>

      ${
        app.state.databases.map(db => {
          const termCount = db.categories.reduce((a, c) => a + c.words.length, 0);

          return `
            <article class="card span6">
              <div class="row between">
                <div>
                  <h3>${esc(db.name)}</h3>
                  <p class="muted">
                    ${esc(db.subject)} • ${db.categories.length} κατηγορίες • ${termCount} όροι
                  </p>
                </div>
                <span class="pill">${db.subject === 'Υγιεινή' ? '🩺' : '🦴'}</span>
              </div>

              <div class="row">
                <button class="btn" data-viewdb="${db.id}">📚 Άνοιγμα</button>
                <button class="btn secondary" data-editdb="${db.id}">✏ Ρυθμίσεις</button>
                <button class="btn secondary" data-exportdb="${db.id}">Export</button>
                <button class="btn danger" data-deldb="${db.id}">Διαγραφή</button>
              </div>
            </article>
          `;
        }).join('')
      }
    </div>
  `;
}

export function bindDatabase(app) {
  document.getElementById('newDb')?.addEventListener('click', () => {
    editDbSettings(app, {
      id: uid(),
      subject: app.state.settings.subject || 'Υγιεινή',
      name: 'Νέα βάση',
      categories: []
    }, true);
  });

  document.getElementById('importBtn')?.addEventListener('click', () => {
    document.getElementById('importFile')?.click();
  });

  document.getElementById('exportAll')?.addEventListener('click', () => {
    download(
      JSON.stringify(packDatabases(app.state.databases), null, 2),
      'teacher-toolkit-epal-backup.epack'
    );
  });

  document.querySelectorAll('[data-viewdb]').forEach(btn => {
    btn.addEventListener('click', () => {
      const db = findDb(app, btn.dataset.viewdb);
      if (db) viewDb(app, db);
    });
  });

  document.querySelectorAll('[data-editdb]').forEach(btn => {
    btn.addEventListener('click', () => {
      const db = findDb(app, btn.dataset.editdb);
      if (db) editDbSettings(app, db, false);
    });
  });

  document.querySelectorAll('[data-exportdb]').forEach(btn => {
    btn.addEventListener('click', () => {
      const db = findDb(app, btn.dataset.exportdb);
      if (!db) return;

      download(
        JSON.stringify(packDatabases([db]), null, 2),
        safeFileName(`${db.subject}-${db.name}.epack`)
      );
    });
  });

  document.querySelectorAll('[data-deldb]').forEach(btn => {
    btn.addEventListener('click', () => {
      const db = findDb(app, btn.dataset.deldb);
      if (!db) return;

      if (confirm(`Να διαγραφεί η βάση "${db.name}";`)) {
        app.state.databases = app.state.databases.filter(d => d.id !== db.id);
        app.save();
        app.render();
      }
    });
  });
}

/* -----------------------------
   Database view
------------------------------ */

function viewDb(app, db) {
  const termCount = db.categories.reduce((a, c) => a + c.words.length, 0);

  const html = `
    <div class="row between">
      <div>
        <h2>${esc(db.name)}</h2>
        <p class="muted">${esc(db.subject)} • ${db.categories.length} κατηγορίες • ${termCount} όροι</p>
      </div>
      <span class="pill">${db.subject === 'Υγιεινή' ? '🩺 Υγιεινή' : '🦴 Ανατομία'}</span>
    </div>

    <div class="row">
      <button class="btn" id="addCategory">➕ Νέα κατηγορία</button>
      <button class="btn secondary" id="editDbSettings">✏ Ρυθμίσεις βάσης</button>
    </div>

    <hr>

    ${
      db.categories.length
        ? `
          <div class="grid">
            ${db.categories.map(cat => `
              <article class="card span6">
                <div class="row between">
                  <div>
                    <h3>${esc(cat.name)}</h3>
                    <p class="muted">${cat.words.length} όροι</p>
                  </div>
                  <span class="pill">📚</span>
                </div>

                <div class="row">
                  <button class="btn" data-viewcat="${cat.id}">Άνοιγμα</button>
                  <button class="btn secondary" data-editcat="${cat.id}">✏</button>
                  <button class="btn danger" data-delcat="${cat.id}">🗑</button>
                </div>
              </article>
            `).join('')}
          </div>
        `
        : `<p class="muted">Δεν υπάρχουν ακόμα κατηγορίες.</p>`
    }
  `;

  const m = modal(html);

  m.querySelector('#addCategory')?.addEventListener('click', () => {
    db.categories.push({
      id: uid(),
      name: 'Νέα κατηγορία',
      words: []
    });

    app.save();
    closeModals();
    viewDb(app, db);
  });

  m.querySelector('#editDbSettings')?.addEventListener('click', () => {
    closeModals();
    editDbSettings(app, db, false);
  });

  m.querySelectorAll('[data-viewcat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = findCategory(db, btn.dataset.viewcat);
      if (!cat) return;

      closeModals();
      viewCategory(app, db, cat);
    });
  });

  m.querySelectorAll('[data-editcat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = findCategory(db, btn.dataset.editcat);
      if (!cat) return;

      editCategory(app, db, cat);
    });
  });

  m.querySelectorAll('[data-delcat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = findCategory(db, btn.dataset.delcat);
      if (!cat) return;

      if (confirm(`Να διαγραφεί η κατηγορία "${cat.name}" και όλοι οι όροι της;`)) {
        db.categories = db.categories.filter(c => c.id !== cat.id);
        app.save();
        closeModals();
        viewDb(app, db);
      }
    });
  });
}

/* -----------------------------
   Database settings
------------------------------ */

function editDbSettings(app, db, isNew) {
  const html = `
    <h2>${isNew ? 'Νέα βάση' : 'Ρυθμίσεις βάσης'}</h2>

    <label>
      <p class="label">Μάθημα</p>
      <select id="dbSubject">
        <option ${db.subject === 'Υγιεινή' ? 'selected' : ''}>Υγιεινή</option>
        <option ${db.subject === 'Ανατομία' ? 'selected' : ''}>Ανατομία</option>
      </select>
    </label>

    <label>
      <p class="label">Όνομα βάσης</p>
      <input id="dbName" value="${esc(db.name)}">
    </label>

    <br>

    <div class="row">
      <button class="btn" id="saveDb">Αποθήκευση</button>
      ${!isNew ? `<button class="btn secondary" id="openDb">Άνοιγμα κατηγοριών</button>` : ''}
    </div>
  `;

  const m = modal(html);

  m.querySelector('#saveDb')?.addEventListener('click', () => {
    db.subject = m.querySelector('#dbSubject').value;
    db.name = m.querySelector('#dbName').value.trim() || 'Χωρίς όνομα';

    if (isNew) {
      app.state.databases.push(db);
    }

    app.save();
    closeModals();
    app.render();
  });

  m.querySelector('#openDb')?.addEventListener('click', () => {
    closeModals();
    viewDb(app, db);
  });
}

/* -----------------------------
   Category view/editor
------------------------------ */

function viewCategory(app, db, cat) {
  const html = `
    <div class="row between">
      <div>
        <h2>${esc(cat.name)}</h2>
        <p class="muted">${esc(db.name)} • ${cat.words.length} όροι</p>
      </div>
      <span class="pill">📚 Κατηγορία</span>
    </div>

    <div class="row">
      <button class="btn" id="backToDb">← Πίσω</button>
      <button class="btn" id="addTerm">➕ Νέος όρος</button>
      <button class="btn secondary" id="editCat">✏ Μετονομασία</button>
    </div>

    <hr>

    ${
      cat.words.length
        ? `
          <div class="term-list">
            ${cat.words.map((w, index) => `
              <article class="card term-item">
                <div>
                  <h3>${esc(getTerm(w))}</h3>
                  <p class="muted">${esc(w.hint || w.definition || 'Χωρίς hint/ορισμό')}</p>
                </div>

                <div class="row">
                  <button class="btn secondary" data-viewterm="${index}">Προβολή</button>
                  <button class="btn secondary" data-editterm="${index}">✏</button>
                  <button class="btn danger" data-delterm="${index}">🗑</button>
                </div>
              </article>
            `).join('')}
          </div>
        `
        : `<p class="muted">Δεν υπάρχουν ακόμα όροι σε αυτή την κατηγορία.</p>`
    }
  `;

  const m = modal(html);

  m.querySelector('#backToDb')?.addEventListener('click', () => {
    closeModals();
    viewDb(app, db);
  });

  m.querySelector('#addTerm')?.addEventListener('click', () => {
    editTerm(app, db, cat, null);
  });

  m.querySelector('#editCat')?.addEventListener('click', () => {
    editCategory(app, db, cat);
  });

  m.querySelectorAll('[data-viewterm]').forEach(btn => {
    btn.addEventListener('click', () => {
      const term = cat.words[Number(btn.dataset.viewterm)];
      viewTerm(term);
    });
  });

  m.querySelectorAll('[data-editterm]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.editterm);
      editTerm(app, db, cat, index);
    });
  });

  m.querySelectorAll('[data-delterm]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.delterm);
      const term = cat.words[index];

      if (confirm(`Να διαγραφεί ο όρος "${getTerm(term)}";`)) {
        cat.words.splice(index, 1);
        app.save();
        closeModals();
        viewCategory(app, db, cat);
      }
    });
  });
}

function editCategory(app, db, cat) {
  const html = `
    <h2>Επεξεργασία κατηγορίας</h2>

    <label>
      <p class="label">Όνομα κατηγορίας</p>
      <input id="catName" value="${esc(cat.name)}">
    </label>

    <br>

    <button class="btn" id="saveCat">Αποθήκευση</button>
  `;

  const m = modal(html);

  m.querySelector('#saveCat')?.addEventListener('click', () => {
    cat.name = m.querySelector('#catName').value.trim() || 'Χωρίς κατηγορία';

    app.save();
    closeModals();
    viewDb(app, db);
  });
}

/* -----------------------------
   Term view/editor
------------------------------ */

function viewTerm(term) {
  const html = `
    <h2>${esc(getTerm(term))}</h2>

    <section class="teacher-card">
      <p><b>💡 Hint:</b><br>${esc(term.hint || '—')}</p>
      <p><b>📖 Ορισμός:</b><br>${esc(term.definition || '—')}</p>
      <p><b>❓ Ερώτηση:</b><br>${esc(term.quiz || '—')}</p>
    </section>
  `;

  modal(html);
}

function editTerm(app, db, cat, index) {
  const isNew = index === null;

  const term = isNew
    ? {
        term: '',
        hint: '',
        definition: '',
        quiz: ''
      }
    : cat.words[index];

  const html = `
    <h2>${isNew ? 'Νέος όρος' : 'Επεξεργασία όρου'}</h2>

    <label>
      <p class="label">Όρος</p>
      <input id="termName" value="${esc(getTerm(term))}">
    </label>

    <label>
      <p class="label">Hint</p>
      <textarea id="termHint" rows="2">${esc(term.hint || '')}</textarea>
    </label>

    <label>
      <p class="label">Ορισμός</p>
      <textarea id="termDefinition" rows="4">${esc(term.definition || '')}</textarea>
    </label>

    <label>
      <p class="label">Ερώτηση / Quiz</p>
      <textarea id="termQuiz" rows="3">${esc(term.quiz || '')}</textarea>
    </label>

    <br>

    <button class="btn" id="saveTerm">Αποθήκευση</button>
  `;

  const m = modal(html);

  m.querySelector('#saveTerm')?.addEventListener('click', () => {
    const saved = {
      term: m.querySelector('#termName').value.trim() || 'Χωρίς όρο',
      hint: m.querySelector('#termHint').value.trim(),
      definition: m.querySelector('#termDefinition').value.trim(),
      quiz: m.querySelector('#termQuiz').value.trim()
    };

    if (isNew) {
      cat.words.push(saved);
    } else {
      cat.words[index] = {
        ...cat.words[index],
        ...saved
      };
    }

    app.save();
    closeModals();
    viewCategory(app, db, cat);
  });
}

/* -----------------------------
   Import
------------------------------ */

export async function handleImport(app, file) {
  try {
    const text = await file.text();
    const pack = normalizePack(JSON.parse(text));

    app.state.databases.push(...pack.databases);
    app.save();

    app.toast('Έγινε εισαγωγή lesson pack.');
    app.render();
  } catch (err) {
    console.error(err);
    app.toast('Δεν έγινε εισαγωγή. Το αρχείο δεν είναι έγκυρο.');
  }
}

/* -----------------------------
   Helpers
------------------------------ */

function findDb(app, id) {
  return app.state.databases.find(db => db.id === id);
}

function findCategory(db, id) {
  return db.categories.find(cat => cat.id === id);
}

function getTerm(word) {
  return typeof word === 'string' ? word : word.term;
}

function safeFileName(name) {
  return name
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}