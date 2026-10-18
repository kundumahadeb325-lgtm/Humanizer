export interface HumanizeRequestBody {
  text: string;
  apiKey?: string;
}

export interface FactCheckRequestBody {
  text: string;
  apiKey?: string;
}

export interface AnalyzeRequestBody {
  text: string;
}

export type ClaimVerdict =
  | "supported"
  | "disputed"
  | "unverifiable"
  | "needs_context";

export interface FactCheckClaim {
  claim: string;
  verdict: ClaimVerdict;
  confidence: "low" | "medium" | "high";
  explanation: string;
  sources: string[];
}

export interface FactCheckResult {
  claims: FactCheckClaim[];
  usedWebSearch: boolean;
  summary: string;
}

export interface PatternFlag {
  /** Machine-readable id, e.g. "em_dash", "ai_vocabulary" */
  id: string;
  /** Human-readable label shown in the UI */
  label: string;
  /** Number of occurrences found */
  count: number;
  /** A few example matches, for the "show me" link */
  examples: string[];
}

export interface AnalysisResult {
  score: number; // 0 (clean) - 100 (heavily patterned)
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  sentenceLengthVariance: number;
  flags: PatternFlag[];
}

export const MAX_INPUT_CHARS = 20000;
