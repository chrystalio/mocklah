import { describe, expect, test } from "vitest";
import { generatePdf } from "./generate";

const decoder = new TextDecoder();

const targets = [
  999, 1000, 1001, 2000, 4096, 9999, 10000, 10001, 100000, 1000000, 2500000,
];

describe("generatePdf", () => {
  test.each(targets)("hits %i bytes exactly", (target) => {
    expect(generatePdf(target).length).toBe(target);
  });

  test.each(targets)("produces a well-formed PDF at %i bytes", (target) => {
    const text = decoder.decode(generatePdf(target));
    expect(text.startsWith("%PDF-1.7")).toBe(true);
    expect(text.endsWith("%%EOF\n")).toBe(true);
    expect(text).toContain("\ntrailer\n");
  });

  test("refuses a target below the smallest possible PDF", () => {
    expect(() => generatePdf(200)).toThrow(RangeError);
  });
});
