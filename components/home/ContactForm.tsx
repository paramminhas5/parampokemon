"use client";
import { useState } from "react";
import { useScrollReveal } from "@/lib/useScrollReveal";

const PURPOSES = ["Hire", "Collaborate", "Advisory", "Other"] as const;
type Purpose = typeof PURPOSES[number];

export function ContactForm() {
  const { ref, visible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(
      `${purpose || "General"}: From ${name || "Someone"}`
    );
    const body = encodeURIComponent(
      `Hi Param,\n\n${message}\n\n—\n${name}\n${email}`
    );
    window.open(
      `mailto:minhas.param@gmail.com?subject=${subject}&body=${body}`,
      "_blank"
    );
    setSent(true);
  }

  return (
    <div
      ref={ref}
      className="pq-panel"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <div className="pq-panel-inner" style={{ padding: "24px 20px" }}>

        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 12,
              color: "#7ce0ff", marginBottom: 12,
            }}>
              ★ EMAIL CLIENT OPENED
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 15,
              color: "#8aa0c0", lineHeight: 1.5,
            }}>
              Your message should be ready to send in your email app.<br />
              Or email directly:{" "}
              <a href="mailto:minhas.param@gmail.com" style={{ color: "#7ce0ff", textDecoration: "none" }}>
                minhas.param@gmail.com
              </a>
            </div>
            <button
              onClick={() => setSent(false)}
              className="pq-btn"
              style={{ marginTop: 16, fontSize: 9 }}
            >
              SEND ANOTHER
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Purpose selector */}
            <div style={{ marginBottom: 18 }}>
              <div style={{
                fontFamily: "var(--font-pixel)", fontSize: 7,
                color: "#4a6888", marginBottom: 10,
                letterSpacing: "0.1em",
              }}>
                I&apos;M LOOKING TO...
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PURPOSES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPurpose(p)}
                    style={{
                      fontFamily: "var(--font-pixel)", fontSize: 8,
                      padding: "8px 14px",
                      background: purpose === p ? "rgba(124,224,255,0.15)" : "rgba(10,18,38,0.6)",
                      border: `1.5px solid ${purpose === p ? "#7ce0ff" : "rgba(42,58,80,0.5)"}`,
                      color: purpose === p ? "#7ce0ff" : "#5a7a9a",
                      borderRadius: 4,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                fontFamily: "var(--font-pixel)", fontSize: 6,
                color: "#3a5070", letterSpacing: "0.1em",
                display: "block", marginBottom: 6,
              }}>
                NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(10,18,38,0.7)",
                  border: "1.5px solid rgba(42,58,80,0.5)",
                  borderRadius: 4,
                  color: "#c8d8f0",
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#7ce0ff"}
                onBlur={e => e.target.style.borderColor = "rgba(42,58,80,0.5)"}
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{
                fontFamily: "var(--font-pixel)", fontSize: 6,
                color: "#3a5070", letterSpacing: "0.1em",
                display: "block", marginBottom: 6,
              }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(10,18,38,0.7)",
                  border: "1.5px solid rgba(42,58,80,0.5)",
                  borderRadius: 4,
                  color: "#c8d8f0",
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#7ce0ff"}
                onBlur={e => e.target.style.borderColor = "rgba(42,58,80,0.5)"}
                placeholder="you@company.com"
              />
            </div>

            {/* Message */}
            <div style={{ marginBottom: 18 }}>
              <label style={{
                fontFamily: "var(--font-pixel)", fontSize: 6,
                color: "#3a5070", letterSpacing: "0.1em",
                display: "block", marginBottom: 6,
              }}>
                MESSAGE
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(10,18,38,0.7)",
                  border: "1.5px solid rgba(42,58,80,0.5)",
                  borderRadius: 4,
                  color: "#c8d8f0",
                  fontFamily: "var(--font-mono)",
                  fontSize: 14,
                  outline: "none",
                  resize: "vertical",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#7ce0ff"}
                onBlur={e => e.target.style.borderColor = "rgba(42,58,80,0.5)"}
                placeholder="What are you working on?"
              />
            </div>

            {/* Submit */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <button
                type="submit"
                className="pq-btn pq-btn-primary"
                style={{ fontSize: 10, padding: "12px 24px" }}
              >
                SEND →
              </button>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 13,
                color: "#3a5070",
              }}>
                Or email directly:{" "}
                <a href="mailto:minhas.param@gmail.com" style={{ color: "#5a7a9a", textDecoration: "none" }}>
                  minhas.param@gmail.com
                </a>
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
