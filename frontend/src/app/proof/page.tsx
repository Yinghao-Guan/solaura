"use client";

import { useEffect, useState } from "react";
import { PageShell } from "../components/PageShell";

const BARS = [
  { name: "OrCam MyEye 2", price: "$4,500", width: 100, bg: "#ff4444" },
  { name: "WeWALK / BuzzClip", price: "$650", width: 14, bg: "#ff8844" },
  { name: "Smart Vision Glasses", price: "$360", width: 8, bg: "#ffaa44" },
  { name: "Solaura", price: "$0 hardware", width: 1.5, bg: "#00cc88" },
];

export default function Page4() {
  const [barMounted, setBarMounted] = useState(false);

  useEffect(() => {
    setBarMounted(true);
  }, []);

  return (
    <PageShell
      pageNum={5}
      totalPages={7}
      nextHref="/unlock"
      prevHref="/process"
      breadcrumb="Solaura / What It Costs"
    >
      <div
        className="flex h-full min-h-0 flex-col justify-center overflow-hidden px-20 py-10"
        style={{ maxWidth: 560, margin: "0 auto" }}
      >
        <div style={{ minHeight: 0 }}>
          <p
            style={{
              fontFamily: "Geist Mono, monospace",
              fontSize: 15,
              fontWeight: 700,
              color: "#888888",
              letterSpacing: "0.12em",
              marginBottom: 20,
              marginTop: 0,
            }}
          >
            WHAT THE ALTERNATIVES COST
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {BARS.map((bar) => (
              <div key={bar.name} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#111111",
                    }}
                  >
                    {bar.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "system-ui, sans-serif",
                      fontSize: bar.name === "Solaura" ? 12 : 17,
                      fontWeight: bar.name === "Solaura" ? 700 : 800,
                      color: bar.name === "Solaura" ? "#00cc88" : "#ff4444",
                    }}
                  >
                    {bar.name === "Solaura"
                      ? "$0 hardware · API costs cents per session"
                      : bar.price}
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: "#f0f0f0",
                    borderRadius: 4,
                    overflow: "hidden",
                    minWidth: 140,
                  }}
                >
                  <div
                    style={{
                      width: `${barMounted ? bar.width : 0}%`,
                      height: "100%",
                      borderRadius: 4,
                      background: bar.bg,
                      transition: "width 1.2s ease-out",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 20,
              background: "#f0fdf8",
              border: "1px solid #00cc88",
              borderRadius: 10,
              padding: "16px 20px",
            }}
          >
            <p
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 15,
                fontWeight: 700,
                color: "#111111",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Zero hardware cost.
            </p>
            <p
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 14,
                fontWeight: 500,
                color: "#555555",
                marginTop: 6,
                marginBottom: 0,
                lineHeight: 1.3,
              }}
            >
              Gemini + ElevenLabs — cents per session.
            </p>
          </div>
          <p
            style={{
              fontFamily: "Geist Mono, monospace",
              fontSize: 9,
              color: "#bbbbbb",
              marginTop: 10,
              marginBottom: 0,
            }}
          >
            OrCam.com · PMC 12178407 · BuzzClip.com · IEEE Xplore · Apple
          </p>
        </div>
      </div>
    </PageShell>
  );
}
