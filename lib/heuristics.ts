import type { AnalysisResult, PatternFlag } from "./types";

/**
 * Lightweight, local, regex-based detector for the writing patterns most
 * associated with unedited AI output (see Wikipedia:Signs of AI writing).
 * This is a heuristic score for user feedback inside the editor — it is not
 * a model of any third-party detector (Quillbot, ZeroGPT, or otherwise) and
 * makes no claim to predict their output.
 */

interface FlagDefinition {
  id: string;
  label: string;
  weight: number;
  pattern: RegExp;
}

function phrasesToPattern(phrases: string[]): RegExp {
  const escaped = phrases
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"));
  return new RegExp(`\\b(?:${escaped.join("|")})\\b`, "gi");
}

const AI_VOCABULARY = [
  "delve", "delves", "delving",
  "tapestry", "tapestries",
  "testament",
  "underscore", "underscores", "underscoring",
  "boast", "boasts", "boasting",
  "leverage", "leverages", "leveraging",
  "foster", "fosters", "fostering",
  "cultivate", "cultivates", "cultivating",
  "intricate", "intricacies",
  "pivotal",
  "vibrant",
  "seamless", "seamlessly",
  "landscape",
  "realm",
  "myriad",
  "plethora",
  "holistic",
  "synergy", "synergies",
  "unlock", "unlocks", "unlocking",
  "elevate", "elevates", "elevating",
  "empower", "empowers", "empowering",
  "unleash", "unleashes", "unleashing",
  "garner", "garners", "garnering",
  "showcase", "showcases", "showcasing",
  "multifaceted",
  "ever-evolving",
];

const FILLER_HEDGING = [
  "it is important to note",
  "it's important to note",
  "it is worth noting",
  "in order to",
  "at this point in time",
  "at the end of the day",
  "needless to say",
  "it could be argued",
  "it could be said",
  "with that being said",
  "with that said",
  "due to the fact that",
  "in the event that",
  "in today's world",
  "in today's day and age",
  "for all intents and purposes",
  "to some extent",
  "in a sense",
  "arguably",
  "one might argue",
  "it goes without saying",
];

const PROMOTIONAL_LANGUAGE = [
  "world-class", "world class",
  "cutting-edge", "cutting edge",
  "groundbreaking",
  "game-changing", "game changer",
  "stunning",
  "breathtaking",
  "must-visit",
  "nestled",
  "rich cultural heritage",
  "unparalleled",
  "unrivaled",
  "state-of-the-art",
  "revolutionize", "revolutionizing", "revolutionized",
];

const VAGUE_ATTRIBUTION = [
  "experts agree",
  "experts believe",
  "studies show",
  "research shows",
  "industry observers",
  "many believe",
  "critics argue",
  "it is widely believed",
  "observers have noted",
];

const GENERIC_CONCLUSION = [
  "the future looks bright",
  "exciting times lie ahead",
  "only time will tell",
  "time will tell",
  "a testament to",
  "a step in the right direction",
];

const FLAG_DEFINITIONS: FlagDefinition[] = [
  {
    id: "dashes",
    label: "Em/en dashes",
    weight: 1,
    pattern: /[—–]|\s--\s/g,
  },
  {
    id: "curly_quotes",
    label: "Curly quotes",
    weight: 1,
    pattern: /[‘’“”]/g,
  },
  {
    id: "ai_vocabulary",
    label: "AI-typical vocabulary",
    weight: 3,
    pattern: phrasesToPattern(AI_VOCABULARY),
  },
  {
    id: "filler_hedging",
    label: "Filler & hedging phrases",
    weight: 3,
    pattern: phrasesToPattern(FILLER_HEDGING),
  },
  {
    id: "promotional_language",
    label: "Promotional language",
    weight: 3,
    pattern: phrasesToPattern(PROMOTIONAL_LANGUAGE),
  },
  {
    id: "vague_attribution",
    label: "Vague attribution",
    weight: 4,
    pattern: phrasesToPattern(VAGUE_ATTRIBUTION),
  },
  {
    id: "negative_parallelism",
    label: "Negative parallelism (“not only… but”)",
    weight: 4,
    pattern: /\bnot only\b[^.?!]{0,80}\bbut\b/gi,
  },
  {
    id: "generic_conclusion",
    label: "Generic uplifting conclusions",
    weight: 4,
    pattern: phrasesToPattern(GENERIC_CONCLUSION),
  },
  {
    id: "emoji",
    label: "Emoji",
    weight: 5,
    pattern: /\p{Extended_Pictographic}/gu,
  },
  {
    id: "bold_header_list",
    label: "Bold-header list items",
    weight: 2,
    pattern: /^[-*]\s+\*\*[^*]+\*\*:/gm,
  },
];

function extractExample(text: string, index: number, matchLength: number): string {
  const radius = 28;
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + matchLength + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  const snippet = text.slice(start, end).replace(/\s+/g, " ").trim();
  return `${prefix}${snippet}${suffix}`;
}

function computeFlags(text: string): PatternFlag[] {
  const flags: PatternFlag[] = [];
  for (const def of FLAG_DEFINITIONS) {
    const matches = Array.from(text.matchAll(def.pattern));
    if (matches.length === 0) continue;
    const examples = matches
      .slice(0, 3)
      .map((m) => extractExample(text, m.index ?? 0, m[0].length));
    flags.push({
      id: def.id,
      label: def.label,
      count: matches.length,
      examples,
    });
  }
  return flags.sort((a, b) => b.count - a.count);
}

function splitSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (matches && matches.length > 0) return matches.map((s) => s.trim()).filter(Boolean);
  const trimmed = text.trim();
  return trimmed ? [trimmed] : [];
}

function countWords(segment: string): number {
  return segment.split(/\s+/).filter(Boolean).length;
}

const FLAG_WEIGHTS: Record<string, number> = Object.fromEntries(
  FLAG_DEFINITIONS.map((d) => [d.id, d.weight]),
);

function computeScore(flags: PatternFlag[], wordCount: number, sentenceLengths: number[]): number {
  const weightedHits = flags.reduce(
    (sum, f) => sum + f.count * (FLAG_WEIGHTS[f.id] ?? 2),
    0,
  );
  // Calibrated heuristic, not a statistical model of any real detector:
  // roughly, ~1 weighted hit per 100 words starts to read as "patterned".
  const density = (weightedHits / Math.max(wordCount, 50)) * 1000;
  const patternScore = Math.min(85, density);

  let rhythmPenalty = 0;
  if (sentenceLengths.length >= 4) {
    const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance =
      sentenceLengths.reduce((a, b) => a + (b - mean) ** 2, 0) / sentenceLengths.length;
    const stdev = Math.sqrt(variance);
    if (mean > 6) {
      rhythmPenalty = Math.max(0, Math.min(15, 15 - stdev * 2));
    }
  }

  return Math.round(Math.max(0, Math.min(100, patternScore + rhythmPenalty)));
}

export function analyzeText(rawText: string): AnalysisResult {
  const text = rawText ?? "";
  const trimmed = text.trim();

  if (!trimmed) {
    return {
      score: 0,
      wordCount: 0,
      sentenceCount: 0,
      avgSentenceLength: 0,
      sentenceLengthVariance: 0,
      flags: [],
    };
  }

  const sentences = splitSentences(text);
  const sentenceLengths = sentences.map(countWords);
  const wordCount = countWords(text);
  const avgSentenceLength =
    sentenceLengths.length > 0
      ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
      : 0;
  const variance =
    sentenceLengths.length > 0
      ? sentenceLengths.reduce((a, b) => a + (b - avgSentenceLength) ** 2, 0) /
        sentenceLengths.length
      : 0;

  const flags = computeFlags(text);
  const score = computeScore(flags, wordCount, sentenceLengths);

  return {
    score,
    wordCount,
    sentenceCount: sentences.length,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    sentenceLengthVariance: Math.round(variance * 10) / 10,
    flags,
  };
}
