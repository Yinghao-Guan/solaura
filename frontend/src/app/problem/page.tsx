"use client";

import { PageShell } from "../components/PageShell";

const CARDS = [
  {
    name: "White Cane",
    does: "Detects ground-level obstacles",
    miss: "Reads the floor. Ignores the world.",
    source: "WHO assistive tech review",
  },
  {
    name: "Screen Reader",
    does: "Reads on-screen digital content",
    miss: "Knows the phone. Doesn't know the room.",
    source: "AT2030 Program",
  },
  {
    name: "GPS / Maps",
    does: "Outdoor routing and directions",
    miss: "Finds the street. Loses the moment.",
    source: "PathFinder · arXiv 2025",
  },
];

export default function Page2() {
  return (
    <PageShell
      pageNum={2}
      totalPages={7}
      nextHref="/solution"
      prevHref="/"
      breadcrumb="Solaura / The Failure"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          height: "100%",
          overflow: "hidden",
          padding: 80,
          boxSizing: "border-box",
          position: "relative",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "clamp(32px, 4.5vw, 52px)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "#111111",
            margin: 0,
          }}
        >
          Every tool helps them navigate.
        </h2>
        <h2
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "clamp(32px, 4.5vw, 52px)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "#ff4444",
            margin: "4px 0 0",
          }}
        >
          None of them help them sense.
        </h2>

        <div style={{ marginTop: 40, flexShrink: 0 }} />

        <div className="flex gap-5" style={{ gap: 20, width: "100%", alignItems: "stretch" }}>
          {CARDS.map((card) => (
            <div
              key={card.name}
              style={{
                flex: 1,
                background: "#fafafa",
                border: "1px solid #efefef",
                borderRadius: 14,
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
                minHeight: 200,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#111111",
                  }}
                >
                  {card.name}
                </span>
                <span
                  style={{
                    fontFamily: "Geist Mono, monospace",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                    background: "#fff0f0",
                    color: "#ff4444",
                    padding: "4px 10px",
                    borderRadius: 20,
                  }}
                >
                  FAILS HERE
                </span>
              </div>
              <p
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 13,
                  color: "#888888",
                  lineHeight: 1.5,
                  marginBottom: 16,
                  marginTop: 0,
                }}
              >
                {card.does}
              </p>
              <div style={{ height: 1, background: "#efefef", marginBottom: 16 }} />
              <p
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111111",
                  lineHeight: 1.4,
                  fontStyle: "italic",
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                {card.miss}
              </p>
              <p
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 9,
                  color: "#bbbbbb",
                  marginTop: "auto",
                  paddingTop: 16,
                  marginBottom: 0,
                }}
              >
                {card.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
