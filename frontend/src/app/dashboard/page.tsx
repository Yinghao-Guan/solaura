"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// World-space range shown in canvas: ±WORLD_RANGE metres
const WORLD_RANGE = 1.0;
// Must match HALF in TerrainCanvas (= (GRID-1)*SPACING*0.5 = 79*0.18*0.5)
const CANVAS_HALF = 7.11;
const WORLD_TO_CANVAS = CANVAS_HALF / WORLD_RANGE;

export default function DashboardPage() {
  const [coords, setCoords] = useState<[number, number, number] | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8765/state");
        const data = await res.json();

        if (data.cam_pos && data.target_pos && data.cam_offset) {
          const [cx, cy, cz]: number[] = data.cam_pos;
          const [tx, ty, tz]: number[] = data.target_pos;
          const dx = tx - cx, dy = ty - cy, dz = tz - cz;
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // cam_offset = world vector rotated into camera frame
          // v_c[1] = left/right (same as audio azimuth uses)
          // v_c[2] = forward/back (-Z is forward in camera frame)
          const [, vy_cam, vz_cam]: number[] = data.cam_offset;

          setCoords([dx, dy, dz]);
          setIsActive(data.is_active);
          setDistance(d);

          if (typeof (window as any).setSource === "function") {
            (window as any).setSource(0, {
              x:  vy_cam * WORLD_TO_CANVAS,  // camera Y → canvas X (left/right)
              z:  vz_cam * WORLD_TO_CANVAS,  // camera Z → canvas Z (fwd=-Z=upper)
              intensity: data.is_active ? 0.9 : 0.0,
            });
            // Hide second fixed source
            (window as any).setSource(1, { intensity: 0.0 });
          }
        } else {
          setIsActive(false);
          if (typeof (window as any).setSource === "function") {
            (window as any).setSource(0, { intensity: 0.0 });
            (window as any).setSource(1, { intensity: 0.0 });
          }
        }
      } catch {
        // backend not running
      }
    }, 100);
    return () => clearInterval(id);
  }, []);

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
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          <div>
            <div style={{ fontSize: 40, fontWeight: 600, color: "#fff" }}>?</div>
          </div>

          <Divider />

          <Metric label="Distance" value={distance !== null ? distance.toFixed(2) : "—"} unit="m" />
          <Metric
            label="State"
            value={isActive ? "LOCKED" : "IDLE"}
            highlight={isActive}
          />

          <Divider />

          <div>
            <Label>Object Offset (m)</Label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["X", "Y", "Z"] as const).map((axis, i) => (
                <CoordBox
                  key={axis}
                  axis={axis}
                  value={coords ? coords[i].toFixed(2) : undefined}
                />
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
        <TerrainCanvas />
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

function Metric({ label, value, unit, highlight }: { label: string; value: string; unit?: string; highlight?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      <div style={{ fontSize: 16, color: highlight ? "#7bf5a0" : "rgba(255,255,255,0.88)" }}>
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

function CoordBox({ axis, value }: { axis: string; value?: string }) {
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
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{value ?? "—"}</div>
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

// ─────────────────────────────────────────────────────────────────────────────
// TERRAIN CANVAS
// ─────────────────────────────────────────────────────────────────────────────

function TerrainCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Config ────────────────────────────────────────────────────────────────
    const GRID       = 80;
    const SPACING    = 0.18;
    const MAX_HEIGHT = 5.0;
    const SMOOTHING  = 0.20;
    const HALF       = (GRID - 1) * SPACING * 0.5;

    const SOURCE_PALETTE = [
      { color: 0x00d4ff },   // bottle marker — cyan
    ];

    const FIXED_POSITIONS = [
      { x: 0.0, z: 0.0 },   // bottle — starts at centre, moved by live data
    ];

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(1, 1);
    renderer.domElement.style.width  = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    // ── Scene / Camera ────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 100);
    camera.position.set(0, 3, 13);
    camera.lookAt(0, 0, 0);

    // ── Resize observer ───────────────────────────────────────────────────────
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    // ── Terrain geometry ──────────────────────────────────────────────────────
    const total     = GRID * GRID;
    const positions = new Float32Array(total * 3);
    const colors    = new Float32Array(total * 3);
    const currentY  = new Float32Array(total);
    const targetY   = new Float32Array(total);
    const gx        = new Float32Array(total);
    const gz        = new Float32Array(total);

    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        const i          = row * GRID + col;
        gx[i]            = col * SPACING - HALF;
        gz[i]            = row * SPACING - HALF;
        positions[i * 3]     = gx[i];
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = gz[i];
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color",    new THREE.BufferAttribute(colors,    3));

    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true,
    })));

    // ── Camera sphere (moved toward viewer = lower on screen) ─────────────────
    const camSpherePos = new THREE.Vector3(0, 0.1, 5);
    const camSphereOuter = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.10, wireframe: true })
    );
    camSphereOuter.position.copy(camSpherePos);
    scene.add(camSphereOuter);

    const camSphereInner = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xbbaaff, transparent: true, opacity: 0.12 })
    );
    camSphereInner.position.copy(camSpherePos);
    scene.add(camSphereInner);

    // ── Sources ───────────────────────────────────────────────────────────────
    const sources: { x: number; z: number; intensity: number; marker: THREE.Mesh }[] = [];

    FIXED_POSITIONS.forEach((pos, idx) => {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.20, 16, 16),
        new THREE.MeshBasicMaterial({ color: SOURCE_PALETTE[idx].color })
      );
      marker.position.set(pos.x, 0.1, pos.z);
      scene.add(marker);
      sources.push({ x: pos.x, z: pos.z, intensity: 0.0, marker });
    });

    // ── Public API ────────────────────────────────────────────────────────────
    (window as any).setSource = (index: number, data: { x?: number; z?: number; intensity?: number }) => {
      if (!sources[index]) return;
      Object.assign(sources[index], data);
      sources[index].marker.position.set(sources[index].x, 0.1, sources[index].z);
    };

    (window as any).setSources = (list: { x?: number; z?: number; intensity?: number }[]) => {
      list.forEach((s, i) => (window as any).setSource(i, s));
    };

    // ── Source influence ──────────────────────────────────────────────────────
    function sourceInfluence(sx: number, sz: number, intensity: number, px: number, pz: number) {
      const srcDist = Math.sqrt(sx * sx + sz * sz);
      if (srcDist < 0.001) return intensity;

      const srcAngle = Math.atan2(sz, sx);
      const ptDist   = Math.sqrt(px * px + pz * pz);
      if (ptDist < 0.001) return 0;

      const ptAngle = Math.atan2(pz, px);
      let diff = Math.abs(srcAngle - ptAngle);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;

      const directional = Math.max(0, Math.cos(diff));
      const distFactor  = Math.min(ptDist / (HALF * 0.6), 1.0);

      return intensity * Math.pow(directional, 1.0) * distFactor;
    }

    // ── Animation loop ────────────────────────────────────────────────────────
    let rafId: number;
    let t = 0;

    function animate() {
      rafId = requestAnimationFrame(animate);
      t += 0.012;

      // compute target heights
      for (let i = 0; i < total; i++) {
        const px = gx[i];
        const pz = gz[i];

        let height = 0;
        for (const src of sources) {
          height += sourceInfluence(src.x, src.z, src.intensity, px, pz);
        }

        targetY[i] = Math.min(height * MAX_HEIGHT, MAX_HEIGHT);
      }

      // smooth + write color
      for (let i = 0; i < total; i++) {
        currentY[i] += (targetY[i] - currentY[i]) * SMOOTHING;
        const y  = currentY[i];
        const t_ = Math.min(y / MAX_HEIGHT, 1);

        positions[i * 3 + 1] = y;

        // color ramp: dark indigo → violet → cyan → white
        let cr, cg, cb;
        if (t_ < 0.33) {
          const k = t_ / 0.33;
          cr = 0.18 + k * 0.40; cg = 0.08 + k * 0.22; cb = 0.35 + k * 0.60;
        } else if (t_ < 0.66) {
          const k = (t_ - 0.33) / 0.33;
          cr = 0.58 - k * 0.58; cg = 0.30 + k * 0.55; cb = 0.95 + k * 0.05;
        } else {
          const k = (t_ - 0.66) / 0.34;
          cr = k;                cg = 0.85 + k * 0.15; cb = 1.0;
        }

        colors[i * 3]     = cr;
        colors[i * 3 + 1] = cg;
        colors[i * 3 + 2] = cb;
      }

      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate    = true;

      renderer.render(scene, camera);
    }

    animate();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ flex: 1, width: "100%", overflow: "hidden", borderRadius: 4 }}
    />
  );
}