import { describe, expect, it } from "vitest";
import { analyzeText } from "./heuristics";

describe("analyzeText", () => {
  it("returns a zeroed result for empty input", () => {
    const result = analyzeText("");
    expect(result.score).toBe(0);
    expect(result.wordCount).toBe(0);
    expect(result.sentenceCount).toBe(0);
    expect(result.flags).toHaveLength(0);
  });

  it("treats whitespace-only input as empty", () => {
    const result = analyzeText("   \n\t  ");
    expect(result.score).toBe(0);
    expect(result.wordCount).toBe(0);
  });

  it("flags em dashes and en dashes", () => {
    const result = analyzeText(
      "The policy changed—without warning—and it affected thousands of workers who had planned around the old rules for years.",
    );
    const dashFlag = result.flags.find((f) => f.id === "dashes");
    expect(dashFlag).toBeDefined();
    expect(dashFlag!.count).toBe(2);
    expect(dashFlag!.examples.length).toBeGreaterThan(0);
  });

  it("flags common AI-vocabulary words case-insensitively", () => {
    const result = analyzeText(
      "The team decided to DELVE into the archive. The report is a testament to years of careful cataloguing, and it underscores the value of the collection.",
    );
    const vocabFlag = result.flags.find((f) => f.id === "ai_vocabulary");
    expect(vocabFlag).toBeDefined();
    expect(vocabFlag!.count).toBeGreaterThanOrEqual(2); // delve, underscores (testament is a separate word not in this list)
  });

  it("does not match an AI-vocabulary word as a substring of another word", () => {
    const result = analyzeText(
      "The landscaper trimmed the hedges along the property line before the inspection on Tuesday morning.",
    );
    const vocabFlag = result.flags.find((f) => f.id === "ai_vocabulary");
    expect(vocabFlag).toBeUndefined();
  });

  it("flags filler and hedging phrases", () => {
    const result = analyzeText(
      "It is important to note that the results, in order to be valid, must be reproduced. At this point in time, no one has repeated the experiment.",
    );
    const fillerFlag = result.flags.find((f) => f.id === "filler_hedging");
    expect(fillerFlag).toBeDefined();
    expect(fillerFlag!.count).toBe(3);
  });

  it("flags negative parallelism (not only ... but)", () => {
    const result = analyzeText(
      "The device was not only expensive to manufacture but also difficult to repair once it left the factory.",
    );
    const flag = result.flags.find((f) => f.id === "negative_parallelism");
    expect(flag).toBeDefined();
    expect(flag!.count).toBe(1);
  });

  it("flags curly quotes and emoji", () => {
    const result = analyzeText(
      '“This is great,” she said. \u{1F680} Everything is on track.',
    );
    expect(result.flags.find((f) => f.id === "curly_quotes")).toBeDefined();
    expect(result.flags.find((f) => f.id === "emoji")).toBeDefined();
  });

  it("scores clean, varied-rhythm prose lower than heavily patterned prose", () => {
    const clean = analyzeText(
      "The committee met on Tuesday. After reviewing the budget for nearly two hours, members agreed to postpone the vote until the finance subcommittee could confirm the revised figures. No one objected.",
    );
    const patterned = analyzeText(
      "This groundbreaking initiative stands as a testament to innovation. It is important to note that the platform boasts seamless integration. Experts agree that this represents a pivotal moment—a true game-changer.",
    );
    expect(clean.score).toBeLessThan(patterned.score);
  });

  it("penalizes uniform sentence rhythm relative to varied rhythm", () => {
    const uniform = analyzeText(
      "The team met on Monday. The team reviewed the plan. The team approved the budget. The team scheduled the launch. The team notified the client. The team closed the meeting.",
    );
    const varied = analyzeText(
      "The team met on Monday. After a long debate about the budget, and a shorter one about the launch date, they finally approved the plan everyone had been waiting on. It was done.",
    );
    expect(uniform.sentenceLengthVariance).toBeLessThan(varied.sentenceLengthVariance);
  });

  it("keeps the score within 0-100 for extreme input", () => {
    const spam = Array(50)
      .fill(
        "Delve into this vibrant, seamless, groundbreaking, game-changing tapestry—a true testament to synergy. Experts agree it underscores a pivotal, holistic realm of myriad possibility.",
      )
      .join(" ");
    const result = analyzeText(spam);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThan(50);
  });

  it("reports word and sentence counts", () => {
    const result = analyzeText("Rain fell all afternoon. The river rose by morning.");
    expect(result.wordCount).toBe(9);
    expect(result.sentenceCount).toBe(2);
  });
});
