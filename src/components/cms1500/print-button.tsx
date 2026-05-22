"use client";

export function Cms1500PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      style={{
        padding: "8px 16px",
        cursor: "pointer",
        fontSize: "11pt",
        fontWeight: 600,
        background: "linear-gradient(135deg, #ff2d8a, #00f5c4)",
        color: "#fff",
        border: "none",
        borderRadius: 4,
      }}
    >
      Print CMS-1500
    </button>
  );
}
