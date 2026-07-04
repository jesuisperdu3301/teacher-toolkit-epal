import { allTerms } from '../core/database.js';
import { esc, shuffle } from '../core/ui.js';

let q = null;
let streak = 0;

export function renderQuiz(app) {
  const words = quizTerms(app);

  if (words.length < 4) {
    return `
      <section class="card">
        <h3>Χρειάζονται τουλάχιστον 4 όροι με ορισμούς ή hints.</h3>
        <p class="muted">Προσθέστε περισσότερους όρους στη Διαχείριση Βάσεων.</p>
      </section>
    `;
  }

  if (!q) q = makeQuestion(words);

  const total = app.state.stats.quizTotal || 0;
  const correct = app.state.stats.quizCorrect || 0;
  const percent = total ? Math.round((correct / total) * 100) : 0;

  return `
    <section class="card quiz-shell">
      <div class="row between">
        <div>
          <h2>❓ Quiz γνώσεων</h2>
          <p class="muted">Βρες τον σωστό όρο με βάση τον ορισμό.</p>
        </div>

        <button class="btn secondary" id="newQuiz">
          🔄 Νέα ερώτηση
        </button>
      </div>

      <div class="quiz-stats">
        <div>
          <strong>${correct}/${total}</strong>
          <span>Σωστές</span>
        </div>

        <div>
          <strong>${percent}%</strong>
          <span>Επιτυχία</span>
        </div>

        <div>
          <strong>${streak}</strong>
          <span>Streak</span>
        </div>
      </div>

      <div class="quiz-question">
        <span class="pill">${subjectIcon(q.subject)} ${esc(q.subject)} • ${esc(q.category)}</span>

        <h3>Ποιος όρος ταιριάζει με την περιγραφή;</h3>

        <p class="quiz-prompt">
          ${esc(q.prompt)}
        </p>
      </div>

      <div class="quiz-options">
        ${q.choices.map((choice, index) => `
          <button 
            class="quiz-choice ${choiceClass(choice)}" 
            data-choice="${esc(choice)}"
            ${q.answered ? 'disabled' : ''}
          >
            <span class="choice-letter">${String.fromCharCode(65 + index)}</span>
            <span>${esc(choice)}</span>
          </button>
        `).join('')}
      </div>

      ${
        q.answered
          ? `
            <div class="quiz-feedback ${q.pick === q.answer ? 'good' : 'bad'}">
              <h3>${q.pick === q.answer ? '✅ Σωστά!' : '❌ Όχι ακριβώς.'}</h3>

              <p>
                <b>Σωστή απάντηση:</b> ${esc(q.answer)}
              </p>

              <p>
                <b>Επεξήγηση:</b> ${esc(q.definition || q.hint || 'Δείτε τον όρο στη Μελέτη για περισσότερες πληροφορίες.')}
              </p>

              ${
                q.quiz
                  ? `<p><b>Ερώτηση συζήτησης:</b> ${esc(q.quiz)}</p>`
                  : ''
              }

              <button class="btn" id="nextQuiz">
                Επόμενη ερώτηση →
              </button>
            </div>
          `
          : ''
      }
    </section>
  `;
}

export function bindQuiz(app) {
  document.getElementById('newQuiz')?.addEventListener('click', () => {
    q = makeQuestion(quizTerms(app));
    app.render();
  });

  document.getElementById('nextQuiz')?.addEventListener('click', () => {
    q = makeQuestion(quizTerms(app));
    app.render();
  });

  document.querySelectorAll('[data-choice]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!q || q.answered) return;

      q.answered = true;
      q.pick = btn.dataset.choice;

      app.state.stats.quizTotal = (app.state.stats.quizTotal || 0) + 1;

      if (q.pick === q.answer) {
        app.state.stats.quizCorrect = (app.state.stats.quizCorrect || 0) + 1;
        streak++;
      } else {
        streak = 0;
      }

      app.save();
      app.render();
    });
  });
}

function makeQuestion(words) {
  const answer = words[Math.floor(Math.random() * words.length)];

  const sameCategory = words.filter(w =>
    w.category === answer.category &&
    w.term !== answer.term
  );

  const sameSubject = words.filter(w =>
    w.subject === answer.subject &&
    w.term !== answer.term
  );

  const fallback = words.filter(w => w.term !== answer.term);

  let distractorPool = sameCategory.length >= 3
    ? sameCategory
    : sameSubject.length >= 3
      ? sameSubject
      : fallback;

  const choices = [answer.term];

  for (const item of shuffle(distractorPool)) {
    if (choices.length >= 4) break;
    if (!choices.includes(item.term)) {
      choices.push(item.term);
    }
  }

  return {
    prompt: answer.definition || answer.hint,
    answer: answer.term,
    choices: shuffle(choices),
    answered: false,
    pick: null,
    subject: answer.subject,
    category: answer.category,
    hint: answer.hint,
    definition: answer.definition,
    quiz: answer.quiz
  };
}

function quizTerms(app) {
  return allTerms(app.state).filter(t => t.definition || t.hint);
}

function choiceClass(choice) {
  if (!q?.answered) return '';

  if (choice === q.answer) return 'correct';
  if (choice === q.pick) return 'wrong';

  return 'muted-choice';
}

function subjectIcon(subject) {
  if (subject === 'Υγιεινή') return '🩺';
  if (subject === 'Ανατομία') return '🦴';
  return '📚';
}