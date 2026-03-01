"use client";

import { useRouter } from "next/navigation";
import { PageShell } from "../components/PageShell";

export default function ReadyPage() {
  const router = useRouter();

  return (
    <PageShell
      pageNum={7}
      totalPages={7}
      nextHref="/demo"
      prevHref="/unlock"
      breadcrumb="Solaura / Try the demo"
    >
      <div
        className="flex min-h-0 flex-col justify-center overflow-hidden px-20 py-12"
        style={{
          maxWidth: 640,
          margin: "0 auto",
          height: "100%",
          textAlign: "center",
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 32,
        }}
      >
        <h2
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: "clamp(36px, 5vw, 52px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#111111",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Ready to hear the room?
        </h2>
        <button
          type="button"
          onClick={() => router.push("/demo")}
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 16,
            fontWeight: 600,
            color: "#00e5ff",
            background: "transparent",
            border: "2px solid #00e5ff",
            borderRadius: 12,
            padding: "14px 32px",
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.opacity = "0.85";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          Open spatial demo →
        </button>
        <p
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 400,
            color: "#888888",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Core spatial sensing confirmed. Running offline on existing hardware.
        </p>
      </div>
    </PageShell>
  );
}
