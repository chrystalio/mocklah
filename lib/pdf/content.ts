const encoder = new TextEncoder();

const HEADER = [
  "BT",
  "/F1 16 Tf",
  "56 800 Td",
  "(MockLah Invoice) Tj",
  "/F1 10 Tf",
  "0 -18 Td",
  "(Sample document of an exact byte size) Tj",
  "/F1 11 Tf",
  "0 -24 Td",
];

const FOOTER = "ET";

const ROW_COUNT = 40;

export function buildPageContent(maxBytes = Infinity): Uint8Array {
  const lines: string[] = [];
  let length = 0;

  const reserve = FOOTER.length + 1;

  const push = (line: string, extraReserve = 0): boolean => {
    const added = (lines.length > 0 ? 1 : 0) + line.length;
    if (length + added + extraReserve > maxBytes) return false;
    lines.push(line);
    length += added;
    return true;
  };

  for (const line of HEADER) {
    if (!push(line, reserve)) break;
  }

  for (let row = 1; row <= ROW_COUNT; row++) {
    if (!push("0 -14 Td", reserve)) break;
    if (!push(`(Item ${row} ................ ${row * 137}.00) Tj`, reserve)) break;
  }

  if (lines.length > 0) push(FOOTER);

  return encoder.encode(lines.join("\n"));
}
