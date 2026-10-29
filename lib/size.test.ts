import { describe, expect, test } from "vitest";
import { formatBytes, parseBytes, toBytes } from "./size";

describe("toBytes", () => {
  test("B is raw bytes", () => {
    expect(toBytes(1, "B")).toBe(1);
    expect(toBytes(2500, "B")).toBe(2500);
  });

  test("KB is 1000, not 1024", () => {
    expect(toBytes(1, "KB")).toBe(1000);
  });

  test("MB is 1,000,000 (decimal)", () => {
    expect(toBytes(2.5, "MB")).toBe(2500000);
  });

  test("GB is 1,000,000,000 (decimal)", () => {
    expect(toBytes(1, "GB")).toBe(1000000000);
  });

  test("rounds a fractional byte to the nearest whole byte", () => {
    expect(toBytes(1.4, "B")).toBe(1);
    expect(toBytes(1.6, "B")).toBe(2);
    expect(toBytes(1.234567, "KB")).toBe(1235);
  });
});

describe("parseBytes", () => {
  test("parses a plain integer", () => {
    expect(parseBytes("2500", "B")).toBe(2500);
  });

  test("parses a decimal and applies the unit", () => {
    expect(parseBytes("2.5", "MB")).toBe(2500000);
  });

  test("ignores surrounding whitespace", () => {
    expect(parseBytes("  2.5  ", "MB")).toBe(2500000);
  });

  test("strips thousands separators", () => {
    expect(parseBytes("2,500", "KB")).toBe(2500000);
  });

  test("zero is a valid value", () => {
    expect(parseBytes("0", "MB")).toBe(0);
  });

  test("negative parses through for the caller to reject", () => {
    expect(parseBytes("-5", "MB")).toBe(-5000000);
  });

  test("returns null for empty or whitespace-only input", () => {
    expect(parseBytes("", "MB")).toBeNull();
    expect(parseBytes("   ", "MB")).toBeNull();
  });

  test("returns null for non-numeric input", () => {
    expect(parseBytes("abc", "MB")).toBeNull();
    expect(parseBytes("2.5.6", "MB")).toBeNull();
  });
});

describe("formatBytes", () => {
  test("formats a small integer with no grouping", () => {
    expect(formatBytes(0)).toBe("0");
    expect(formatBytes(100)).toBe("100");
  });

  test("groups thousands with commas", () => {
    expect(formatBytes(1000)).toBe("1,000");
    expect(formatBytes(2500000)).toBe("2,500,000");
    expect(formatBytes(1000000000)).toBe("1,000,000,000");
  });

  test("groups a negative value", () => {
    expect(formatBytes(-5000000)).toBe("-5,000,000");
  });
});
