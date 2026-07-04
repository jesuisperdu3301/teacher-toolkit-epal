import { loadState, saveState } from './core/storage.js';
import { loadDefaultPacks, allTerms, categories } from './core/database.js';
import { toast, $ } from './core/ui.js';

import { renderHome } from './modules/home.js';
import { renderImpostor, bindImpostor } from './modules/impostor.js';
import { renderFlashcards, bindFlashcards } from './modules/flashcards.js';
import { renderQuiz, bindQuiz } from './modules/quiz.js';
import { renderWheel, bindWheel } from './modules/wheel.js';
import { renderStudy, bindStudy } from './modules/study.js';
import { renderDatabase, bindDatabase, handleImport } from './modules/databaseManager.js';
import { renderSettings, bindSettings } from './modules/settings.js';

const app = {
    state: loadState(),
    route: 'home',

    routes: [
        { id: 'home', icon: '🏠', label: 'Αρχική', desc: 'Επισκόπηση και επιλογή μαθήματος' },
        { id: 'impostor', icon: '🎭', label: 'Impostor', desc: 'Κρυφή λέξη και impostors', home: true },
        { id: 'flashcards', icon: '🃏', label: 'Flashcards', desc: 'Κάρτες επανάληψης', home: true },
        { id: 'quiz', icon: '❓', label: 'Quiz', desc: 'Αυτόματες ερωτήσεις', home: true },
        { id: 'wheel', icon: '🎡', label: 'Random Wheel', desc: 'Τυχαία προφορική εξέταση', home: true },
        { id: 'study', icon: '🔎', label: 'Study Browser', desc: 'Αναζήτηση και εκπαιδευτικές κάρτες', home: true },
        { id: 'database', icon: '📚', label: 'Βάσεις', desc: 'Lesson packs και import/export', home: true },
        { id: 'settings', icon: '⚙️', label: 'Ρυθμίσεις', desc: 'Theme, PWA και backup', home: true }
    ],

    toast,

    save() {
        saveState(this.state);
    },

    setRoute(route) {
        this.route = route || 'home';
        this.render();
    },

    render() {
        renderShell();

        const view = $('#view');
        if (!view) return;

        const map = {
            home: renderHome,
            impostor: renderImpostor,
            flashcards: renderFlashcards,
            quiz: renderQuiz,
            wheel: renderWheel,
            study: renderStudy,
            database: renderDatabase,
            settings: renderSettings
        };

        view.innerHTML = (map[this.route] || renderHome)(this);

        bindGlobal();

        const binders = {
            impostor: bindImpostor,
            flashcards: bindFlashcards,
            quiz: bindQuiz,
            wheel: bindWheel,
            study: bindStudy,
            database: bindDatabase,
            settings: bindSettings
        };

        (binders[this.route] || (() => { }))(this);
    }
};

async function init() {
    ensureStateShape();

    if (!app.state.databases.length) {
        app.state.databases = await loadDefaultPacks();
        app.save();
    }

    applyTheme(app.state.settings.theme || 'light');
    // Fullscreen cannot persist after reload, so never trust a saved presentation flag on startup.
    applyPresentation(!!document.fullscreenElement);

    document.addEventListener('fullscreenchange', () => {
        applyPresentation(!!document.fullscreenElement);
        app.save();
    });

    window.app = app;

    window.__saveTeacherNote = id => {
        app.state.notes ||= {};
        const box = document.getElementById('noteBox');
        app.state.notes[id] = box ? box.value : '';
        app.save();
        toast('Η σημείωση αποθηκεύτηκε.');
    };

    window.__saveModalNote = id => {
        app.state.notes ||= {};
        const box = document.getElementById('modalNote');
        app.state.notes[id] = box ? box.value : '';
        app.save();
        toast('Η σημείωση αποθηκεύτηκε.');
    };

    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.onchange = e => {
            const file = e.target.files?.[0];

            if (file) {
                handleImport(app, file).catch(() => {
                    toast('Μη έγκυρο αρχείο.');
                });
            }

            e.target.value = '';
        };
    }

    app.render();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => { });
    }
}

function renderShell() {
    applyTheme(app.state.settings.theme || 'light');
    applyPresentation(!!document.fullscreenElement);

    const nav = $('#nav');
    if (nav) {
        nav.innerHTML = app.routes.map(route => `
            <button class="${app.route === route.id ? 'active' : ''}" data-route="${route.id}">
                <span>${route.icon}</span>${route.label}
            </button>
        `).join('');
    }

    const route = app.routes.find(x => x.id === app.route) || app.routes[0];

    const pageTitle = $('#pageTitle');
    if (pageTitle) {
        pageTitle.textContent = route.label === 'Αρχική'
            ? 'Teacher Toolkit ΕΠΑΛ'
            : route.label;
    }

    const pageSubtitle = $('#pageSubtitle');
    if (pageSubtitle) pageSubtitle.textContent = route.desc;

    const meta = $('#meta');
    if (meta) {
        meta.innerHTML = `
            <span class="chip">${app.state.settings.subject}</span>
            <span class="chip">${allTerms(app.state).length} όροι</span>
            <span class="chip">${categories(app.state).length} κατηγορίες</span>
            <span class="chip">${app.state.databases.length} βάσεις</span>
        `;
    }

    updateThemeBtn();
    updatePresentationBtn();
}

function bindGlobal() {
    // Use onclick assignments instead of addEventListener.
    // app.render() runs often; addEventListener would stack duplicate handlers.
    document.querySelectorAll('[data-route]').forEach(btn => {
        btn.onclick = () => app.setRoute(btn.dataset.route);
    });

    document.querySelectorAll('[data-subject]').forEach(btn => {
        btn.onclick = () => {
            app.state.settings.subject = btn.dataset.subject;
            app.save();
            toast('Επιλέχθηκε ' + btn.dataset.subject);
            app.render();
        };
    });

    const themeBtn = $('#themeBtn');
    if (themeBtn) {
        themeBtn.onclick = () => {
            const next = app.state.settings.theme === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            app.save();
        };
    }

    const presentationBtn = $('#presentationBtn');
    if (presentationBtn) {
        presentationBtn.onclick = async () => {
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                } else {
                    await document.exitFullscreen();
                }
                // fullscreenchange will sync state/button, but call once here too for instant feedback.
                applyPresentation(!!document.fullscreenElement);
                app.save();
            } catch {
                toast('Το fullscreen δεν υποστηρίζεται ή μπλοκαρίστηκε από τον browser.');
            }
        };
    }

    const brand = $('.brand');
    if (brand) brand.onclick = () => app.setRoute('home');
}

function applyTheme(theme) {
    const cleanTheme = theme === 'dark' ? 'dark' : 'light';

    app.state.settings.theme = cleanTheme;

    document.documentElement.dataset.theme = cleanTheme;
    document.body.dataset.theme = cleanTheme;

    document.documentElement.classList.toggle('dark', cleanTheme === 'dark');
    document.body.classList.toggle('dark', cleanTheme === 'dark');

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', cleanTheme === 'dark' ? '#0f1220' : '#6759ff');

    updateThemeBtn();
}

function applyPresentation(on) {
    app.state.settings.presentation = !!on;
    document.body.classList.toggle('presentation', !!on);
    updatePresentationBtn();
}

function updateThemeBtn() {
    const btn = $('#themeBtn');
    if (!btn) return;

    btn.textContent = app.state.settings.theme === 'dark' ? '☀️ Light' : '🌙 Dark';
    btn.setAttribute('aria-label', app.state.settings.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.title = app.state.settings.theme === 'dark' ? 'Light mode' : 'Dark mode';
}

function updatePresentationBtn() {
    const btn = $('#presentationBtn');
    if (!btn) return;

    btn.textContent = document.fullscreenElement || app.state.settings.presentation
        ? 'Έξοδος Full Screen'
        : '🖥 Full Screen';
}

function ensureStateShape() {
    app.state ||= {};

    app.state.settings ||= {};
    app.state.settings.theme = app.state.settings.theme === 'dark' ? 'dark' : 'light';
    app.state.settings.subject ||= 'Υγιεινή';
    app.state.settings.presentation = false;

    app.state.databases ||= [];
    app.state.notes ||= {};
    app.state.favorites ||= [];

    app.state.stats ||= {};
    app.state.stats.rounds ||= 0;
    app.state.stats.quizCorrect ||= 0;
    app.state.stats.quizTotal ||= 0;
    app.state.stats.wheelSpins ||= 0;
}

init();
