# Teacher Toolkit ΕΠΑΛ

Offline, open-source classroom toolkit for Greek ΕΠΑΛ Health Sciences.

## Modules

- 🎭 Impostor
- 🃏 Flashcards
- ❓ Quiz Generator
- 🎡 Random Wheel
- 🔎 Study Browser
- 📚 Lesson Pack / Database Manager

## GitHub Pages

Upload the **contents** of this folder to a GitHub repository. Enable GitHub Pages from `main` branch and `/root`.

Required root files:

- `index.html`
- `manifest.json`
- `sw.js`
- `css/`
- `js/`
- `data/`
- `assets/`

Do **not** upload only the ZIP.

## Storage

The app uses browser LocalStorage. Data is saved per browser/device. It is not shared through GitHub Pages. Use **Export Backup** and **Import** to move data to another computer.

## Lesson pack schema

```json
{
  "app": "Teacher Toolkit ΕΠΑΛ",
  "version": 2,
  "databases": [
    {
      "subject": "Ανατομία",
      "name": "Example Pack",
      "categories": [
        {
          "name": "Κυκλοφορικό",
          "words": [
            {
              "term": "Καρδιά",
              "hint": "Η αντλία του κυκλοφορικού.",
              "definition": "Μυώδες όργανο που προωθεί το αίμα.",
              "quiz": "Ποια είναι η διαδρομή του αίματος;",
              "difficulty": 2,
              "image": "heart.webp",
              "keywords": ["αίμα", "κυκλοφορικό"],
              "related": ["Αρτηρία", "Φλέβα"]
            }
          ]
        }
      ]
    }
  ]
}
```

## License

MIT License.
