import { describe, expect, it } from "vitest";
import type { ParsedIntent, Place } from "@moves/shared";
import { scorePlace } from "./scorePlace";

const basePlace: Place = {
  id: "test-place",
  name: "Test Place",
  description: "A test venue.",
  category: "bar",
  neighborhood: "Logan Square",
  city: "Chicago",
  address: "1 Test St",
  lat: 41.9,
  lng: -87.7,
  priceLevel: 2,
  vibes: ["energetic", "social"],
  musicStyles: ["afrobeats"],
};

const emptyIntent: ParsedIntent = { rawQuery: "" };

describe("scorePlace", () => {
  it("returns score 0 with no reasons for an empty intent", () => {
    const { score, reasons } = scorePlace(emptyIntent, basePlace);
    expect(score).toBe(0);
    expect(reasons).toEqual([]);
  });

  it("adds one vibe reason per matching vibe", () => {
    const intent: ParsedIntent = {
      rawQuery: "",
      vibes: ["energetic", "social"],
    };
    const { reasons } = scorePlace(intent, basePlace);
    expect(reasons).toHaveLength(2);
    expect(reasons.every((r) => r.factor === "vibe")).toBe(true);
  });

  it("does not add a reason for a non-matching vibe", () => {
    const intent: ParsedIntent = { rawQuery: "", vibes: ["romantic"] };
    const { score, reasons } = scorePlace(intent, basePlace);
    expect(score).toBe(0);
    expect(reasons).toEqual([]);
  });

  it("weights music more than vibe per match", () => {
    const vibeOnly: ParsedIntent = { rawQuery: "", vibes: ["energetic"] };
    const musicOnly: ParsedIntent = {
      rawQuery: "",
      musicStyles: ["afrobeats"],
    };
    expect(scorePlace(musicOnly, basePlace).score).toBeGreaterThan(
      scorePlace(vibeOnly, basePlace).score,
    );
  });

  it("adds a category reason when category is in the intent", () => {
    const intent: ParsedIntent = { rawQuery: "", categories: ["bar"] };
    const { reasons } = scorePlace(intent, basePlace);
    expect(reasons[0]?.factor).toBe("category");
  });

  it("adds a neighborhood reason when neighborhood matches", () => {
    const intent: ParsedIntent = {
      rawQuery: "",
      neighborhoods: ["Logan Square"],
    };
    expect(scorePlace(intent, basePlace).reasons[0]?.factor).toBe(
      "neighborhood",
    );
  });

  it("adds a price reason when pricePreference is set", () => {
    const intent: ParsedIntent = { rawQuery: "", pricePreference: "cheap" };
    expect(scorePlace(intent, basePlace).reasons[0]?.factor).toBe("price");
  });

  it("treats pricePreference 'any' as no signal", () => {
    const intent: ParsedIntent = { rawQuery: "", pricePreference: "any" };
    expect(scorePlace(intent, basePlace).reasons).toEqual([]);
  });

  it("totals score as the sum of reason weights", () => {
    const intent: ParsedIntent = {
      rawQuery: "",
      vibes: ["energetic"],
      musicStyles: ["afrobeats"],
      categories: ["bar"],
      neighborhoods: ["Logan Square"],
      pricePreference: "cheap",
    };
    const { score, reasons } = scorePlace(intent, basePlace);
    const summed = reasons.reduce((s, r) => s + r.weight, 0);
    expect(score).toBe(summed);
    expect(reasons).toHaveLength(5);
  });

  it("ignores rawQuery — free text is filter-only, not a ranking signal", () => {
    const intent: ParsedIntent = { rawQuery: "test place" };
    expect(scorePlace(intent, basePlace).score).toBe(0);
  });
});
