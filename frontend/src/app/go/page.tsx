"use client";

import Link from "next/link";

const ROADMAP = [
  {
    step: "01",
    horizon: "NEAR TERM",
    title: "Smart Glasses Integration",
    value: "Port Solaura to Meta Ray-Ban glasses — always-on spatial awareness with no phone in hand, no friction, no barriers to adoption.",
  },
  {
    step: "02",
    horizon: "MID TERM",
    title: "Multi-Object Tracking",
    value: "Simultaneously track and sonify multiple objects with distinct audio signatures — a full acoustic map of the environment, updated in real time.",
  },
  {
    step: "03",
    horizon: "MID TERM",
    title: "AI Scene Understanding",
    value: "Move beyond position to meaning. Classify objects — door, person, vehicle — and deliver contextual audio cues that describe the world, not just the geometry.",
  },
  {
    step: "04",
    horizon: "LONG TERM",
    title: "Platform & Ecosystem",
    value: "Open SDK for third-party developers. Solaura becomes the spatial audio layer that any accessibility app can build on — the audio equivalent of GPS.",
  },
];

const MILESTONES = [
  { label: "Core prototype", status: "DONE", color: "#7bf5a0" },
  { label: "Smart glasses MVP", status: "Q3 2025", color: "#0891b2" },
  { label: "Multi-object tracking", status: "Q1 2026", color: "rgba(180,160,255,0.7)" },
  { label: "Public beta", status: "Q2 2026", color: "rgba(180,160,255,0.4)" },
];

export default function FutureWorkPage() {
  return (
    <>
      {/* ── Page navigation overlay ── */}
      <div
        className="fixed left-1/2 top-0 z-[9999] -translate-x-1/2 py-6 text-center"
        style={{
          fontFamily: "Geist Mono, monospace",
          fontSize: 11,
          color: "rgba(180, 160, 255, 0.45)",
          letterSpacing: "0.15em",
        }}
      >
        06 / 06
      </div>
      <Link
        href="/proof"
        className="fixed bottom-0 left-0 z-[9999] pb-8 pl-8 transition-opacity hover:opacity-80"
        style={{
          fontFamily: "Geist, system-ui, sans-serif",
          fontSize: 14,
          color: "rgba(255,255,255,0.35)",
        }}
      >
        ← Back
      </Link>

      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e8e4f0",
          backgroundColor: "#090620ff",
          backgroundImage: `radial-gradient(
            ellipse 70% 70% at 100% 0%,
            rgba(120, 90, 220, 0.22) 0%,
            rgba(37, 20, 105, 0.1) 40%,
            transparent 80%
          )`,
          fontFamily: "system-ui, sans-serif",
          overflowY: "auto",
          padding: "80px 24px",
        }}
      >
        <div className="mx-auto w-full max-w-[960px]">
          <p
            style={{
              fontFamily: "Geist Mono, monospace",
              fontSize: 11,
              color: "rgba(180, 160, 255, 0.45)",
              marginBottom: 20,
            }}
          >
            Solaura  /  What&apos;s Next
          </p>

          <h2
            style={{
              fontFamily: "Geist, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 3.5vw, 42px)",
              lineHeight: 1.2,
              color: "#fff",
              margin: 0,
            }}
          >
            The iPhone was just the beginning.
            <br />
            <span style={{ color: "rgba(180, 160, 255, 0.85)" }}>
              The real opportunity is everywhere you look.
            </span>
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[60%_36%]">

            {/* LEFT — roadmap */}
            <div style={{ borderTop: "1px solid rgba(180, 160, 255, 0.1)" }}>
              {ROADMAP.map((item) => (
                <div
                  key={item.step}
                  style={{
                    display: "flex",
                    gap: 20,
                    padding: "16px 0",
                    borderBottom: "1px solid rgba(180, 160, 255, 0.1)",
                  }}
                >
                  <div style={{ flexShrink: 0, width: 120 }}>
                    <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 10, color: "rgba(180, 160, 255, 0.5)" }}>
                      {item.step}
                    </div>
                    <div
                      style={{
                        fontFamily: "Geist Mono, monospace",
                        fontSize: 9,
                        color: "#0891b2",
                        letterSpacing: "0.12em",
                        marginTop: 3,
                      }}
                    >
                      {item.horizon}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "Geist, system-ui, sans-serif",
                        fontWeight: 600,
                        fontSize: 15,
                        color: "#fff",
                        marginBottom: 6,
                      }}
                    >
                      {item.title}
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.65 }}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT — milestone tracker + closing */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(180, 160, 255, 0.12)",
                  borderRadius: 6,
                  padding: "16px 18px",
                }}
              >
                <p
                  style={{
                    fontFamily: "Geist Mono, monospace",
                    fontSize: 10,
                    color: "rgba(180, 160, 255, 0.6)",
                    margin: 0,
                    marginBottom: 14,
                    letterSpacing: "0.15em",
                  }}
                >
                  MILESTONE TRACKER
                </p>
                {MILESTONES.map((m) => (
                  <div
                    key={m.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "1px solid rgba(180, 160, 255, 0.07)",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{m.label}</span>
                    <span
                      style={{
                        fontFamily: "Geist Mono, monospace",
                        fontSize: 11,
                        color: m.color,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "rgba(120, 90, 220, 0.10)",
                  borderLeft: "3px solid rgba(180, 160, 255, 0.7)",
                  borderRadius: 6,
                  padding: "14px 16px",
                }}
              >
                <p
                  style={{
                    fontFamily: "Geist Mono, monospace",
                    fontSize: 10,
                    color: "rgba(180, 160, 255, 0.6)",
                    margin: 0,
                    marginBottom: 8,
                    letterSpacing: "0.15em",
                  }}
                >
                  THE VISION
                </p>
                <p style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 14, color: "rgba(255,255,255,0.82)", margin: 0, lineHeight: 1.7 }}>
                  We&apos;re building the spatial audio OS for the visually impaired.
                  Starting with an iPhone.{" "}
                  <span style={{ color: "#fff" }}>Ending with an entirely new way humans perceive the world.</span>
                </p>
              </div>

              <div
                style={{
                  background: "rgba(8, 145, 178, 0.08)",
                  borderLeft: "3px solid #0891b2",
                  borderRadius: 6,
                  padding: "14px 16px",
                }}
              >
                <p style={{ fontFamily: "Geist, system-ui, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.7 }}>
                  <span style={{ color: "#7bf5a0" }}>✓</span> Core prototype confirmed working
                  <br />
                  <span style={{ color: "#7bf5a0" }}>✓</span> Runs on existing consumer hardware
                  <br />
                  <span style={{ color: "#0891b2" }}>→</span> Next: always-on, hands-free, on smart glasses
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
