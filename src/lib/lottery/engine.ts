import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { HudCopy } from "@/lib/i18n";
import { DrawRecorder } from "@/lib/lottery/recorder";

export type Phase = "idle" | "mixing" | "opening" | "extracting" | "presenting" | "finale" | "done";
export type RecordState = "idle" | "recording" | "saved" | "unsupported" | "error";

export type EngineHooks = {
  onDrawn: (names: string[], numbers: number[]) => void;
  onPhase: (phase: Phase) => void;
  onRecord: (state: RecordState) => void;
  onFile: (blob: Blob) => void;
  onWebgl: (ok: boolean) => void;
};

export type PhysicsSettings = {
  gravity: number;
  agitation: number;
  bounce: number;
  drag: number;
};

type Ball = {
  name: string;
  listNo: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  radius: number;
  group: THREE.Group;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  texture: THREE.CanvasTexture;
  inDrum: boolean;
  docked: boolean;
};

type Bit = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  life: number;
  max: number;
};

const IVORY = "#f4ecdc";
const INK = "#1c1915";
const BRASS = "#c6a15a";
const SEAL = "#9c2f2c";
const CONFETTI = [BRASS, IVORY, SEAL, "#e7d7b0"];

const SPHERE_R = 1.42;
const CENTER = new THREE.Vector3(0, 0.42, 0);
const TRAY_Y = -1.745;
const TRAY_Z = 2.55;
const COLLAR_TOP = -0.92;
const CAMERA_ZOOM = 2.4;
const CAMERA_DROP = 1;

type Rod = { angle: number; y: number; inner: number; outer: number; radius: number };

const AXLE_HALF = (SPHERE_R * 1.85) / 2;

function fitSizes(count: number, ballUser: number, machineUser: number) {
  const n = Math.max(1, count);
  const baseBall = 0.16;
  const autoSphere = Math.max(SPHERE_R, baseBall * Math.cbrt(n / 0.24));
  const sphere = autoSphere * machineUser;
  const wanted = Math.min(0.36, Math.max(0.05, baseBall * ballUser));
  const maxBall = sphere * Math.cbrt(0.4 / n);
  return { sphereR: sphere, ballRadius: Math.min(wanted, Math.max(0.04, maxBall)) };
}

function smooth(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function randomInSphere(rand: () => number, radius: number, target: THREE.Vector3) {
  const u = rand();
  const v = rand();
  const theta = Math.PI * 2 * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(rand());
  target.set(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [text];
  const lines: string[] = [];
  let cur = words[0]!;
  for (let i = 1; i < words.length; i++) {
    const next = `${cur} ${words[i]}`;
    if (ctx.measureText(next).width <= maxWidth) cur = next;
    else {
      lines.push(cur);
      cur = words[i]!;
    }
  }
  lines.push(cur);
  return lines;
}

function makeLabel(listNo: number, name: string, width: number) {
  const height = Math.max(2, Math.round(width / 2));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d");
  ctx.fillStyle = "#f4ecdc";
  ctx.fillRect(0, 0, width, height);
  const shade = ctx.createLinearGradient(0, 0, 0, height);
  shade.addColorStop(0, "rgba(78, 58, 32, 0.34)");
  shade.addColorStop(0.22, "rgba(244, 236, 220, 0)");
  shade.addColorStop(0.78, "rgba(244, 236, 220, 0)");
  shade.addColorStop(1, "rgba(62, 46, 28, 0.4)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);
  const band = height * 0.5;
  paintInscription(ctx, listNo, name, width * 0.25, height * 0.5, width * 0.4, band);
  paintInscription(ctx, listNo, name, width * 0.75, height * 0.5, width * 0.4, band);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = width >= 512 ? 8 : 2;
  texture.needsUpdate = true;
  return texture;
}

function paintInscription(
  ctx: CanvasRenderingContext2D,
  listNo: number,
  name: string,
  cx: number,
  cy: number,
  maxWidth: number,
  band: number,
) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let nameSize = Math.round(band * 0.28);
  let lines = [name];
  const minSize = Math.max(12, Math.round(band * 0.12));
  for (; nameSize >= minSize; nameSize -= 2) {
    ctx.font = `700 ${nameSize}px Manrope, "Noto Sans", sans-serif`;
    lines = wrapLines(ctx, name, maxWidth);
    const tooWide = lines.some((line) => ctx.measureText(line).width > maxWidth);
    if (!tooWide && lines.length <= 2) break;
  }
  const numSize = Math.round(Math.max(nameSize * 1.15, band * 0.34));
  const nameLH = nameSize * 1.12;
  const gap = Math.max(4, nameSize * 0.2);
  const nameBlock = lines.length * nameLH;
  const total = numSize + gap + nameBlock;
  const top = cy - total / 2;
  ctx.font = `700 ${numSize}px Manrope, "Noto Sans", sans-serif`;
  ctx.fillStyle = SEAL;
  ctx.fillText(`${listNo}.`, cx, top + numSize / 2);
  ctx.font = `700 ${nameSize}px Manrope, "Noto Sans", sans-serif`;
  ctx.fillStyle = INK;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i]!, cx, top + numSize + gap + nameLH * i + nameLH / 2);
  }
}

export class LotteryEngine {
  private hooks: EngineHooks;
  private host: HTMLElement;
  private gl: HTMLCanvasElement;
  private hudCanvas: HTMLCanvasElement;
  private hud: CanvasRenderingContext2D;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 2400);
  private rig = new THREE.Group();
  private shell = new THREE.Group();
  private paddles = new THREE.Group();
  private rodsGroup = new THREE.Group();
  private rods: Rod[] = [];
  private rodSteel: THREE.MeshStandardMaterial | null = null;
  private rodBrass: THREE.MeshStandardMaterial | null = null;
  private windGuide = new THREE.Group();
  private windColumn: THREE.Mesh | null = null;
  private windRing: THREE.Mesh | null = null;
  private windStreaks = new THREE.Group();
  private streaks: { mesh: THREE.Mesh; phase: number; turn: number }[] = [];
  private sky: THREE.Mesh | null = null;
  private skyMap: THREE.Texture | null = null;
  private ballsGroup = new THREE.Group();
  private halo: THREE.Mesh;
  private plaqueMap: THREE.CanvasTexture | null = null;
  private plaque: THREE.Mesh | null = null;
  private ballGeo = new THREE.SphereGeometry(1, 64, 48);
  private cage = new THREE.Group();
  private chute = new THREE.Group();
  private hinge = new THREE.Group();
  private holeAxis = new THREE.Vector3(0, -0.62, 0.784).normalize();
  private holeRadius = 0.22;
  private gate = 0;
  private chosen: Ball | null = null;
  private escaped = false;
  private racing = true;
  private balls: Ball[] = [];
  private names: string[] = [];
  private namesKey = "";
  private drawCount = 1;
  private speed = 1;
  private mixSeconds = 6;
  private gravity = 18;
  private agitation = 1;
  private bounce = 0.74;
  private drag = 0.5;
  private rodsOn = true;
  private rodSpeed = 1;
  private rodCount = 2;
  private windOn = true;
  private wind = 3;
  private windWidth = 0.33;
  private windHeight = 0.85;
  private windPreview = false;
  private suction = 1;
  private volume = 0;
  private windClock = 0;
  private paddleOmega = 0;
  private hudText: HudCopy = {
    kicker: "ИЗВУЧЕНО",
    resultTitle: "Извучена имена",
    of: "од",
  };
  private phase: Phase = "idle";
  private phaseT = 0;
  private plan: string[] = [];
  private planIndex = 0;
  private drawn: string[] = [];
  private drawnNos: number[] = [];
  private completedPlan: string[] | null = null;
  private completedKey = "";
  private focus: Ball | null = null;
  private focusFrom = new THREE.Vector3();
  private mouth = new THREE.Vector3();
  private hero = new THREE.Vector3(0, 1.22, 2.45);
  private paddleAngle = 0;
  private acc = 0;
  private ballRadius = 0.16;
  private sphereR = SPHERE_R;
  private ballUser = 1;
  private machineUser = 1;
  private ballSeg = 0;
  private bits: Bit[] = [];
  private recorder = new DrawRecorder();
  private recording = false;
  private recW = 1280;
  private recH = 720;
  private viewW = 2;
  private viewH = 2;
  private bufW = 0;
  private bufH = 0;
  private rafId = 0;
  private last = 0;
  private framing = false;
  private disposed = false;
  private reduced = false;
  private audio: AudioContext | null = null;
  private noiseBuf: AudioBuffer | null = null;
  private hitQueued = 0;
  private hitWait = 0;
  private azimuth = 0;
  private polar = 1.32 + (15 * Math.PI) / 180;
  private zoom = CAMERA_ZOOM;
  private pan = new THREE.Vector3();
  private dragMode: "orbit" | "pan" | "pinch" | null = null;
  private pointers = new Map<number, { x: number; y: number }>();
  private pinchDist = 0;
  private lastX = 0;
  private lastY = 0;
  private centerW = new THREE.Vector3();
  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();
  private dockTmp = new THREE.Vector3();
  private axis = new THREE.Vector3();
  private q = new THREE.Quaternion();
  private upright = new THREE.Quaternion();
  private observer: ResizeObserver;
  private onPointerDown: (e: PointerEvent) => void;
  private onPointerMove: (e: PointerEvent) => void;
  private onPointerUp: (e: PointerEvent) => void;
  private onWheel: (e: WheelEvent) => void;
  private onContext: (e: Event) => void;
  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;
  private keys = new Set<string>();

  constructor(host: HTMLElement, hooks: EngineHooks) {
    this.host = host;
    this.hooks = hooks;
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.gl = document.createElement("canvas");
    this.hudCanvas = document.createElement("canvas");
    const hud = this.hudCanvas.getContext("2d");
    if (!hud) throw new Error("2d");
    this.hud = hud;
    for (const canvas of [this.gl, this.hudCanvas]) {
      canvas.style.position = "absolute";
      canvas.style.inset = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
    }
    this.gl.style.touchAction = "none";
    this.gl.style.cursor = "grab";
    this.hudCanvas.style.pointerEvents = "none";
    host.append(this.gl, this.hudCanvas);

    this.mouth.copy(CENTER).addScaledVector(this.holeAxis, SPHERE_R);

    const haloGeo = new THREE.TorusGeometry(0.34, 0.012, 8, 48);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xc6a15a,
      metalness: 0.9,
      roughness: 0.3,
    });
    this.halo = new THREE.Mesh(haloGeo, haloMat);
    this.halo.rotation.x = Math.PI / 2;
    this.halo.visible = false;

    this.observer = new ResizeObserver(() => this.readView());
    this.observer.observe(host);
    this.onPointerDown = (e: PointerEvent) => {
      if (this.recording) return;
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.gl.style.cursor = "grabbing";
      try {
        this.gl.setPointerCapture(e.pointerId);
      } catch {
        /* capture is optional */
      }
      this.unlock();
      if (this.pointers.size >= 2) {
        this.dragMode = "pinch";
        this.pinchDist = this.pointerSpan();
        return;
      }
      if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
      this.dragMode = e.button === 0 && !e.shiftKey ? "orbit" : "pan";
    };
    this.onPointerMove = (e: PointerEvent) => {
      const point = this.pointers.get(e.pointerId);
      if (point) {
        point.x = e.clientX;
        point.y = e.clientY;
      }
      if (this.pointers.size >= 2) {
        const dist = this.pointerSpan();
        if (this.pinchDist > 8 && dist > 8) {
          this.zoom = Math.min(4.5, Math.max(0.28, this.zoom * (this.pinchDist / dist)));
        }
        this.pinchDist = dist;
        this.dragMode = "pinch";
        return;
      }
      if (!this.dragMode || this.dragMode === "pinch" || this.recording) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      if (this.dragMode === "orbit") {
        this.azimuth -= dx * 0.005;
        this.polar = Math.min(Math.PI - 0.08, Math.max(0.08, this.polar - dy * 0.005));
        return;
      }
      const dist = 5.7 * this.span() * this.zoom;
      const k = dist * 0.00115;
      const az = this.azimuth;
      const rightX = Math.cos(az);
      const rightZ = -Math.sin(az);
      const upX = -Math.cos(this.polar) * Math.sin(az);
      const upY = Math.sin(this.polar);
      const upZ = -Math.cos(this.polar) * Math.cos(az);
      this.pan.x += (-dx * rightX + dy * upX) * k;
      this.pan.y += dy * upY * k;
      this.pan.z += (-dx * rightZ + dy * upZ) * k;
    };
    this.onPointerUp = (e: PointerEvent) => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size >= 2) {
        this.pinchDist = this.pointerSpan();
        return;
      }
      if (this.pointers.size === 1) {
        const [left] = this.pointers.values();
        this.dragMode = "orbit";
        this.lastX = left.x;
        this.lastY = left.y;
        this.pinchDist = 0;
        return;
      }
      this.dragMode = null;
      this.pinchDist = 0;
      this.gl.style.cursor = "grab";
    };
    this.onWheel = (e: WheelEvent) => {
      if (this.recording) return;
      e.preventDefault();
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16;
      else if (e.deltaMode === 2) dy *= 40;
      this.zoom = Math.min(4.5, Math.max(0.28, this.zoom * Math.exp(dy * 0.00115)));
    };
    this.onContext = (e: Event) => e.preventDefault();
    this.onKeyDown = (e: KeyboardEvent) => {
      if (this.recording) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement | null)?.isContentEditable) return;
      const key = e.key.toLowerCase();
      if (key !== "w" && key !== "a" && key !== "s" && key !== "d") return;
      this.keys.add(key);
      e.preventDefault();
    };
    this.onKeyUp = (e: KeyboardEvent) => {
      this.keys.delete(e.key.toLowerCase());
    };
    this.gl.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
    this.gl.addEventListener("wheel", this.onWheel, { passive: false });
    this.gl.addEventListener("contextmenu", this.onContext);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    this.buildScene();
    void document.fonts.ready.then(async () => {
      if (this.disposed) return;
      await document.fonts.load('600 64px "Cormorant Garamond"');
      await document.fonts.load("600 32px Manrope");
      if (this.disposed) return;
      this.relabel();
    });
  }

  private buildScene() {
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: this.gl,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      this.hooks.onWebgl(false);
      return;
    }
    if (!renderer.getContext()) {
      this.hooks.onWebgl(false);
      return;
    }
    this.renderer = renderer;
    renderer.setClearColor(0x07080c, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene.background = new THREE.Color(0x07080c);
    this.buildSky();
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      /* reflections are optional */
    }

    this.scene.add(new THREE.HemisphereLight(0xf4ecdf, 0x2a211b, 0.55));
    const key = new THREE.DirectionalLight(0xfff4e4, 2.35);
    key.position.set(4.6, 7.4, 3.2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.00035;
    key.shadow.normalBias = 0.028;
    key.shadow.camera.near = 0.4;
    key.shadow.camera.far = 26;
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 6;
    key.shadow.camera.bottom = -6;
    key.target.position.set(0, 0.15, 0);
    this.scene.add(key, key.target);
    const fill = new THREE.DirectionalLight(0xc5d4e4, 0.55);
    fill.position.set(-4.2, 2.4, 3.6);
    this.scene.add(fill);
    const rim = new THREE.DirectionalLight(0xe7c98a, 0.7);
    rim.position.set(-2.2, 3.2, -4.4);
    this.scene.add(rim);

    const brass = new THREE.MeshStandardMaterial({
      color: 0xc6a15a,
      metalness: 0.94,
      roughness: 0.28,
      shadowSide: THREE.DoubleSide,
    });
    const wood = new THREE.MeshStandardMaterial({
      color: 0x4a3424,
      roughness: 0.78,
      metalness: 0.05,
    });
    const steel = new THREE.MeshStandardMaterial({
      color: 0x8a847c,
      metalness: 0.82,
      roughness: 0.34,
    });
    this.rodSteel = steel;
    this.rodBrass = brass;
    const glass = new THREE.MeshStandardMaterial({
      color: 0xd5e6ee,
      transparent: true,
      opacity: 0.1,
      roughness: 0.04,
      metalness: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.scene.add(this.rig);
    this.rig.add(this.shell);
    this.rig.add(this.ballsGroup);
    this.rig.add(this.halo);
    this.shell.add(this.paddles);
    this.shell.add(this.cage);
    this.shell.add(this.chute);

    const globe = new THREE.Mesh(new THREE.SphereGeometry(SPHERE_R, 64, 48), glass);
    globe.position.copy(CENTER);
    globe.renderOrder = 2;
    this.shell.add(globe);

    const eq = new THREE.Mesh(new THREE.TorusGeometry(SPHERE_R + 0.02, 0.018, 12, 80), brass);
    eq.rotation.x = Math.PI / 2;
    eq.position.copy(CENTER);
    eq.castShadow = true;
    eq.receiveShadow = true;
    this.cage.add(eq);
    for (const y of [-0.55, 0.55]) {
      const lat = Math.sqrt(Math.max(0.05, SPHERE_R * SPHERE_R - y * y));
      const tropic = new THREE.Mesh(new THREE.TorusGeometry(lat, 0.012, 8, 64), brass);
      tropic.rotation.x = Math.PI / 2;
      tropic.position.set(CENTER.x, CENTER.y + y, CENTER.z);
      tropic.castShadow = true;
      tropic.receiveShadow = true;
      this.cage.add(tropic);
    }
    for (let i = 0; i < 6; i++) {
      const mer = new THREE.Mesh(new THREE.TorusGeometry(SPHERE_R + 0.012, 0.011, 8, 72), brass);
      mer.position.copy(CENTER);
      mer.rotation.y = (i * Math.PI) / 6;
      mer.castShadow = true;
      mer.receiveShadow = true;
      this.cage.add(mer);
    }

    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, SPHERE_R * 1.85, 12), steel);
    axle.castShadow = true;
    this.paddles.add(axle);
    this.paddles.add(this.rodsGroup);
    this.layoutRods(this.rodCount);
    this.paddles.position.copy(CENTER);

    const capGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.08, 20);
    const topCap = new THREE.Mesh(capGeo, brass);
    topCap.position.set(0, CENTER.y + SPHERE_R + 0.04, 0);
    const botCap = new THREE.Mesh(capGeo, brass);
    botCap.position.set(0, CENTER.y - SPHERE_R - 0.02, 0);
    this.shell.add(topCap, botCap);

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.78, 0.28, 40, 1, true), brass);
    collar.position.y = -1.06;
    collar.castShadow = true;
    collar.receiveShadow = true;
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.16, 0.48, 48), wood);
    plinth.position.y = -1.38;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.28, 0.1, 48), brass);
    foot.position.y = -1.66;
    foot.castShadow = true;
    foot.receiveShadow = true;
    this.shell.add(collar, plinth, foot);

    const pad = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.07, 1.85), wood);
    pad.position.set(0, TRAY_Y, TRAY_Z);
    pad.castShadow = true;
    pad.receiveShadow = true;
    const padRim = new THREE.Mesh(new THREE.BoxGeometry(4.36, 0.04, 2.0), brass);
    padRim.position.set(0, TRAY_Y - 0.025, TRAY_Z);
    padRim.receiveShadow = true;
    this.shell.add(pad, padRim);

    const dark = new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: 0.9, metalness: 0.1 });
    const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.028, 12, 36), brass);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.12, 24, 1, true), brass);
    tube.rotation.x = Math.PI / 2;
    tube.position.z = 0.07;
    const throat = new THREE.Mesh(new THREE.CircleGeometry(0.19, 28), dark);
    throat.position.z = -0.015;
    this.hinge.position.y = 0.2;
    const door = new THREE.Mesh(new THREE.CylinderGeometry(0.198, 0.198, 0.034, 28), brass);
    door.rotation.x = Math.PI / 2;
    door.position.set(0, -0.2, 0.055);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), brass);
    knob.position.set(0, -0.2, 0.05);
    this.hinge.add(door, knob);
    this.chute.add(bezel, tube, throat, this.hinge);
    this.layoutAperture();

    this.plaqueMap = this.makePlaque();
    this.plaque = new THREE.Mesh(
      new THREE.CylinderGeometry(1.08, 1.16, 0.3, 48, 1, true, -0.78, 1.56),
      new THREE.MeshBasicMaterial({ map: this.plaqueMap }),
    );
    this.plaque.position.y = -1.38;
    this.shell.add(this.plaque);
    this.buildGrate(brass, dark);

    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 1, 40, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xb7e4f2,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.018, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0xc6a15a, transparent: true, opacity: 0.95, depthWrite: false }),
    );
    ring.rotation.x = Math.PI / 2;
    this.windColumn = column;
    this.windRing = ring;
    this.windGuide.add(column, ring);
    this.windGuide.position.copy(CENTER);
    this.windGuide.visible = false;
    this.shell.add(this.windGuide);
    this.shell.add(this.windStreaks);
    this.updateWindGuide();

    this.camera.position.set(0.28, 1.18, 5.65);
    this.hooks.onWebgl(true);
  }

  private makePlaque() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 220;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d");
    ctx.fillStyle = BRASS;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 10;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
    ctx.fillStyle = INK;
    ctx.font = '600 92px "Cormorant Garamond", serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("САВЕТОДАВНО ТЕЛО", canvas.width / 2, canvas.height / 2 + 4);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  private relabel() {
    if (this.plaqueMap && this.plaque) {
      const next = this.makePlaque();
      this.plaqueMap.dispose();
      this.plaqueMap = next;
      const mat = this.plaque.material as THREE.MeshBasicMaterial;
      mat.map = next;
      mat.needsUpdate = true;
    }
    const size = labelWidth(this.balls.length);
    for (const ball of this.balls) {
      ball.texture.dispose();
      ball.texture = makeLabel(ball.listNo, ball.name, size);
      ball.material.map = ball.texture;
      ball.material.needsUpdate = true;
    }
  }

  private layoutAperture() {
    const s = Math.max(0.001, this.span());
    this.holeRadius = Math.min(0.36 * s, Math.max(0.1 * s, this.ballRadius * 1.34));
    this.mouth.copy(CENTER).addScaledVector(this.holeAxis, SPHERE_R - 0.012);
    this.chute.position.copy(this.mouth);
    const z = this.holeAxis;
    const worldUp = this.tmp.set(0, 1, 0);
    const x = this.tmp2.crossVectors(worldUp, z);
    if (x.lengthSq() < 1e-6) x.set(1, 0, 0);
    x.normalize();
    const y = this.axis.crossVectors(z, x).normalize();
    const basis = new THREE.Matrix4().makeBasis(x, y, z);
    this.chute.quaternion.setFromRotationMatrix(basis);
    this.chute.scale.setScalar(this.holeRadius / s / 0.2);
    this.hinge.rotation.x = -2.15 * this.gate;
    this.mouth.copy(CENTER).multiplyScalar(s).addScaledVector(this.holeAxis, this.sphereR - 0.012 * s);
  }

  private span() {
    return this.sphereR / SPHERE_R;
  }

  private applyFit() {
    const n = this.names.length;
    if (n === 0) {
      this.sphereR = SPHERE_R * this.machineUser;
      this.ballRadius = 0.16 * this.ballUser;
    } else {
      const fit = fitSizes(n, this.ballUser, this.machineUser);
      this.sphereR = fit.sphereR;
      this.ballRadius = fit.ballRadius;
    }
    this.shell.scale.setScalar(this.span());
    this.halo.scale.setScalar(Math.max(this.span(), this.ballRadius / 0.16));
    this.hero.set(0, 1.22, 2.45).multiplyScalar(this.span());
    this.layoutAperture();
  }

  private ensureGeo(n: number) {
    const seg = n > 240 ? 12 : n > 100 ? 18 : n > 40 ? 28 : 48;
    if (this.ballSeg === seg) return;
    const height = n > 100 ? Math.max(8, Math.round(seg * 0.62)) : Math.round(seg * 0.72);
    this.ballGeo.dispose();
    this.ballGeo = new THREE.SphereGeometry(1, seg, height);
    this.ballSeg = seg;
  }

  setHooks(hooks: EngineHooks) {
    this.hooks = hooks;
  }

  setHud(copy: HudCopy) {
    this.hudText = copy;
  }

  setSpeed(speed: number) {
    this.speed = Math.min(4, Math.max(0.5, speed));
  }

  setMixSeconds(seconds: number) {
    this.mixSeconds = Math.min(60, Math.max(2, seconds));
  }

  setPhysics(settings: PhysicsSettings) {
    this.gravity = Math.min(36, Math.max(0, settings.gravity));
    this.agitation = Math.min(2.5, Math.max(0, settings.agitation));
    this.bounce = Math.min(0.95, Math.max(0, settings.bounce));
    this.drag = Math.min(2.4, Math.max(0, settings.drag));
  }

  setRods(on: boolean) {
    this.rodsOn = on;
    this.rodsGroup.visible = on;
  }

  setRodSpeed(value: number) {
    this.rodSpeed = Math.min(3, Math.max(0, value));
  }

  setRodCount(count: number) {
    const next = Math.min(12, Math.max(1, Math.round(count)));
    if (next === this.rodCount && this.rods.length === next) return;
    this.layoutRods(next);
  }

  setWindWidth(value: number) {
    this.windWidth = Math.min(1, Math.max(0.2, value));
    this.updateWindGuide();
  }

  setWindHeight(value: number) {
    this.windHeight = Math.min(1, Math.max(0.15, value));
    this.updateWindGuide();
  }

  setWindPreview(on: boolean) {
    this.windPreview = on;
  }

  private buildGrate(brass: THREE.Material, dark: THREE.Material) {
    const y = COLLAR_TOP;
    const radius = 0.56;
    const grate = new THREE.Group();
    const mouth = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.9, 40), dark);
    mouth.rotation.x = -Math.PI / 2;
    mouth.position.y = y - 0.02;
    grate.add(mouth);
    for (const ringR of [0.16, 0.32, 0.46, radius]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(ringR, 0.02, 8, 36), brass);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = y;
      ring.castShadow = true;
      ring.receiveShadow = true;
      grate.add(ring);
    }
    for (let i = 0; i < 8; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(radius * 1.92, 0.022, 0.032), brass);
      slat.position.y = y + 0.012;
      slat.rotation.y = (i * Math.PI) / 8;
      slat.castShadow = true;
      slat.receiveShadow = true;
      grate.add(slat);
    }
    this.shell.add(grate);

    const streakGeo = new THREE.BoxGeometry(0.018, 0.2, 0.018);
    for (let i = 0; i < 10; i++) {
      const mesh = new THREE.Mesh(
        streakGeo,
        new THREE.MeshBasicMaterial({
          color: 0xe7f4f8,
          transparent: true,
          opacity: 0.16,
          depthWrite: false,
        }),
      );
      this.windStreaks.add(mesh);
      this.streaks.push({ mesh, phase: i / 10, turn: (i / 10) * Math.PI * 2 });
    }
    this.windStreaks.visible = this.windOn;
  }

  private buildSky() {
    const geo = new THREE.SphereGeometry(1, 64, 40);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.BackSide,
      depthWrite: false,
      toneMapped: false,
    });
    const sky = new THREE.Mesh(geo, mat);
    sky.frustumCulled = false;
    sky.renderOrder = -2;
    sky.scale.setScalar(640);
    const deg = Math.PI / 180;
    sky.rotation.set(0.28 - 15 * deg, 1.22 + 20 * deg, 0);
    this.sky = sky;
    this.scene.add(sky);
    const loader = new THREE.TextureLoader();
    loader.load("/textures/8k_stars_milky_way.jpg", (tex) => {
      if (this.disposed) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.anisotropy = this.renderer?.capabilities.getMaxAnisotropy() ?? 8;
      mat.map = tex;
      mat.color.setRGB(4.2, 4.35, 5.1);
      mat.needsUpdate = true;
      this.skyMap = tex;
    });
  }

  private blowStreaks(dt: number) {
    const on = this.windOn && this.wind > 0.02;
    this.windStreaks.visible = on;
    if (!on) return;
    const rise = 0.28 + this.wind * 0.11;
    const floorY = COLLAR_TOP + 0.04;
    const travel = Math.max(0.25, this.windReachLocal() - floorY);
    for (const streak of this.streaks) {
      streak.phase = (streak.phase + dt * rise) % 1;
      const y = floorY + streak.phase * travel;
      const disk = this.windWidth * 0.5;
      const wobble = 0.45 + 0.55 * Math.sin(streak.turn * 2);
      const radius = disk * wobble;
      const angle = streak.turn + this.windClock * 0.2;
      streak.mesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      const mat = streak.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + Math.sin(streak.phase * Math.PI) * 0.14;
    }
  }

  private layoutRods(count: number) {
    const n = Math.min(12, Math.max(1, Math.round(count)));
    this.rodCount = n;
    const steel = this.rodSteel;
    const brass = this.rodBrass;
    if (!steel || !brass) return;
    for (const child of [...this.rodsGroup.children]) {
      child.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
      });
      this.rodsGroup.remove(child);
    }
    const span = AXLE_HALF * 2;
    const rods: Rod[] = [];
    for (let i = 0; i < n; i++) {
      const y = -AXLE_HALF + ((i + 1) / (n + 1)) * span;
      const radial = Math.sqrt(Math.max(0.2, SPHERE_R * SPHERE_R - y * y));
      const outer = Math.max(0.42, radial * 0.82);
      rods.push({ angle: (i * Math.PI * 2) / n, y, inner: 0, outer, radius: 0.034 });
    }
    this.rods = rods;
    for (const rod of rods) {
      const pivot = new THREE.Group();
      pivot.rotation.y = rod.angle;
      const length = rod.outer - rod.inner;
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(rod.radius, rod.radius * 0.82, length, 8), steel);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(rod.inner + length / 2, rod.y, 0);
      bar.castShadow = true;
      const tip = new THREE.Mesh(new THREE.SphereGeometry(rod.radius * 1.35, 8, 6), brass);
      tip.position.set(rod.outer, rod.y, 0);
      tip.castShadow = true;
      const hub = new THREE.Mesh(
        new THREE.TorusGeometry(0.058, Math.max(0.02, rod.radius * 0.95), 6, 12),
        brass,
      );
      hub.rotation.x = Math.PI / 2;
      hub.position.set(0, rod.y, 0);
      pivot.add(bar, tip, hub);
      this.rodsGroup.add(pivot);
    }
  }

  private windReachLocal() {
    const ny = -1 + this.windHeight * 2;
    return CENTER.y + ny * SPHERE_R;
  }

  private updateWindGuide() {
    const radius = Math.max(0.12, this.windWidth * 0.52);
    const height = Math.max(0.16, this.windReachLocal() - COLLAR_TOP);
    this.windColumn?.scale.set(radius, height, radius);
    if (this.windColumn) this.windColumn.position.y = height / 2;
    this.windRing?.scale.set(radius, radius, 1);
    if (this.windRing) this.windRing.position.y = height;
    this.windGuide.position.set(0, COLLAR_TOP, 0);
  }

  setSuction(value: number) {
    this.suction = Math.min(3, Math.max(0, value));
  }

  setVolume(value: number) {
    this.volume = Math.min(3, Math.max(0, value));
  }

  setWind(on: boolean, strength: number) {
    this.windOn = on;
    this.wind = Math.min(12, Math.max(0, strength));
  }

  setScale(ball: number, machine: number) {
    const nextBall = Math.min(2.4, Math.max(0.45, ball));
    const nextMachine = Math.min(2.4, Math.max(0.65, machine));
    if (nextBall === this.ballUser && nextMachine === this.machineUser) return;
    this.ballUser = nextBall;
    this.machineUser = nextMachine;
    if (this.recording) return;
    if (this.phase !== "idle" && this.phase !== "done") return;
    this.rebuildBalls();
    if (this.phase === "done") {
      this.drawn = [];
      this.drawnNos = [];
      this.completedPlan = null;
      this.completedKey = "";
      this.phase = "idle";
      this.hooks.onDrawn([], []);
      this.hooks.onPhase("idle");
    }
  }

  setDrawCount(count: number) {
    const next = Math.max(1, Math.floor(count));
    if (next === this.drawCount) return;
    this.drawCount = next;
    if (this.completedPlan && this.completedKey !== this.replayKey()) {
      this.completedPlan = null;
      this.completedKey = "";
    }
  }

  canReplay() {
    return !!this.completedPlan && this.completedKey === this.replayKey() && this.names.length > 0;
  }

  setNames(names: string[]) {
    const key = names.join("\n");
    if (key === this.namesKey) return;
    if (this.recording) return;
    if (this.phase !== "idle" && this.phase !== "done") return;
    this.names = names.slice();
    this.namesKey = key;
    this.completedPlan = null;
    this.completedKey = "";
    this.plan = [];
    this.drawn = [];
    this.drawnNos = [];
    this.focus = null;
    this.chosen = null;
    this.escaped = false;
    this.gate = 0;
    this.phase = "idle";
    this.bits = [];
    this.hooks.onDrawn([], []);
    this.hooks.onPhase("idle");
    this.rebuildBalls();
  }

  private replayKey() {
    const count = Math.min(this.drawCount, this.names.length);
    return `${this.namesKey}#${count}`;
  }

  private rebuildBalls() {
    for (const ball of this.balls) {
      ball.texture.dispose();
      ball.material.dispose();
      this.ballsGroup.remove(ball.group);
    }
    this.balls = [];
    this.applyFit();
    const n = this.names.length;
    if (n === 0 || !this.renderer) return;
    this.ensureGeo(n);
    const texSize = labelWidth(n);
    this.names.forEach((name, index) => {
      const texture = makeLabel(index + 1, name, texSize);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: texture,
        roughness: 0.46,
        metalness: 0.04,
      });
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(this.ballGeo, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      group.scale.setScalar(this.ballRadius);
      const ball: Ball = {
        name,
        listNo: index + 1,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        radius: this.ballRadius,
        group,
        mesh,
        material,
        texture,
        inDrum: true,
        docked: false,
      };
      this.placeInside(ball);
      this.balls.push(ball);
      this.ballsGroup.add(group);
    });
    for (let i = 0; i < 18; i++) this.collide();
  }

  private placeInside(ball: Ball) {
    const s = this.span();
    const origin = this.dockTmp.copy(CENTER).multiplyScalar(s);
    const max = Math.max(ball.radius * 0.4, this.sphereR - 0.07 * s - ball.radius);
    for (let i = 0; i < 28; i++) {
      randomInSphere(Math.random, max * 0.9, this.tmp);
      ball.pos.copy(origin).add(this.tmp);
      let ok = true;
      for (const other of this.balls) {
        if (other === ball || !other.inDrum) continue;
        const min = ball.radius + other.radius + 0.008;
        if (ball.pos.distanceToSquared(other.pos) < min * min) {
          ok = false;
          break;
        }
      }
      if (ok) break;
    }
    const kick = 0.25 + Math.min(0.35, this.sphereR * 0.08);
    ball.vel.set((Math.random() - 0.5) * kick, (Math.random() - 0.5) * kick * 0.6, (Math.random() - 0.5) * kick);
    ball.mesh.quaternion.identity();
  }

  unlock() {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!this.audio) this.audio = new Ctx();
    if (this.audio.state === "suspended") void this.audio.resume();
  }

  private noteHit(speed: number) {
    if (speed > this.hitQueued) this.hitQueued = speed;
  }

  private flushHits(realDt: number) {
    this.hitWait = Math.max(0, this.hitWait - realDt);
    if (this.hitWait <= 0 && this.hitQueued > 0.8) {
      this.knock(Math.min(1, this.hitQueued / 4.5));
      this.hitWait = 0.062;
    }
    this.hitQueued = 0;
  }

  private ensureNoise() {
    const ctx = this.audio;
    if (!ctx || this.noiseBuf) return;
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * 0.05);
    const buf = ctx.createBuffer(1, len, rate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
  }

  private knock(strength: number) {
    const ctx = this.audio;
    if (!ctx || ctx.state !== "running" || this.volume <= 0.001) return;
    this.ensureNoise();
    if (!this.noiseBuf) return;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 380 + strength * 1400;
    filter.Q.value = 0.85;
    const gain = ctx.createGain();
    const vol = (0.03 + strength * 0.16) * this.volume;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    const body = ctx.createOscillator();
    body.type = "sine";
    body.frequency.setValueAtTime(180 + strength * 220, now);
    body.frequency.exponentialRampToValueAtTime(90 + strength * 40, now + 0.04);
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(vol * 0.55, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    body.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    body.start(now);
    body.stop(now + 0.055);
  }

  private chime() {
    const ctx = this.audio;
    if (!ctx || ctx.state !== "running" || this.volume <= 0.001) return;
    const t = ctx.currentTime;
    const peak = 0.06 * this.volume;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
    gain.connect(ctx.destination);
    for (const [freq, type] of [
      [523.25, "sine"],
      [784, "triangle"],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.2);
      osc.connect(gain);
      osc.start(t);
      osc.stop(t + 0.7);
    }
  }

  start() {
    if (this.recording || this.names.length === 0) return;
    if (this.phase === "mixing" || this.phase === "opening" || this.phase === "extracting" || this.phase === "presenting") return;
    this.unlock();
    this.begin(true);
  }

  restart() {
    if (this.recording) return;
    this.completedPlan = null;
    this.completedKey = "";
    this.plan = [];
    this.planIndex = 0;
    this.drawn = [];
    this.drawnNos = [];
    this.focus = null;
    this.chosen = null;
    this.escaped = false;
    this.gate = 0;
    this.bits = [];
    this.phase = "idle";
    this.phaseT = 0;
    this.halo.visible = false;
    for (const ball of this.balls) {
      ball.inDrum = true;
      ball.docked = false;
      ball.group.scale.setScalar(ball.radius);
      this.placeInside(ball);
    }
    for (let i = 0; i < 12; i++) this.collide();
    this.hooks.onDrawn([], []);
    this.hooks.onPhase("idle");
  }

  async exportVideo() {
    if (this.recording || !this.renderer || this.names.length === 0) return;
    if (this.phase === "mixing" || this.phase === "opening" || this.phase === "extracting" || this.phase === "presenting") return;
    this.unlock();
    this.readView();
    const size = this.recordSize();
    let opened = false;
    try {
      opened = await this.recorder.open(size.w, size.h);
    } catch {
      opened = false;
    }
    if (this.disposed) {
      if (opened) await this.recorder.cancel();
      return;
    }
    if (!opened) {
      this.hooks.onRecord("unsupported");
      return;
    }
    this.recW = this.recorder.width;
    this.recH = this.recorder.height;
    this.recording = true;
    this.bufW = 0;
    this.hooks.onRecord("recording");
    this.begin(false);
  }

  private recordSize() {
    const aspect = this.viewW / Math.max(1, this.viewH);
    let w = 960;
    let h = Math.round(w / aspect);
    if (h > 720) {
      h = 720;
      w = Math.round(h * aspect);
    }
    if (w % 2) w += 1;
    if (h % 2) h += 1;
    return { w: Math.max(640, w), h: Math.max(360, h) };
  }

  private begin(forceNew: boolean) {
    if (this.names.length === 0) return;
    const count = Math.min(this.drawCount, this.names.length);
    const key = `${this.namesKey}#${count}`;
    if (!forceNew && this.completedPlan && this.completedKey === key && this.completedPlan.length === count) {
      this.plan = this.completedPlan.slice();
      this.racing = false;
    } else {
      this.plan = new Array(count).fill("");
      this.racing = true;
      this.completedPlan = null;
      this.completedKey = "";
    }
    this.planIndex = 0;
    this.drawn = [];
    this.drawnNos = [];
    this.focus = null;
    this.chosen = null;
    this.escaped = false;
    this.gate = 0;
    this.phaseT = 0;
    this.bits = [];
    this.halo.visible = false;
    for (const ball of this.balls) {
      ball.inDrum = true;
      ball.docked = false;
      ball.group.scale.setScalar(ball.radius);
      this.placeInside(ball);
    }
    for (let i = 0; i < 12; i++) this.collide();
    this.phase = "mixing";
    this.hooks.onDrawn([], []);
    this.hooks.onPhase("mixing");
  }

  private duration(phase: Phase) {
    const s = this.speed;
    if (phase === "mixing") return Math.max(2, this.mixSeconds);
    if (phase === "opening") return Math.max(0.45, 0.9 / s);
    if (phase === "extracting") return Math.max(0.7, 1.7 / s);
    if (phase === "presenting") return Math.max(0.95, 1.55 / s);
    if (phase === "finale") return 3.1;
    return Infinity;
  }

  startLoop() {
    this.readView();
    this.last = 0;
    this.rafId = requestAnimationFrame(this.onFrame);
  }

  private onFrame = (now: number) => {
    void this.frame(now);
  };

  private async frame(now: number) {
    if (this.framing || this.disposed) return;
    this.framing = true;
    try {
      if (!this.renderer) return;
      if (this.last === 0) {
        this.last = now;
        return;
      }
      const wall = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      const dt = this.recording ? 1 / 30 : wall;
      this.readView();
      this.applySize();
      this.tick(dt);
      this.paint();
      if (this.recording) {
        while (this.recorder.busy > 2 && !this.disposed) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
        if (this.disposed || !this.recording) return;
        this.recorder.capture(this.gl, this.hudCanvas, 1 / 30);
      }
    } finally {
      this.framing = false;
      if (!this.disposed) this.rafId = requestAnimationFrame(this.onFrame);
    }
  }

  private readView() {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    if (w > 1 && h > 1) {
      this.viewW = w;
      this.viewH = h;
    }
  }

  private applySize() {
    let w: number;
    let h: number;
    if (this.recording) {
      w = this.recW;
      h = this.recH;
    } else {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = Math.max(2, Math.round(this.viewW * dpr));
      h = Math.max(2, Math.round(this.viewH * dpr));
    }
    if (w === this.bufW && h === this.bufH) return;
    this.bufW = w;
    this.bufH = h;
    this.renderer?.setSize(w, h, false);
    this.hudCanvas.width = w;
    this.hudCanvas.height = h;
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
  }

  private tick(realDt: number) {
    this.updateGate(realDt);
    this.slideKeys(realDt);
    this.physics(realDt);
    this.advance(realDt);
    this.updateFocus();
    const spinDt = realDt * this.speed;
    for (const ball of this.balls) {
      ball.group.position.copy(ball.pos);
      this.spinBall(ball, spinDt);
    }
    this.paddles.rotation.y = this.paddleAngle;
    this.blowStreaks(realDt);
    this.flushHits(realDt);
    for (const bit of this.bits) {
      bit.life -= realDt;
      bit.x += bit.vx * realDt;
      bit.y += bit.vy * realDt;
      bit.vy += 0.85 * realDt;
      bit.rot += bit.vr * realDt;
    }
    if (this.bits.length) this.bits = this.bits.filter((bit) => bit.life > 0);
  }

  private updateGate(realDt: number) {
    if (this.phase === "opening") {
      this.gate = smooth(Math.min(1, this.phaseT / Math.max(0.001, this.duration("opening"))));
    } else if (this.phase === "extracting") {
      this.gate = 1;
    } else {
      this.gate += (0 - this.gate) * Math.min(1, realDt * 3.2);
    }
    this.hinge.rotation.x = -2.15 * this.gate;
  }

  private stirring() {
    if (this.agitation <= 0.02) return false;
    if (this.phase === "mixing" || this.phase === "opening") return true;
    return this.phase === "extracting" && !this.escaped;
  }

  private physics(realDt: number) {
    const scaled = realDt * this.speed;
    this.acc += scaled;
    const heavy = this.balls.length > 160;
    const step = heavy ? 1 / 60 : 1 / 90;
    const cap = heavy ? 5 : 10;
    let n = 0;
    while (this.acc >= step && n < cap) {
      this.substep(step);
      this.acc -= step;
      n += 1;
    }
    if (n === cap) this.acc = 0;
    const stir = this.stirring();
    this.cage.rotation.y += scaled * (stir ? 0.22 : 0.03);
  }

  private substep(dt: number) {
    const stir = this.stirring();
    const blow = this.windOn && this.wind > 0.02;
    this.windClock += dt;
    const spinRods = this.rodsOn && this.rodSpeed > 0.01;
    this.paddleOmega = spinRods ? 4.4 * this.rodSpeed : 0;
    this.paddleAngle += dt * this.paddleOmega;
    for (const ball of this.balls) {
      if (!ball.inDrum || ball === this.focus) continue;
      ball.vel.y -= this.gravity * dt;
      const c = this.worldCenter();
      const rx = ball.pos.x - c.x;
      const rz = ball.pos.z - c.z;
      if (stir) {
        const wind = (1.15 * this.agitation * this.sphereR) / SPHERE_R;
        ball.vel.x += -rz * wind * dt;
        ball.vel.z += rx * wind * dt;
      }
      if (blow) {
        const inhaling =
          this.racing &&
          !this.escaped &&
          this.gate > 0.4 &&
          (this.phase === "opening" || this.phase === "extracting");
        const scale = inhaling ? 0.22 : 1;
        const span = Math.max(0.35, this.sphereR);
        const nx = rx / span;
        const ny = (ball.pos.y - c.y) / span;
        const nz = rz / span;
        const radial = Math.hypot(nx, nz);
        const width = this.windWidth;
        const t = this.windClock;
        const vents = 6;
        const ring = width * 0.55;
        let jet = 0;
        for (let i = 0; i < vents; i++) {
          const a = (i / vents) * Math.PI * 2 + t * 0.4;
          const dx = nx - Math.cos(a) * ring;
          const dz = nz - Math.sin(a) * ring;
          const reach = 0.16 + width * 0.2;
          jet = Math.max(jet, Math.max(0, 1 - Math.hypot(dx, dz) / reach));
        }
        const fan = Math.max(0, 1 - radial / Math.max(0.22, width));
        const liftMix = Math.max(jet, fan * 0.7);
        const reachY = -1 + this.windHeight * 2;
        const above = ny - reachY;
        const heightGate = above <= 0 ? 1 : Math.max(0, 1 - above / 0.08);
        const lift = this.wind * (12 + this.gravity) * liftMix * heightGate * scale;
        ball.vel.y += lift * dt;
        const wobble = ball.listNo * 1.37;
        const flutter = this.wind * 0.55 * scale * dt;
        ball.vel.x += Math.sin(t * 1.1 + wobble) * flutter;
        ball.vel.z += Math.cos(t * 0.9 + wobble * 0.8) * flutter;
        ball.vel.x += -rz * this.wind * 0.28 * scale * dt;
        ball.vel.z += rx * this.wind * 0.28 * scale * dt;
        if (above > 0) {
          const peel = above * (18 + this.wind * 1.6) * scale;
          ball.vel.y -= peel * dt;
          if (ball.vel.y > 0) ball.vel.y *= Math.max(0.15, 1 - above * 6);
          ball.vel.x += nx * peel * 0.45 * dt;
          ball.vel.z += nz * peel * 0.45 * dt;
        }
      }
      const dragK =
        ball === this.chosen && this.gate > 0.7 && !this.racing
          ? 0.08
          : blow
            ? this.drag * 0.16 + 0.04
            : this.drag * (stir ? 0.28 : 1.15) + (stir ? 0.04 : 0.45);
      ball.vel.multiplyScalar(1 / (1 + dragK * dt));
      const maxSp = (6 + this.agitation * 2.2 + (blow ? this.wind * 4.2 : 0)) * Math.max(1, this.span());
      const sp = ball.vel.length();
      if (sp > maxSp) ball.vel.multiplyScalar(maxSp / sp);
      this.pullToMouth(ball, dt);
      ball.pos.addScaledVector(ball.vel, dt);
      this.pushRods(ball, dt, spinRods);
      this.contain(ball, dt);
    }
    this.collide();
    for (const ball of this.balls) {
      if (!ball.inDrum || ball === this.focus) continue;
      this.contain(ball, dt);
    }
  }

  resetCamera() {
    this.azimuth = 0;
    this.polar = 1.32 + (15 * Math.PI) / 180;
    this.zoom = CAMERA_ZOOM;
    this.pan.set(0, 0, 0);
  }

  private slideKeys(dt: number) {
    if (this.recording || this.keys.size === 0) return;
    let strafe = 0;
    let ahead = 0;
    if (this.keys.has("d")) strafe += 1;
    if (this.keys.has("a")) strafe -= 1;
    if (this.keys.has("w")) ahead += 1;
    if (this.keys.has("s")) ahead -= 1;
    if (strafe === 0 && ahead === 0) return;
    const az = this.azimuth;
    const sp = Math.sin(this.polar);
    const rightX = Math.cos(az);
    const rightZ = -Math.sin(az);
    const fwdX = -sp * Math.sin(az);
    const fwdY = -Math.cos(this.polar);
    const fwdZ = -sp * Math.cos(az);
    const speed = 1.45 * this.span() * this.zoom * dt;
    this.pan.x += (rightX * strafe + fwdX * ahead) * speed;
    this.pan.y += fwdY * ahead * speed;
    this.pan.z += (rightZ * strafe + fwdZ * ahead) * speed;
  }

  private worldCenter() {
    return this.centerW.copy(CENTER).multiplyScalar(this.span());
  }

  private pullToMouth(ball: Ball, dt: number) {
    if (this.racing) this.suck(ball, dt);
    else this.guideChosen(ball, dt);
  }

  private suck(ball: Ball, dt: number) {
    if (this.escaped || this.gate < 0.4) return;
    if (this.phase !== "opening" && this.phase !== "extracting") return;
    this.tmp2.copy(this.mouth).sub(ball.pos);
    const dist = this.tmp2.length();
    if (dist < 1e-4) return;
    this.tmp2.multiplyScalar(1 / dist);
    const reach = this.sphereR * 0.98;
    const closeness = Math.max(0, 1 - dist / reach);
    const grab = closeness * closeness;
    const impatient = this.phase === "extracting" ? Math.min(2.4, this.phaseT * 0.5) : Math.min(0.45, this.phaseT * 0.2);
    const pull = (1.6 + grab * 46 + impatient * 12) * Math.max(0.4, this.gate) * this.suction;
    ball.vel.addScaledVector(this.tmp2, pull * dt);
    if (dist < this.holeRadius * 3.4) ball.vel.addScaledVector(this.holeAxis, (14 + impatient * 8) * this.suction * dt);
  }

  private guideChosen(ball: Ball, dt: number) {
    if (ball !== this.chosen || this.gate < 0.72 || !ball.inDrum) return;
    if (this.phase !== "opening" && this.phase !== "extracting") return;
    this.tmp2.copy(this.mouth).sub(ball.pos);
    const dist = this.tmp2.length();
    if (dist < 1e-4) return;
    this.tmp2.multiplyScalar(1 / dist);
    const grew = Math.min(4.5, this.phase === "extracting" ? this.phaseT : this.phaseT * 0.45);
    const urge = (6 + grew * 10) * (0.45 + this.agitation) * this.suction;
    ball.vel.addScaledVector(this.tmp2, urge * dt);
    if (dist < this.holeRadius * 2.6) ball.vel.addScaledVector(this.holeAxis, 14 * this.suction * dt);
  }

  private contain(ball: Ball, dt: number) {
    const c = this.worldCenter();
    this.tmp.copy(ball.pos).sub(c);
    const dist = this.tmp.length();
    if (dist < 1e-6) return;
    this.tmp.multiplyScalar(1 / dist);
    const s = this.span();
    const limit = this.sphereR - 0.02 * s - ball.radius;
    const align = this.tmp.dot(this.holeAxis);
    const clearance = Math.max(0.03 * s, this.holeRadius - ball.radius * 0.72);
    const holeCos = Math.cos(Math.asin(Math.min(0.94, clearance / Math.max(0.2, this.sphereR))));
    const nearMouth = ball.pos.distanceToSquared(this.mouth) < (this.holeRadius * 2.5) ** 2;
    const corridor = align > 0.72 || nearMouth;
    const openRace = this.racing && !this.escaped && this.gate > 0.72 && ball.inDrum;
    const openGuided = !this.racing && this.gate > 0.8 && ball === this.chosen && ball.inDrum;
    if ((openRace || openGuided) && corridor) {
      if (dist > this.sphereR - ball.radius * 0.22) this.escape(ball);
      return;
    }
    if (!openRace && this.gate > 0.8 && ball !== this.chosen && align > holeCos - 0.04) {
      ball.vel.addScaledVector(this.tmp, -10 * dt);
    }
    if (dist <= limit) return;
    ball.pos.copy(c).addScaledVector(this.tmp, limit);
    const vn = ball.vel.dot(this.tmp);
    if (vn > 0) {
      if (vn > 1.15) this.noteHit(vn * 0.65);
      ball.vel.addScaledVector(this.tmp, -(1 + this.bounce) * vn);
      const tangent = this.velTmp(ball);
      ball.vel.addScaledVector(tangent, -0.08);
    }
  }

  private velTmp(ball: Ball) {
    const vn = ball.vel.dot(this.tmp);
    return this.tmp2.copy(ball.vel).addScaledVector(this.tmp, -vn);
  }

  private escape(ball: Ball) {
    if (this.escaped || !ball.inDrum) return;
    ball.inDrum = false;
    this.focus = ball;
    this.focusFrom.copy(ball.pos);
    this.escaped = true;
    this.chosen = ball;
    this.phase = "extracting";
    this.phaseT = 0;
    this.hooks.onPhase("extracting");
  }

  private pushRods(ball: Ball, dt: number, stir: boolean) {
    if (this.gate > 0.4 && ball === this.chosen && !this.racing) return;
    if (this.racing && this.gate > 0.45 && ball.pos.distanceToSquared(this.mouth) < (this.holeRadius * 3.2) ** 2) return;
    const s = this.span();
    const c = this.worldCenter();
    const axleR = 0.03 * s + ball.radius;
    const dx = ball.pos.x - c.x;
    const dz = ball.pos.z - c.z;
    const axleDist = Math.hypot(dx, dz);
    if (axleDist < axleR && axleDist > 1e-6) {
      const nx = dx / axleDist;
      const nz = dz / axleDist;
      const pen = axleR - axleDist;
      ball.pos.x += nx * pen;
      ball.pos.z += nz * pen;
      const vn = ball.vel.x * nx + ball.vel.z * nz;
      if (vn < 0) {
        ball.vel.x -= (1 + this.bounce) * vn * nx;
        ball.vel.z -= (1 + this.bounce) * vn * nz;
      }
    }
    if (!this.rodsOn) return;
    for (const rod of this.rods) {
      const theta = this.paddleAngle + rod.angle;
      const dirX = Math.cos(theta);
      const dirZ = -Math.sin(theta);
      const y = c.y + rod.y * s;
      const x0 = c.x + dirX * rod.inner * s;
      const z0 = c.z + dirZ * rod.inner * s;
      const x1 = c.x + dirX * rod.outer * s;
      const z1 = c.z + dirZ * rod.outer * s;
      const segX = x1 - x0;
      const segZ = z1 - z0;
      const len2 = segX * segX + segZ * segZ;
      if (len2 < 1e-8) continue;
      let t = ((ball.pos.x - x0) * segX + (ball.pos.z - z0) * segZ) / len2;
      if (t < 0) t = 0;
      else if (t > 1) t = 1;
      const px = x0 + segX * t;
      const pz = z0 + segZ * t;
      let ox = ball.pos.x - px;
      let oy = ball.pos.y - y;
      let oz = ball.pos.z - pz;
      let dist = Math.hypot(ox, oy, oz);
      const limit = rod.radius * s + ball.radius;
      if (dist >= limit) continue;
      if (dist < 1e-6) {
        ox = 0;
        oy = 1;
        oz = 0;
        dist = 1e-6;
      }
      const inv = 1 / dist;
      const nx = ox * inv;
      const ny = oy * inv;
      const nz = oz * inv;
      const pen = limit - dist;
      ball.pos.x += nx * pen;
      ball.pos.y += ny * pen;
      ball.pos.z += nz * pen;
      const rx = px - c.x;
      const rz = pz - c.z;
      const vx = stir ? this.paddleOmega * rz : 0;
      const vz = stir ? -this.paddleOmega * rx : 0;
      const rvn = (ball.vel.x - vx) * nx + ball.vel.y * ny + (ball.vel.z - vz) * nz;
      if (rvn < 0) {
        if (rvn < -1.1) this.noteHit(-rvn * 0.55);
        const jn = (1 + this.bounce) * rvn;
        ball.vel.x -= jn * nx;
        ball.vel.y -= jn * ny;
        ball.vel.z -= jn * nz;
      }
      if (!stir) continue;
      const blend = Math.min(0.75, 6 * dt * Math.max(0.35, this.rodSpeed));
      ball.vel.x += vx * blend;
      ball.vel.z += vz * blend;
      ball.vel.y += (0.55 + Math.max(0, c.y - ball.pos.y) * 0.35) * this.agitation * dt * 6;
    }
  }

  private collide() {
    const list = this.balls;
    const inside: Ball[] = [];
    for (const ball of list) if (ball.inDrum) inside.push(ball);
    if (inside.length < 48) {
      for (let i = 0; i < inside.length; i++) {
        const a = inside[i]!;
        for (let j = i + 1; j < inside.length; j++) this.separate(a, inside[j]!);
      }
      return;
    }
    const cell = Math.max(0.02, this.ballRadius * 2);
    const grid = new Map<string, Ball[]>();
    const keyOf = (ix: number, iy: number, iz: number) => `${ix}|${iy}|${iz}`;
    for (const ball of inside) {
      const ix = Math.floor(ball.pos.x / cell);
      const iy = Math.floor(ball.pos.y / cell);
      const iz = Math.floor(ball.pos.z / cell);
      const key = keyOf(ix, iy, iz);
      const bucket = grid.get(key);
      if (bucket) bucket.push(ball);
      else grid.set(key, [ball]);
    }
    const neighbors: Array<[number, number, number]> = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 0],
      [1, -1, 0],
      [1, 0, 1],
      [1, 0, -1],
      [0, 1, 1],
      [0, 1, -1],
      [1, 1, 1],
      [1, 1, -1],
      [1, -1, 1],
      [1, -1, -1],
    ];
    for (const [key, bucket] of grid) {
      for (let i = 0; i < bucket.length; i++) {
        const a = bucket[i]!;
        for (let j = i + 1; j < bucket.length; j++) this.separate(a, bucket[j]!);
      }
      const parts = key.split("|");
      const ix = Number(parts[0]);
      const iy = Number(parts[1]);
      const iz = Number(parts[2]);
      for (const [dx, dy, dz] of neighbors) {
        const other = grid.get(keyOf(ix + dx, iy + dy, iz + dz));
        if (!other) continue;
        for (const a of bucket) for (const b of other) this.separate(a, b);
      }
    }
  }

  private separate(a: Ball, b: Ball) {
    const e = this.bounce;
    this.tmp.copy(b.pos).sub(a.pos);
    let dist = this.tmp.length();
    const min = a.radius + b.radius;
    if (dist === 0) {
      this.tmp.set(1, 0, 0);
      dist = 0.0001;
    }
    if (dist >= min) return;
    this.tmp.multiplyScalar(1 / dist);
    const corr = (min - dist - 0.0004) * 0.75;
    if (corr > 0) {
      a.pos.addScaledVector(this.tmp, -corr * 0.5);
      b.pos.addScaledVector(this.tmp, corr * 0.5);
    }
    const relN = this.tmp.dot(b.vel) - this.tmp.dot(a.vel);
    if (relN < 0) {
      if (relN < -0.85) this.noteHit(-relN);
      const jn = (-(1 + e) * relN) / 2;
      a.vel.addScaledVector(this.tmp, -jn);
      b.vel.addScaledVector(this.tmp, jn);
    }
    this.tmp2.copy(b.vel).sub(a.vel);
    const vn = this.tmp2.dot(this.tmp);
    this.tmp2.addScaledVector(this.tmp, -vn);
    a.vel.addScaledVector(this.tmp2, 0.08);
    b.vel.addScaledVector(this.tmp2, -0.08);
  }

  private spinBall(ball: Ball, dt: number) {
    if (!ball.inDrum || ball.docked) return;
    this.tmp.set(ball.vel.x, ball.vel.y, ball.vel.z);
    const speed = this.tmp.length();
    if (speed < 0.04) return;
    const c = this.worldCenter();
    this.tmp2.set(ball.pos.x - c.x, ball.pos.y - c.y, ball.pos.z - c.z);
    if (this.tmp2.lengthSq() < 1e-6) return;
    this.axis.crossVectors(this.tmp2, this.tmp);
    const mag = this.axis.length();
    if (mag < 1e-5) return;
    this.axis.multiplyScalar(1 / mag);
    this.q.setFromAxisAngle(this.axis, (speed / ball.radius) * dt);
    ball.mesh.quaternion.premultiply(this.q);
  }

  private nearestInDrum() {
    let best: Ball | null = null;
    let bestD = Infinity;
    for (const ball of this.balls) {
      if (!ball.inDrum) continue;
      const d = ball.pos.distanceToSquared(this.mouth);
      if (d < bestD) {
        bestD = d;
        best = ball;
      }
    }
    return best;
  }

  private advance(realDt: number) {
    if (this.phase === "idle" || this.phase === "done") return;
    this.phaseT += realDt;
    if (!this.escaped && (this.phase === "opening" || this.phase === "extracting")) {
      if (this.phase === "opening" && this.phaseT >= this.duration("opening")) {
        this.phase = "extracting";
        this.phaseT = 0;
        this.hooks.onPhase("extracting");
        return;
      }
      if (this.phase === "extracting") {
        const limit = this.racing ? 4.2 : 3.1 / Math.max(0.45, Math.min(1.2, this.speed));
        if (this.phaseT < limit) return;
        const ball = this.racing ? this.nearestInDrum() : this.chosen;
        if (ball?.inDrum) {
          ball.pos.copy(this.mouth).addScaledVector(this.holeAxis, ball.radius * 1.35);
          ball.vel.copy(this.holeAxis).multiplyScalar(1.4);
          this.escape(ball);
        } else this.enterFinale();
      }
      return;
    }
    if (this.phaseT < this.duration(this.phase)) return;
    this.phaseT = 0;
    if (this.phase === "mixing") {
      this.chosen = null;
      this.escaped = false;
      this.focus = null;
      if (!this.racing) {
        const name = this.plan[this.planIndex];
        const ball = name ? this.balls.find((item) => item.inDrum && item.name === name) : undefined;
        if (!ball || !name) {
          this.enterFinale();
          return;
        }
        this.chosen = ball;
      }
      this.phase = "opening";
      this.hooks.onPhase("opening");
      return;
    }
    if (this.phase === "opening") return;
    if (this.phase === "extracting") {
      const ball = this.focus ?? this.chosen;
      const name = ball?.name;
      const no = ball?.listNo ?? this.drawn.length + 1;
      if (name) {
        this.plan[this.planIndex] = name;
        this.drawn.push(name);
        this.drawnNos.push(no);
        this.hooks.onDrawn(this.drawn.slice(), this.drawnNos.slice());
      }
      this.chime();
      this.spawnConfetti();
      this.phase = "presenting";
      this.hooks.onPhase("presenting");
      return;
    }
    if (this.phase === "presenting") {
      this.dockFocus();
      this.planIndex += 1;
      this.chosen = null;
      this.escaped = false;
      if (this.planIndex >= this.plan.length) this.enterFinale();
      else {
        this.phase = "mixing";
        this.hooks.onPhase("mixing");
      }
      return;
    }
    if (this.phase === "finale") {
      this.phase = "done";
      this.halo.visible = false;
      this.hooks.onPhase("done");
      if (this.recording) void this.finishRecording();
    }
  }

  private enterFinale() {
    this.focus = null;
    this.halo.visible = false;
    this.phase = "finale";
    this.phaseT = 0;
    this.completedPlan = this.plan.slice();
    this.completedKey = this.replayKey();
    this.hooks.onPhase("finale");
  }

  private dockFocus() {
    const ball = this.focus;
    if (!ball) return;
    this.slotPosition(this.planIndex, ball.pos);
    ball.docked = true;
    ball.group.scale.setScalar(ball.radius * this.dockMul());
    this.focus = null;
    this.halo.visible = false;
  }

  private dockMul() {
    return this.plan.length > 24 ? 0.58 : 0.8;
  }

  private slotPosition(index: number, target: THREE.Vector3) {
    const n = Math.max(1, this.plan.length);
    const cols = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(n * 1.7))));
    const col = index % cols;
    const row = Math.floor(index / cols);
    const rows = Math.ceil(n / cols);
    const s = this.span();
    const diameter = this.ballRadius * this.dockMul() * 2;
    const gap = Math.min(0.42 * s, Math.max(diameter * 1.25, 0.16 * s));
    const x = (col - (Math.min(cols, n) - 1) / 2) * gap;
    const z = TRAY_Z * s + (row - (rows - 1) / 2) * gap * 0.72;
    const y = (TRAY_Y + 0.04) * s + this.ballRadius * this.dockMul();
    target.set(x, y, z);
  }

  private updateFocus() {
    const ball = this.focus;
    const showHalo = this.phase === "presenting" || (this.phase === "extracting" && this.escaped);
    this.halo.visible = showHalo && !!ball;
    if (!ball) return;
    if (this.phase === "extracting" && this.escaped) {
      const t = Math.min(1, this.phaseT / this.duration("extracting"));
      const e = smooth(t);
      this.chuteExit(this.dockTmp);
      if (e < 0.42) ball.pos.lerpVectors(this.focusFrom, this.dockTmp, smooth(e / 0.42));
      else ball.pos.lerpVectors(this.dockTmp, this.hero, smooth((e - 0.42) / 0.58));
      const mul = e < 0.4 ? 1 : 1 + (2.15 - 1) * smooth((e - 0.4) / 0.6);
      ball.group.scale.setScalar(ball.radius * mul);
      if (e > 0.45) ball.mesh.quaternion.slerp(this.upright, Math.min(1, (e - 0.45) * 1.6));
    } else if (this.phase === "presenting") {
      const t = Math.min(1, this.phaseT / this.duration("presenting"));
      ball.mesh.quaternion.slerp(this.upright, 0.18);
      if (t < 0.76) {
        ball.pos.copy(this.hero);
        ball.pos.y += Math.sin(this.phaseT * 3.2) * 0.035;
        ball.group.scale.setScalar(ball.radius * 2.15);
      } else {
        const k = smooth((t - 0.76) / 0.24);
        this.slotPosition(this.planIndex, this.dockTmp);
        ball.pos.lerpVectors(this.hero, this.dockTmp, k);
        const mul = 2.15 + (this.dockMul() - 2.15) * k;
        ball.group.scale.setScalar(ball.radius * mul);
      }
    }
    this.halo.position.set(this.hero.x, this.hero.y - 0.55, this.hero.z);
  }

  private chuteExit(target: THREE.Vector3) {
    const reach = 0.28 * (this.holeRadius / 0.2);
    target.copy(this.mouth).addScaledVector(this.holeAxis, reach);
  }

  private spawnConfetti() {
    const count = this.reduced ? 18 : 84;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.18 + Math.random() * 0.55;
      this.bits.push({
        x: 0.5 + (Math.random() - 0.5) * 0.08,
        y: 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.65 - 0.35,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 8,
        w: 0.008 + Math.random() * 0.012,
        h: 0.014 + Math.random() * 0.02,
        color: CONFETTI[i % CONFETTI.length]!,
        life: 1.15 + Math.random() * 0.7,
        max: 1.6,
      });
    }
  }

  private pointerSpan() {
    const pts = [...this.pointers.values()];
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }

  private paint() {
    if (!this.renderer) return;
    this.windGuide.visible = this.windPreview && !this.recording;
    this.placeCamera();
    this.fitSky();
    this.renderer.render(this.scene, this.camera);
    this.drawHud();
  }

  private placeCamera() {
    const dist = 5.7 * this.span() * this.zoom;
    const target = this.worldCenter();
    target.y -= CAMERA_DROP * this.span();
    target.add(this.pan);
    const sp = Math.sin(this.polar);
    this.camera.position.set(
      target.x + dist * sp * Math.sin(this.azimuth),
      target.y + dist * Math.cos(this.polar),
      target.z + dist * sp * Math.cos(this.azimuth),
    );
    this.camera.lookAt(target);
    this.camera.near = Math.max(0.05, dist * 0.012);
  }

  private fitSky() {
    const center = this.worldCenter();
    const camDist = this.camera.position.distanceTo(center);
    const radius = Math.max(640, camDist * 1.55);
    if (this.sky) {
      this.sky.position.copy(center);
      this.sky.scale.setScalar(radius);
    }
    this.camera.far = radius * 2.6;
    this.camera.updateProjectionMatrix();
  }

  private drawHud() {
    const ctx = this.hud;
    const w = this.hudCanvas.width;
    const h = this.hudCanvas.height;
    ctx.clearRect(0, 0, w, h);
    if (w < 2 || h < 2) return;
    const u = h / 800;
    if (this.phase === "finale") this.drawBoard(ctx, w, h, u);
    else if (this.phase !== "idle" && this.phase !== "done") this.drawCeremony(ctx, w, h, u);
    this.drawBits(ctx, w, h);
  }

  private drawCeremony(ctx: CanvasRenderingContext2D, w: number, h: number, u: number) {
    const shown = Math.min(
      this.plan.length,
      this.drawn.length + (this.phase === "extracting" || this.phase === "mixing" || this.phase === "opening" ? 1 : 0),
    );
    const label = `${Math.max(shown, this.drawn.length)} ${this.hudText.of} ${this.plan.length}`;
    ctx.save();
    ctx.font = `600 ${Math.round(18 * u)}px Manrope, sans-serif`;
    const padX = 16 * u;
    const textW = ctx.measureText(label).width;
    const pillW = textW + padX * 2;
    const pillH = 36 * u;
    const x = (w - pillW) / 2;
    const y = 22 * u;
    ctx.fillStyle = "rgba(20, 18, 14, 0.72)";
    ctx.beginPath();
    ctx.roundRect(x, y, pillW, pillH, 999);
    ctx.fill();
    ctx.fillStyle = IVORY;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, w / 2, y + pillH / 2);
    ctx.restore();

    if (this.recording) {
      ctx.save();
      ctx.font = `600 ${Math.round(26 * u)}px "Cormorant Garamond", serif`;
      ctx.fillStyle = IVORY;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 8;
      ctx.fillText("Саветодавно тело", 22 * u, 22 * u);
      ctx.restore();
    }

    if (this.phase !== "presenting") return;
    const name = this.drawn[this.drawn.length - 1];
    const no = this.drawnNos[this.drawn.length - 1];
    if (!name) return;
    const inscription = no ? `${no}. ${name}` : name;
    const cardW = Math.min(w * 0.8, 680 * u);
    const cardH = Math.max(120 * u, Math.min(h * 0.24, 180 * u));
    const cx = (w - cardW) / 2;
    const cy = h * 0.7;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 24 * u;
    ctx.fillStyle = IVORY;
    ctx.beginPath();
    ctx.roundRect(cx, cy, cardW, cardH, 22 * u);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = SEAL;
    ctx.font = `700 ${Math.round(14 * u)}px Manrope, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.hudText.kicker.split("").join("  "), w / 2, cy + cardH * 0.28);
    ctx.fillStyle = INK;
    let fontSize = Math.round(54 * u);
    const maxWidth = cardW * 0.86;
    let drawnName = false;
    for (; fontSize > 18 * u; fontSize -= 2) {
      ctx.font = `600 ${fontSize}px "Cormorant Garamond", serif`;
      const lines = wrapLines(ctx, inscription, maxWidth);
      const fits = lines.length <= 3 && lines.every((line) => ctx.measureText(line).width <= maxWidth);
      if (!fits && fontSize > 20 * u) continue;
      const lh = fontSize * 1.05;
      const start = cy + cardH * 0.62 - ((lines.length - 1) * lh) / 2;
      for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i]!, w / 2, start + i * lh, maxWidth);
      drawnName = true;
      break;
    }
    if (!drawnName) ctx.fillText(inscription, w / 2, cy + cardH * 0.62, maxWidth);
    ctx.restore();
  }

  private drawBoard(ctx: CanvasRenderingContext2D, w: number, h: number, u: number) {
    ctx.save();
    ctx.fillStyle = "rgba(20, 18, 14, 0.72)";
    ctx.fillRect(0, 0, w, h);
    const names = this.drawn;
    const cols = names.length > 18 ? 3 : names.length > 7 ? 2 : 1;
    const rows = Math.max(1, Math.ceil(names.length / cols));
    const panelW = Math.min(w * 0.88, (cols === 1 ? 640 : cols === 2 ? 920 : 1100) * u);
    const titleH = 78 * u;
    const rowH = Math.max(22 * u, Math.min(42 * u, (h * 0.62 - titleH) / rows));
    const panelH = Math.min(h * 0.84, titleH + rows * rowH + 28 * u);
    const x = (w - panelW) / 2;
    const y = (h - panelH) / 2;
    ctx.fillStyle = IVORY;
    ctx.beginPath();
    ctx.roundRect(x, y, panelW, panelH, 24 * u);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 ${Math.round(36 * u)}px "Cormorant Garamond", serif`;
    ctx.fillText(this.hudText.resultTitle, w / 2, y + titleH * 0.55);
    ctx.font = `600 ${Math.round(Math.min(22, rowH * 0.46))}px Manrope, sans-serif`;
    const colW = panelW / cols;
    names.forEach((name, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const tx = x + col * colW + colW / 2;
      const ty = y + titleH + row * rowH + rowH / 2;
      const no = this.drawnNos[index] ?? index + 1;
      const line = `${no}. ${name}`;
      ctx.fillStyle = index === names.length - 1 ? SEAL : INK;
      ctx.fillText(line, tx, ty, colW - 24 * u);
    });
    ctx.restore();
  }

  private drawBits(ctx: CanvasRenderingContext2D, w: number, h: number) {
    for (const bit of this.bits) {
      const alpha = Math.max(0, Math.min(1, bit.life / (bit.max * 0.45)));
      ctx.save();
      ctx.translate(bit.x * w, bit.y * h);
      ctx.rotate(bit.rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = bit.color;
      ctx.fillRect((-bit.w * w) / 2, (-bit.h * h) / 2, bit.w * w, bit.h * h);
      ctx.restore();
    }
  }

  private async finishRecording() {
    if (!this.recording && !this.recorder.active) return;
    this.recording = false;
    try {
      const blob = await this.recorder.finish();
      if (this.disposed) return;
      this.hooks.onFile(blob);
      this.hooks.onRecord("saved");
    } catch {
      if (!this.disposed) this.hooks.onRecord("error");
    }
    this.bufW = 0;
    this.applySize();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    this.observer.disconnect();
    this.gl.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
    this.gl.removeEventListener("wheel", this.onWheel);
    this.gl.removeEventListener("contextmenu", this.onContext);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    void this.recorder.cancel();
    for (const ball of this.balls) {
      ball.texture.dispose();
      ball.material.dispose();
    }
    this.ballGeo.dispose();
    this.plaqueMap?.dispose();
    this.skyMap?.dispose();
    this.sky?.geometry.dispose();
    (this.sky?.material as THREE.Material | undefined)?.dispose();
    this.renderer?.dispose();
    this.gl.remove();
    this.hudCanvas.remove();
    void this.audio?.close();
  }
}

function labelWidth(count: number) {
  if (count > 320) return 128;
  if (count > 140) return 256;
  if (count > 60) return 384;
  if (count > 28) return 512;
  return 1024;
}
