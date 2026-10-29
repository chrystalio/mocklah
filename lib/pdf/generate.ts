import { buildPageContent } from "./content";
import { buildPdf } from "./document";

const fullPage = buildPageContent();

function withPadding(content: Uint8Array, extra: number): Uint8Array {
  const bytes = new Uint8Array(content.length + extra);
  bytes.set(content);
  bytes.fill(0x0a, content.length);
  return bytes;
}

function assemble(
  pageCount: number,
  content: Uint8Array,
  streamPadding = 0,
  tailPadding = 0,
): Uint8Array {
  const pages = Array.from({ length: pageCount }, () => content);
  if (streamPadding > 0) pages[pageCount - 1] = withPadding(content, streamPadding);
  return buildPdf(pages, tailPadding);
}

function padToTarget(
  targetBytes: number,
  pageCount: number,
  content: Uint8Array,
  base: Uint8Array,
): Uint8Array {
  let stream = Math.max(0, targetBytes - base.length);

  for (;;) {
    const bytes = assemble(pageCount, content, stream);
    const residual = targetBytes - bytes.length;
    if (residual === 0) return bytes;
    if (residual > 0) return assemble(pageCount, content, stream, residual);
    stream = Math.max(0, stream + residual);
  }
}

export function generatePdf(targetBytes: number): Uint8Array {
  const smallest = buildPdf([new Uint8Array()]).length;
  if (targetBytes < smallest) {
    throw new RangeError(
      `target of ${targetBytes} bytes is below the smallest possible PDF (${smallest} bytes)`,
    );
  }

  const oneFullPage = buildPdf([fullPage]).length;

  if (oneFullPage > targetBytes) {
    let budget = targetBytes - smallest;
    for (;;) {
      const content = buildPageContent(Math.max(0, budget));
      const base = buildPdf([content]);
      if (base.length <= targetBytes) return padToTarget(targetBytes, 1, content, base);
      if (budget === 0) throw new Error("could not reach the target size");
      budget -= 1;
    }
  }

  const framing = buildPdf([]).length;
  const perPage = oneFullPage - framing;
  let pages = Math.max(1, Math.floor((targetBytes - framing) / perPage));
  let base = assemble(pages, fullPage);

  while (pages > 1 && base.length > targetBytes) {
    pages -= 1;
    base = assemble(pages, fullPage);
  }

  for (;;) {
    const next = assemble(pages + 1, fullPage);
    if (next.length > targetBytes) break;
    pages += 1;
    base = next;
  }

  return padToTarget(targetBytes, pages, fullPage, base);
}
