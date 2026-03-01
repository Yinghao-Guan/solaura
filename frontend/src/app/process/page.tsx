"use client";

import { PageShell } from "../components/PageShell";

const LAYERS = [
  {
    num: "01",
    label: "SENSE",
    text: "LiDAR + ARKit reads your space.\nYOLOv8 finds what matters.",
  },
  {
    num: "02",
    label: "PROCESS",
    text: "Distance becomes rhythm.\nDirection becomes stereo.",
  },
  {
    num: "03",
    label: "GUIDE",
    text: "Sound leads your hand.\nGemini + ElevenLabs add voice.",
  },
];

export default function ProcessPage() {
  return (
    <PageShell
      pageNum={4}
      totalPages={7}
      nextHref="/proof"
      prevHref="/solution"
      breadcrumb="Solaura / The Process"
    >
      <div
        className="flex min-h-0 flex-col justify-center overflow-hidden px-20 py-10"
        style={{ maxWidth: 900, margin: "0 auto", height: "100%" }}
      >
        <p
          style={{
            fontFamily: "Geist Mono, monospace",
            fontSize: 11,
            color: "#aaaaaa",
            letterSpacing: "0.12em",
            marginBottom: 10,
            marginTop: 0,
          }}
        >
          THE PROCESS
        </p>
        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: "#888888",
            margin: 0,
          }}
        >
          Solaura.
        </p>
        <h2
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "clamp(28px, 3.5vw, 38px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#111111",
            margin: "4px 0 0 0",
            lineHeight: 1.25,
          }}
        >
          A complete spatial awareness system.
        </h2>

        <div
          className="flex flex-nowrap"
          style={{ marginTop: 28, gap: 16, flexDirection: "row" }}
        >
          {LAYERS.map((layer) => (
            <div
              key={layer.num}
              style={{
                flex: "1 1 0",
                minWidth: 0,
                background: "#fafafa",
                border: "1px solid #efefef",
                borderRadius: 14,
                padding: "20px 18px",
                display: "flex",
                flexDirection: "row",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#111111",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "Geist Mono, monospace",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {layer.num}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: "Geist Mono, monospace",
                    fontSize: 10,
                    color: "#00e5ff",
                    letterSpacing: "0.1em",
                  }}
                >
                  {layer.label}
                </span>
                <p
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 14,
                    color: "#333333",
                    lineHeight: 1.5,
                    margin: 0,
                    whiteSpace: "pre-line",
                  }}
                >
                  {layer.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2" style={{ gap: 8 }}>
          {["✓ Fully Offline", "✓ On-device ML", "✓ UDP Low-latency", "✓ No New Hardware"].map((chip) => (
            <span
              key={chip}
              style={{
                border: "1px solid #efefef",
                borderRadius: 20,
                padding: "6px 14px",
                fontSize: 11,
                color: "#555555",
                background: "white",
                fontFamily: "system-ui, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
