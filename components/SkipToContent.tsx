"use client";

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="skip-to-content"
      style={{
        position: "absolute",
        left: "-9999px",
        top: "auto",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        zIndex: 9999,
      }}
      onFocus={(e) => {
        const el = e.currentTarget;
        el.style.position = "fixed";
        el.style.top = "8px";
        el.style.left = "8px";
        el.style.width = "auto";
        el.style.height = "auto";
        el.style.padding = "12px 20px";
        el.style.background = "#7ce0ff";
        el.style.color = "#020509";
        el.style.fontFamily = "monospace";
        el.style.fontSize = "14px";
        el.style.fontWeight = "bold";
        el.style.borderRadius = "4px";
        el.style.textDecoration = "none";
      }}
      onBlur={(e) => {
        const el = e.currentTarget;
        el.style.position = "absolute";
        el.style.left = "-9999px";
        el.style.width = "1px";
        el.style.height = "1px";
      }}
    >
      Skip to main content
    </a>
  );
}
