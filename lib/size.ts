export type SizeUnit = "B" | "KB" | "MB" | "GB";

export function toBytes(_value: number, _unit: SizeUnit): number {
  const factor = { B: 1, KB: 1000, MB: 1000 ** 2, GB: 1000 ** 3 }[_unit];

  return Math.round(_value * factor);
}

export function parseBytes(raw: string, unit: SizeUnit): number | null {
  const cleaned = raw.trim().replace(/,/g, "");

  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) {
    return null;
  }

  return toBytes(Number(cleaned), unit);
}

export function formatBytes(bytes: number): string {
  return bytes.toLocaleString("en-US");
}