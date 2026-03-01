"use client";

import Link from "next/link";

export default function HomePage() {
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
        01 / 07
      </div>
      <Link
        href="/problem"
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
          textAlign: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "clamp(72px, 10vw, 112px)",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#fff",
              lineHeight: 1.1,
            }}
          >
            Solaura
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: "clamp(20px, 2.8vw, 32px)",
              color: "rgba(255,255,255,0.78)",
              fontWeight: 400,
            }}
          >
            Perceive Beyond Sight.
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: "clamp(13px, 1.4vw, 18px)",
              color: "rgba(180, 160, 255, 0.6)",
              letterSpacing: "0.06em",
            }}
          >
            Spatial Awareness for the Visually Impaired
          </div>
        </div>
      </main>
    </>
  );
}
