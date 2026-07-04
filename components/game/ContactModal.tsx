"use client";
import { useState } from "react";
import { CONTACT } from "@/game/data";

export function ContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!name || !email || !message) return;
    const subject = encodeURIComponent("Career Quest — Let's talk");
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.open(`mailto:${CONTACT.email}?subject=${subject}&body=${body}`);
    setSent(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#060c18",
    border: "1px solid #1a2a4a",
    color: "var(--color-dialog)",
    padding: "10px 12px",
    fontFamily: "var(--font-pixel)",
    fontSize: 9,
    outline: "none",
    resize: "none" as const,
    boxSizing: "border-box" as const,
    lineHeight: 1.6,
  };

  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 50,
        background: "rgba(4,8,20,0.95)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: 420,
          border: "2px solid #2a3a5a",
          background: "linear-gradient(180deg, #07101e 0%, #050c18 100%)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "2px solid #1a2a4a",
          background: "#060e1c",
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 10, color: "#7ce0ff" }}>
              ✦ REACH OUT
            </div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", marginTop: 2 }}>
              ITERATE · FOUNDER PARTNERSHIPS
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "1px solid #1a2a4a",
            color: "#3a5070", padding: "6px 10px",
            fontFamily: "var(--font-pixel)", fontSize: 9, cursor: "pointer",
          }}>✕</button>
        </div>

        <div style={{ padding: 16 }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 24, color: "#4ade80", marginBottom: 12 }}>★</div>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 11, color: "#4ade80", marginBottom: 8 }}>
                MAIL OPENED
              </div>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#3a5070", lineHeight: 1.8 }}>
                Finish in your mail app.
                <br />
                {CONTACT.email}
              </div>
              <button onClick={onClose} style={{
                marginTop: 20,
                background: "#4ade8022", border: "1px solid #4ade80",
                color: "#4ade80", padding: "10px 20px",
                fontFamily: "var(--font-pixel)", fontSize: 9, cursor: "pointer",
              }}>
                ✓ DONE
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 8, color: "#4a6080", lineHeight: 1.8, marginBottom: 16 }}>
                We work with a small number of founder partners per quarter. If you&apos;re building something interesting, say hi.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <label style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", display: "block", marginBottom: 4 }}>NAME</label>
                  <input
                    value={name} onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", display: "block", marginBottom: 4 }}>EMAIL</label>
                  <input
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    type="email"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-pixel)", fontSize: 7, color: "#3a5070", display: "block", marginBottom: 4 }}>WHAT ARE YOU BUILDING?</label>
                  <textarea
                    value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Tell me about your project..."
                    rows={4}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  onClick={handleSend}
                  disabled={!name || !email || !message}
                  style={{
                    flex: 1,
                    background: (!name || !email || !message) ? "#0d1527" : "linear-gradient(135deg, #7ce0ff22 0%, #3a78d822 100%)",
                    border: `1px solid ${(!name || !email || !message) ? "#1a2a4a" : "#7ce0ff"}`,
                    color: (!name || !email || !message) ? "#2a3a5a" : "#7ce0ff",
                    padding: "12px",
                    fontFamily: "var(--font-pixel)", fontSize: 10,
                    cursor: (!name || !email || !message) ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  SEND ▶
                </button>
                <a
                  href={`mailto:${CONTACT.email}`}
                  style={{
                    padding: "12px 14px",
                    border: "1px solid #1a2a4a", color: "#3a5070",
                    fontFamily: "var(--font-pixel)", fontSize: 9,
                    textDecoration: "none", display: "flex", alignItems: "center",
                  }}
                >
                  DIRECT
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
