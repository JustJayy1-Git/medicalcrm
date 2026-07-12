/** Shared print stylesheet for paper-document pages. */
export const PAPER_PRINT_CSS = `
  @page { size: letter; margin: 0.22in; }
  @media print {
    .no-print { display: none !important; }
    body { background: #fff !important; }
    .paper-sheet {
      box-shadow: none !important;
      margin: 0 auto !important;
      min-height: auto !important;
      width: 100% !important;
      max-width: 7.9in !important;
      page-break-after: always;
    }
    /* Never cut a row, checkbox line, table row, or heading in half. */
    .paper-sheet label,
    .paper-sheet li,
    .paper-sheet tr,
    .paper-sheet h1,
    .paper-sheet h2,
    .paper-sheet h3,
    .paper-sheet canvas,
    .paper-sheet img {
      break-inside: avoid;
    }
  }
`;
