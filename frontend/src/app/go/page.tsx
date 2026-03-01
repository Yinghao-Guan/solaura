"use client";

import { useRouter } from "next/navigation";
import { Syne, Space_Mono } from "next/font/google";
import { PageShell } from "../components/PageShell";

const syne = Syne({ weight: ["400", "700", "800"], subsets: ["latin"] });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"] });

const CYAN = "#00e5ff";
const MUTED = "#3d4f5e";
const WHITE = "#e8eaf0";

export default function GoToDashboardPage() {
  const router = useRouter();

  const handleOpenDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <PageShell
      pageNum={6}
      totalPages={6}
      nextHref="/dashboard"
      prevHref="/demo"
    >
      <div className="flex h-full flex-col items-center justify-center px-6">
        <div className="mx-auto w-full max-w-[560px] text-center">
          <p
            className={`mb-6 ${spaceMono.className}`}
            style={{
              fontSize: 11,
              color: CYAN,
              letterSpacing: "0.25em",
            }}
          >
            READY TO TRY
          </p>

          <h1
            className={`${syne.className} font-bold leading-tight`}
            style={{
              fontSize: "clamp(36px, 5vw, 64px)",
              color: WHITE,
            }}
          >
            Open the dashboard.
          </h1>

          <p
            className={`mt-6 ${spaceMono.className}`}
            style={{
              fontSize: 14,
              color: MUTED,
              lineHeight: 1.7,
            }}
          >
            Launch the app and perceive space through sound.
          </p>

          <button
            type="button"
            onClick={handleOpenDashboard}
            className={`mt-10 inline-block border px-8 py-4 ${spaceMono.className} text-[13px] transition-opacity hover:opacity-90`}
            style={{
              borderColor: CYAN,
              color: CYAN,
            }}
          >
            OPEN DASHBOARD
          </button>

          <p className="mt-8 text-[11px]" style={{ color: MUTED }}>
            Or click NEXT → below to continue.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
