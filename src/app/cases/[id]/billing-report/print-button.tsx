"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{
        marginLeft: 12,
        padding: "6px 12px",
        cursor: "pointer",
        fontSize: "10pt",
      }}
    >
      Print
    </button>
  );
}
