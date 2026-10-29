# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- The PDF engine (`lib/pdf/`): builds a valid, openable PDF and hits an exact byte
  size. It estimates the page count, measures the assembled document, adjusts to
  the largest count that fits, then pads with whitespace — correcting for the
  `/Length` field's digit width — to land on the exact number. Sizes that padding
  alone cannot reach are closed with whitespace after `startxref`, so every target
  from the smallest possible PDF upward is hit exactly.
- Pages now carry real content: a header, up to 40 table rows, and a footer, sized
  to a byte budget so even the smallest targets produce well-formed pages.
- Engine tests: a property test asserting the output is exactly the requested size
  and well-formed, plus dense sweeps of consecutive sizes across the digit-width
  boundaries that a sparse spread would miss.
- `lib/size.ts`: `toBytes`, `parseBytes`, and `formatBytes` for resolving and formatting exact byte sizes (decimal `B`/`KB`/`MB`/`GB`).
- Vitest as the test runner with a `test` script; 16 unit tests covering unit factors, whole-byte rounding, and parser edge cases.
- Initial Next.js 16.4.3 application scaffold using the App Router, React 19.3, and strict TypeScript.
- Cache Components (`cacheComponents`) and Partial Prefetching (`partialPrefetching`) enabled in `next.config.ts`.
- Tailwind CSS v4 processed through the `@tailwindcss/turbopack` loader, with Geist and Geist Mono loaded via `next/font/google`.
- ESLint 9 flat config combining `eslint-config-next` core-web-vitals and TypeScript presets.

### Changed
- README rewritten with a project overview, supported range, and development commands.