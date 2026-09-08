# Faridkot English reading edition — GitHub source audit

Source: https://github.com/redroyals/faridkot-teeka-exegesis-multilingual/tree/4603dec01997b8e6abc4b2b54a98c9ee38eba740

The original Punjabi is taken from this pinned GitHub commit. Every extracted Punjabi page reconstructs the GitHub ang text exactly. English page boundaries are recovered from the repository separators; only exterior whitespace from the older packaging is restored to retain existing audit offsets. The recovered English includes 124 pages missing from the previous local cache.

- 4,292 paired physical pages completed two bilingual model reviews and a final Punjabi-only review using `google/gemini-2.5-flash-lite`.
- 4,300 output slots retained; pages 1–5 are absent front matter in this repository, and Punjabi pages 971, 1565, 2974 are absent. These eight slots are explicitly marked missing-source.
- 1,309 ang assets contain 19,019 contextual hover occurrences. Other angs retain their existing reading.
- 34 occurrence contexts did not match the corrected reader text exactly and were withheld.
- 19,029 source-linked English annotations are exported separately. These are the basis for future language-specific alignment, not completed translations into 26 languages.

The original English remains an immutable audit input. This is a reading-label audit, not a complete scholarly correction of every translated sentence. Verse lines, personal names and uncertain mappings remain protected. Model agreement does not establish infallibility.

Reader: English labels are white and bold; hover/tap provides Punjabi, transliteration and explanation. Inline source subtitles are disabled by default and can be enabled in the toolbar.

Validation: 1,873 unit tests pass (26 skipped); 12 publisher invariants pass. The TypeScript ratchet still fails with three existing admin/PDF errors, so this has not been deployed to production.

Live development data also passed desktop (1440px) and mobile (390px) checks: 168 explainers on ang 1, source modal, hidden default subtitles, no marker leakage and no horizontal overflow. The mocked occurrence-reader regression checks also passed.
