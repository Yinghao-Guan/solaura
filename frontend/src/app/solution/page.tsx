"use client";

import Link from "next/link";

const ROWS = [
  { step: "01", name: "SENSING", value: "iPhone LiDAR maps objects up to 5m ahead" },
  { step: "02", name: "PROXIMITY", value: "Beep interval shortens as distance closes" },
  { step: "03", name: "DIRECTION", value: "Stereo panning: left is left, right is right" },
];

export default function Page3WhatWeBuilt() {
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
        03 / 07
      </div>
      <Link
        href="/problem"
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
        href="/dashboard"
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
          height: "100vh",
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
          overflow: "hidden",
          padding: "0 24px",
        }}
      >
        <div className="mx-auto grid w-full max-w-[920px] grid-cols-1 items-center gap-10 lg:grid-cols-[58%_38%]">
          <div>
            <p
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(180, 160, 255, 0.6)",
                marginBottom: 20,
              }}
            >
              Solaura / The Solution
            </p>

            <h2
              style={{
                fontWeight: 600,
                fontSize: 38,
                lineHeight: 1.2,
                color: "#fff",
                margin: 0,
              }}
            >
              Solaura.
            </h2>

            <p
              style={{
                fontWeight: 600,
                fontSize: 22,
                lineHeight: 1.35,
                color: "rgba(255,255,255,0.78)",
                marginTop: 10,
              }}
            >
              Space, turned into sound.
            </p>

            <p
              style={{
                fontSize: 16,
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.62)",
                marginTop: 22,
                maxWidth: 520,
              }}
            >
              LiDAR reads the geometry.
              <br />
              Distance becomes volume.
              <br />
              Direction becomes stereo.
            </p>

            <div style={{ marginTop: 28, borderBottom: "1px solid rgba(180, 160, 255, 0.12)" }}>
              {ROWS.map((row) => (
                <div
                  key={row.step}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 18,
                    alignItems: "flex-start",
                    padding: "16px 0",
                    borderBottom: "1px solid rgba(180, 160, 255, 0.12)",
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.2em",
                        color: "rgba(180, 160, 255, 0.7)",
                      }}
                    >
                      {row.step}
                    </span>
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: 13,
                        color: "rgba(180, 160, 255, 0.7)",
                        marginLeft: 6,
                      }}
                    >
                      {row.name}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 15,
                      color: "rgba(255,255,255,0.88)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {row.value}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 22,
                background: "rgba(120, 90, 220, 0.12)",
                borderLeft: "3px solid rgba(180, 160, 255, 0.8)",
                borderRadius: 6,
                padding: "14px 18px",
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  color: "rgba(180, 160, 255, 0.7)",
                  margin: 0,
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                Build Status
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.7)",
                  margin: 0,
                  lineHeight: 1.8,
                }}
              >
                <span style={{ color: "#7bf5a0" }}>✓</span> Core spatial cue — confirmed working
                <br />
                <span style={{ color: "#7bf5a0" }}>✓</span> Offline / on-device — confirmed
                <br />
                <span style={{ color: "#7bf5a0" }}>✓</span> Existing iPhone hardware — no new device needed
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <svg width={380} height={240} viewBox="0 0 300 190" style={{ overflow: "visible" }}>
              <text
                x={150}
                y={18}
                textAnchor="middle"
                style={{ fontSize: 9, letterSpacing: "0.2em", fill: "rgba(180, 160, 255, 0.6)" }}
              >
                FORWARD SENSING ZONE
              </text>
              <line x1={85} y1={125} x2={215} y2={125} stroke="rgba(180, 160, 255, 0.2)" strokeWidth={1} strokeDasharray="4 2" />
              <text x={220} y={129} style={{ fontSize: 9, fill: "rgba(180, 160, 255, 0.6)" }}>5m</text>
              <line x1={85} y1={85} x2={215} y2={85} stroke="rgba(180, 160, 255, 0.2)" strokeWidth={1} strokeDasharray="4 2" />
              <text x={220} y={89} style={{ fontSize: 9, fill: "rgba(180, 160, 255, 0.6)" }}>3m</text>
              <line x1={85} y1={45} x2={215} y2={45} stroke="rgba(180, 160, 255, 0.2)" strokeWidth={1} strokeDasharray="4 2" />
              <text x={220} y={49} style={{ fontSize: 9, fill: "rgba(180, 160, 255, 0.6)" }}>1m</text>
              <line x1={150} y1={160} x2={65} y2={35} stroke="rgba(180, 160, 255, 0.6)" strokeWidth={1} opacity={0.5} />
              <line x1={150} y1={160} x2={150} y2={25} stroke="rgba(180, 160, 255, 0.85)" strokeWidth={1.5} opacity={0.8} />
              <line x1={150} y1={160} x2={235} y2={35} stroke="rgba(180, 160, 255, 0.6)" strokeWidth={1} opacity={0.5} />
              <circle cx={150} cy={160} r={5} fill="rgba(180, 160, 255, 0.9)" />
              <text x={150} y={183} textAnchor="middle" style={{ fontSize: 9, fill: "rgba(180, 160, 255, 0.6)" }}>YOU</text>
              <circle cx={150} cy={25} r={5} fill="rgba(180, 160, 255, 0.9)" />
              <text x={140} y={12} textAnchor="middle" style={{ fontSize: 9, fill: "rgba(180, 160, 255, 0.6)" }}>OBJECT</text>
            </svg>
          </div>
        </div>
      </main>
    </>
  );
}
