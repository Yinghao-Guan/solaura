"use client";

import { PageShell } from "../components/PageShell";

export default function UnlockPage() {
  return (
    <PageShell
      pageNum={6}
      totalPages={7}
      nextHref="/ready"
      prevHref="/proof"
      breadcrumb="Solaura / The Sensor"
    >
      <div
        className="flex min-h-0 flex-col justify-center overflow-hidden px-20 py-12"
        style={{ maxWidth: 720, margin: "0 auto", height: "100%", textAlign: "center" }}
      >
        <p
          style={{
            fontFamily: "Geist Mono, monospace",
            fontSize: 11,
            color: "#aaaaaa",
            letterSpacing: "0.12em",
            marginBottom: 24,
            marginTop: 0,
          }}
        >
          NO NEW HARDWARE
        </p>
        <h2
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "clamp(32px, 4.5vw, 48px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#111111",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          The sensor has been in your pocket
          <br />
          since 2020. We unlocked it.
        </h2>
        <p
          style={{
            fontFamily: "Geist Mono, monospace",
            fontSize: 13,
            color: "#00e5ff",
            marginTop: 20,
            marginBottom: 0,
            letterSpacing: "0.02em",
          }}
        >
          iPhone Pro LiDAR · Available since iPhone 12 Pro
        </p>
      </div>
    </PageShell>
  );
}
