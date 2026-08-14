# Data quality

Measured on this tree, 2026-08-14, after Pass A (holes / Japanese) and Pass B (English hyphen join + two wording repairs, replayed).

This is a working digital edition, not a critical text. English and Gurmukhi are the columns to build on. The other 23 languages are machine text on the English spine.

Live reader: https://sikhi.io/dictionary

## At a glance

| Column | Live coverage | What it is | Quality |
|---|---|---|---|
| Grid (`core.json`) | 64,218 live / 3,932 excluded | Stable `{vol}-{page}-{seq}` ids | High |
| Gurmukhi headword | 64,218 / 64,218 | Original lemma | High |
| English | 64,214 / 64,218 | Patiala edition, OCR’d | Working edition |
| Hindi | 64,218 / 64,218 | From the English | Working edition |
| Gurmukhi body | **60,196 / 64,218 (93.74%)** | Original prose | Best column after English |
| 23 other languages | 64,214–64,218 each | Machine translations of English | Access layer |

4 live English rows are empty strings. Those ids cannot be translated. They stay empty on purpose.

## The grid

- Every live entry has a headword.
- Excluded rows are kept and labelled (front matter, tables, abbreviation keys, duplicate artefacts). They are not silently deleted.
- The same id is the same entry in every language. That is the product.

## English

- 0 missing definition arrays. 4 arrays are `['']`.
- About 12,900 `See X` stubs — the printed book does that.
- About 15,600 entries pack numbered senses (`1 … 2 …`) into one string.
- 501 live entries have no Latin `tr`.
- 680 entries are flagged in `corruption_flags.json` (broken See-refs, script junk).
- Pass B joined **2,900** OCR line-break hyphens on **2,004** English entries (`ac- knowledged` → `acknowledged`, `caste- mark` → `caste-mark`). Meaning unchanged; translations were not replayed.
- Two wording repairs were replayed through every language: `1-37-0` (`Skt 3 n` / `part wonderment`) and `3-58-21` (`Skt 2 n pony`). Spanish is now `maravilla, asombro`, not `parte de maravilla`.

English is complete enough to search and to translate from. Residual scars remain (Devanagari in some See-refs, 4 empty defs). Every other language still inherits whatever English we have not yet touched.

## Gurmukhi body

- 60,196 rows, every one has `text`, `align: "original"`.
- 5,651 carry a `lemma` when the recovered headword differs from `core.hw`.
- ~4,022 live ids have no body. That is an unjoined headword, not a missing file. Do not invent the rest.

## The 23 translations

Method: lock English to the id, translate that English per entry. Do not re-key by Gurmukhi.

After Pass A:

- Japanese leftover English `See X` → `「X」を参照` on **5,900** rows.
- Japanese duplicated sense-lists trimmed on **~1,175** rows (example: `1-290-0` no longer reprints 2–8).
- **133** empty/`page-fallback` rows filled (105 via machine translate of the English; 28 Shahmukhi from the Gurmukhi body, script-converted).
- **44** rows still empty — the 4 live ids with no English, in the languages that had no prior text.

A live A/B on 7 entries against Google Translate (same English): same band. This set keeps dictionary locks better (`Shiv` stayed Shiv; Google Spanish once produced `navajas`). Google was better on one Japanese `See`. Neither side repairs bad English.

Treat ES…DA as convenience text. Do not cite Danish as Nabha.

Shahmukhi is the weak method. Most of it is still English-MT. 28 holes were filled from Gurmukhi script conversion; that conversion is mechanical, not a human orthography.

## Japanese (cleanup pass)

Flash-Lite had left English `See`, duplicated sense lists, and ~560 rows with no kana/kanji (English or Hindi in the Japanese slot).

After the cleanup (same English spine, Gemini Flash on the leftovers; numbers/letter-names written in Japanese):

- Live Japanese rows with text: 64,217 / 64,218 (the one empty id has no English)
- Leftover English `See`: **0**
- Rows with no kana/kanji: **0**
- `を参照` present on ~19k See-style rows

Still machine Japanese. Not a human lexicon. The “never became Japanese” hole is closed.

## What “finished” still means

1. Repair dirty English, then re-translate **only those ids**.
2. Public queue for the ~4k Gurmukhi gaps. No guessed bodies.
3. Humans on the headwords people actually open, if you want a scholarly layer.

None of that blocks using or forking this tree.
