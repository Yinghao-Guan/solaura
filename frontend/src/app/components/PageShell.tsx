"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BG = "#ffffff";
const CYAN = "#0891b2";
const MUTED = "#525252";

type PageShellProps = {
  pageNum: number;
  totalPages?: number;
  nextHref: string | null;
  prevHref: string | null;
  nextVisibleDelay?: number;
  children: React.ReactNode;
};

export function PageShell({
  pageNum,
  totalPages = 5,
  nextHref,
  prevHref,
  nextVisibleDelay = 0,
  children,
}: PageShellProps) {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [nextVisible, setNextVisible] = useState(nextVisibleDelay === 0);

  useEffect(() => {
    if (nextVisibleDelay <= 0) {
      setNextVisible(true);
      return undefined;
    }
    const t = setTimeout(() => setNextVisible(true), nextVisibleDelay);
    return () => clearTimeout(t);
  }, [nextVisibleDelay]);

  const handleNav = (href: string) => {
    setLeaving(true);
    setTimeout(() => router.push(href), 250);
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden transition-opacity duration-250 ease-in"
      style={{
        opacity: leaving ? 0 : 1,
        backgroundColor: BG,
      }}
    >
      <div
        className="absolute left-0 right-0 top-0 py-6 text-center"
        style={{ zIndex: 10 }}
      >
        <span
          style={{
            fontFamily: "Geist Mono, monospace",
            fontSize: 11,
            color: "var(--text-label)",
            letterSpacing: "0.15em",
          }}
        >
          {String(pageNum).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
        </span>
      </div>
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
        <footer
          className="flex shrink-0 items-center justify-between px-6 md:px-12"
          style={{ paddingTop: 16, paddingBottom: 32 }}
        >
          <div style={{ width: 80 }}>
            {prevHref ? (
              <button
                type="button"
                onClick={() => handleNav(prevHref)}
                className="transition-opacity hover:opacity-80"
                style={{
                  fontFamily: "Geist, system-ui, sans-serif",
                  fontSize: 14,
                  color: MUTED,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
          </div>
          <div
            style={{
              width: 80,
              textAlign: "right",
              opacity: nextVisible ? 1 : 0,
              transition: "opacity 400ms ease-out",
            }}
          >
            {nextHref ? (
              <button
                type="button"
                onClick={() => handleNav(nextHref)}
                className="transition-opacity hover:opacity-80"
                style={{
                  fontFamily: "Geist, system-ui, sans-serif",
                  fontSize: 14,
                  color: CYAN,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Next →
              </button>
            ) : (
              <span />
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
