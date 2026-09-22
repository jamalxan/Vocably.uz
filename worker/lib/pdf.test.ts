import { describe, it, expect } from 'vitest';
import { extractPdfText, renderPageScreenshots } from './pdf';

// Minimal, hand-written, valid single-page PDF with real text content — avoids
// depending on a real book PDF (and avoids any copyright concern, LEGAL-01)
// for a unit test. Manually verified against this exact library on this
// machine (2026-09-22) before writing this test.
const SAMPLE_PDF = Buffer.from(
  `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 150] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 60 >>
stream
BT /F1 18 Tf 20 100 Td (Hello Vocably Worker Test) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
trailer
<< /Size 6 /Root 1 0 R >>
startxref
0
%%EOF`,
  'utf-8'
);

describe('extractPdfText', () => {
  it('extracts per-page text and detects a real text layer', async () => {
    const result = await extractPdfText(SAMPLE_PDF);
    expect(result.pageCount).toBe(1);
    expect(result.hasTextLayer).toBe(true);
    expect(result.pages[0].n).toBe(1);
    expect(result.pages[0].text).toContain('Hello Vocably Worker Test');
    expect(result.fullText).toContain('Hello Vocably Worker Test');
  }, 20000);
});

describe('renderPageScreenshots', () => {
  it('renders each page to a non-empty PNG buffer', async () => {
    const shots = await renderPageScreenshots(SAMPLE_PDF);
    expect(shots).toHaveLength(1);
    expect(shots[0].n).toBe(1);
    expect(shots[0].contentType).toBe('image/png');
    expect(shots[0].buffer.length).toBeGreaterThan(0);
    // PNG magic bytes
    expect(shots[0].buffer.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  }, 20000);
});
