import { allTerms, categories } from '../core/database.js';
import { esc } from '../core/ui.js';

export function renderHome(app) {
  const s = app.state;
  const terms = allTerms(s);
  const cats = categories(s);
  const activeSubject = s.settings.subject;

  const totalNotes = Object.values(s.notes || {}).filter(Boolean).length;
  const totalFavs = (s.favorites || []).length;
  const quizTotal = s.stats.quizTotal || 0;
  const quizCorrect = s.stats.quizCorrect || 0;
  const quizPercent = quizTotal ? Math.round((quizCorrect / quizTotal) * 100) : 0;

  return `
    <div class="home-hero card span12">
      <div>
        <span class="pill">🎓 Teacher Toolkit ΕΠΑΛ v1.0</span>

        <h1>Διαδραστική διδασκαλία για ΕΠΑΛ</h1>

        <p>
          Όροι, hints, ορισμοί και ερωτήσεις γίνονται παιχνίδια, flashcards,
          quiz και εργαλεία επανάληψης για την τάξη.
        </p>

        <div class="row">
          <button class="btn" data-route="study">📚 Άνοιγμα Μελέτης</button>
          <button class="btn secondary" data-route="impostor">🎭 Νέος γύρος Impostor</button>
        </div>
      </div>

      <div class="hero-panel">
        <div class="hero-number">${terms.length}</div>
        <p>εκπαιδευτικοί όροι διαθέσιμοι</p>
        <div class="mini-grid">
          <span>${cats.length} κατηγορίες</span>
          <span>${totalFavs} αγαπημένα</span>
          <span>${totalNotes} σημειώσεις</span>
          <span>${quizPercent}% quiz</span>
        </div>
      </div>
    </div>

    <div class="grid">
      <section class="card span12">
        <div class="row between">
          <div>
            <h2>Επιλογή μαθήματος</h2>
            <p class="muted">Διάλεξε ποιο lesson pack θα χρησιμοποιείται ως βασικό φίλτρο.</p>
          </div>

          <span class="pill">Ενεργό: ${subjectIcon(activeSubject)} ${esc(activeSubject)}</span>
        </div>

        <div class="subject-grid">
          ${['Υγιεινή', 'Ανατομία'].map(sub => {
            const isActive = sub === activeSubject;
            const count = allTerms(s, sub).length;
            const catCount = categories(s, sub).length;

            return `
              <article class="subject-card ${isActive ? 'active' : ''}">
                <div>
                  <div class="icon">${subjectIcon(sub)}</div>
                  <h3>${esc(sub)}</h3>
                  <p>${count} όροι • ${catCount} κατηγορίες</p>
                </div>

                <button class="btn ${isActive ? '' : 'secondary'}" data-subject="${sub}">
                  ${isActive ? 'Ενεργό μάθημα' : 'Επιλογή'}
                </button>
              </article>
            `;
          }).join('')}
        </div>
      </section>

      <section class="card span12">
        <div class="row between">
          <div>
            <h2>Εργαλεία τάξης</h2>
            <p class="muted">Όλα τα εργαλεία χρησιμοποιούν τις ίδιες βάσεις γνώσης.</p>
          </div>
        </div>

        <div class="tool-grid">
          ${app.routes.filter(r => r.home).map(r => `
            <article class="tool-card" data-route="${r.id}">
              <div class="icon">${r.icon}</div>
              <h3>${esc(r.label)}</h3>
              <p>${esc(r.desc)}</p>
              <span>Άνοιγμα →</span>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="card span8">
        <h2>🎯 Προτεινόμενη ροή διδασκαλίας</h2>

        <div class="workflow">
          <div>
            <strong>1</strong>
            <p><b>Μελέτη</b><br>Βρείτε τον όρο, δείτε τον ορισμό και προσθέστε σημειώσεις.</p>
          </div>

          <div>
            <strong>2</strong>
            <p><b>Flashcards</b><br>Γρήγορη επανάληψη με hint, ορισμό και ερώτηση.</p>
          </div>

          <div>
            <strong>3</strong>
            <p><b>Quiz</b><br>Έλεγχος κατανόησης με αυτόματες ερωτήσεις.</p>
          </div>

          <div>
            <strong>4</strong>
            <p><b>Impostor / Wheel</b><br>Παιχνίδι στην τάξη για συμμετοχή και συζήτηση.</p>
          </div>
        </div>
      </section>

      <aside class="card span4">
        <h2>📊 Σήμερα</h2>

        <div class="dashboard-list">
          <p><b>${terms.length}</b><span>όροι</span></p>
          <p><b>${cats.length}</b><span>κατηγορίες</span></p>
          <p><b>${totalFavs}</b><span>αγαπημένα</span></p>
          <p><b>${totalNotes}</b><span>σημειώσεις καθηγητή</span></p>
          <p><b>${s.stats.wheelSpins || 0}</b><span>wheel spins</span></p>
        </div>
      </aside>

      <article class="card span12">
        <h2>💾 Μεταφορά σε άλλη συσκευή</h2>

        <p class="hint">
          Οι αλλαγές αποθηκεύονται αυτόματα στον browser της συσκευής.
          Για μεταφορά: <b>Βάσεις → Export Backup</b> και μετά <b>Import</b> στη νέα συσκευή.
        </p>
      </article>
    </div>
  `;
}

function subjectIcon(subject) {
  if (subject === 'Υγιεινή') return '🩺';
  if (subject === 'Ανατομία') return '🦴';
  return '📚';
}