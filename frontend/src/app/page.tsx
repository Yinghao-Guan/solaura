"use client";

import { useEffect, useState } from "react";
import { PageShell } from "./components/PageShell";

const STATS = [
  { number: "43M", label: "People blind worldwide", color: "var(--cyan)" },
  { number: "295M", label: "Severe vision loss", color: "var(--cyan)" },
  { number: "+55%", label: "Projected rise by 2050", color: "var(--amber)" },
];

export default function Page1HumanCost() {
  const [headline, setHeadline] = useState(false);
  const [subtext, setSubtext] = useState(false);
  const [stats, setStats] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHeadline(true), 0);
    const t2 = setTimeout(() => setSubtext(true), 300);
    const t3 = setTimeout(() => setStats(true), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <PageShell pageNum={1} totalPages={7} nextHref="/problem" prevHref={null} nextVisibleDelay={900}>
      <div
        className="mx-auto flex min-h-0 flex-1 flex-col justify-center px-6 py-4 md:px-12"
        style={{ maxWidth: 860 }}
      >
        <div className="mx-auto w-full max-w-[720px]">
          <p
            style={{
              fontFamily: "Geist Mono, monospace",
              fontSize: 11,
              color: "var(--text-muted)",
              marginBottom: 24,
            }}
          >
            Solaura  /  The Problem
          </p>

          <div
            style={{
              opacity: headline ? 1 : 0,
              transform: headline ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 500ms ease-out, transform 500ms ease-out",
            }}
          >
            <h1
              style={{
                fontFamily: "Geist, system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 56,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "var(--text)",
                margin: 0,
              }}
            >
              1.1 billion people
              <br />
              can&apos;t see the space
              <br />
              they&apos;re standing in.
            </h1>
          </div>

          <div
            style={{
              marginTop: 24,
              maxWidth: 520,
              opacity: subtext ? 1 : 0,
              transform: subtext ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 500ms ease-out, transform 500ms ease-out",
            }}
          >
            <p
              style={{
                fontFamily: "Geist, system-ui, sans-serif",
                fontSize: 16,
                fontWeight: 400,
                lineHeight: 1.75,
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Not the street. Not the phone. The room.
              <br />
              The hallway. The object two steps ahead.
              <br />
              For hundreds of millions, that space is
              <br />
              completely invisible.
            </p>
          </div>

          <div
            className="mt-8 flex flex-wrap gap-3"
            style={{
              opacity: stats ? 1 : 0,
              transform: stats ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 500ms ease-out, transform 500ms ease-out",
            }}
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  flex: "1 1 140px",
                  minWidth: 140,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "16px 20px",
                  opacity: stats ? 1 : 0,
                  transform: stats ? "translateY(0)" : "translateY(12px)",
                  transition: `opacity 500ms ease-out ${i * 100}ms, transform 500ms ease-out ${i * 100}ms`,
                }}
              >
                <div
                  style={{
                    fontFamily: "Geist, system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: 36,
                    color: stat.color,
                  }}
                >
                  {stat.number}
                </div>
                <p
                  style={{
                    fontFamily: "Geist, system-ui, sans-serif",
                    fontSize: 15,
                    lineHeight: 1.75,
                    color: "var(--text-muted)",
                    margin: "4px 0 0",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <p
            style={{
              fontFamily: "Geist Mono, monospace",
              fontSize: 10,
              color: "var(--text-muted)",
              marginTop: 24,
            }}
          >
            Source: WHO Global Vision Report · IAPB Vision Atlas 2021
          </p>
        </div>
      </div>
    </PageShell>
  );
}
