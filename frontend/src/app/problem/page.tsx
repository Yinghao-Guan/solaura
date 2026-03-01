"use client";

import { Fragment } from "react";
import { PageShell } from "../components/PageShell";

const TABLE_ROWS = [
  {
    tool: "White Cane",
    does: "Detects ground-level obstacles only",
    misses: "Cannot detect head-level objects, approaching obstacles, or 3D spatial context",
    source: "Documented limitation — WHO assistive tech review",
  },
  {
    tool: "Screen Reader",
    does: "Reads on-screen digital content",
    misses: "Zero awareness of physical space around the user",
    source: "AT2030 Program — mobile assistive tech gaps",
  },
  {
    tool: "GPS / Maps",
    does: "Outdoor routing and directions",
    misses: "No indoor sensing, no real-time obstacle detection, fails without signal",
    source: "PathFinder study — arXiv 2025",
  },
];

export default function Page2TheGap() {
  return (
    <PageShell pageNum={2} totalPages={5} nextHref="/solution" prevHref="/">
      <div
        className="mx-auto flex min-h-0 flex-1 flex-col justify-center px-6 py-4 md:px-12"
        style={{ maxWidth: 860 }}
      >
        <div className="mx-auto w-full max-w-[800px]">
          <p
            style={{
              fontFamily: "Geist Mono, monospace",
              fontSize: 11,
              color: "var(--text-muted)",
              marginBottom: 24,
            }}
          >
            Solaura  /  The Gap
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
            Everything helps them navigate.
            <br />
            Nothing helps them sense.
          </h2>

          <p
            style={{
              fontFamily: "Geist, system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.75,
              color: "var(--text-muted)",
              marginTop: 24,
              maxWidth: 500,
            }}
          >
            The tools built for blind people
            <br />
            solve the wrong problem.
          </p>

          <div
            style={{
              marginTop: 32,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-2)" }}>
                  <th
                    style={{
                      fontFamily: "Geist Mono, monospace",
                      fontSize: 11,
                      color: "var(--text-label)",
                      padding: "10px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid var(--border)",
                      fontWeight: 500,
                    }}
                  >
                    TOOL
                  </th>
                  <th
                    style={{
                      fontFamily: "Geist Mono, monospace",
                      fontSize: 11,
                      color: "var(--text-label)",
                      padding: "10px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid var(--border)",
                      fontWeight: 500,
                    }}
                  >
                    WHAT IT DOES
                  </th>
                  <th
                    style={{
                      fontFamily: "Geist Mono, monospace",
                      fontSize: 11,
                      color: "var(--text-label)",
                      padding: "10px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid var(--border)",
                      fontWeight: 500,
                    }}
                  >
                    WHAT IT MISSES
                  </th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <Fragment key={row.tool}>
                    <tr
                      style={{
                        borderBottom: "none",
                        transition: "background 150ms",
                      }}
                      className="table-row-hover"
                    >
                      <td
                        style={{
                          fontFamily: "Geist, system-ui, sans-serif",
                          fontWeight: 500,
                          fontSize: 15,
                          color: "var(--text)",
                          padding: "14px 16px",
                        }}
                      >
                        {row.tool}
                      </td>
                      <td
                        style={{
                          fontFamily: "Geist, system-ui, sans-serif",
                          fontSize: 15,
                          color: "var(--text-muted)",
                          padding: "14px 16px",
                        }}
                      >
                        {row.does}
                      </td>
                      <td
                        style={{
                          fontFamily: "Geist, system-ui, sans-serif",
                          fontSize: 15,
                          color: "var(--danger)",
                          padding: "14px 16px",
                        }}
                      >
                        <span style={{ color: "var(--danger)" }}>●</span> {row.misses}
                      </td>
                    </tr>
                    <tr>
                      <td
                        colSpan={3}
                        style={{
                          fontFamily: "Geist Mono, monospace",
                          fontSize: 9,
                          color: "var(--text-muted)",
                          padding: "4px 16px 12px",
                          borderBottom: i < TABLE_ROWS.length - 1 ? "1px solid var(--border)" : "none",
                        }}
                      >
                        {row.source}
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: 20,
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
              The space directly in front of them
              <br />
              is invisible. We made it audible.
            </p>
          </div>

          <div
            style={{
              marginTop: 20,
              background: "var(--surface)",
              borderLeft: "3px solid var(--amber)",
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
              $411 billion lost in global productivity
              <br />
              annually due to vision impairment.
              <br />
              The cost of doing nothing is not zero.
            </p>
            <p
              style={{
                fontFamily: "Geist Mono, monospace",
                fontSize: 9,
                color: "var(--text-muted)",
                margin: "8px 0 0",
                textAlign: "right",
              }}
            >
              WHO Global Report
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
