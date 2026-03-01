"use client";

import Link from "next/link";

const TABLE_ROWS = [
  {
    tool: "White Cane",
    does: "Detects ground-level obstacles",
    misses: "Real-time spatial awareness",
  },
  {
    tool: "Guide Dog",
    does: "Navigates routes, avoids hazards",
    misses: "Object shape, distance, identity",
  },
  {
    tool: "OrCam MyEye 2",
    does: "Reads text and recognises faces",
    misses: "Continuous 3D spatial sensing",
  },
];

const STATS = [
  { number: "1.1B", label: "People with vision impairment" },
  { number: "43M", label: "People who are fully blind" },
  { number: "$0", label: "Extra hardware — runs on existing iPhone" },
];

const PILLARS = [
  {
    step: "01",
    name: "COMPUTER VISION & LiDAR",
    value: "iPhone's LiDAR scanner builds a real-time 3D map, pinpointing every object's exact position in space.",
  },
  {
    step: "02",
    name: "3D SPATIAL AUDIO",
    value: "Each object emits a radar-like beep at its precise location — left is left, right is right, closer is louder.",
  },
  {
    step: "03",
    name: "A NEW SENSE",
    value: "Together, they give users an ears-based picture of the world — no screen, no cloud, no assistance required.",
  },
];

export default function Page2TheGap() {
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
        02 / 07
      </div>
      <Link
        href="/"
        className="fixed bottom-0 left-0 z-[9999] pb-8 pl-8 transition-opacity hover:opacity-80"
        style={{
          fontFamily: "Geist, system-ui, sans-serif",
          fontSize: 14,
          color: "rgba(255,255,255,0.35)",
        }}
      >
        ← Back
      </Link>
      <Link
        href="/solution"
        className="fixed bottom-0 right-0 z-[9999] pb-8 pr-8 transition-opacity hover:opacity-80"
        style={{
          fontFamily: "Geist, system-ui, sans-serif",
          fontSize: 14,
          color: "#0891b2",
        }}
      >
        Next →
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
            Solaura  /  The Problem &amp; Impact
          </p>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

            {/* LEFT — problem */}
            <div>
              <h2
                style={{
                  fontFamily: "Geist, system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: 28,
                  lineHeight: 1.3,
                  color: "#fff",
                  margin: 0,
                }}
              >
                Everything helps them navigate.
                <br />
                Nothing helps them sense.
              </h2>

              <p
                style={{
                  fontFamily: "Geist, system-ui, sans-serif",
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: "rgba(255,255,255,0.5)",
                  marginTop: 14,
                }}
              >
                The tools built for blind people solve the wrong problem.
              </p>

              <div
                style={{
                  marginTop: 24,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(180, 160, 255, 0.12)",
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                      {["TOOL", "DOES", "MISSES"].map((h) => (
                        <th
                          key={h}
                          style={{
                            fontFamily: "Geist Mono, monospace",
                            fontSize: 10,
                            color: "rgba(180, 160, 255, 0.6)",
                            padding: "9px 14px",
                            textAlign: "left",
                            borderBottom: "1px solid rgba(180, 160, 255, 0.12)",
                            fontWeight: 500,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TABLE_ROWS.map((row, i) => (
                      <tr
                        key={row.tool}
                        style={{
                          borderBottom: i < TABLE_ROWS.length - 1 ? "1px solid rgba(180, 160, 255, 0.08)" : "none",
                        }}
                      >
                        <td style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 14, color: "rgba(255,255,255,0.88)", padding: "12px 14px" }}>
                          {row.tool}
                        </td>
                        <td style={{ fontFamily: "Geist, system-ui, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", padding: "12px 14px" }}>
                          {row.does}
                        </td>
                        <td style={{ fontFamily: "Geist, system-ui, sans-serif", fontSize: 13, color: "#ff6b6b", padding: "12px 14px" }}>
                          <span style={{ marginRight: 5 }}>●</span>{row.misses}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  marginTop: 16,
                  background: "rgba(8, 145, 178, 0.08)",
                  borderLeft: "3px solid #0891b2",
                  borderRadius: 6,
                  padding: "12px 16px",
                }}
              >
                <p style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 14, color: "rgba(255,255,255,0.78)", margin: 0, lineHeight: 1.6 }}>
                  The space directly in front of them is invisible.
                  <br />
                  We made it audible.
                </p>
              </div>
            </div>

            {/* RIGHT — impact + how */}
            <div>
              {/* Stats */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {STATS.map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(180, 160, 255, 0.12)",
                      borderRadius: 6,
                      padding: "12px 16px",
                    }}
                  >
                    <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 26, color: "#0891b2", flexShrink: 0, minWidth: 72 }}>
                      {stat.number}
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.5 }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pillars */}
              <div style={{ borderTop: "1px solid rgba(180, 160, 255, 0.1)" }}>
                {PILLARS.map((p) => (
                  <div
                    key={p.step}
                    style={{
                      display: "flex",
                      gap: 14,
                      padding: "13px 0",
                      borderBottom: "1px solid rgba(180, 160, 255, 0.1)",
                    }}
                  >
                    <div style={{ flexShrink: 0 }}>
                      <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 10, color: "rgba(180, 160, 255, 0.5)" }}>
                        {p.step}
                      </span>
                      <div style={{ fontFamily: "Geist Mono, monospace", fontSize: 10, color: "rgba(180, 160, 255, 0.85)", marginTop: 2, letterSpacing: "0.04em" }}>
                        {p.name}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.65 }}>
                      {p.value}
                    </p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 16,
                  background: "rgba(120, 90, 220, 0.10)",
                  borderLeft: "3px solid rgba(180, 160, 255, 0.7)",
                  borderRadius: 6,
                  padding: "12px 16px",
                }}
              >
                <p style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 14, color: "rgba(255,255,255,0.78)", margin: 0, lineHeight: 1.65 }}>
                  For the first time, the physical world becomes audible —
                  not described, but <span style={{ color: "#fff" }}>directly sensed</span>.
                  A new perceptual layer for 1.1 billion people.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  );
}
