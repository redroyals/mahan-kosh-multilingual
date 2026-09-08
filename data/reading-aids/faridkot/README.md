# Faridkot reading aids

This is a separate, source-linked Faridkot Teeka reading dataset hosted alongside Mahan Kosh. It does not replace `data/entries`, change Mahan Kosh definitions, or assert that a Faridkot source sense is a matched Mahan Kosh entry. Faridkot physical-page IDs must never be used as Mahan Kosh entry IDs.

`en/english-reading-edition.json` preserves 4,300 physical-page slots, with 4,292 model-reviewed readings and eight explicit source gaps. `en/source-alignments.json` contains 19,029 occurrence bindings with Punjabi evidence, source hashes, transliteration, English display labels and explanations. `en/source-provenance.json` pins the original GitHub commit. `en/manifest.json` records checksums. See `en/AUDIT.md` for the review method and limits.

This is a readability and explanation layer, not a complete revision of the underlying translation. The source repository holds the original text. Three reviews by the same model provide checks, not independent scholarly certification. The original scripture, names and uncertain senses remain protected. Existing site corrections may cause an exact occurrence match to be withheld.

## Other languages

Existing editions can remain available with their existing machine-translation quality labels. This English audit provides no new assurance about their accuracy. No non-English edition was rewritten or reviewed in this release.

For each additional language:

1. Pin its original text and retain its stable entry or page IDs.
2. Match its exact local-language phrase to the same Punjabi source evidence. Never reuse English character offsets or match a word globally across different senses.
3. Translate the short reading label and explanation naturally in that language, preserving Punjabi quotations, letters and names. Store bindings under the appropriate language code, with the target-text hash.
4. Review the phrase and meaning against the Punjabi passage; separately check grammar, duplicate bracketed glosses, omitted clauses, script integrity and mobile/keyboard interaction. Withhold uncertain alignments.
5. Retranslate only passages whose underlying meaning is wrong, then revalidate all affected occurrence offsets. Preserve the existing reading as fallback when no reviewed alignment exists.

For Mahan Kosh dictionary translations, changes must instead follow Mahan Kosh's own stable entry IDs and original dictionary evidence. This Faridkot audit must not be propagated into dictionary definitions without that separate evidence check.

The source keys and evidence are reusable across languages; the English phrases and offsets are not. The Mahan Kosh viewer is not changed by adding these data files.
