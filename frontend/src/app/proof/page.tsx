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
    <PageShell pageNum={4} totalPages={5} nextHref="/demo" prevHref="/solution">
      <div
        className="mx-auto flex min-h-0 flex-1 flex-col justify-center px-6 py-4 md:px-12"
        style={{ maxWidth: 860 }}
      >
        <div className="mx-auto w-full max-w-[780px]">
          <p
            style={{
              fontFamily: "Geist Mono, monospace",
              fontSize: 11,
              color: "var(--text-muted)",
              marginBottom: 24,
            }}
          >
            Solaura  /  Why It Works
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
            The sensor is already
            <br />
            in your pocket.
          </h2>

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
            iPhone Pro has included LiDAR since 2020.
            <br />
            Solaura runs on hardware over 1 billion
            <br />
            people already own.
          </p>

          <div className="mt-8 flex flex-col gap-px sm:flex-row">
            <div
              style={{
                flex: 1,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: 24,
              }}
            >
              <p
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 11,
                  color: "var(--text-label)",
                  margin: 0,
                  marginBottom: 16,
                }}
              >
                WITHOUT SOLAURA
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {WITHOUT.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontFamily: "Geist, system-ui, sans-serif",
                      fontSize: 14,
                      lineHeight: 2,
                      color: "var(--text-muted)",
                    }}
                  >
                    <span style={{ color: "var(--danger)" }}>●</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div
              style={{
                flex: 1,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: 24,
              }}
            >
              <p
                style={{
                  fontFamily: "Geist Mono, monospace",
                  fontSize: 11,
                  color: "var(--cyan)",
                  margin: 0,
                  marginBottom: 16,
                }}
              >
                WITH SOLAURA
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {WITH_SOLAURA.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontFamily: "Geist, system-ui, sans-serif",
                      fontSize: 14,
                      lineHeight: 2,
                      color: "var(--text)",
                    }}
                  >
                    <span style={{ color: "var(--success)" }}>●</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            style={{
              marginTop: 32,
              background: "var(--surface)",
              borderLeft: "3px solid var(--cyan)",
              borderRadius: 6,
              padding: "14px 18px",
            }}
          >
            <p
              style={{
                fontFamily: "Geist, system-ui, sans-serif",
                fontWeight: 500,
                fontSize: 15,
                color: "var(--text)",
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
      </div>
    </PageShell>
  );
}
