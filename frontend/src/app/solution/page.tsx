"use client";

import { PageShell } from "../components/PageShell";

const ROWS = [
  { step: "01", name: "SENSING", value: "iPhone Pro LiDAR maps 3D space in real time — peer-reviewed accuracy confirmed at indoor ranges" },
  { step: "02", name: "PROXIMITY", value: "Beep interval shortens as distance closes — LASS system (IEEE 2018) proved stereo pitch conveys distance effectively" },
  { step: "03", name: "DIRECTION", value: "Stereo panning maps object azimuth — visual cortex activates for spatial sound in blind individuals (Cerebral Cortex, 2024)" },
];

export default function Page3WhatWeBuilt() {
  return (
    <PageShell pageNum={3} totalPages={5} nextHref="/proof" prevHref="/problem">
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
                <br />
                <span style={{ color: "var(--success)" }}>✓</span> LiDAR spatial sensing — peer-reviewed across 6 published systems (IEEE / PMC 2018–2026)
              </p>
            </div>
          </div>

          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: 24,
              width: "100%",
            }}
          >
            <p
              style={{
                fontFamily: "Geist Mono, monospace",
                fontSize: 10,
                color: "var(--text-label)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              PEER-REVIEWED EVIDENCE
            </p>
            <div style={{ height: 1, background: "var(--border)", margin: "12px 0" }} />
            {[
              { number: "2.2B", label: "people affected by vision impairment globally", source: "WHO\n2024" },
              { number: "$411B", label: "annual productivity loss from vision impairment", source: "WHO\nGlobal\nReport" },
              { number: "$10.5B", label: "assistive tech market by 2028 — growing at 7.9% annually", source: "Markets\nand\nMarkets\n2023" },
              { number: "6", label: "peer-reviewed LiDAR assistive systems confirm offline real-time spatial audio is achievable", source: "IEEE /\nPMC\n2018–2026" },
            ].map((stat) => (
              <div
                key={stat.number}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div>
                  <div style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 700, fontSize: 28, color: "var(--cyan)" }}>
                    {stat.number}
                  </div>
                  <p style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 400, fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
                    {stat.label}
                  </p>
                </div>
                <p
                  style={{
                    fontFamily: "Geist Mono, monospace",
                    fontSize: 9,
                    color: "var(--text-label)",
                    textAlign: "right",
                    margin: 0,
                    whiteSpace: "pre-line",
                  }}
                >
                  {stat.source}
                </p>
              </div>
            ))}
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0 12px" }} />
            <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ color: "#4cc38a", fontSize: 10 }}>●</span>
              <div>
                <p style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 400, fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                  Visual cortex recruited for spatial sound in blind individuals
                </p>
                <p style={{ fontFamily: "Geist Mono, monospace", fontSize: 9, color: "var(--text-label)", margin: "2px 0 0" }}>
                  Cerebral Cortex · 2024
                </p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ color: "#4cc38a", fontSize: 10 }}>●</span>
              <div>
                <p style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 400, fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                  Brain builds spatial maps independent of vision via place and grid cells
                </p>
                <p style={{ fontFamily: "Geist Mono, monospace", fontSize: 9, color: "var(--text-label)", margin: "2px 0 0" }}>
                  Nature Comms · 2024
                </p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: 0 }}>
              <span style={{ color: "#4cc38a", fontSize: 10 }}>●</span>
              <div>
                <p style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 400, fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                  Sensory substitution: brain learns to interpret directional sound as space within 30 minutes
                </p>
                <p style={{ fontFamily: "Geist Mono, monospace", fontSize: 9, color: "var(--text-label)", margin: "2px 0 0" }}>
                  npj Science of Learning · 2025
                </p>
              </div>
            </div>
            <p
              style={{
                fontFamily: "Geist Mono, monospace",
                fontSize: 9,
                color: "var(--text-label)",
                marginTop: 16,
                marginBottom: 0,
              }}
            >
              Sources: WHO · IAPB · IEEE Xplore · PubMed · Nature · Cerebral Cortex · Frontiers Neurosci.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
