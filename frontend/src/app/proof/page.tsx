"use client";

import { PageShell } from "../components/PageShell";

const WITHOUT = [
  "Dedicated hardware required",
  "Requires internet connection",
  "Verbal narration — slow feedback",
  "Fails indoors and in darkness",
  "Needs a human assistant",
];

const WITH_SOLAURA = [
  "Runs on existing iPhone",
  "Fully offline, on-device",
  "Instant directional audio <50ms",
  "Works in total darkness",
  "Zero setup — point and sense",
];

export default function Page4TheProof() {
  return (
    <PageShell
      pageNum={5}
      totalPages={6}
      nextHref="/go"
      prevHref="/dashboard"
      theme="dark"
      backgroundColor="#090620ff"
      backgroundImage={`radial-gradient(
        ellipse 70% 70% at 100% 0%,
        rgba(120, 90, 220, 0.22) 0%,
        rgba(37, 20, 105, 0.1) 40%,
        transparent 80%
      )`}
    >
      <main
        className="mx-auto flex min-h-0 flex-1 flex-col justify-center px-6 py-6 md:px-12"
        style={{
          maxWidth: 980,
          color: "#e8e4f0",
          fontFamily: "system-ui, sans-serif",
          minHeight: "100%",
        }}
      >
        <div className="mx-auto w-full max-w-[820px]">
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(180, 160, 255, 0.6)",
              marginBottom: 20,
            }}
          >
            Solaura / Why It Works
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
            The sensor is already
            <br />
            in your pocket.
          </h2>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.62)",
              marginTop: 22,
              maxWidth: 520,
            }}
          >
            iPhone Pro has included LiDAR since 2020.
            <br />
            Solaura runs on hardware over 1 billion
            <br />
            people already own.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(180,160,255,0.12)",
                borderRadius: 6,
                padding: 20,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "rgba(180, 160, 255, 0.6)",
                  margin: 0,
                  marginBottom: 14,
                }}
              >
                WITHOUT SOLAURA
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {WITHOUT.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: 14,
                      lineHeight: 2,
                      color: "rgba(255,255,255,0.65)",
                    }}
                  >
                    <span style={{ color: "#ff7a7a" }}>●</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(180,160,255,0.12)",
                borderRadius: 6,
                padding: 20,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "rgba(180, 160, 255, 0.85)",
                  margin: 0,
                  marginBottom: 14,
                }}
              >
                WITH SOLAURA
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {WITH_SOLAURA.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: 14,
                      lineHeight: 2,
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    <span style={{ color: "#7bf5a0" }}>●</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            style={{
              marginTop: 28,
              background: "rgba(120, 90, 220, 0.12)",
              borderLeft: "3px solid rgba(180, 160, 255, 0.8)",
              borderRadius: 6,
              padding: "14px 18px",
            }}
          >
            <p
              style={{
                fontWeight: 500,
                fontSize: 15,
                color: "rgba(255,255,255,0.85)",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              This isn&apos;t a concept. The core is confirmed working.
              <br />
              Built in [X] hours. Demo is live.
            </p>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
