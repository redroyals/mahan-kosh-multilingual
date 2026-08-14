# Mahan Kosh (multilingual)

Bhai Kahan Singh Nabha’s *Gurushabad Ratnakar Mahan Kosh* (1930) — the great Sikh encyclopedia-dictionary — as plain JSON anyone can open, search, and build on.

**64,218** live entries. **26** languages. One id shared across every language.

This release is from [Sikhi.io](https://sikhi.io), in honour of **Guru Tegh Bahadur Ji’s 350th sacrifice** for the freedom of consciousness. Fork it. Translate it further. Put it in an app. Teach with it. Do not wait for permission.

Read it live: **https://sikhi.io/dictionary**

## What this is

*Mahan Kosh* is a dictionary and a short encyclopedia. Each entry has a Gurmukhi headword (the word being defined) and a body of prose: etymology, senses, people, places, scripture.

This repo is that book, keyed so a computer can use it.

- Every entry has a stable id like `1-37-0` (volume, page, position on the page).
- The same id is the same entry in English, Hindi, Gurmukhi, Spanish, Japanese, …
- There is no API and no login. The files in `data/` **are** the product.

If you can read a JSON file, you can build something.

## Languages

| What | Coverage | Notes |
|---|---|---|
| Gurmukhi headword | every live entry | Original lemma |
| Gurmukhi body | **60,196 / 64,218 (93.74%)** | Original prose. The other 4,022 are a join gap, not an error. |
| English | ~100% | Punjabi University Patiala edition (2006–2011) |
| Hindi | ~100% | From the English |
| 23 other languages | ~100% | Machine translations of the English |

The 23: Spanish, French, German, Portuguese, Italian, Chinese, Arabic, Urdu, Russian, Bengali, Gujarati, Tamil, Telugu, Persian, Japanese, Shahmukhi, Dutch, Polish, Swedish, Romanian, Czech, Hungarian, Danish.

English and Hindi are the careful spine. Everything after that is convenience text — useful for access, **not** a scholarly edition. Do not quote a machine translation as if Bhai Kahan Singh wrote it in Danish.

Numbers and the Google-Translate A/B: [`QUALITY.md`](QUALITY.md).

A missing Gurmukhi body is not “translation failed.” The headword could not be joined to original prose. The viewer says so instead of inventing a definition.

## Files

```
data/
  manifest.json           counts per language
  entries/core.json       the skeleton: id, headword, volume, page
  entries/en.json         English definitions
  entries/hi.json         Hindi definitions
  entries/gurmukhi.json   original Gurmukhi body (partial)
  entries/{lang}.json     one file per other language
```

`core.json` also keeps **3,932** excluded rows (title pages, tables, front matter). Skip anything with `"excluded": true`. Live entries = 64,218.

Optional `lemma` on a Gurmukhi row means the recovered headword spelling differs from `core.hw`.

`data/pages/` and `data/entries/tr/` are only fallbacks for the included viewer. You can ignore them.

## Look at one entry

`1-37-0` is the letter ਉ.

```js
// core.json → entries[]
{ "id": "1-37-0", "hw": "ਉ", "vol": 1, "page": 37 }

// en.json["1-37-0"]
{ "definitions": ["Skt 3 n Brahma. 2 Vishnu. 3 Shiv. …"] }

// gurmukhi.json["1-37-0"]
{ "text": "ਸੰ. उ. ਸੰਗ੍ਯਾ- ਬ੍ਰਹਮਾ। …", "align": "original" }

// spanish.json["1-37-0"]
{ "text": "Skt 3 n Brahma. 2 Vishnu. 3 Shiv. …", "align": "entry" }
```

Same id. Three languages. That is the whole design.

## Browse it on your machine

```
cd site
npm install
npm run dev
```

Opens a small search UI over these files. No backend.

## Use it in your own code

```js
import core from './data/entries/core.json' assert { type: 'json' }
import en from './data/entries/en.json' assert { type: 'json' }
import pa from './data/entries/gurmukhi.json' assert { type: 'json' }

for (const e of core.entries) {
  if (e.excluded) continue
  console.log(e.id, e.hw, en[e.id]?.definitions, pa[e.id]?.text)
}
```

Or open any `data/entries/*.json` in Python, Excel, a phone app, a game, a chatbot — whatever you actually ship.

## Please build

This data is meant to be taken. Ideas, none required:

- A better reader than [sikhi.io/dictionary](https://sikhi.io/dictionary)
- Offline / phone packs for one language
- Search that understands Gurmukhi *and* Latin spellings
- Flashcards, classroom sheets, “word of the day”
- A new human translation of a language we only have as machine text
- Tools that fill the remaining ~6% Gurmukhi bodies *without guessing*

If you add a language or fix a body, open a pull request. Keep machine text labelled as machine text.

## Limits (read these)

- Machine translations are unreviewed.
- Gurmukhi body is **complete for every id we could join without guessing.** 4,022 live ids are listed in `data/unresolved.json`. They have a headword and English. They are not errors and not forgotten files. Do not invent Gurmukhi for them.
- Headwords and English can still carry OCR scars. Treat this as a working digital edition, not a critical text.
- Ids are this edition’s grid. They are not page numbers in every printed Mahan Kosh.

## Licence

See `LICENSE` (CC BY 4.0). The 1930 Gurmukhi original is public domain. English follows the Patiala edition.

Credit Bhai Kahan Singh Nabha. Credit [Sikhi.io](https://sikhi.io) if you use this packaging.

Released in honour of Guru Tegh Bahadur Ji.
