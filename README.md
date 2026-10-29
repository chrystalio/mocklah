# MockLah

Generate a real PDF file of an exact byte size, entirely in your browser.

Type a size, click generate, and MockLah hands you a PDF that is exactly that many
bytes. Not approximately. That is the whole product: if it cannot hit the number
exactly, it refuses rather than approximating.

## How it works

A PDF is a text file with a fixed structure. MockLah builds one in four steps:

1. Estimate how many pages fit the target.
2. Build the document and measure its exact byte length.
3. Adjust the page count to the largest number that still fits.
4. Pad the last content stream with whitespace to close the gap, then recompute
   the cross-reference table.

Whitespace between PDF operators is ignored by readers, so it is invisible and
exactly one byte each. The file is assembled as raw bytes (`Uint8Array`),
uncompressed, ASCII only, using the standard 14 fonts (Helvetica). No dependency
is added to the output, everything runs client-side, and nothing is uploaded.

## Supported range

- Units: `B`, `KB`, `MB`, `GB` (decimal: 1 KB = 1,000 bytes).
- Targets: 1 KB to 100 MB. Outside that range MockLah refuses with an explanation.
- Paper: A4 (595 x 842 pt).

## Status

Early MVP, built in test-driven steps.

- Done: exact size parsing and formatting (`lib/size.ts`).
- Next: the PDF engine (`lib/pdf/`), the UI, the download path.

## Getting started

```bash
bun install
bun run dev      # http://localhost:3000
bun run test     # Vitest (note: `bun test` runs Bun's runner, not Vitest)
bun run build
bun run lint
```

## Project layout

```
app/                Next.js App Router (single route)
components/         UI (GeneratorApp, SizeInput, ...)
lib/size.ts         parse and format byte sizes
lib/pdf/            PDF engine (content, objects, document, generate)
```


Built with Next.js (App Router).
