"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Space_Mono } from "next/font/google";

const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"] });

const BG = "#070d1a";
const CYAN = "#00e5ff";
const MUTED = "#4a5568";

const SPHERE_POSITIONS: [number, number, number][] = [
  [2, 1.5, -1],
  [-2, 1.5, 1],
  [3, 1.2, 2],
  [-1, 1.8, -3],
];

function beepIntervalFromDistance(d: number): number {
  if (d > 8) return 900;
  if (d > 5) return 600;
  if (d > 3) return 380;
  if (d > 1.5) return 200;
  if (d > 0.4) return 100;
  return 0;
}

function gainFromDistance(d: number): number {
  const maxD = 12;
  const t = Math.max(0, 1 - d / maxD);
  return 0.08 + t * 0.22;
}

export default function LandingPage() {
  return (
    <>
      <div
        className="fixed left-1/2 top-0 z-[9999] -translate-x-1/2 py-6 text-center"
        style={{
          fontFamily: "var(--font-space-mono), monospace",
          fontSize: 11,
          color: "#3d4f5e",
          letterSpacing: "0.2em",
        }}
      >
        05 / 05
      </div>
      <Link
        href="/proof"
        className="fixed bottom-0 left-0 z-[9999] pb-7 pl-8 transition-opacity hover:opacity-80"
        style={{
          fontFamily: "Geist, system-ui, sans-serif",
          fontSize: 14,
          color: CYAN,
        }}
      >
        ← Back
      </Link>
      <div
        className="min-h-screen text-zinc-900"
        style={{ backgroundColor: "#ffffff" }}
      >
      <div
        className="fixed inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      <nav className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0" style={{ backgroundColor: CYAN }} />
          <span className={`text-lg font-semibold tracking-tight text-zinc-900 ${spaceMono.className}`}>
            Solaura
          </span>
        </Link>
        <div className="flex items-center gap-2 border border-zinc-200 px-2.5 py-1">
          <span className="h-1.5 w-1.5 shrink-0" style={{ backgroundColor: CYAN }} />
          <span className="text-xs font-medium text-zinc-500">Device Status</span>
        </div>
      </nav>

      <main className="relative z-10">
        <section className="flex flex-col items-center px-6 pt-8 pb-6 text-center">
          <h1
            className={`text-2xl font-bold tracking-tight md:text-3xl ${spaceMono.className}`}
            style={{ color: "#171717" }}
          >
            Perceive
            <br />
            Beyond Sight.
          </h1>
          <p className={`mt-2 text-sm ${spaceMono.className}`} style={{ color: "#525252" }}>
            A new sense for navigating space.
            <br />
            LiDAR. Directional sound. Nothing else.
          </p>
        </section>

        <section className="flex justify-center px-6 pb-6">
          <Scene3D />
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            <Card
              label="Spatial Sensing"
              body="LiDAR maps the space in front of you in real time."
            />
            <Card
              label="Directional Audio"
              body="A beep tells you where. Closer means louder. That's it."
            />
            <Card
              label="No Dependencies"
              body="No cloud. No assistant. Works in airplane mode."
            />
          </div>
        </section>

        <section
          className="border-t border-zinc-200 px-6 py-20"
          style={{ backgroundColor: "#fafafa" }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className={`text-3xl font-bold tracking-tight md:text-4xl ${spaceMono.className}`}
              style={{ color: "#171717" }}
            >
              Ready to perceive beyond sight?
            </h2>
            <Link
              href="/dashboard"
              className="mt-8 inline-block border px-8 py-4 text-base font-medium transition-colors"
              style={{
                borderColor: CYAN,
                color: CYAN,
                borderRadius: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(0,229,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Launch Dashboard
            </Link>
            <p className="mt-6 text-xs text-zinc-500">
              Core spatial sensing confirmed. Running offline on existing hardware.
            </p>
          </div>
        </section>
      </main>
    </div>
    </>
  );
}

function Card({ label, body }: { label: string; body: string }) {
  return (
    <div
      className="border p-6"
      style={{
        borderColor: "#e5e5e5",
        backgroundColor: "transparent",
        borderRadius: 0,
      }}
    >
      <h3
        className={`text-xs font-medium uppercase tracking-wider ${spaceMono.className}`}
        style={{ color: CYAN }}
      >
        {label}
      </h3>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: MUTED }}>
        {body}
      </p>
    </div>
  );
}

// ─── 3D Scene + Spatial Audio ───────────────────────────────────────────────

type HudState = "IDLE" | "SCANNING" | "LOCKED" | "ARRIVED";

function Scene3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const mouseInRef = useRef(false);
  const [hud, setHud] = useState<{
    distance: number | null;
    direction: string;
    state: HudState;
  }>({ distance: null, direction: "", state: "IDLE" });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const el = container;

    let width = Math.min(860, el.clientWidth);
    const height = 480;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x070d1a, 1);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8, 14);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070d1a);

    const gridHelper = new THREE.GridHelper(20, 20, 0x1a2a3a, 0x1a2a3a);
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(20, 20);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x070d1a,
      visible: false,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    scene.add(floorMesh);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0x00e5ff, 0.8);
    dirLight.position.set(-5, 12, 5);
    scene.add(dirLight);

    let spherePositionIndex = 0;
    const spherePos = new THREE.Vector3(
      SPHERE_POSITIONS[0][0],
      SPHERE_POSITIONS[0][1],
      SPHERE_POSITIONS[0][2]
    );

    const sphereGeo = new THREE.SphereGeometry(0.4, 16, 16);
    const sphereMat = new THREE.MeshLambertMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.6,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMesh.position.copy(spherePos);
    scene.add(sphereMesh);

    const pointLight = new THREE.PointLight(0x00e5ff, 1, 3);
    pointLight.position.copy(spherePos);
    scene.add(pointLight);

    const cursorRingGeo = new THREE.RingGeometry(0.15, 0.2, 16);
    const cursorRingMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const cursorRing = new THREE.Mesh(cursorRingGeo, cursorRingMat);
    cursorRing.rotation.x = -Math.PI / 2;
    cursorRing.visible = false;
    scene.add(cursorRing);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let audioContext: AudioContext | null = null;
    let gainNode: GainNode | null = null;
    let pannerNode: StereoPannerNode | null = null;
    let oscillator: OscillatorNode | null = null;
    let beepTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let currentInterval = 900;
    let currentGain = 0.25;
    let arrivedAt: number | null = null;
    let sphereFlashStart: number | null = null;

    function initAudio() {
      if (audioContext) return;
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      oscillator = audioContext.createOscillator();
      gainNode = audioContext.createGain();
      pannerNode = audioContext.createStereoPanner();
      oscillator.connect(gainNode!);
      gainNode!.connect(pannerNode!);
      pannerNode!.connect(audioContext.destination);
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gainNode!.gain.value = 0;
      oscillator.start(0);
    }

    function cancelBeep() {
      if (beepTimeoutId !== null) {
        clearTimeout(beepTimeoutId);
        beepTimeoutId = null;
      }
      if (gainNode && audioContext) {
        gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.01);
      }
    }

    function scheduleBeep() {
      if (!audioContext || !gainNode || !mouseInRef.current || arrivedAt !== null) return;
      const now = audioContext.currentTime;
      gainNode.gain.setTargetAtTime(currentGain, now, 0.004);
      gainNode.gain.setTargetAtTime(0, now + 0.06, 0.004);
      beepTimeoutId = setTimeout(scheduleBeep, currentInterval);
    }

    function getDirection(dxObjToCursor: number, dzObjToCursor: number, distance: number): string {
      if (distance < 0.4) return "● HERE";
      if (Math.abs(dzObjToCursor) >= Math.abs(dxObjToCursor)) {
        return dzObjToCursor < 0 ? "↑ AHEAD" : "↓ BEHIND";
      }
      return dxObjToCursor < 0 ? "← LEFT" : "→ RIGHT";
    }

    function resize() {
      width = Math.min(860, el.clientWidth);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(el);

    function onMouseMove(e: MouseEvent) {
      const rect = el.getBoundingClientRect();
      mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      mouseInRef.current = true;
      if (!audioContext) initAudio();
    }

    function onMouseLeave() {
      mousePosRef.current = null;
      mouseInRef.current = false;
      cancelBeep();
      setHud({ distance: null, direction: "", state: "IDLE" });
    }

    function onMouseEnter() {
      mouseInRef.current = true;
      if (audioContext && gainNode && arrivedAt === null && mousePosRef.current) {
        scheduleBeep();
      }
    }

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("mouseenter", onMouseEnter);
    el.style.cursor = "crosshair";

    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);

      sphereMesh.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.08);

      if (sphereFlashStart !== null) {
        const elapsed = Date.now() - sphereFlashStart;
        if (elapsed < 500) {
          sphereMat.emissiveIntensity = 0.6 + (2 - 0.6) * (1 - elapsed / 500);
        } else {
          sphereMat.emissiveIntensity = 0.6;
          sphereFlashStart = null;
        }
      }

      if (arrivedAt !== null) {
        const elapsed = Date.now() - arrivedAt;
        if (elapsed >= 1200) {
          arrivedAt = null;
          spherePositionIndex = (spherePositionIndex + 1) % SPHERE_POSITIONS.length;
          const p = SPHERE_POSITIONS[spherePositionIndex];
          spherePos.set(p[0], p[1], p[2]);
          sphereMesh.position.copy(spherePos);
          pointLight.position.copy(spherePos);
          if (mouseInRef.current && mousePosRef.current) scheduleBeep();
        }
      }

      const mp = mousePosRef.current;
      if (mp && raycaster && camera) {
        mouse.x = (mp.x / width) * 2 - 1;
        mouse.y = -(mp.y / height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(floorMesh);
        if (hits.length > 0) {
          const pt = hits[0].point;
          cursorRing.position.copy(pt);
          cursorRing.visible = true;

          const dx = pt.x - spherePos.x;
          const dz = pt.z - spherePos.z;
          const distance = Math.sqrt(dx * dx + dz * dz);

          const dxObjToCursor = spherePos.x - pt.x;
          const dzObjToCursor = spherePos.z - pt.z;

          currentInterval = beepIntervalFromDistance(distance);
          currentGain = gainFromDistance(distance);
          if (pannerNode && audioContext) {
            const pan = Math.max(-1, Math.min(1, -dx / 3));
            pannerNode.pan.setTargetAtTime(pan, audioContext.currentTime, 0.06);
          }

          let state: HudState = "SCANNING";
          if (arrivedAt !== null && Date.now() - arrivedAt < 1200) {
            state = "ARRIVED";
          } else if (distance < 0.4) {
            state = "ARRIVED";
            if (arrivedAt === null) {
              arrivedAt = Date.now();
              sphereFlashStart = Date.now();
              cancelBeep();
            }
          } else if (distance < 1.5) {
            state = "LOCKED";
            if (beepTimeoutId === null && mouseInRef.current) scheduleBeep();
          } else {
            if (beepTimeoutId === null && mouseInRef.current) scheduleBeep();
          }

          setHud({
            distance,
            direction: getDirection(dxObjToCursor, dzObjToCursor, distance),
            state,
          });
        } else {
          cursorRing.visible = false;
        }
      } else {
        cursorRing.visible = false;
      }

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("mouseenter", onMouseEnter);
      cancelBeep();
      if (audioContext) audioContext.close();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[860px] overflow-hidden border"
      style={{
        borderColor: "rgba(0, 229, 255, 0.12)",
        height: 480,
        borderRadius: 0,
      }}
    >
      <canvas ref={canvasRef} className="block w-full" style={{ width: "100%", height: 480 }} />
      {/* HUD overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex justify-between items-start">
          <div className="text-xs" style={{ color: MUTED, fontFamily: "Geist, system-ui, sans-serif" }}>
            <div className="flex gap-4">
              <span>DISTANCE</span>
              <span style={{ color: CYAN }}>
                {hud.distance != null ? `${hud.distance.toFixed(1)}m` : "—"}
              </span>
            </div>
            <div className="mt-1 flex gap-4">
              <span>DIRECTION</span>
              <span style={{ color: CYAN }}>{hud.direction || "—"}</span>
            </div>
            <div className="mt-1 flex gap-4">
              <span>STATE</span>
              <span style={{ color: CYAN }}>
                {hud.state === "ARRIVED" ? "ARRIVED ●" : hud.state}
              </span>
            </div>
          </div>
          <p
            className="text-[11px]"
            style={{ color: MUTED, fontFamily: "Space Mono, monospace" }}
          >
            Use headphones for full spatial audio
          </p>
        </div>
        <div
          className="flex justify-center gap-4 text-xs"
          style={{ color: CYAN, fontFamily: "Space Mono, monospace" }}
        >
          <span>● On-device</span>
          <span>● Low-latency</span>
          <span>● Offline</span>
        </div>
      </div>
    </div>
  );
}
