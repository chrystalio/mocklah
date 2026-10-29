export function buildPdf(pages: Uint8Array[], tailPadding = 0): Uint8Array {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const kids = pages.map((_, index) => `${4 + 2 * index} 0 R`).join(" ");

  const objects: string[] = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
    `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj\n`,
    `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
  ];

  pages.forEach((page, index) => {
    const pageObject = 4 + 2 * index;
    const contentObject = 5 + 2 * index;
    objects.push(
      `${pageObject} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObject} 0 R >>\nendobj\n`,
    );
    objects.push(
      `${contentObject} 0 obj\n<< /Length ${page.length} >>\nstream\n${decoder.decode(page)}\nendstream\nendobj\n`,
    );
  });

  let out = "%PDF-1.7\n";
  const offsets: number[] = [];

  for (const object of objects) {
    offsets.push(out.length);
    out += object;
  }

  const size = objects.length + 1;
  const xrefOffset = out.length;
  out += "xref\n";
  out += `0 ${size}\n`;
  out += "0000000000 65535 f \n";
  for (const offset of offsets) {
    out += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  out += `trailer\n<< /Size ${size} /Root 1 0 R >>\n`;
  out += `startxref\n${xrefOffset}\n`;
  if (tailPadding > 0) out += "\n".repeat(tailPadding);
  out += "%%EOF\n";

  return encoder.encode(out);
}
