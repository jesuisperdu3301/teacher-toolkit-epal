import { allTerms } from '../core/database.js';
import { esc } from '../core/ui.js';

let wheelRot = 0;
let selected = null;
let spinning = false;

export function renderWheel(app) {
  const words = allTerms(app.state);

  return `
    <section class="card" style="text-align:center">
      <div class="wheel" id="wheel" style="transform:rotate(${wheelRot}deg)">
        <div class="wheelInner">
          ${spinning ? 'Γυρίζει...' : '🎡'}
        </div>
      </div>

      <br>

      <button class="btn" id="spinWheel" ${spinning || !words.length ? 'disabled' : ''}>
        🎡 Spin
      </button>

      ${
        selected && !spinning
          ? `
            <div class="card result-card" style="margin-top:16px">
              <h2>${esc(selected.term)}</h2>
              <p class="small">${esc(selected.category || '')}</p>
              <p class="hint">${esc(selected.hint || selected.definition || '')}</p>
              <p><b>Ερώτηση:</b> ${esc(selected.quiz || 'Εξηγήστε τον όρο.')}</p>
            </div>
          `
          : ''
      }
    </section>
  `;
}

export function bindWheel(app) {
  document.getElementById('spinWheel')?.addEventListener('click', () => {
    const words = allTerms(app.state);
    if (!words.length || spinning) return;

    selected = null;
    spinning = true;
    app.render();

    setTimeout(() => {
      wheelRot += 1080 + Math.floor(Math.random() * 360);
      const wheel = document.getElementById('wheel');
      if (wheel) wheel.style.transform = `rotate(${wheelRot}deg)`;
    }, 30);

    setTimeout(() => {
      selected = words[Math.floor(Math.random() * words.length)];
      spinning = false;

      app.state.stats.wheelSpins = (app.state.stats.wheelSpins || 0) + 1;
      app.save();
      app.render();
    }, 2000);
  });
}