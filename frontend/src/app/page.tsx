"use client";

import { PageShell } from "./components/PageShell";

const CHIPS = [
  { number: "43M", label: "living in darkness", source: "WHO · 2024" },
  { number: "$411B", label: "lost every year. to silence.", source: "WHO Global Report" },
  { number: "474M", label: "projected by 2050 — and rising", source: "IAPB · 2021" },
];

export default function Page1() {
  return (
    <PageShell
      pageNum={1}
      totalPages={7}
      nextHref="/problem"
      prevHref={null}
      breadcrumb="Solaura / The Problem"
    >
      <div
        className="flex flex-col justify-center overflow-hidden px-20 pt-20 pb-24"
        style={{ maxWidth: 1100, margin: "0 auto", height: "100vh" }}
      >
        <h1
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "clamp(52px, 7.5vw, 88px)",
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
            color: "#111111",
            margin: 0,
          }}
        >
          2.2 billion people
          <br />
          live in a world
          <br />
          <span style={{ color: "#aaaaaa" }}>not built for them.</span>
        </h1>

        <div style={{ marginTop: 36 }} />

        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 18,
            fontWeight: 400,
            color: "#555555",
            lineHeight: 1.75,
            maxWidth: 500,
            margin: 0,
          }}
        >
          43 million are completely blind.
          <br />
          295 million more live with severe vision loss.
          <br />
          The space directly in front of them — invisible.
        </p>

        <div style={{ marginTop: 44 }} />

        <div className="flex flex-wrap gap-4" style={{ gap: 16 }}>
          {CHIPS.map((chip) => (
            <div
              key={chip.number}
              style={{
                border: "1px solid #efefef",
                borderRadius: 12,
                padding: "20px 28px",
                background: "#fafafa",
                minWidth: 155,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#00e5ff",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {chip.number}
              </div>
              <p
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 12,
                  color: "#888888",
                  lineHeight: 1.4,
                  marginTop: 4,
                  marginBottom: 0,
                }}
              >
                {chip.label}
              </p>
              <p
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 9,
                  color: "#bbbbbb",
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                {chip.source}
              </p>
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: "Geist Mono, monospace",
            fontSize: 10,
            color: "#bbbbbb",
            marginTop: 28,
            marginBottom: 0,
          }}
        >
          WHO Blindness & Vision Impairment Fact Sheet 2024 · IAPB Vision Atlas 2021
        </p>
      </div>
    </PageShell>
  );
}
