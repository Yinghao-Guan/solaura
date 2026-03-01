"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PageShellProps = {
  pageNum: number;
  totalPages?: number;
  nextHref: string | null;
  prevHref: string | null;
  breadcrumb?: string;
  nextVisibleDelay?: number;
  children: React.ReactNode;
};

export function PageShell({
  pageNum,
  totalPages = 4,
  nextHref,
  prevHref,
  breadcrumb = "",
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
      style={{ opacity: leaving ? 0 : 1, backgroundColor: "#ffffff" }}
    >
      <div
        className="absolute left-0 right-0 flex items-center justify-between"
        style={{ top: 32, zIndex: 10, padding: "0 80px" }}
      >
        <span
          style={{
            fontFamily: "Geist Mono, monospace",
            fontSize: 11,
            color: "#aaaaaa",
          }}
        >
          {breadcrumb}
        </span>
        <span
          style={{
            fontFamily: "Geist Mono, monospace",
            fontSize: 12,
            color: "#aaaaaa",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {String(pageNum).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
        </span>
        <span style={{ width: 1 }} />
      </div>
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex-1 overflow-hidden">{children}</div>
        <footer
          className="absolute left-0 right-0 flex items-center justify-between"
          style={{ bottom: 32, zIndex: 10, padding: "0 80px" }}
        >
          <div style={{ width: 80 }}>
            {prevHref ? (
              <button
                type="button"
                onClick={() => handleNav(prevHref)}
                className="transition-opacity hover:opacity-80"
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 14,
                  color: "#aaaaaa",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "none",
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
              opacity: nextVisible && nextHref ? 1 : 0,
              transition: "opacity 400ms ease-out",
            }}
          >
            {nextHref ? (
              <button
                type="button"
                onClick={() => handleNav(nextHref)}
                className="transition-opacity hover:opacity-80"
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 14,
                  color: "#00e5ff",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "none",
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
