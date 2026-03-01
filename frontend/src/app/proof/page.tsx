"use client";

import { PageShell } from "../components/PageShell";

const WITHOUT = [
  "Dedicated hardware: $360–$5,000+",
  "Requires internet (Seeing AI, Lookout)",
  "Verbal narration — average 2–4s delay",
  "Fails indoors and in darkness",
  "Requires extra device or attachment",
  "Ultrasonic canes: detect ahead only, no spatial audio",
];

const WITH_SOLAURA = [
  "Runs on existing iPhone Pro",
  "Fully offline — on-device LiDAR",
  "Directional audio feedback <50ms",
  "Works in complete darkness",
  "Zero hardware cost beyond iPhone",
  "Stereo panning proven to convey object direction (IEEE 2018–2026)",
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
              6 peer-reviewed systems confirm LiDAR +
              <br />
              directional audio works offline.
              <br />
              The brain is already wired to process it.
              <br />
              The sensor is already in the phone.
              <br />
              Solaura connects them.
            </p>
          </div>

          <div
            style={{
              marginTop: 16,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: 16,
            }}
          >
            <p
              style={{
                fontFamily: "Geist Mono, monospace",
                fontSize: 10,
                color: "var(--text-label)",
                margin: 0,
                marginBottom: 12,
              }}
            >
              COMPETITOR PRICING REFERENCE
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "10px 0" }}>
              <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 14 }}>OrCam MyEye 2</span>
              <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 13, color: "var(--danger)" }}>~$4,000–$5,000</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", padding: "10px 0" }}>
              <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 14 }}>WeWALK / BuzzClip (ultrasonic)</span>
              <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 13, color: "var(--danger)" }}>~$500–$800</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
              <span style={{ fontFamily: "Geist, system-ui, sans-serif", fontWeight: 500, fontSize: 14 }}>Smart Vision Glasses (LiDAR)</span>
              <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 13, color: "var(--danger)" }}>~$360</span>
            </div>
            <p
              style={{
                fontFamily: "Geist Mono, monospace",
                fontSize: 10,
                color: "#4cc38a",
                margin: "12px 0 0",
              }}
            >
              Solaura: $0 additional hardware required.
            </p>
            <p
              style={{
                fontFamily: "Geist Mono, monospace",
                fontSize: 9,
                color: "var(--text-label)",
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              Sources: OrCam.com · PMC 12178407 · BuzzClip.com · IEEE Xplore
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
