import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import "./App.css";

type CoreEntry = { id: string; hw: string | null; tr: string | null; vol: number; page: number; sources: string[]; excluded?: boolean; exclude_reason?: string };
type CoreData = { count: number; entries: CoreEntry[] };
type EnEntry = { definitions: string[] };
type HiEntry = { tr_hi: string | null; definitions_hi: string[] };
type LangEntry = { text: string | null; align: string; lemma?: string };
type Manifest = { total_entries: number; aligned_languages: Record<string, { resolved_pct: number }> };

const LANGUAGES: { key: string; label: string }[] = [
  { key: "gurmukhi", label: "ਗੁਰਮੁਖੀ (Original)" },
  { key: "en", label: "English" },
  { key: "hi", label: "Hindi" },
  { key: "spanish", label: "Spanish" },
  { key: "french", label: "French" },
  { key: "german", label: "German" },
  { key: "portuguese", label: "Portuguese" },
  { key: "italian", label: "Italian" },
  { key: "chinese", label: "Chinese" },
  { key: "arabic", label: "Arabic" },
  { key: "urdu", label: "Urdu" },
  { key: "russian", label: "Russian" },
  { key: "bengali", label: "Bengali" },
  { key: "gujarati", label: "Gujarati" },
  { key: "tamil", label: "Tamil" },
  { key: "telugu", label: "Telugu" },
  { key: "persian", label: "Persian" },
  { key: "japanese", label: "Japanese" },
  { key: "shahmukhi", label: "Punjabi (Shahmukhi)" },
  { key: "dutch", label: "Dutch" },
  { key: "polish", label: "Polish" },
  { key: "swedish", label: "Swedish" },
  { key: "romanian", label: "Romanian" },
  { key: "czech", label: "Czech" },
  { key: "hungarian", label: "Hungarian" },
  { key: "danish", label: "Danish" },
];

// Each language's own alphabet, in its own conventional order (vowels
// first for the abugida scripts -- Devanagari/Bengali/Gujarati/Tamil/
// Telugu recitation order; alef-be-... order for the Perso-Arabic
// scripts; gojuon order for Japanese hiragana; Zhuyin for Chinese, since
// Chinese has no letter alphabet of its own). Rendered as a row of
// individually clickable letters below the language switcher, for the
// currently active language only -- clicking one runs it as a search
// query, the same substring match the search box already does, so it
// works as a quick "browse by letter" shortcut once a script you can't
// type on your own keyboard is selected.
const ALPHABETS: Record<string, string[]> = {
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  hi: "अ आ इ ई उ ऊ ऋ ए ऐ ओ औ क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह".split(" "),
  spanish: "A B C D E F G H I J K L M N Ñ O P Q R S T U V W X Y Z".split(" "),
  french: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  german: "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z Ä Ö Ü ß".split(" "),
  portuguese: "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z Ã Ç Õ".split(" "),
  italian: "A B C D E F G H I L M N O P Q R S T U V Z".split(" "),
  chinese: "ㄅ ㄆ ㄇ ㄈ ㄉ ㄊ ㄋ ㄌ ㄍ ㄎ ㄏ ㄐ ㄑ ㄒ ㄓ ㄔ ㄕ ㄖ ㄗ ㄘ ㄙ ㄧ ㄨ ㄩ ㄚ ㄛ ㄜ ㄝ ㄞ ㄟ ㄠ ㄡ ㄢ ㄣ ㄤ ㄥ ㄦ".split(" "),
  arabic: "ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي".split(" "),
  urdu: "ا ب پ ت ٹ ث ج چ ح خ د ڈ ذ ر ڑ ز ژ س ش ص ض ط ظ ع غ ف ق ک گ ل م ن و ہ ھ ء ی ے".split(" "),
  russian: "А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я".split(" "),
  bengali: "অ আ ই ঈ উ ঊ ঋ এ ঐ ও ঔ ক খ গ ঘ ঙ চ ছ জ ঝ ঞ ট ঠ ড ঢ ণ ত থ দ ধ ন প ফ ব ভ ম য র ল শ ষ স হ".split(" "),
  gujarati: "અ આ ઇ ઈ ઉ ઊ ઋ એ ઐ ઓ ઔ ક ખ ગ ઘ ઙ ચ છ જ ઝ ઞ ટ ઠ ડ ઢ ણ ત થ દ ધ ન પ ફ બ ભ મ ય ર લ વ શ ષ સ હ ળ".split(" "),
  tamil: "அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ க ங ச ஞ ட ண த ந ப ம ய ர ல வ ழ ள ற ன".split(" "),
  telugu: "అ ఆ ఇ ఈ ఉ ఊ ఋ ఎ ఏ ఐ ఒ ఓ ఔ క ఖ గ ఘ ఙ చ ఛ జ ఝ ఞ ట ఠ డ ఢ ణ త థ ద ధ న ప ఫ బ భ మ య ర ల వ శ ష స హ ళ".split(" "),
  persian: "ا ب پ ت ث ج چ ح خ د ذ ر ز ژ س ش ص ض ط ظ ع غ ف ق ک گ ل م ن و ه ی".split(" "),
  japanese: "あ い う え お か き く け こ さ し す せ そ た ち つ て と な に ぬ ね の は ひ ふ へ ほ ま み む め も や ゆ よ ら り る れ ろ わ を ん".split(" "),
  // Shahmukhi is Punjabi written in the same Perso-Arabic script family
  // as Urdu -- reusing Urdu's own alphabet row here (proven correct
  // characters) rather than hand-typing a separate Shahmukhi-specific
  // order, which this project has no verified source for yet.
  shahmukhi: "ا ب پ ت ٹ ث ج چ ح خ د ڈ ذ ر ڑ ز ژ س ش ص ض ط ظ ع غ ف ق ک گ ل م ن و ہ ھ ء ی ے".split(" "),
  // The 8-language European batch (2026-08-06): standard national
  // alphabets including each language's own diacritic letters, in their
  // conventional collation position (not just A-Z + extras appended).
  dutch: "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z".split(" "),
  polish: "A Ą B C Ć D E Ę F G H I J K L Ł M N Ń O Ó P R S Ś T U W Y Z Ź Ż".split(" "),
  swedish: "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z Å Ä Ö".split(" "),
  romanian: "A Ă Â B C D E F G H I Î J K L M N O P Q R S Ș T Ț U V W X Y Z".split(" "),
  czech: "A Á B C Č D Ď E É Ě F G H CH I Í J K L M N Ň O Ó P Q R Ř S Š T Ť U Ú Ů V W X Y Ý Z Ž".split(" "),
  hungarian: "A Á B C Cs D Dz Dzs E É F G Gy H I Í J K L Ly M N Ny O Ó Ö Ő P Q R S Sz T Ty U Ú Ü Ű V W X Y Z Zs".split(" "),
  danish: "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z Æ Ø Å".split(" "),
};

// Traditional 35-letter Gurmukhi
// painti order this dictionary itself is physically organized by --
// confirmed against the real corpus: sorting live entries by
// (vol, page, sequence) reproduces exactly this sequence across all 4
// volumes with no volume restarting the alphabet. "ੴ" is a synthetic
// bucket for the ~44 digit-initial entries (the book opens with ੴ).
const PAINTI = [
  "ੴ", "ੳ", "ਅ", "ੲ", "ਸ", "ਹ", "ਕ", "ਖ", "ਗ", "ਘ", "ਙ",
  "ਚ", "ਛ", "ਜ", "ਝ", "ਞ", "ਟ", "ਠ", "ਡ", "ਢ", "ਣ",
  "ਤ", "ਥ", "ਦ", "ਧ", "ਨ", "ਪ", "ਫ", "ਬ", "ਭ", "ਮ",
  "ਯ", "ਰ", "ਲ", "ਵ", "ੜ",
];

// Gurmukhi's own alphabet row reuses PAINTI directly -- declared here
// (an assignment, not part of the ALPHABETS literal above) because
// PAINTI itself isn't defined until this point in the module, and the
// object literal above evaluates top-to-bottom.
ALPHABETS["gurmukhi"] = PAINTI;

// Independent-vowel bearers (ਉ/ਊ/ਓ share the ੳ section, etc.) and
// precomposed nukta letters (ਸ਼ ਖ਼ ਗ਼ ਜ਼ ਫ਼ -- decomposed base+਼ sequences
// already resolve correctly since the base letter IS the first
// character in that case, nothing to fold).
const VOWEL_BEARER: Record<string, string> = {
  "ਉ": "ੳ", "ਊ": "ੳ", "ਓ": "ੳ",
  "ਆ": "ਅ", "ਐ": "ਅ", "ਔ": "ਅ",
  "ਈ": "ੲ", "ਏ": "ੲ",
};
const NUKTA_TO_BASE: Record<string, string> = {
  "ਸ਼": "ਸ", "ਖ਼": "ਖ", "ਗ਼": "ਗ", "ਜ਼": "ਜ", "ਫ਼": "ਫ",
};

function bearerLetter(hw: string): string {
  const s = hw.normalize("NFC");
  if (!s) return "?";
  let ch = s[0];
  if (/[੦-੯0-9]/.test(ch)) return "ੴ";
  ch = NUKTA_TO_BASE[ch] ?? ch;
  ch = VOWEL_BEARER[ch] ?? ch;
  return PAINTI.includes(ch) ? ch : "?";
}

// Languages with a real native-script transliteration of the headword
// generated by scripts/gen_indic_tr.py (deterministic Gurmukhi-block-
// offset transform, not the raw Latin `tr`). Everything else (Latin-
// display languages, and the LLM-lane languages not yet generated)
// falls back to the raw English/Latin `tr`.
const NATIVE_TR_LANGS = new Set([
  "hi", "bengali", "gujarati", "telugu", "tamil",
  "urdu", "persian", "arabic", "russian", "japanese",
]);

function normalize(s: string) {
  return s.normalize("NFC").toLowerCase().trim();
}

function stripBrackets(s: string | null | undefined): string | null {
  if (!s) return null;
  const t = s.replace(/[[\]]/g, "").trim();
  return t || null;
}

// core.json's `tr` uses ~40 IPA/diacritic Latin letters (ə ǝ ɛ ɪ ı ɔ ɑ ŋ ɖ ɲ
// plus macron/dot/cedilla-marked letters like ā ī ū ṭ ḍ ṇ ṛ ṣ ṅ ş ţ) --
// 69% of live entries (44,035/63,717) have at least one. The OLD romanize()
// just capitalized the raw string verbatim, so the bold display headword
// showed the schwa-laden phonetic scheme itself (e.g. "Əstavəkr") instead
// of a reader-facing transliteration -- while the entry's own English prose
// naturally spells the same word "Ashtavakar". Same folding idea already
// proven for anchor MATCHING in align_translations.py's normalize_anchor,
// reused here for DISPLAY: fold IPA letters with no Unicode decomposition
// via an explicit map, then NFKD-strip combining marks off everything else
// (macron/dot/cedilla letters decompose into base-letter + mark) -- unlike
// the matching-side fold, this keeps vowels and case, since a display
// transliteration must still read as a word, not a consonant skeleton.
const DISPLAY_IPA_FOLD: Record<string, string> = {
  "ə": "a", "ǝ": "a", "ɛ": "e", "ɪ": "i", "ı": "i", "ɔ": "o",
  "ɑ": "a", "ŋ": "n", "ɖ": "d", "ɲ": "n",
};

function foldDiacritics(s: string): string {
  const mapped = Array.from(s).map((ch) => DISPLAY_IPA_FOLD[ch] ?? ch).join("");
  return mapped.normalize("NFKD").replace(/\p{Mn}/gu, "").normalize("NFC");
}

// A dictionary-style romanized headword, derived from the source
// phonetic `tr` (e.g. "[udiana]" -> "Udiana"). Purely a display
// transform -- no new data, and it normalizes the ~2,394 live entries
// whose `tr` was never bracketed to begin with in the same pass.
function romanize(tr: string | null): string | null {
  const stripped = stripBrackets(tr);
  if (!stripped) return null;
  const folded = foldDiacritics(stripped);
  return folded.charAt(0).toUpperCase() + folded.slice(1);
}

// "See <Gurmukhi...>" cross-references in the English definitions.
// Captures a run of Gurmukhi-block words (U+0A00-U+0A7F) after "See "
// (also "See also"). Multi-word refs are real ("See ਉਸਟ੍ਰੀ ਦਮਾਮਾ");
// resolution (in linkifySee below) tries the longest word-prefix first
// and backs off word by word, so "See ਉਸਟ 2." still links just ਉਸਟ.
// Measured across en.json: 25,725 such refs; 18,540 (~72%) resolve to an
// exact live headword after NFC normalization -- the rest render as
// plain text, never a dead link, per this project's "never fabricate"
// convention.
const SEE_REF_RE = /\b(See(?:\s+also)?\s+)([਀-੿]+(?:\s+[਀-੿]+)*)/g;

// A short English gloss for the header, e.g. "Attraction" from a first
// definition like "Skt ... n attraction, gravitation, pull." Mahan Kosh
// is a scholarly ETYMOLOGICAL dictionary -- a single entry can chain
// several source-language markers before the real English gloss starts
// (e.g. "T ਕੈਂਚੀ Skt ਕਤਰਨੀ n scissors", or a marker glued directly to a
// foreign word with no space).
const GLOSS_MARKERS = new Set([
  "Skt", "Pkt", "Dg", "Pg", "A", "P", "S", "E", "T", "L", "F", "H", "G", "M", "U",
]);
const GLOSS_POS_RE = /^(?:adj|adv|vt|vi|vr|pron|part|sen|conj|prep|onom|num|abbr|suf|n|v)\.?\s+/;
// Glued POS tags are real (adj/adv fused to the next word, e.g.
// "adjready", "advsecond") but naive stripping is dangerous -- real
// glosses legitimately start "village", "vocative", "adverb",
// "advocate", so the adv form excludes those specific continuations.
const GLOSS_POS_GLUED_ADJ_RE = /^adj(?=[a-z])/;
const GLOSS_POS_GLUED_ADV_RE = /^adv(?!(?:erb|ocat|anc|ent|ers|ic|is))(?=[a-z])/;
// "na plant" (POS "n" glued to the article "a") -> "a plant".
const GLOSS_POS_GLUED_ARTICLE_RE = /^(?:n|v)(a|an|the)\b/;
const NON_ASCII_RE = /[^\x00-\x7F]/;

// `strict`: the primary (first-clause) candidate uses a TOLERANT ASCII
// ratio (>=90% after stripping punctuation) since it's already been
// through the marker/POS strip above. Second/third-clause fallback
// candidates (see extractGloss below) are unstripped raw clause text,
// so they need a stricter, fully-ASCII bar. The tolerant version
// admits transliteration junk ("–sənama", "pəraūṭha") on later clauses.
function isValidGlossCandidate(s: string, strict: boolean): boolean {
  if (!s) return false;
  if (/^[-–—]/.test(s)) return false; // citation attribution ("-VN.")
  if (/^\d/.test(s)) return false; // leading sense number/digit
  if (/^\(/.test(s)) return false; // leading parenthetical
  if (s.includes(")") && !s.includes("(")) return false; // unmatched close paren
  const cleaned = s.replace(/['''""–—]/g, "");
  if (!cleaned) return false;
  if (strict) {
    if (NON_ASCII_RE.test(cleaned)) return false;
  } else {
    const asciiCount = (cleaned.match(/[\x00-\x7F]/g) || []).length;
    if (asciiCount / cleaned.length < 0.9) return false;
  }
  if (!/[a-z]{2,}/.test(s)) return false;
  return true;
}

// The primary candidate is the first clause of `rest`. Some clean
// English clauses run past 60 chars before the first comma/semicolon.
// Rather than just raising the cap (which admits run-on garbage), a
// 61-120-char candidate first tries a GUARDED cut at a relative-clause
// boundary (" which "/" who "/" that "/etc.), keeping the cut only if
// the resulting prefix is itself a real phrase (>=15 chars, >=3 words)
// -- otherwise falls back to accepting the whole clause up to 80 chars.
const RELATIVE_CLAUSE_CUT_RE = /\s+(which|who|that|having|with|in order to|and|or)\s+/;

function fitFirstClause(rest: string): string | null {
  const m = rest.match(/^[^,;.“”"]+/);
  const candidate = (m ? m[0] : rest).trim();
  if (!candidate) return null;
  if (candidate.length <= 60) {
    return isValidGlossCandidate(candidate, false) ? candidate : null;
  }
  if (candidate.length <= 120) {
    const cut = candidate.match(RELATIVE_CLAUSE_CUT_RE);
    if (cut && cut.index !== undefined) {
      const prefix = candidate.slice(0, cut.index).trim();
      if (prefix.length >= 15 && prefix.split(/\s+/).length >= 3 && isValidGlossCandidate(prefix, false)) {
        return prefix;
      }
    }
    if (candidate.length <= 80) {
      return isValidGlossCandidate(candidate, false) ? candidate : null;
    }
  }
  return null;
}

// Strips the leading etymology-marker chain and POS tag from a raw
// definition string, returning what's left (still needs clause-
// splitting and validation by the caller).
function stripMarkersAndPos(def0: string): string {
  // Skip leading etymology-marker tokens (however many chain together),
  // and any foreign-script or capitalized-borrowed-word token riding
  // along with them (a Gurmukhi/Devanagari/Arabic word, or a garbled
  // Latin binomial name) -- capped at 8 tokens so a genuinely marker-
  // free definition can't be eaten by accident.
  const tokens = def0.split(/\s+/);
  let i = 0;
  while (i < tokens.length - 1 && i < 8) {
    const tok = tokens[i];
    const stripped = tok.replace(/[.,;]+$/, "");
    const hasNonAscii = NON_ASCII_RE.test(tok);
    const hasLowerAscii = /[a-z]/.test(tok);
    if (GLOSS_MARKERS.has(stripped)) {
      i++;
      continue;
    }
    if (hasNonAscii && (i > 0 || !hasLowerAscii)) {
      i++;
      continue;
    }
    if (i > 0 && /^[A-Z][A-Za-z]*[.,]?$/.test(tok)) {
      i++;
      continue;
    }
    break;
  }
  let rest = tokens.slice(i).join(" ");

  // Strip the POS tag (plain or glued) to a fixpoint, then drop a
  // leading foreign-script token with no lowercase ASCII letter (e.g.
  // "n ਆਕ a wild plant" -- POS, then an embedded Gurmukhi gloss word,
  // then the real English gloss).
  let prev;
  do {
    prev = rest;
    rest = rest.replace(GLOSS_POS_RE, "");
    rest = rest.replace(GLOSS_POS_GLUED_ADJ_RE, "");
    rest = rest.replace(GLOSS_POS_GLUED_ADV_RE, "");
    rest = rest.replace(GLOSS_POS_GLUED_ARTICLE_RE, "$1");
    const m = rest.match(/^(\S+)\s+/);
    if (m && NON_ASCII_RE.test(m[1]) && !/[a-z]/.test(m[1])) {
      rest = rest.slice(m[0].length);
    }
  } while (rest !== prev);

  return rest;
}

// Runs the strip + clause-fallback pipeline on one raw definition
// string, returning a valid (but not yet capitalized) gloss or null.
function glossFromOneDefinition(def0: string): string | null {
  if (/^See\b/.test(def0)) return null;
  const rest = stripMarkersAndPos(def0);
  // A marker/POS chain can strip down to another disguised cross-
  // reference ("A مجموع gathered. See ..." -> "See ..."); catch it here
  // too so it classifies the same way as an undisguised one, rather
  // than falling through to the clause fallbacks below.
  if (/^See\b/.test(rest)) return null;
  if (/^[“"]/.test(rest)) return null; // opens straight into a scripture citation, not a gloss

  const primary = fitFirstClause(rest);
  if (primary) return primary;

  // First clause may embed Gurmukhi; a later clause can be the gloss.
  const clauses = rest.split(/[,;.]/).slice(1);
  for (const raw of clauses) {
    const candidate = raw.trim();
    if (candidate.length > 60) continue;
    if (isValidGlossCandidate(candidate, true)) return candidate;
  }
  return null;
}

function extractGloss(definitions: string[] | undefined): string | null {
  if (!definitions || !definitions.length) return null;
  const def0 = (definitions[0] ?? "").trim();

  let gloss: string | null = null;
  if (!def0 || /^See\b/.test(def0)) {
    // First sense is a See-ref; try the second sense.
    const def1 = (definitions[1] ?? "").trim().replace(/^\d+\s+/, "");
    if (def1) gloss = glossFromOneDefinition(def1);
  } else {
    gloss = glossFromOneDefinition(def0);
  }

  if (!gloss) return null;
  return gloss.charAt(0).toUpperCase() + gloss.slice(1);
}

// Strips ONLY the leading etymology-marker chain (Skt, Pkt, P, A, ... --
// the fixed set the translation prompt instructs every language to keep
// VERBATIM in Latin, e.g. "Skt ਅਸ੍ਵਾਵਕ੍ਰ n ..." stays "Skt ਅਸ੍ਵਾਵਕ੍ਰ n ..."
// in every language) plus the POS tag, for the 15 translated languages.
//
// Deliberately NOT stripMarkersAndPos's do-while loop's extra "drop a
// leading foreign-script token with no lowercase ASCII letter" step
// (see stripMarkersAndPos above, the "n ਆਕ a wild plant" case) -- a real
// bug found live via manual multi-language comparison (2026-08-06): that
// step assumes the SURROUNDING text is English, so a foreign-script
// token right after the POS tag is a single embedded aside to skip
// before the real (English) gloss resumes. That assumption breaks
// completely once the REST OF THE TEXT is ALSO non-Latin script (i.e.
// every translated language except Chinese/Japanese, which have no
// spaces to tokenize on and so were accidentally immune): the do-while
// loop re-applies the "drop one leading foreign token" check on EVERY
// pass, and since every word in Arabic/Bengali/Tamil/etc prose is
// "foreign" by this test, it kept eating real gloss content one word at
// a time -- e.g. a correct Spanish "Véase ਅਖਲੇਸ." (See X) came out as a
// bare Arabic "ਹਾਸਿਦ." / Bengali "ਅਖਲੇਸ।" with the actual "see"/"صف"/
// "দেখুন" word silently eaten. Confirmed via a direct side-by-side of
// the same entry id across Spanish/Arabic/Bengali/Tamil/Japanese.
function stripLeadingScaffolding(def0: string): string {
  const tokens = def0.split(/\s+/);
  let i = 0;
  while (i < tokens.length - 1 && i < 8) {
    const tok = tokens[i];
    const stripped = tok.replace(/[.,;]+$/, "");
    if (GLOSS_MARKERS.has(stripped)) { i++; continue; }
    // The Gurmukhi headword embedded right after a marker (e.g. "Skt
    // ਅਸ੍ਵਾਵਕ੍ਰ") is genuine scaffolding in every language and safe to
    // drop unconditionally within the leading scaffolding region (i < 8)
    // -- safe at ANY position in the chain, not just i===0, since this
    // checks the GURMUKHI Unicode block specifically, never the target
    // language's own script (Arabic/Bengali/Tamil/etc characters simply
    // aren't in that range), so it can never eat real translated prose.
    if (GURMUKHI_RE_GLOSS.test(tok)) { i++; continue; }
    break;
  }
  let rest = tokens.slice(i).join(" ");
  let prev;
  do {
    prev = rest;
    rest = rest.replace(GLOSS_POS_RE, "");
    rest = rest.replace(GLOSS_POS_GLUED_ADJ_RE, "");
    rest = rest.replace(GLOSS_POS_GLUED_ADV_RE, "");
    rest = rest.replace(GLOSS_POS_GLUED_ARTICLE_RE, "$1");
  } while (rest !== prev);
  return rest;
}

const GURMUKHI_RE_GLOSS = /[਀-੿]/;

// A short gloss for any of the 15 translated (non-English) languages,
// which don't have en.json's array-of-clean-senses structure to work
// with -- each has one already-joined `text` string (or, for Hindi,
// `definitions_hi[0]`). Cuts at the first sentence-ending punctuation
// mark (covering the terminators these languages' own scripts use:
// Latin ".!?", CJK "。！？", Arabic/Urdu/Persian "؟۔", Bengali/Hindi/etc
// "।"), falling back to a ~100-char cap trimmed to the last space so a
// gloss never ends mid-word. Deliberately simpler than extractGloss's
// clause-fallback machinery above -- that machinery's validity checks
// (ASCII ratio, Latin word-shape) are English-specific and would reject
// every non-Latin-script gloss outright.
const SENTENCE_END_RE = /[.!?。！？؟۔।]/;

function extractGlossGeneric(text: string | null | undefined): string | null {
  if (!text) return null;
  const stripped = stripLeadingScaffolding(text.trim());
  if (!stripped) return null;
  const m = stripped.match(SENTENCE_END_RE);
  let candidate = m && m.index !== undefined ? stripped.slice(0, m.index + 1) : stripped;
  if (candidate.length > 100) {
    const cut = candidate.slice(0, 100);
    const lastSpace = cut.lastIndexOf(" ");
    candidate = (lastSpace > 40 ? cut.slice(0, lastSpace) : cut) + "…";
  }
  candidate = candidate.trim();
  if (!candidate) return null;
  return candidate.charAt(0).toUpperCase() + candidate.slice(1);
}

// A leading run of alternating "[transliteration]" / Gurmukhi-word
// tokens, e.g. "[omah], ਓਮਾਹੜਾ [omahra], ਓਮਾਹਾ [omaha]" -- the shared
// slice a grouped-variant entry opens with, per the source dictionary's
// own convention of listing alternate spellings before the definition.
// Only matches when the run contains at least one bracket (so a
// definition that happens to start with a bare Gurmukhi word for
// legitimate reasons is left alone).
const LEADING_VARIANT_RE =
  /^((?:\[[^\]\n]{1,60}\]|[਀-੿]+)(?:[,،、]?\s+(?:\[[^\]\n]{1,60}\]|[਀-੿]+))*)\s*/;

function splitGroupedVariants(text: string): { prefix: string; rest: string } | null {
  const m = text.match(LEADING_VARIANT_RE);
  if (!m || !m[1].includes("[")) return null;
  const rest = text.slice(m[0].length);
  if (!rest.trim()) return null;
  return { prefix: m[1], rest };
}

// A sidebar list row: Gurmukhi headword, its clean Latin transliteration
// in parentheses right after it (using the same fold as the entry-panel
// title -- romanize(), not the raw IPA-laden tr), then a short gloss IN
// THE CURRENTLY SELECTED LANGUAGE on its own line, bold, so the list
// itself teaches a reader the word and its meaning at a glance -- not
// just a bare list of Gurmukhi to click through, and not always English
// regardless of which language tab is active (the bug this fixes: the
// gloss used to read from langCache["en"] unconditionally). English and
// Hindi use their own array-of-clean-senses extractor (extractGloss /
// a direct definitions_hi[0] read); the 15 translated languages use the
// script-agnostic extractGlossGeneric over their single joined `text`
// field. Whichever cache isn't loaded yet just shows no gloss line
// rather than blocking the row -- gloss data catches up once
// ensureLangLoaded's fetch resolves (triggered on language switch).
function ResultRow({
  e,
  active,
  onClick,
  lang,
  enCache,
  hiCache,
  otherCache,
  nativeTr,
}: {
  e: CoreEntry;
  active: boolean;
  onClick: () => void;
  lang: string;
  enCache: Record<string, EnEntry> | undefined;
  hiCache: Record<string, HiEntry> | undefined;
  otherCache: Record<string, LangEntry> | undefined;
  nativeTr: string | undefined;
}) {
  // Same rule as the entry-detail panel's "native rendering" line: for
  // languages with a real native-script transliteration of the headword
  // (NATIVE_TR_LANGS), show THAT here instead of the Latin romanization
  // -- a reader of Arabic/Bengali/Tamil/etc shouldn't have to read the
  // pronunciation guide in Latin script just because that's the only
  // form the sidebar used to show, regardless of which language tab was
  // active. Falls back to the Latin form for languages without a
  // generated native-tr file (the six Latin-display languages, and any
  // not-yet-processed new language).
  const nativeStripped = stripBrackets(nativeTr);
  const roman = nativeStripped ?? romanize(e.tr);
  let gloss: string | null = null;
  if (lang === "en") {
    gloss = extractGloss(enCache?.[e.id]?.definitions);
  } else if (lang === "hi") {
    gloss = extractGlossGeneric(hiCache?.[e.id]?.definitions_hi?.[0]);
  } else {
    gloss = extractGlossGeneric(otherCache?.[e.id]?.text);
  }
  return (
    <button className={"result" + (active ? " active" : "")} onClick={onClick}>
      <div className="result-headline">
        <span className="hw">{e.hw}</span>
        {roman && <span className="tr">({roman})</span>}
      </div>
      {gloss && <div className="result-gloss">{gloss}</div>}
    </button>
  );
}

export default function App() {
  const [core, setCore] = useState<CoreData | null>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CoreEntry | null>(null);
  const [lang, setLang] = useState("en");
  const [langCache, setLangCache] = useState<Record<string, Record<string, EnEntry | HiEntry | LangEntry>>>({});
  const [pageCache, setPageCache] = useState<Record<string, Record<string, string>>>({});
  const [trCache, setTrCache] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"search" | "browse">("search");
  const [browseLetter, setBrowseLetter] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/entries/core.json").then((r) => r.json()),
      fetch("/manifest.json").then((r) => r.json()),
    ]).then(([c, m]) => {
      setCore(c);
      setManifest(m);
      setLoading(false);
    });
  }, []);

  // Tracks in-flight fetches so the mount-effect and an explicit
  // selectLang call in the same tick share one request instead of
  // double-fetching a 15-23MB language file.
  const inFlight = useRef<Map<string, Promise<unknown>>>(new Map());

  const ensureLangLoaded = useCallback(
    async (l: string) => {
      if (l in langCache) return;
      const key = `entries:${l}`;
      if (!inFlight.current.has(key)) {
        inFlight.current.set(key, fetch(`/entries/${l}.json`).then((r) => r.json()));
      }
      const data = (await inFlight.current.get(key)) as Record<string, EnEntry | HiEntry | LangEntry>;
      inFlight.current.delete(key);
      setLangCache((prev) => (l in prev ? prev : { ...prev, [l]: data }));
    },
    [langCache]
  );

  const ensurePageLoaded = useCallback(
    async (l: string) => {
      const pageLang = l === "en" ? "english" : l === "hi" || l === "gurmukhi" ? null : l;
      if (!pageLang || pageLang in pageCache) return;
      const data = await fetch(`/pages/${pageLang}.json`).then((r) => r.json());
      setPageCache((prev) => ({ ...prev, [pageLang]: data }));
    },
    [pageCache]
  );

  const ensureTrLoaded = useCallback(
    async (l: string) => {
      if (!NATIVE_TR_LANGS.has(l) || l in trCache) return;
      const key = `tr:${l}`;
      if (!inFlight.current.has(key)) {
        inFlight.current.set(key, fetch(`/entries/tr/${l}.json`).then((r) => r.json()));
      }
      const data = (await inFlight.current.get(key)) as Record<string, string>;
      inFlight.current.delete(key);
      setTrCache((prev) => (l in prev ? prev : { ...prev, [l]: data }));
    },
    [trCache]
  );

  useEffect(() => {
    ensureLangLoaded(lang);
  }, [lang, ensureLangLoaded]);

  const results = useMemo(() => {
    if (!core || !query.trim()) return [];
    const q = normalize(query);
    const nativeByLang = trCache[lang];
    return core.entries
      .filter((e) => !e.excluded)
      .filter((e) => {
        if (e.hw && normalize(e.hw).includes(q)) return true;
        if (e.tr && normalize(e.tr).includes(q)) return true;
        // Lets an alphabet-letter click (native script) actually find
        // entries -- without this, clicking e.g. Telugu's అ would only
        // ever match against the raw Latin/Gurmukhi fields, which never
        // contain Telugu characters, and always return "No matches."
        const nativeTr = nativeByLang?.[e.id];
        if (nativeTr && normalize(nativeTr).includes(q)) return true;
        return false;
      })
      .slice(0, 200);
  }, [core, query, trCache, lang]);

  // "Browse the Book": groups live entries by their Gurmukhi painti
  // section, each section internally sorted by (vol, page, sequence) --
  // i.e. the exact order they physically appear in the printed Mahan
  // Kosh, not any alphabetization of our own. core.json's `entries`
  // array is NOT stored in this order (verified), so this sort is
  // required, not a formality.
  const bookIndex = useMemo(() => {
    if (!core) return null;
    const live = core.entries.filter((e) => !e.excluded && e.hw);
    const seqOf = (id: string) => Number(id.split("-").pop());
    live.sort((a, b) => a.vol - b.vol || a.page - b.page || seqOf(a.id) - seqOf(b.id));
    const byLetter = new Map<string, CoreEntry[]>();
    for (const e of live) {
      const letter = bearerLetter(e.hw!);
      if (!byLetter.has(letter)) byLetter.set(letter, []);
      byLetter.get(letter)!.push(e);
    }
    return byLetter;
  }, [core]);

  // Exact-headword -> entry lookup for "See ..." cross-reference links.
  // 3,295 live headwords are duplicated (multiple senses / OCR variants
  // sharing one spelling) -- pick the FIRST in physical book order (vol,
  // page, sequence), same sort as bookIndex above, so the target is
  // deterministic and matches how the printed dictionary's own "See"
  // refs read (they point at the word; a reader finds its first entry).
  // NFC-normalized keys, since a handful of refs only match post-NFC.
  const hwLookup = useMemo(() => {
    if (!core) return null;
    const live = core.entries.filter((e) => !e.excluded && e.hw);
    const seqOf = (id: string) => Number(id.split("-").pop());
    live.sort((a, b) => a.vol - b.vol || a.page - b.page || seqOf(a.id) - seqOf(b.id));
    const map = new Map<string, CoreEntry>();
    for (const e of live) {
      const key = e.hw!.normalize("NFC").trim();
      if (!map.has(key)) map.set(key, e);
    }
    return map;
  }, [core]);

  // Shared by selectEntry and selectLang: given a target entry + language,
  // make sure both the entry-level data AND (if needed) the page-fallback
  // data for that language are loaded. Previously only selectLang did
  // this -- selectEntry (switching entries without changing language)
  // never ensured page-fallback data for the NEW entry was loaded, which
  // could leave a genuinely page-fallback entry stuck showing nothing
  // useful if its language's page file hadn't been fetched yet.
  const ensureEntryLangReady = useCallback(
    async (entry: CoreEntry, l: string) => {
      await ensureLangLoaded(l);
      await ensureTrLoaded(l);
      if (l === "en" || l === "hi" || l === "gurmukhi") return;
      // langCache here may still be one render behind ensureLangLoaded's
      // own state update (React state updates aren't synchronous even
      // after an await) -- treat "don't know yet" the same as "needs the
      // page fallback", which is always safe, just occasionally a wasted
      // (idempotent) fetch rather than a missed one.
      const rec = langCache[l]?.[entry.id] as LangEntry | undefined;
      if (!rec || rec.align === "page-fallback" || !rec.text) {
        await ensurePageLoaded(l);
      }
    },
    [langCache, ensureLangLoaded, ensurePageLoaded, ensureTrLoaded]
  );

  async function selectEntry(e: CoreEntry) {
    setSelected(e);
    await ensureEntryLangReady(e, lang);
  }

  // Splits one English definition string into text + clickable "See X"
  // cross-reference links. Only a Gurmukhi run that exactly resolves via
  // hwLookup becomes a link -- an unresolved reference (OCR variance, or
  // genuinely not a real cross-reference) stays plain text, never a dead
  // link. English-only for now: the translated languages DO contain their
  // own "See"-equivalent phrases ("Véase", "Voir", "Siehe", "जुओ", "See"
  // itself is unambiguous; those aren't), but those phrase forms are
  // inconsistent within a language and some (e.g. Hindi "देख") double as
  // ordinary prose verbs -- extending this needs its own measured
  // per-language analysis, not a guess, so it's deferred.
  function linkifySee(text: string): ReactNode {
    if (!hwLookup) return text;
    const out: ReactNode[] = [];
    let last = 0;
    let k = 0;
    for (const m of text.matchAll(SEE_REF_RE)) {
      const idx = m.index!;
      const words = m[2].split(/\s+/);
      // Longest-prefix match against real headwords first, backing off
      // word by word -- handles both multi-word refs and a trailing
      // sense number/extra clause that isn't part of the headword.
      let target: CoreEntry | undefined;
      let matchedLen = 0;
      for (let n = words.length; n >= 1; n--) {
        const phrase = words.slice(0, n).join(" ").normalize("NFC");
        const hit = hwLookup.get(phrase);
        if (hit) {
          target = hit;
          matchedLen = n;
          break;
        }
      }
      if (!target) continue; // leave the whole match as plain text
      const linked = words.slice(0, matchedLen).join(" ");
      const linkStart = idx + m[1].length;
      out.push(text.slice(last, linkStart));
      const t = target;
      out.push(
        <a
          key={k++}
          className="see-link"
          href="#"
          onClick={(ev) => {
            ev.preventDefault();
            selectEntry(t);
          }}
        >
          {linked}
        </a>
      );
      last = linkStart + linked.length;
    }
    if (last === 0) return text;
    out.push(text.slice(last));
    return <>{out}</>;
  }

  // Generalizes linkifySee to every other language, WITHOUT needing a
  // per-language "See"-equivalent phrase list (the thing that got this
  // feature deferred to English-only in the first place -- each
  // language spells "see" differently and some forms double as ordinary
  // prose verbs, too risky to pattern-match directly). The trick: find
  // the cross-reference TARGET from the entry's own ENGLISH source
  // (already-proven SEE_REF_RE + hwLookup resolution), then link that
  // same Gurmukhi phrase wherever it appears LITERALLY in the currently
  // displayed translation -- translations keep Gurmukhi cross-reference
  // words untouched by the translation prompt's own instruction, so the
  // anchor text is guaranteed to be present verbatim regardless of which
  // language is showing, with zero per-language phrase-matching risk.
  function seeTargetsForEntry(id: string): { phrase: string; entry: CoreEntry }[] {
    if (!hwLookup) return [];
    const enRec = langCache["en"]?.[id] as EnEntry | undefined;
    if (!enRec?.definitions) return [];
    const joined = enRec.definitions.join(" ");
    const targets: { phrase: string; entry: CoreEntry }[] = [];
    for (const m of joined.matchAll(SEE_REF_RE)) {
      const words = m[2].split(/\s+/);
      for (let n = words.length; n >= 1; n--) {
        const phrase = words.slice(0, n).join(" ").normalize("NFC");
        const hit = hwLookup.get(phrase);
        if (hit) {
          targets.push({ phrase, entry: hit });
          break;
        }
      }
    }
    return targets;
  }

  // Wraps literal occurrences of each resolved target phrase in the
  // given (already-translated, any-language) text with a clickable link.
  // Longest phrase first so a multi-word target ("ਉਸਟ੍ਰੀ ਦਮਾਮਾ") isn't
  // pre-empted by a shorter target that happens to be its own prefix.
  function linkifyTargets(text: string, targets: { phrase: string; entry: CoreEntry }[]): ReactNode {
    if (!targets.length) return text;
    const sorted = [...targets].sort((a, b) => b.phrase.length - a.phrase.length);
    let out: ReactNode[] = [text];
    let k = 0;
    for (const { phrase, entry } of sorted) {
      const next: ReactNode[] = [];
      for (const chunk of out) {
        if (typeof chunk !== "string") { next.push(chunk); continue; }
        const idx = chunk.indexOf(phrase);
        if (idx === -1) { next.push(chunk); continue; }
        if (idx > 0) next.push(chunk.slice(0, idx));
        const t = entry;
        next.push(
          <a
            key={`t${k++}`}
            className="see-link"
            href="#"
            onClick={(ev) => { ev.preventDefault(); selectEntry(t); }}
          >
            {phrase}
          </a>
        );
        const rest = chunk.slice(idx + phrase.length);
        if (rest) next.push(rest);
      }
      out = next;
    }
    return <>{out}</>;
  }

  async function selectLang(l: string) {
    setLang(l);
    // Loaded unconditionally (not just when an entry is selected) so the
    // sidebar result list -- which now also displays the active language's
    // native transliteration next to each headword -- has the data ready
    // even before the user opens any entry.
    await ensureTrLoaded(l);
    if (selected) await ensureEntryLangReady(selected, l);
  }

  const currentRecord = selected ? langCache[lang]?.[selected.id] : undefined;
  const langLoaded = lang in langCache;

  function renderDefinition() {
    if (!selected) return null;
    if (!langLoaded) return <p className="muted">Loading…</p>;
    if (lang !== "gurmukhi" && !currentRecord) return <p className="muted">Loading…</p>;

    if (lang === "en") {
      const rec = currentRecord as EnEntry;
      return (
        <ol className="definitions">
          {rec.definitions.map((d, i) => (
            <li key={i}>{linkifySee(d)}</li>
          ))}
        </ol>
      );
    }
    if (lang === "gurmukhi") {
      // Original-language dictionary prose (not a translation). No
      // page-fallback file; missing ids (~6% residual) are disclosed
      // here rather than as a spinner or "translation failed" message.
      const rec = currentRecord as LangEntry | undefined;
      const targets = seeTargetsForEntry(selected.id);
      if (rec?.text) {
        return <p className="translated-text gurmukhi-text">{linkifyTargets(rec.text, targets)}</p>;
      }
      return (
        <p className="muted">
          No original Gurmukhi body for this entry (4,022 of 64,218 live ids).
          The headword could not be joined without guessing. English and other
          languages for this id still work.
        </p>
      );
    }
    if (lang === "hi") {
      const rec = currentRecord as HiEntry;
      const targets = seeTargetsForEntry(selected.id);
      return (
        <ol className="definitions">
          {rec.definitions_hi.map((d, i) => (
            <li key={i}>{linkifyTargets(d, targets)}</li>
          ))}
        </ol>
      );
    }

    const rec = currentRecord as LangEntry;
    const pageKey = `${selected.vol}-${selected.page}`;
    const pageText = pageCache[lang]?.[pageKey];

    if (rec.text) {
      // Grouped slices ("exact_grouped" / "fuzzy_grouped" / "native_grouped"
      // -- the suffix now reflects the REAL quality of the anchor that
      // found the group, not always "exact") legitimately open with a
      // comma-separated list of alternate headword spellings (e.g. two
      // other Gurmukhi variants of the same word, each with its own
      // bracketed transliteration) BEFORE the actual definition prose --
      // real content from the source dictionary, not garbled translation.
      // Displayed as plain paragraph text it reads as noise mixed into
      // the definition; split it into its own "Also written" line
      // instead, matching how a real dictionary sets off alternate
      // spellings from the definition itself.
      const variants = rec.align.endsWith("_grouped") ? splitGroupedVariants(rec.text) : null;
      const targets = seeTargetsForEntry(selected.id);
      return (
        <>
          {variants && <div className="also-written">Also written: {variants.prefix}</div>}
          <p className="translated-text">{linkifyTargets(variants ? variants.rest : rec.text, targets)}</p>
        </>
      );
    }
    if (pageText) {
      return (
        <>
          <p className="muted">
            No confident per-entry alignment for this language — showing the full source page instead.
            Look for <strong>{selected.hw}</strong>
            {selected.tr ? ` ${selected.tr}` : ""} within it.
          </p>
          <pre className="page-fallback">{pageText}</pre>
        </>
      );
    }
    // pageCache[lang] loaded but this specific page has no entry: a real,
    // known gap (43 pages across the corpus failed translation entirely in
    // every language during generation), not a stuck fetch -- say so
    // rather than showing an infinite spinner.
    if (pageCache[lang]) {
      return (
        <p className="muted">
          No translation available for this entry in any form (page {selected.vol}-{selected.page} failed
          translation generation in every language). This is a known data gap, not a loading error.
        </p>
      );
    }
    return <p className="muted">Loading page fallback…</p>;
  }

  if (loading) return <div className="loading">Loading Mahan Kosh…</div>;

  return (
    <div className="app">
      <header className="topbar">
        <h1>
          ਮਹਾਨ ਕੋਸ਼ <span className="subtitle">Mahan Kosh — multilingual</span>
        </h1>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="lang-switcher lang-switcher-sidebar">
            {LANGUAGES.map((l) => {
              const pct = manifest?.aligned_languages?.[l.key]?.resolved_pct;
              return (
                <button
                  key={l.key}
                  className={"lang-btn" + (lang === l.key ? " active" : "")}
                  onClick={() => selectLang(l.key)}
                  title={pct !== undefined ? `${pct}% entries aligned` : undefined}
                >
                  {l.label}
                </button>
              );
            })}
          </div>

          <div className="mode-tabs">
            <button
              className={"mode-tab" + (mode === "search" ? " active" : "")}
              onClick={() => setMode("search")}
            >
              Search
            </button>
            <button
              className={"mode-tab" + (mode === "browse" ? " active" : "")}
              onClick={() => setMode("browse")}
            >
              Browse the Book
            </button>
          </div>

          {mode === "search" && (
            <>
              {ALPHABETS[lang] && (
                <div className="alphabet-row">
                  {ALPHABETS[lang].map((letter, i) => (
                    <button
                      key={`${letter}-${i}`}
                      className="alphabet-letter"
                      onClick={() => setQuery(letter)}
                      title={`Browse entries containing "${letter}"`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              )}

              <input
                className="search"
                placeholder="Search headword or transliteration…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <div className="results">
                {query.trim() === "" && (
                  <p className="muted small">
                    {core?.count.toLocaleString()} entries ·{" "}
                    {Object.keys(manifest?.aligned_languages ?? {}).length + 2} languages
                  </p>
                )}
                {results.map((e) => (
                  <ResultRow
                    key={e.id}
                    e={e}
                    active={selected?.id === e.id}
                    onClick={() => selectEntry(e)}
                    lang={lang}
                    enCache={langCache["en"] as Record<string, EnEntry> | undefined}
                    hiCache={langCache["hi"] as Record<string, HiEntry> | undefined}
                    otherCache={langCache[lang] as Record<string, LangEntry> | undefined}
                    nativeTr={trCache[lang]?.[e.id]}
                  />
                ))}
                {query.trim() !== "" && results.length === 0 && <p className="muted small">No matches.</p>}
              </div>
            </>
          )}

          {mode === "browse" && !browseLetter && (
            <div className="painti-grid">
              {PAINTI.map((letter) => {
                const count = bookIndex?.get(letter)?.length ?? 0;
                if (count === 0) return null;
                return (
                  <button key={letter} className="painti-letter" onClick={() => setBrowseLetter(letter)}>
                    <span className="painti-letter-glyph">{letter}</span>
                    <span className="painti-letter-count">{count.toLocaleString()}</span>
                  </button>
                );
              })}
            </div>
          )}

          {mode === "browse" && browseLetter && (
            <>
              <button className="browse-back" onClick={() => setBrowseLetter(null)}>
                ← All letters
              </button>
              <div className="results browse-results">
                {(() => {
                  const entries = bookIndex?.get(browseLetter) ?? [];
                  let lastPage: number | null = null;
                  const enCache = langCache["en"] as Record<string, EnEntry> | undefined;
                  const hiCache = langCache["hi"] as Record<string, HiEntry> | undefined;
                  const otherCache = langCache[lang] as Record<string, LangEntry> | undefined;
                  const nativeByLang = trCache[lang];
                  return entries.map((e) => {
                    const showBreak = e.page !== lastPage;
                    lastPage = e.page;
                    return (
                      <div key={e.id}>
                        {showBreak && (
                          <div className="page-break-marker">
                            Vol {e.vol}, p. {e.page}
                          </div>
                        )}
                        <ResultRow
                          e={e}
                          active={selected?.id === e.id}
                          onClick={() => selectEntry(e)}
                          lang={lang}
                          enCache={enCache}
                          hiCache={hiCache}
                          otherCache={otherCache}
                          nativeTr={nativeByLang?.[e.id]}
                        />
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}
        </aside>

        <main className="entry-panel">
          {!selected && <p className="muted">Search for a headword to begin.</p>}
          {selected && (
            <>
              <div className="entry-head">
                <div className="headword-row">
                  <span className="hw-gurmukhi">{selected.hw}</span>
                </div>
                {(() => {
                  // Native-script rendering now sits directly under the
                  // title (2nd position) -- a reader of the currently
                  // selected language should see their own script
                  // immediately, not after two lines of Latin transliteration
                  // first. Shown additionally, not as a replacement -- e.g.
                  // "Beijing (bay-JING)" keeps its pinyin AND gets an
                  // English-reader-friendly respelling alongside it.
                  const nativeTr = stripBrackets(trCache[lang]?.[selected.id]);
                  const langLabel = LANGUAGES.find((l) => l.key === lang)?.label;
                  return (
                    nativeTr && (
                      <div className="native-script-line">
                        <span className="native-script-text">{nativeTr}</span>
                        <span className="native-script-label">{langLabel} rendering</span>
                      </div>
                    )
                  );
                })()}
                {/* Latin/English romanization, 3rd position (was inside
                    headword-row, 2nd position, before the native-script
                    line existed above it). */}
                {romanize(selected.tr) && (
                  <div className="hw-roman-line">
                    <span className="hw-roman">{romanize(selected.tr)}</span>
                  </div>
                )}
                {/* Pronunciation (the raw /slash-notation/ phonetic form),
                    4th position -- a property of the WORD, not the
                    translation, so always the source dictionary's own
                    phonetic tr, never swapped when the language changes
                    (that used to happen: nativeTr ?? selected.tr). */}
                {stripBrackets(selected.tr) && (
                  <div className="pronunciation">/{stripBrackets(selected.tr)}/</div>
                )}
                {(() => {
                  // English viewers get a short gloss line too, the same
                  // idea as the native-script line for other languages --
                  // "at a glance" meaning above the full definition below.
                  // Only shown for English (the data's already loaded by
                  // then; other languages would need en.json fetched
                  // unconditionally just to compute this).
                  if (lang !== "en") return null;
                  const rec = langCache["en"]?.[selected.id] as EnEntry | undefined;
                  const gloss = extractGloss(rec?.definitions);
                  return gloss && <div className="gloss-line">{gloss}</div>;
                })()}
                <div className="source-ref">
                  Vol {selected.vol}, p. {selected.page}
                </div>
              </div>

              <div className="definition-box">{renderDefinition()}</div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
