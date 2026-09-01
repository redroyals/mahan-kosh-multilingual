// Mahan Kosh's own lexicographic convention (documented in the dictionary's
// own front matter, entries 1-30-0/1-31-0): a loanword's origin is tagged
// with a short abbreviation — Skt (Sanskrit, 10,851 entries), P (Persian,
// 2,880), A (Arabic, 2,567) — at the start of a definition, or right after a
// leading sense number. Every one of the 23 machine-translated languages
// left these three tags as bare, untranslated English abbreviations (they
// read as proper nouns to the translation model), so e.g. a Tamil or
// Russian reader sees literal "Skt n Brahma..." with no indication what
// "Skt" means.
//
// This expands ONLY those three tags — the three loan-origin languages the
// dictionary's own front matter names as its classification scheme — at
// DISPLAY time. It never touches the underlying data files (data/entries/).
// Two rarer tags exist in the corpus (Dg, S — ~197 and ~188 entries) but
// their referent language is not confidently identifiable from the data
// alone, so per the "don't convert what wasn't meant to be converted" rule
// they are deliberately left unexpanded rather than guessed at.
//
// Matches only a true tag position: start of string, or right after a
// leading Arabic-numeral sense number ("2 Skt ..."). The trailing \b(?=\s)
// requires a genuine word boundary followed by whitespace, so "Part" can
// never match "P" and a real word never breaks right after the bare tag.

type TagSet = { skt: string; p: string; a: string };

// Non-Latin-script languages: the bare native word only, no parenthetical
// Latin abbreviation code — embedding "(Skt.)" inside Devanagari/Cyrillic/
// CJK/Perso-Arabic prose reads as a typographic glitch and the abbreviation
// itself carries no meaning to that reader anyway (same choice already made
// for the sikhs.pk/Urdu sibling site).
const NATIVE_ONLY = new Set([
  "arabic",
  "urdu",
  "persian",
  "shahmukhi",
  "chinese",
  "japanese",
  "bengali",
  "gujarati",
  "tamil",
  "telugu",
  "russian",
]);

const TAGS: Record<string, TagSet> = {
  spanish: { skt: "Sánscrito", p: "Persa", a: "Árabe" },
  french: { skt: "Sanskrit", p: "Persan", a: "Arabe" },
  german: { skt: "Sanskrit", p: "Persisch", a: "Arabisch" },
  portuguese: { skt: "Sânscrito", p: "Persa", a: "Árabe" },
  italian: { skt: "Sanscrito", p: "Persiano", a: "Arabo" },
  dutch: { skt: "Sanskriet", p: "Perzisch", a: "Arabisch" },
  polish: { skt: "Sanskryt", p: "Perski", a: "Arabski" },
  swedish: { skt: "Sanskrit", p: "Persiska", a: "Arabiska" },
  romanian: { skt: "Sanscrită", p: "Persană", a: "Arabă" },
  czech: { skt: "Sanskrt", p: "Perština", a: "Arabština" },
  hungarian: { skt: "Szanszkrit", p: "Perzsa", a: "Arab" },
  danish: { skt: "Sanskrit", p: "Persisk", a: "Arabisk" },
  chinese: { skt: "梵语", p: "波斯语", a: "阿拉伯语" },
  japanese: { skt: "サンスクリット語", p: "ペルシア語", a: "アラビア語" },
  bengali: { skt: "সংস্কৃত", p: "ফার্সি", a: "আরবি" },
  gujarati: { skt: "સંસ્કૃત", p: "ફારસી", a: "અરબી" },
  tamil: { skt: "சமஸ்கிருதம்", p: "பாரசீகம்", a: "அரபு" },
  telugu: { skt: "సంస్కృతం", p: "పర్షియన్", a: "అరబిక్" },
  russian: { skt: "Санскрит", p: "Персидский", a: "Арабский" },
  persian: { skt: "سانسکریت", p: "فارسی", a: "عربی" },
  arabic: { skt: "سنسكريتية", p: "فارسية", a: "عربية" },
  urdu: { skt: "سنسکرت", p: "فارسی", a: "عربی" },
  shahmukhi: { skt: "سنسکرت", p: "فارسی", a: "عربی" },
};

const TAG_RE = /^(\d+\s+)?(Skt|P|A)\b(?=\s)/;

export function expandOriginTag(text: string, lang: string): string {
  const set = TAGS[lang];
  if (!set) return text;
  const m = TAG_RE.exec(text);
  if (!m) return text;
  const [, prefix = "", tag] = m;
  const full = tag === "Skt" ? set.skt : tag === "P" ? set.p : set.a;
  const rest = text.slice(m[0].length);
  if (NATIVE_ONLY.has(lang)) {
    return `${prefix}${full}${rest}`;
  }
  return `${prefix}${full} (${tag}.)${rest}`;
}
