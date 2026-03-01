"use client";

import { PageShell } from "../components/PageShell";

const FACTS = [
  {
    text: "Blind brains build full spatial maps — independent of vision",
    source: "Nature Communications · 2024",
  },
  {
    text: "Visual cortex fires for directional sound in blind individuals",
    source: "Cerebral Cortex · 2024",
  },
  {
    text: "Brain learns spatial audio as navigation — in 30 minutes",
    source: "npj Science of Learning · 2025",
  },
];

export default function Page3() {
  return (
    <PageShell
      pageNum={3}
      totalPages={4}
      nextHref="/process"
      prevHref="/problem"
      breadcrumb="Solaura / The Science"
    >
      <div
        style={{
          position: "relative",
          height: "100%",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0 80px",
          boxSizing: "border-box",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontFamily: "Geist Mono, monospace",
              fontSize: 11,
              color: "#aaaaaa",
            }}
          >
            Solaura / The Science
          </span>
          <span
            style={{
              fontFamily: "Geist Mono, monospace",
              fontSize: 12,
              color: "#aaaaaa",
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            03 / 04
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 0,
            paddingBottom: 120,
          }}
        >
          <p
            style={{
              fontFamily: "Geist Mono, monospace",
              fontSize: 11,
              color: "#aaaaaa",
              letterSpacing: "0.14em",
              marginBottom: 24,
              marginTop: 0,
            }}
          >
            THE NEUROSCIENCE
          </p>
          <h1
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: "clamp(64px, 9vw, 108px)",
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              margin: 0,
            }}
          >
            <span style={{ color: "#111111" }}>Visual cortex</span>
            <br />
            <span style={{ color: "#111111" }}>activates</span>
            <br />
            <span style={{ color: "#00e5ff" }}>for sound.</span>
          </h1>
          <div style={{ height: 40 }} />
          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 18,
              fontWeight: 400,
              color: "#555555",
              lineHeight: 1.7,
              maxWidth: 540,
              margin: 0,
              marginBottom: 14,
            }}
          >
            In blind individuals, the brain repurposes visual cortex to process
            spatial audio.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#fafafa",
              border: "1px solid #efefef",
              borderRadius: 20,
              padding: "6px 14px",
              marginBottom: 0,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#00e5ff",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "Geist Mono, monospace",
                fontSize: 11,
                color: "#888888",
              }}
            >
              Cerebral Cortex · 2024
            </span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 72,
            left: 80,
            right: 80,
            display: "flex",
            flexDirection: "row",
            gap: 40,
            alignItems: "flex-start",
          }}
        >
          {FACTS.map((fact) => (
            <div
              key={fact.source}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 2,
                  background: "#dddddd",
                  marginBottom: 12,
                  flexShrink: 0,
                }}
              />
              <p
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#333333",
                  lineHeight: 1.5,
                  marginBottom: 6,
                  marginTop: 0,
                }}
              >
                {fact.text}
              </p>
              <p
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 10,
                  color: "#aaaaaa",
                  margin: 0,
                }}
              >
                {fact.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
