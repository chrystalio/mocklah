import { describe, expect, test } from "vitest";
import { buildPageContent } from "./content";

const decoder = new TextDecoder();

describe("buildPageContent", () => {
  test("emits a text-showing sequence", () => {
    const text = decoder.decode(buildPageContent());
    expect(text).toContain("BT");
    expect(text).toContain("/F1 11 Tf");
    expect(text).toContain("Tj");
    expect(text).toContain("ET");
  });

  test("is ASCII only", () => {
    for (const byte of buildPageContent()) {
      expect(byte).toBeLessThan(128);
    }
  });

  test("never emits more than the byte budget", () => {
    for (const maxBytes of [0, 40, 120, 300, 430, 900]) {
      expect(buildPageContent(maxBytes).length).toBeLessThanOrEqual(maxBytes);
    }
  });

  test("emits less content when the budget is smaller", () => {
    expect(buildPageContent(300).length).toBeLessThan(buildPageContent().length);
  });
});
