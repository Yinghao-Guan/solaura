"use client";

import { PageShell } from "../components/PageShell";

const ROWS = [
  { step: "01", name: "SENSING", value: "iPhone LiDAR maps objects up to 5m ahead" },
  { step: "02", name: "PROXIMITY", value: "Beep interval shortens as distance closes" },
  { step: "03", name: "DIRECTION", value: "Stereo panning: left is left, right is right" },
];

export default function Page3WhatWeBuilt() {
  return (
    <PageShell pageNum={3} totalPages={7} nextHref="/dashboard" prevHref="/problem">
      <div
        className="mx-auto flex min-h-0 flex-1 flex-col justify-center px-6 py-4 md:px-12"
        style={{ maxWidth: 860 }}
      >
        <div className="mx-auto grid w-full max-w-[820px] grid-cols-1 items-center gap-10 lg:grid-cols-[55%_40%]">
          <div>
            <p
              style={{
                fontFamily: "Geist Mono, monospace",
                fontSize: 11,
                color: "var(--text-muted)",
                marginBottom: 24,
              }}
            >
              Solaura  /  The Solution
            </p>

            <h2
              style={{
                fontFamily: "Geist, system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 32,
                lineHeight: 1.3,
                color: "var(--text)",
                margin: 0,
              }}
            >
              Solaura.
            </h2>

            <p
              style={{
                fontFamily: "Geist, system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 20,
                lineHeight: 1.4,
                color: "var(--text-muted)",
                marginTop: 8,
              }}
            >
              Space, turned into sound.
            </p>

            <p
              style={{
                fontFamily: "Geist, system-ui, sans-serif",
                fontSize: 16,
                lineHeight: 1.75,
                color: "var(--text-muted)",
                marginTop: 24,
                maxWidth: 480,
              }}
            >
              LiDAR reads the geometry.
              <br />
              Distance becomes volume.
              <br />
              Direction becomes stereo.
            </p>

            <div style={{ marginTop: 32, borderBottom: "1px solid var(--border)" }}>
              {ROWS.map((row) => (
                <div
                  key={row.step}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 20,
                    alignItems: "flex-start",
                    padding: "18px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    <span
                      style={{
                        fontFamily: "Geist Mono, monospace",
                        fontSize: 11,
                        color: "var(--cyan)",
                      }}
                    >
                      {row.step}
                    </span>
                    <span
                      style={{
                        fontFamily: "Geist, system-ui, sans-serif",
                        fontWeight: 500,
                        fontSize: 14,
                        color: "var(--text-label)",
                        marginLeft: 6,
                      }}
                    >
                      {row.name}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "Geist, system-ui, sans-serif",
                      fontSize: 15,
                      color: "var(--text)",
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
                marginTop: 24,
                background: "rgba(245, 158, 11, 0.08)",
                borderLeft: "3px solid var(--amber)",
                borderRadius: 6,
                padding: "14px 18px",
              }}
            >
              <p
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 10,
                  color: "var(--amber)",
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                BUILD STATUS
              </p>
              <p
                style={{
                  fontFamily: "Geist, system-ui, sans-serif",
                  fontSize: 14,
                  color: "var(--text-muted)",
                  margin: 0,
                  lineHeight: 1.8,
                }}
              >
                <span style={{ color: "var(--success)" }}>✓</span> Core spatial cue — confirmed working
                <br />
                <span style={{ color: "var(--success)" }}>✓</span> Offline / on-device — confirmed
                <br />
                <span style={{ color: "var(--success)" }}>✓</span> Existing iPhone hardware — no new device needed
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <svg width={280} height={180} viewBox="0 0 280 180" style={{ overflow: "visible" }}>
              <text
                x={140}
                y={18}
                textAnchor="middle"
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 9,
                  fill: "var(--text-muted)",
                }}
              >
                FORWARD SENSING ZONE
              </text>
              <line x1={80} y1={120} x2={200} y2={120} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 2" />
              <text x={205} y={124} style={{ fontFamily: "Geist Mono, monospace", fontSize: 9, fill: "var(--text-muted)" }}>5m</text>
              <line x1={80} y1={80} x2={200} y2={80} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 2" />
              <text x={205} y={84} style={{ fontFamily: "Geist Mono, monospace", fontSize: 9, fill: "var(--text-muted)" }}>3m</text>
              <line x1={80} y1={40} x2={200} y2={40} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 2" />
              <text x={205} y={44} style={{ fontFamily: "Geist Mono, monospace", fontSize: 9, fill: "var(--text-muted)" }}>1m</text>
              <line x1={140} y1={155} x2={60} y2={30} stroke="var(--cyan)" strokeWidth={1} opacity={0.5} />
              <line x1={140} y1={155} x2={140} y2={20} stroke="var(--cyan)" strokeWidth={1.5} opacity={0.8} />
              <line x1={140} y1={155} x2={220} y2={30} stroke="var(--cyan)" strokeWidth={1} opacity={0.5} />
              <circle cx={140} cy={155} r={5} fill="var(--cyan)" />
              <text x={140} y={178} textAnchor="middle" style={{ fontFamily: "Geist Mono, monospace", fontSize: 9, fill: "var(--text-muted)" }}>YOU</text>
              <circle cx={140} cy={20} r={5} fill="var(--cyan)" />
              <text x={140} y={12} textAnchor="middle" style={{ fontFamily: "Geist Mono, monospace", fontSize: 9, fill: "var(--text-muted)" }}>OBJECT</text>
            </svg>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
