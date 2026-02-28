export default function DashboardPage() {
  return (
    <main
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        color: "#e8e4f0",
        backgroundColor: "#090620ff",
        backgroundImage: `radial-gradient(
          ellipse 70% 70% at 100% 0%,
          rgba(120, 90, 220, 0.22) 0%,
          rgba(37, 20, 105, 0.1) 40%,
          transparent 80%
        )`,
        fontFamily: "system-ui, sans-serif",
        overflow: "hidden",
      }}
    >

      {/* LEFT — unit status */}
      <section
        style={{
          flex: 1,
          padding: "24px 20px",
          borderRight: "1px solid rgba(180, 160, 255, 0.12)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 66 }}>

          <div>
            <div style={{ fontSize: 40, fontWeight: 600, color: "#fff" }}>?</div>
          </div>

          <Divider />

          <Metric label="Latency" value="—" unit="ms" />
          <Metric label="State"   value="—" />

          <Divider />

          <div>
            <Label>Coordinates</Label>
            <div style={{ display: "flex", gap: 8 }}>
              {["X", "Y", "Z"].map((axis) => (
                <CoordBox key={axis} axis={axis} />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* CENTER — 3D canvas */}
      <section
        style={{
          flex: 3,
          padding: "24px 20px",
          borderRight: "1px solid rgba(180, 160, 255, 0.12)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Label>3D Canvas</Label>
        <Placeholder />
      </section>

      {/* RIGHT — live feed */}
      <section
        style={{
          flex: 2,
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Label>Live</Label>
        <Placeholder />
      </section>

    </main>
  );
}



function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 9,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "rgba(180, 160, 255, 0.45)",
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function Metric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div style={{ fontSize: 16, color: "rgba(255,255,255,0.88)" }}>
        {value}
        {unit && (
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 3 }}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function CoordBox({ axis }: { axis: string }) {
  return (
    <div
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(180,160,255,0.10)",
        borderRadius: 4,
        padding: "7px 8px",
      }}
    >
      <div style={{ fontSize: 8, letterSpacing: "0.14em", color: "rgba(180,160,255,0.4)", marginBottom: 2 }}>
        {axis}
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>—</div>
    </div>
  );
}

function Divider() {
  return (
    <div style={{ height: 1, background: "rgba(180, 160, 255, 0.10)" }} />
  );
}

function Placeholder() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px dashed rgba(180,160,255,0.14)",
        borderRadius: 6,
        background: "rgba(255,255,255,0.015)",
      }}
    />
  );
}