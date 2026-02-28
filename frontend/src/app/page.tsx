export default function SolauraDashboard() {
  return (
    <div className="min-h-screen bg-[#050508] bg-grid-pattern text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-[#050508]/90 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-cyan-400">☀</span>
            <h1 className="font-semibold tracking-tight text-zinc-100">
              Solaura
            </h1>
            <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-medium text-cyan-400">
              Perceive Beyond Sight
            </span>
          </div>
          <div className="flex items-center gap-4">
            <StatusPill status="live" label="Processing" />
            <StatusPill status="connected" label="Device Connected" />
          </div>
        </div>
      </header>

      <main className="flex gap-6 p-6">
        {/* 3D Canvas Placeholder */}
        <section className="flex-1">
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
              Spatial View
            </h2>
            <div className="relative aspect-video overflow-hidden rounded-xl border border-zinc-800 bg-[#0f0f14] glow-cyan">
              {/* Placeholder for 3D canvas - integrate Three.js / React Three Fiber here */}
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-zinc-600">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-zinc-700">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                      />
                    </svg>
                  </div>
                  <p className="font-mono text-sm">3D Canvas Placeholder</p>
                  <p className="font-mono text-xs text-zinc-600">
                    Integrate Three.js / React Three Fiber
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real-time Audio Status Panel */}
        <aside className="w-96 shrink-0">
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
              Real-time Audio
            </h2>
            <div className="rounded-xl border border-zinc-800 bg-[#14141c] p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-500">
                  Spatial feedback stream
                </span>
                <span className="flex h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
              </div>
              <div className="flex flex-col gap-4">
                {/* Example audio status entries */}
                <AudioStatusEntry object="Bottle" direction="ahead" />
                <AudioStatusEntry object="Chair" direction="right" />
                <AudioStatusEntry object="Table" direction="left" />
              </div>
              <div className="mt-4 border-t border-zinc-800 pt-4">
                <p className="font-mono text-xs text-zinc-600">
                  Low-latency • On-device • Directional
                </p>
              </div>
            </div>

            {/* System status */}
            <div className="rounded-xl border border-zinc-800 bg-[#14141c] p-4">
              <h3 className="mb-3 font-mono text-xs font-medium uppercase tracking-wider text-zinc-500">
                System Status
              </h3>
              <ul className="space-y-2 font-mono text-sm">
                <li className="flex justify-between">
                  <span className="text-zinc-500">Object detection</span>
                  <span className="text-cyan-400">Active</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-zinc-500">Audio latency</span>
                  <span className="text-cyan-400">&lt;50ms</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-zinc-500">Tracking</span>
                  <span className="text-cyan-400">Real-time</span>
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function StatusPill({
  status,
  label,
}: {
  status: "live" | "connected";
  label: string;
}) {
  const color =
    status === "live"
      ? "bg-cyan-500/20 text-cyan-400"
      : "bg-emerald-500/20 text-emerald-400";
  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function AudioStatusEntry({
  object,
  direction,
}: {
  object: string;
  direction: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/50 px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20">
        <svg
          className="h-4 w-4 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
      </div>
      <div className="flex-1">
        <p className="font-medium text-zinc-100">{object}</p>
        <p className="font-mono text-xs text-cyan-400">{direction}</p>
      </div>
      <span className="font-mono text-xs text-zinc-600">
        {object}, {direction}
      </span>
    </div>
  );
}
