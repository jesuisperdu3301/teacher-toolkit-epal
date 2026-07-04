# 🎓 Teacher Toolkit ΕΠΑΛ

> **An offline-first Progressive Web App (PWA) designed to transform classroom terminology into interactive learning experiences for Greek EPAL Health Sciences education.**

*(Add a screenshot banner of the Home screen here.)*

---

# 🌟 Overview

Teacher Toolkit ΕΠΑΛ is a modern educational toolkit developed specifically for teachers of the Health Sciences sector in Greek Vocational High Schools (ΕΠΑΛ).

Instead of treating classroom terminology as static content, the application converts a single knowledge base into multiple educational activities such as games, quizzes, flashcards and study tools.

The application runs entirely inside the browser, requires no server, works offline after the first visit, and automatically saves all teacher data locally.

---

# 🎯 Educational Philosophy

Traditional digital educational tools often require teachers to prepare separate material for every classroom activity.

Teacher Toolkit follows a different philosophy.

> **Create educational content once. Reuse it everywhere.**

Each lesson is stored as a structured database containing:

* Terms
* Categories
* Hints
* Definitions
* Discussion questions

From this single dataset the application automatically generates:

* Flashcards
* Quizzes
* Random Wheel activities
* Impostor classroom games
* Study Browser
* Teacher Notes

This dramatically reduces preparation time while keeping all classroom activities synchronized.

---

# 🧠 Core Concept

```text
Lesson Pack (.epack)

        │

        ▼

+-----------------------+
| Structured Knowledge  |
+-----------------------+
        │
        ├───────────────┐
        │               │
        ▼               ▼
Flashcards         Study Browser
        │
        ▼
Quiz Generator
        │
        ▼
Random Wheel
        │
        ▼
Impostor Game
```

Every module uses the exact same database.

There is no duplicated content.

---

# ✨ Features

## 🎭 Impostor

A classroom party game adapted for educational use.

Students secretly receive either:

* the correct educational term
* or the role of the Impostor.

After discussion they must identify the impostor while reviewing important terminology.

Includes:

* multiple impostors
* category selection
* Teacher Mode
* educational discussion cards

---

## 🃏 Flashcards

Interactive revision cards featuring:

* term
* hint
* full definition
* discussion question

Additional features:

* shuffle
* favourites
* progress indicator
* keyboard shortcuts

---

## ❓ Quiz

Automatic multiple-choice assessment generated directly from lesson packs.

Features:

* adaptive distractors
* score tracking
* streak counter
* success statistics
* educational explanations

---

## 🎡 Random Wheel

A random oral examination tool.

Teachers can randomly select:

* individual terms
* entire categories

Each spin reveals additional educational material and discussion prompts.

---

## 🔎 Study Browser

Powerful searchable reference system.

Supports searching by:

* term
* definition
* category
* hint
* discussion question

Teachers can also attach private notes to every educational term.

---

## 📚 Database Manager

Complete lesson pack management.

Supports:

* creating databases
* editing databases
* importing
* exporting
* deleting
* category management
* term management

The application uses the custom `.epack` format.

---

# 📦 Lesson Packs

Each lesson pack contains structured educational information.

Example:

```json
{
  "term":"Heart",
  "category":"Cardiovascular System",
  "hint":"Muscular pump",
  "definition":"The organ responsible for pumping blood...",
  "quiz":"Explain the function of the heart."
}
```

This information automatically powers every educational module.

---

# 💾 Offline First

Teacher Toolkit is a Progressive Web App.

Features include:

* Offline support
* Service Worker caching
* Local auto-save
* Installable as desktop/mobile app
* No account required
* No cloud dependency

---

# 🔒 Privacy

Teacher Toolkit stores all data locally using the browser's Local Storage.

No personal information is transmitted to external servers.

No analytics.

No tracking.

No advertisements.

---

# 🎓 Designed For

* ΕΠΑΛ Health Sciences
* Biology
* Anatomy
* Hygiene
* Nursing
* Healthcare terminology

The architecture can easily be adapted for other educational subjects.

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/yourusername/teacher-toolkit-epal.git
```

Run a local web server.

Example:

```bash
python -m http.server
```

Open

```
http://localhost:8000
```

Or simply deploy to GitHub Pages.

---

# 🌍 Deployment

The project is fully compatible with:

* GitHub Pages
* Netlify
* Vercel
* Cloudflare Pages

No backend is required.

---

# 🏗️ Technologies

* HTML5
* CSS3
* JavaScript (ES Modules)
* Progressive Web App (PWA)
* Local Storage
* Service Workers

No external frameworks.

No build process.

No dependencies.

---

# 📁 Project Structure

```text
TeacherToolkit/

css/
js/
    core/
    modules/
assets/
packs/

index.html
manifest.json
sw.js
README.md
```

---

# 🎮 Educational Workflow

```text
Teacher creates Lesson Pack

↓

Study

↓

Flashcards

↓

Quiz

↓

Random Wheel

↓

Impostor

↓

Teacher Discussion
```

The entire teaching cycle is based on a single knowledge source.

---

# 🗺️ Roadmap

Planned future features:

* Student score tracking
* AI lesson generation
* Classroom leaderboards
* QR-code multiplayer mode
* Images and diagrams
* Audio pronunciation
* Printable worksheets
* Community lesson pack repository
* Cloud synchronization (optional)

---

# 📜 License

MIT License

---

# 👨‍💻 Author

**jesuisperdu3301**
