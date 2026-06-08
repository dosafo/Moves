import { describe, expect, it } from "vitest";
import type { ParsedIntent, Place } from "@moves/shared";
import { scoreResults } from "./scoreResults";

function makePlace(overrides: Partial<Place> = {}): Place {
  return {
    id: "p",
    name: "P",
    description: "",
    category: "bar",
    neighborhood: "Logan Square",
    city: "Chicago",
    address: "",
    lat: 0,
    lng: 0,
    priceLevel: 2,
    vibes: [],
    musicStyles: [],
    ...overrides,
  };
}

describe("scoreResults", () => {
  it("sorts by descending score", () => {
    const intent: ParsedIntent = { rawQuery: "", vibes: ["energetic"] };
    const places = [
      makePlace({ id: "a", name: "A", vibes: [] }),
      makePlace({ id: "b", name: "B", vibes: ["energetic"] }),
    ];
    const results = scoreResults(intent, places);
    expect(results[0]?.item.id).toBe("b");
    expect(results[1]?.item.id).toBe("a");
  });

  it("tie-breaks equal scores by name ascending", () => {
    const intent: ParsedIntent = { rawQuery: "" };
    const places = [
      makePlace({ id: "z", name: "Zebra" }),
      makePlace({ id: "a", name: "Alpha" }),
    ];
    const results = scoreResults(intent, places);
    const first = results[0];
    const second = results[1];
    if (first?.itemType !== "place" || second?.itemType !== "place") {
      throw new Error("expected place results");
    }
    expect(first.item.name).toBe("Alpha");
    expect(second.item.name).toBe("Zebra");
  });

  it("wraps each Place as a ScoredResult with itemType 'place'", () => {
    const results = scoreResults({ rawQuery: "" }, [makePlace()]);
    expect(results[0]?.itemType).toBe("place");
  });

  it("preserves reasons from scorePlace", () => {
    const intent: ParsedIntent = { rawQuery: "", vibes: ["energetic"] };
    const places = [makePlace({ vibes: ["energetic"] })];
    const results = scoreResults(intent, places);
    expect(results[0]?.reasons).toHaveLength(1);
    expect(results[0]?.reasons[0]?.factor).toBe("vibe");
  });

  it("returns an empty array for empty input", () => {
    expect(scoreResults({ rawQuery: "" }, [])).toEqual([]);
  });
});
