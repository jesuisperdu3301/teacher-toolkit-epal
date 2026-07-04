import { allTerms, categories } from '../core/database.js';
import { esc } from '../core/ui.js';

const colors = ['#6759ff','#00a6a6','#f5a623','#e84a5f','#1b9c85','#9b59b6','#3498db','#e67e22'];
let game = null;
let showTeacher = false;

export function renderImpostor(app) {
  if (!game) return setup(app);
  return play(app);
}

function setup(app) {
  const cats = categories(app.state);
  const total = allTerms(app.state).length;

  return `
    <div class="grid">
      <section class="card span7 impostor-setup">
        <span class="pill">🎭 Classroom Game</span>
        <h1>Impostor</h1>
        <p class="muted">Μυστικός όρος, κρυφοί impostors και συζήτηση στην τάξη.</p>

        <div class="setup-grid">
          <label>
            <p class="label">Παίκτες</p>
            <input id="players" type="number" min="3" max="30" value="6">
          </label>

          <label>
            <p class="label">Impostors</p>
            <input id="imps" type="number" min="1" max="5" value="1">
          </label>
        </div>

        <label>
          <p class="label">Κατηγορία</p>
          <select id="cat">
            <option value="all">Όλες οι κατηγορίες</option>
            ${cats.map(c => `<option value="${esc(c.name)}">${esc(c.name)} (${c.words.length})</option>`).join('')}
          </select>
        </label>

        <label>
          <p class="label">Εκπαιδευτική βοήθεια</p>
          <select id="hintMode">
            <option value="hint">Να εμφανίζεται hint στους παίκτες</option>
            <option value="none">Μόνο ο όρος</option>
          </select>
        </label>

        <button class="btn big-btn" id="startImpostor">🚀 Έναρξη γύρου</button>
      </section>

      <aside class="card span5">
        <h2>📚 Πώς παίζεται</h2>
        <div class="workflow">
          <div><strong>1</strong><p>Κάθε παίκτης βλέπει κρυφά την κάρτα του.</p></div>
          <div><strong>2</strong><p>Οι περισσότεροι βλέπουν τον ίδιο όρο.</p></div>
          <div><strong>3</strong><p>Ο impostor βλέπει μόνο ότι είναι impostor.</p></div>
          <div><strong>4</strong><p>Στο τέλος γίνεται συζήτηση και εκπαιδευτική επανάληψη.</p></div>
        </div>

        <div class="hero-panel compact">
          <div class="hero-number">${total}</div>
          <p>διαθέσιμοι όροι</p>
        </div>
      </aside>
    </div>
  `;
}

export function bindImpostor(app) {
  document.getElementById('startImpostor')?.addEventListener('click', () => {
    const players = +document.getElementById('players').value;
    const imps = +document.getElementById('imps').value;
    const cat = document.getElementById('cat').value;
    const hintMode = document.getElementById('hintMode').value;

    const pool = allTerms(app.state).filter(x => cat === 'all' || x.category === cat);

    if (players < 3 || imps >= players || imps < 1 || pool.length < 1) {
      app.toast('Έλεγξε παίκτες, impostors και διαθέσιμους όρους.');
      return;
    }

    const secret = pool[Math.floor(Math.random() * pool.length)];
    const set = new Set();

    while (set.size < imps) {
      set.add(Math.floor(Math.random() * players));
    }

    game = {
      players,
      imps,
      secret,
      impsList: [...set],
      idx: 0,
      phase: 'intro',
      hintMode
    };

    showTeacher = false;
    app.render();
  });

  document.getElementById('readyPlayer')?.addEventListener('click', () => {
    game.phase = 'hidden';
    app.render();
  });

  document.getElementById('revealCard')?.addEventListener('click', () => {
    game.phase = 'shown';
    app.render();
  });

  document.getElementById('coverCard')?.addEventListener('click', () => {
    game.phase = 'covered';
    app.render();
  });

  document.getElementById('nextPlayer')?.addEventListener('click', () => {
    if (game.idx === game.players - 1) {
      game.phase = 'discussion';
    } else {
      game.idx++;
      game.phase = 'intro';
    }
    app.render();
  });

  document.getElementById('finishDiscussion')?.addEventListener('click', () => {
    game.phase = 'end';
    app.state.stats.rounds = (app.state.stats.rounds || 0) + 1;
    app.save();
    app.render();
  });

  document.getElementById('newRound')?.addEventListener('click', () => {
    game = null;
    showTeacher = false;
    app.render();
  });

  document.getElementById('teacherCard')?.addEventListener('click', () => {
    showTeacher = !showTeacher;
    app.render();
  });

  document.getElementById('saveTeacherNote')?.addEventListener('click', () => {
    app.state.notes ||= {};
    app.state.notes[game.secret.id] = document.getElementById('noteBox').value.trim();
    app.save();
    app.toast('Η σημείωση αποθηκεύτηκε.');
  });
}

function play(app) {
  const current = game.idx + 1;
  const pct = game.phase === 'end' ? 100 : Math.round((game.idx / game.players) * 100);
  const color = colors[game.idx % colors.length];
  const isImp = game.impsList.includes(game.idx);

  return `
    <section class="card impostor-shell">
      <div class="row between">
        <div>
          <span class="pill">🎭 Impostor</span>
          <h2>Γύρος σε εξέλιξη</h2>
        </div>
        <span class="pill">${current}/${game.players} παίκτες</span>
      </div>

      <div class="progress">
        <div class="bar" style="width:${pct}%"></div>
      </div>

      <div class="player-dots">
        ${Array.from({ length: game.players }, (_, i) => `
          <span 
            class="${i < game.idx ? 'done' : i === game.idx ? 'active' : ''}" 
            style="--pcolor:${colors[i % colors.length]}"
          >
            ${i + 1}
          </span>
        `).join('')}
      </div>

      <div class="impostor-stage">
        ${screen(app, current, color, isImp)}
      </div>
    </section>
  `;
}

function screen(app, current, color, isImp) {
  if (game.phase === 'intro') {
    return `
      <div class="pass-screen">
        <div class="player-badge xl" style="background:${color}">${current}</div>
        <h1>Παίκτης ${current}</h1>
        <p class="hint">Μόνο ο Παίκτης ${current} πρέπει να κοιτάξει την οθόνη.</p>
        <button class="btn big-btn" id="readyPlayer">Είμαι έτοιμος</button>
      </div>
    `;
  }

  if (game.phase === 'hidden') {
    return `
      <div class="secret-card closed">
        <div class="card-back">🂠</div>
        <h2>Κρυφή κάρτα</h2>
        <p class="hint">Πάτησε για να εμφανιστεί η κάρτα σου.</p>
        <button class="btn big-btn" id="revealCard">👁 Εμφάνιση κάρτας</button>
      </div>
    `;
  }

  if (game.phase === 'shown') {
    return `
      <div class="secret-card revealed ${isImp ? 'impostor' : ''}">
        <div class="card-symbol">${isImp ? '🕵️' : subjectIcon(game.secret.subject)}</div>
        <div class="secret-title">${isImp ? 'IMPOSTOR' : esc(game.secret.term)}</div>

        <p class="hint">
          ${
            isImp
              ? 'Άκου προσεκτικά. Προσπάθησε να καταλάβεις τον όρο χωρίς να αποκαλυφθείς.'
              : game.hintMode === 'hint'
                ? esc(game.secret.hint || 'Θυμήσου τον όρο και πάτησε «Το είδα».')
                : 'Θυμήσου τον όρο και πάτησε «Το είδα».'
          }
        </p>

        <button class="btn ok big-btn" id="coverCard">Το είδα</button>
      </div>
    `;
  }

  if (game.phase === 'covered') {
    return `
      <div class="pass-screen">
        <div class="big">🙈</div>
        <h1>Η κάρτα αποκρύφθηκε</h1>
        <p class="hint">
          ${
            game.idx === game.players - 1
              ? 'Όλοι οι παίκτες είδαν την κάρτα τους.'
              : `Παραδώστε τη συσκευή στον Παίκτη ${current + 1}.`
          }
        </p>
        <button class="btn big-btn" id="nextPlayer">
          ${game.idx === game.players - 1 ? 'Συζήτηση' : 'Επόμενος παίκτης'}
        </button>
      </div>
    `;
  }

  if (game.phase === 'discussion') {
    return `
      <div class="discussion-screen">
        <div class="big">💬</div>
        <h1>Ώρα για συζήτηση</h1>
        <p class="hint">
          Κάθε παίκτης δίνει μία σύντομη περιγραφή χωρίς να πει απευθείας τον όρο.
        </p>

        <div class="discussion-tips">
          <p>✅ Περιγράψτε λειτουργία, χρήση ή παράδειγμα.</p>
          <p>🚫 Μην πείτε τη λέξη αυτούσια.</p>
          <p>🕵️ Προσπαθήστε να εντοπίσετε τον impostor.</p>
        </div>

        <button class="btn big-btn" id="finishDiscussion">Αποκάλυψη αποτελέσματος</button>
      </div>
    `;
  }

  if (game.phase === 'end') {
    return `
      <div class="end-screen">
        <div class="big">🎉</div>
        <h1>Ο γύρος ολοκληρώθηκε</h1>

        <div class="reveal-grid">
          <div>
            <span class="pill">Μυστικός όρος</span>
            <h2>${esc(game.secret.term)}</h2>
            <p class="muted">${esc(game.secret.category)} • ${esc(game.secret.subject)}</p>
          </div>

          <div>
            <span class="pill">Impostor${game.impsList.length > 1 ? 's' : ''}</span>
            <h2>${game.impsList.map(i => `Παίκτης ${i + 1}`).join(', ')}</h2>
          </div>
        </div>

        <div class="row" style="justify-content:center">
          <button class="btn" id="newRound">Νέος γύρος</button>
          <button class="btn secondary" id="teacherCard">📚 Teacher Mode</button>
        </div>

        ${showTeacher ? teacherCard(app) : ''}
      </div>
    `;
  }

  return '';
}

function teacherCard(app) {
  const t = game.secret;

  return `
    <div class="teacher-card impostor-teacher">
      <h2>📚 Εκπαιδευτική κάρτα</h2>

      <div class="teacher-term">
        <div class="icon">${subjectIcon(t.subject)}</div>
        <div>
          <h1>${esc(t.term)}</h1>
          <p class="muted">${esc(t.subject)} • ${esc(t.category)}</p>
        </div>
      </div>

      <h3>💡 Hint</h3>
      <p>${esc(t.hint || '—')}</p>

      <h3>📖 Ορισμός</h3>
      <p>${esc(t.definition || '—')}</p>

      <h3>❓ Ερώτηση συζήτησης</h3>
      <p>${esc(t.quiz || 'Εξηγήστε την έννοια με δικά σας λόγια.')}</p>

      <h3>📝 Ιδιωτική σημείωση καθηγητή</h3>
      <textarea id="noteBox" rows="4">${esc(app.state.notes?.[t.id] || '')}</textarea>

      <br><br>

      <button class="btn secondary" id="saveTeacherNote">Αποθήκευση σημείωσης</button>
    </div>
  `;
}

function subjectIcon(subject) {
  if (subject === 'Υγιεινή') return '🩺';
  if (subject === 'Ανατομία') return '🦴';
  return '📚';
}