import { describe, expect, test } from "vitest";
import { buildPageContent } from "./content";
import { buildPdf } from "./document";

const decoder = new TextDecoder();

function onePagePdf(): Uint8Array {
  return buildPdf([buildPageContent()]);
}

describe("buildPdf (single page)", () => {
  test("starts with the PDF header", () => {
    const bytes = onePagePdf();
    expect(decoder.decode(bytes.slice(0, 8))).toBe("%PDF-1.7");
  });

  test("ends with %%EOF and a trailing newline", () => {
    const text = decoder.decode(onePagePdf());
    expect(text.endsWith("%%EOF\n")).toBe(true);
  });

  test("declares a catalog and a one-page tree", () => {
    const text = decoder.decode(onePagePdf());
    expect(text).toContain("/Type /Catalog");
    expect(text).toContain("/Type /Pages");
    expect(text).toContain("/Count 1");
  });

  test("the page maps /F1 to the font object via /Resources", () => {
    const text = decoder.decode(onePagePdf());
    expect(text).toContain("/Resources << /Font << /F1 3 0 R >> >>");
  });

  test("the content stream /Length matches its actual bytes", () => {
    const text = decoder.decode(onePagePdf());
    const match = /<< \/Length (\d+) >>\nstream\n/.exec(text);
    expect(match).not.toBeNull();
    const declared = Number(match![1]);
    const start = match!.index + match![0].length;
    const end = text.indexOf("\nendstream", start);
    expect(end - start).toBe(declared);
  });
});

describe("buildPdf (cross-reference table)", () => {
  test("ends with a trailer pointing at the catalog", () => {
    const text = decoder.decode(onePagePdf());
    expect(text).toContain("\ntrailer\n");
    expect(text).toContain("/Root 1 0 R");
  });

  test("startxref points at the xref keyword", () => {
    const text = decoder.decode(onePagePdf());
    const match = /startxref\n(\d+)\n/.exec(text);
    expect(match).not.toBeNull();
    const offset = Number(match![1]);
    expect(text.slice(offset, offset + 4)).toBe("xref");
  });

  test("the xref table has one entry per object plus a free entry", () => {
    const text = decoder.decode(onePagePdf());
    const entries = text.match(/^\d{10} \d{5} [nf] \n/gm);
    expect(entries).not.toBeNull();
    expect(entries).toHaveLength(6);
    expect(text).toContain("0 6\n");
    expect(text).toContain("/Size 6");
  });

  test("every xref entry points at the start of its object", () => {
    const text = decoder.decode(onePagePdf());
    const section = text.slice(text.indexOf("\nxref\n") + "\nxref\n".length);
    const header = /^0 (\d+)\n/.exec(section);
    expect(header).not.toBeNull();
    const lines = section.slice(header![0].length).match(/^\d{10} \d{5} n \n/gm);
    expect(lines).toHaveLength(5);
    lines!.forEach((line, index) => {
      const offset = Number(line.slice(0, 10));
      expect(text.slice(offset)).toMatch(new RegExp(`^${index + 1} 0 obj`));
    });
  });
});

describe("buildPdf (multiple pages)", () => {
  const threePages = () => [buildPageContent(), buildPageContent(), buildPageContent()];

  test("lists every page in the tree and counts them", () => {
    const text = decoder.decode(buildPdf(threePages()));
    expect(text).toContain("/Kids [4 0 R 6 0 R 8 0 R]");
    expect(text).toContain("/Count 3");
    expect(text).toContain("/Size 10");
  });

  test("gives every page its own object and content stream", () => {
    const text = decoder.decode(buildPdf(threePages()));
    for (const number of [4, 5, 6, 7, 8, 9]) {
      expect(text).toContain(`\n${number} 0 obj\n`);
    }
    expect(text.match(/\/Resources << \/Font << \/F1 3 0 R >> >>/g)).toHaveLength(3);
  });

  test("every xref entry points at the start of its object", () => {
    const text = decoder.decode(buildPdf(threePages()));
    const section = text.slice(text.indexOf("\nxref\n") + "\nxref\n".length);
    const header = /^0 (\d+)\n/.exec(section)!;
    const lines = section.slice(header[0].length).match(/^\d{10} \d{5} n \n/gm)!;
    expect(lines).toHaveLength(9);
    lines.forEach((line, index) => {
      const offset = Number(line.slice(0, 10));
      expect(text.slice(offset)).toMatch(new RegExp(`^${index + 1} 0 obj`));
    });
  });
});
