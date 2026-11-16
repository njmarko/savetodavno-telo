import { C as TextureLoader, S as SphereGeometry, T as Vector3, _ as PerspectiveCamera, a as CanvasTexture, b as SRGBColorSpace, c as Color, d as Group, f as HemisphereLight, g as MeshStandardMaterial, h as MeshBasicMaterial, i as BoxGeometry, l as CylinderGeometry, m as Mesh, n as PMREMGenerator, o as CircleGeometry, p as Matrix4, r as WebGLRenderer, s as ClampToEdgeWrapping, t as RoomEnvironment, u as DirectionalLight, v as Quaternion, w as TorusGeometry, x as Scene, y as RepeatWrapping } from "../_libs/three.mjs";
import { a as Quality, i as CanvasSource, n as Mp4OutputFormat, o as canEncodeVideo, r as BufferTarget, t as Output } from "../_libs/mediabunny.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/engine-YgIejwKk.js
var DrawRecorder = class {
	canvas;
	ctx;
	output = null;
	source = null;
	pending = [];
	inflight = 0;
	failed = null;
	time = 0;
	width = 0;
	height = 0;
	active = false;
	constructor() {
		this.canvas = document.createElement("canvas");
		const ctx = this.canvas.getContext("2d", { alpha: false });
		if (!ctx) throw new Error("2d");
		this.ctx = ctx;
	}
	async open(width, height) {
		const w = Math.max(2, width - width % 2);
		const h = Math.max(2, height - height % 2);
		let ok = false;
		try {
			ok = await canEncodeVideo("avc", {
				width: w,
				height: h,
				bitrate: new Quality("medium")
			});
		} catch {
			ok = false;
		}
		if (!ok) return false;
		this.width = w;
		this.height = h;
		this.canvas.width = w;
		this.canvas.height = h;
		const target = new BufferTarget();
		const output = new Output({
			format: new Mp4OutputFormat({ fastStart: "in-memory" }),
			target
		});
		const source = new CanvasSource(this.canvas, {
			codec: "avc",
			bitrate: new Quality("medium")
		});
		output.addVideoTrack(source);
		output.setMetadataTags({
			title: "Саветодавно тело",
			artist: "Marko Njegomir"
		});
		await output.start();
		this.output = output;
		this.source = source;
		this.pending = [];
		this.inflight = 0;
		this.failed = null;
		this.time = 0;
		this.active = true;
		return true;
	}
	capture(gl, hud, duration) {
		if (!this.active || !this.source || this.failed) return;
		const w = this.width;
		const h = this.height;
		this.ctx.fillStyle = "#14120e";
		this.ctx.fillRect(0, 0, w, h);
		this.ctx.drawImage(gl, 0, 0, w, h);
		this.ctx.drawImage(hud, 0, 0, w, h);
		const ts = this.time;
		this.time += duration;
		this.inflight += 1;
		try {
			const job = this.source.add(ts, duration).then(() => {
				this.inflight -= 1;
			}, (error) => {
				this.inflight -= 1;
				this.failed = error;
			});
			this.pending.push(job);
		} catch (error) {
			this.inflight -= 1;
			this.failed = error;
		}
	}
	get busy() {
		return this.inflight;
	}
	async finish() {
		this.active = false;
		await Promise.all(this.pending);
		if (this.failed) throw this.failed instanceof Error ? this.failed : /* @__PURE__ */ new Error("encode");
		const output = this.output;
		const source = this.source;
		if (!output || !source) throw new Error("recorder");
		source.close();
		await output.finalize();
		const buffer = output.target.buffer;
		this.output = null;
		this.source = null;
		this.pending = [];
		if (!buffer) throw new Error("empty");
		return new Blob([buffer], { type: "video/mp4" });
	}
	async cancel() {
		this.active = false;
		const output = this.output;
		this.output = null;
		this.source = null;
		this.pending = [];
		if (output && output.state !== "finalized" && output.state !== "canceled") await output.cancel().catch(() => void 0);
	}
};
var IVORY = "#f4ecdc";
var INK = "#1c1915";
var BRASS = "#c6a15a";
var SEAL = "#9c2f2c";
var CONFETTI = [
	BRASS,
	IVORY,
	SEAL,
	"#e7d7b0"
];
var SPHERE_R = 1.42;
var CENTER = new Vector3(0, .42, 0);
var TRAY_Y = -1.745;
var TRAY_Z = 2.55;
var COLLAR_TOP = -.92;
var AXLE_HALF = SPHERE_R * 1.85 / 2;
function fitSizes(count, ballUser, machineUser) {
	const n = Math.max(1, count);
	const baseBall = .16;
	const sphere = Math.max(SPHERE_R, baseBall * Math.cbrt(n / .24)) * machineUser;
	const wanted = Math.min(.36, Math.max(.05, baseBall * ballUser));
	const maxBall = sphere * Math.cbrt(.4 / n);
	return {
		sphereR: sphere,
		ballRadius: Math.min(wanted, Math.max(.04, maxBall))
	};
}
function smooth(t) {
	const x = Math.min(1, Math.max(0, t));
	return x * x * (3 - 2 * x);
}
function randomInSphere(rand, radius, target) {
	const u = rand();
	const v = rand();
	const theta = Math.PI * 2 * u;
	const phi = Math.acos(2 * v - 1);
	const r = radius * Math.cbrt(rand());
	target.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}
function wrapLines(ctx, text, maxWidth) {
	const words = text.split(/\s+/).filter(Boolean);
	if (words.length === 0) return [text];
	const lines = [];
	let cur = words[0];
	for (let i = 1; i < words.length; i++) {
		const next = `${cur} ${words[i]}`;
		if (ctx.measureText(next).width <= maxWidth) cur = next;
		else {
			lines.push(cur);
			cur = words[i];
		}
	}
	lines.push(cur);
	return lines;
}
function makeLabel(listNo, name, width) {
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
	shade.addColorStop(.22, "rgba(244, 236, 220, 0)");
	shade.addColorStop(.78, "rgba(244, 236, 220, 0)");
	shade.addColorStop(1, "rgba(62, 46, 28, 0.4)");
	ctx.fillStyle = shade;
	ctx.fillRect(0, 0, width, height);
	const band = height * .5;
	paintInscription(ctx, listNo, name, width * .25, height * .5, width * .4, band);
	paintInscription(ctx, listNo, name, width * .75, height * .5, width * .4, band);
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.anisotropy = width >= 512 ? 8 : 2;
	texture.needsUpdate = true;
	return texture;
}
function paintInscription(ctx, listNo, name, cx, cy, maxWidth, band) {
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	let nameSize = Math.round(band * .28);
	let lines = [name];
	const minSize = Math.max(12, Math.round(band * .12));
	for (; nameSize >= minSize; nameSize -= 2) {
		ctx.font = `700 ${nameSize}px Manrope, "Noto Sans", sans-serif`;
		lines = wrapLines(ctx, name, maxWidth);
		if (!lines.some((line) => ctx.measureText(line).width > maxWidth) && lines.length <= 2) break;
	}
	const numSize = Math.round(Math.max(nameSize * 1.15, band * .34));
	const nameLH = nameSize * 1.12;
	const gap = Math.max(4, nameSize * .2);
	const nameBlock = lines.length * nameLH;
	const top = cy - (numSize + gap + nameBlock) / 2;
	ctx.font = `700 ${numSize}px Manrope, "Noto Sans", sans-serif`;
	ctx.fillStyle = SEAL;
	ctx.fillText(`${listNo}.`, cx, top + numSize / 2);
	ctx.font = `700 ${nameSize}px Manrope, "Noto Sans", sans-serif`;
	ctx.fillStyle = INK;
	for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], cx, top + numSize + gap + nameLH * i + nameLH / 2);
}
var LotteryEngine = class {
	hooks;
	host;
	gl;
	hudCanvas;
	hud;
	renderer = null;
	scene = new Scene();
	camera = new PerspectiveCamera(32, 1, .1, 2400);
	rig = new Group();
	shell = new Group();
	paddles = new Group();
	rodsGroup = new Group();
	rods = [];
	rodSteel = null;
	rodBrass = null;
	windGuide = new Group();
	windColumn = null;
	windRing = null;
	windStreaks = new Group();
	streaks = [];
	sky = null;
	skyMap = null;
	ballsGroup = new Group();
	halo;
	plaqueMap = null;
	plaque = null;
	ballGeo = new SphereGeometry(1, 64, 48);
	cage = new Group();
	chute = new Group();
	hinge = new Group();
	holeAxis = new Vector3(0, -.62, .784).normalize();
	holeRadius = .22;
	gate = 0;
	chosen = null;
	escaped = false;
	racing = true;
	balls = [];
	names = [];
	namesKey = "";
	drawCount = 1;
	speed = 1;
	mixSeconds = 6;
	gravity = 18;
	agitation = 1;
	bounce = .74;
	drag = .5;
	rodsOn = true;
	rodSpeed = 1;
	rodCount = 2;
	windOn = true;
	wind = 3;
	windWidth = .33;
	windHeight = .9;
	windPreview = false;
	suction = 1;
	windClock = 0;
	paddleOmega = 0;
	hudText = {
		kicker: "ИЗВУЧЕНО",
		resultTitle: "Извучена имена",
		of: "од"
	};
	phase = "idle";
	phaseT = 0;
	plan = [];
	planIndex = 0;
	drawn = [];
	drawnNos = [];
	completedPlan = null;
	completedKey = "";
	focus = null;
	focusFrom = new Vector3();
	mouth = new Vector3();
	hero = new Vector3(0, 1.22, 2.45);
	paddleAngle = 0;
	acc = 0;
	ballRadius = .16;
	sphereR = SPHERE_R;
	ballUser = 1;
	machineUser = 1;
	ballSeg = 0;
	bits = [];
	recorder = new DrawRecorder();
	recording = false;
	recW = 1280;
	recH = 720;
	viewW = 2;
	viewH = 2;
	bufW = 0;
	bufH = 0;
	rafId = 0;
	last = 0;
	framing = false;
	disposed = false;
	reduced = false;
	audio = null;
	noiseBuf = null;
	hitQueued = 0;
	hitWait = 0;
	azimuth = .05;
	polar = 1.32;
	zoom = 1;
	pan = new Vector3();
	dragMode = null;
	lastX = 0;
	lastY = 0;
	centerW = new Vector3();
	tmp = new Vector3();
	tmp2 = new Vector3();
	dockTmp = new Vector3();
	axis = new Vector3();
	q = new Quaternion();
	upright = new Quaternion();
	observer;
	onPointerDown;
	onPointerMove;
	onPointerUp;
	onWheel;
	onContext;
	onKeyDown;
	onKeyUp;
	keys = /* @__PURE__ */ new Set();
	constructor(host, hooks) {
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
		const haloGeo = new TorusGeometry(.34, .012, 8, 48);
		const haloMat = new MeshStandardMaterial({
			color: 13017434,
			metalness: .9,
			roughness: .3
		});
		this.halo = new Mesh(haloGeo, haloMat);
		this.halo.rotation.x = Math.PI / 2;
		this.halo.visible = false;
		this.observer = new ResizeObserver(() => this.readView());
		this.observer.observe(host);
		this.onPointerDown = (e) => {
			if (this.recording) return;
			if (e.button !== 0 && e.button !== 1 && e.button !== 2) return;
			this.dragMode = e.button === 0 && !e.shiftKey ? "orbit" : "pan";
			this.lastX = e.clientX;
			this.lastY = e.clientY;
			this.gl.style.cursor = "grabbing";
			try {
				this.gl.setPointerCapture(e.pointerId);
			} catch {}
			this.unlock();
		};
		this.onPointerMove = (e) => {
			if (!this.dragMode || this.recording) return;
			const dx = e.clientX - this.lastX;
			const dy = e.clientY - this.lastY;
			this.lastX = e.clientX;
			this.lastY = e.clientY;
			if (this.dragMode === "orbit") {
				this.azimuth -= dx * .005;
				this.polar = Math.min(Math.PI - .08, Math.max(.08, this.polar - dy * .005));
				return;
			}
			const k = 5.7 * this.span() * this.zoom * .00115;
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
		this.onPointerUp = () => {
			this.dragMode = null;
			this.gl.style.cursor = "grab";
		};
		this.onWheel = (e) => {
			if (this.recording) return;
			e.preventDefault();
			let dy = e.deltaY;
			if (e.deltaMode === 1) dy *= 16;
			else if (e.deltaMode === 2) dy *= 40;
			this.zoom = Math.min(4.5, Math.max(.28, this.zoom * Math.exp(dy * .00115)));
		};
		this.onContext = (e) => e.preventDefault();
		this.onKeyDown = (e) => {
			if (this.recording) return;
			const tag = e.target?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
			const key = e.key.toLowerCase();
			if (key !== "w" && key !== "a" && key !== "s" && key !== "d") return;
			this.keys.add(key);
			e.preventDefault();
		};
		this.onKeyUp = (e) => {
			this.keys.delete(e.key.toLowerCase());
		};
		this.gl.addEventListener("pointerdown", this.onPointerDown);
		window.addEventListener("pointermove", this.onPointerMove);
		window.addEventListener("pointerup", this.onPointerUp);
		this.gl.addEventListener("wheel", this.onWheel, { passive: false });
		this.gl.addEventListener("contextmenu", this.onContext);
		window.addEventListener("keydown", this.onKeyDown);
		window.addEventListener("keyup", this.onKeyUp);
		this.buildScene();
		document.fonts.ready.then(async () => {
			if (this.disposed) return;
			await document.fonts.load("600 64px \"Cormorant Garamond\"");
			await document.fonts.load("600 32px Manrope");
			if (this.disposed) return;
			this.relabel();
		});
	}
	buildScene() {
		let renderer;
		try {
			renderer = new WebGLRenderer({
				canvas: this.gl,
				antialias: true,
				alpha: false,
				powerPreference: "high-performance"
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
		renderer.setClearColor(460812, 1);
		renderer.outputColorSpace = SRGBColorSpace;
		renderer.toneMapping = 4;
		renderer.toneMappingExposure = 1.02;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = 2;
		this.scene.background = new Color(460812);
		this.buildSky();
		try {
			const pmrem = new PMREMGenerator(renderer);
			this.scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
			pmrem.dispose();
		} catch {}
		this.scene.add(new HemisphereLight(16051423, 2760987, .55));
		const key = new DirectionalLight(16774372, 2.35);
		key.position.set(4.6, 7.4, 3.2);
		key.castShadow = true;
		key.shadow.mapSize.set(2048, 2048);
		key.shadow.bias = -35e-5;
		key.shadow.normalBias = .028;
		key.shadow.camera.near = .4;
		key.shadow.camera.far = 26;
		key.shadow.camera.left = -6;
		key.shadow.camera.right = 6;
		key.shadow.camera.top = 6;
		key.shadow.camera.bottom = -6;
		key.target.position.set(0, .15, 0);
		this.scene.add(key, key.target);
		const fill = new DirectionalLight(12965092, .55);
		fill.position.set(-4.2, 2.4, 3.6);
		this.scene.add(fill);
		const rim = new DirectionalLight(15190410, .7);
		rim.position.set(-2.2, 3.2, -4.4);
		this.scene.add(rim);
		const brass = new MeshStandardMaterial({
			color: 13017434,
			metalness: .94,
			roughness: .28
		});
		const wood = new MeshStandardMaterial({
			color: 4863012,
			roughness: .78,
			metalness: .05
		});
		const steel = new MeshStandardMaterial({
			color: 9077884,
			metalness: .82,
			roughness: .34
		});
		this.rodSteel = steel;
		this.rodBrass = brass;
		const glass = new MeshStandardMaterial({
			color: 14018286,
			transparent: true,
			opacity: .1,
			roughness: .04,
			metalness: .22,
			side: 2,
			depthWrite: false
		});
		this.scene.add(this.rig);
		this.rig.add(this.shell);
		this.rig.add(this.ballsGroup);
		this.rig.add(this.halo);
		this.shell.add(this.paddles);
		this.shell.add(this.cage);
		this.shell.add(this.chute);
		const globe = new Mesh(new SphereGeometry(SPHERE_R, 64, 48), glass);
		globe.position.copy(CENTER);
		globe.renderOrder = 2;
		this.shell.add(globe);
		const eq = new Mesh(new TorusGeometry(1.44, .018, 12, 80), brass);
		eq.rotation.x = Math.PI / 2;
		eq.position.copy(CENTER);
		this.cage.add(eq);
		for (const y of [-.55, .55]) {
			const lat = Math.sqrt(Math.max(.05, SPHERE_R * SPHERE_R - y * y));
			const tropic = new Mesh(new TorusGeometry(lat, .012, 8, 64), brass);
			tropic.rotation.x = Math.PI / 2;
			tropic.position.set(CENTER.x, CENTER.y + y, CENTER.z);
			this.cage.add(tropic);
		}
		for (let i = 0; i < 6; i++) {
			const mer = new Mesh(new TorusGeometry(1.432, .011, 8, 72), brass);
			mer.position.copy(CENTER);
			mer.rotation.y = i * Math.PI / 6;
			this.cage.add(mer);
		}
		const axle = new Mesh(new CylinderGeometry(.03, .03, SPHERE_R * 1.85, 12), steel);
		axle.castShadow = true;
		this.paddles.add(axle);
		this.paddles.add(this.rodsGroup);
		this.layoutRods(this.rodCount);
		this.paddles.position.copy(CENTER);
		const capGeo = new CylinderGeometry(.09, .09, .08, 20);
		const topCap = new Mesh(capGeo, brass);
		topCap.position.set(0, CENTER.y + SPHERE_R + .04, 0);
		const botCap = new Mesh(capGeo, brass);
		botCap.position.set(0, CENTER.y - SPHERE_R - .02, 0);
		this.shell.add(topCap, botCap);
		const collar = new Mesh(new CylinderGeometry(.58, .78, .28, 40, 1, true), brass);
		collar.position.y = -1.06;
		collar.castShadow = true;
		collar.receiveShadow = true;
		const plinth = new Mesh(new CylinderGeometry(1.02, 1.16, .48, 48), wood);
		plinth.position.y = -1.38;
		plinth.castShadow = true;
		plinth.receiveShadow = true;
		const foot = new Mesh(new CylinderGeometry(1.22, 1.28, .1, 48), brass);
		foot.position.y = -1.66;
		foot.castShadow = true;
		foot.receiveShadow = true;
		this.shell.add(collar, plinth, foot);
		const pad = new Mesh(new BoxGeometry(4.2, .07, 1.85), wood);
		pad.position.set(0, TRAY_Y, TRAY_Z);
		pad.castShadow = true;
		pad.receiveShadow = true;
		const padRim = new Mesh(new BoxGeometry(4.36, .04, 2), brass);
		padRim.position.set(0, -1.77, TRAY_Z);
		padRim.receiveShadow = true;
		this.shell.add(pad, padRim);
		const dark = new MeshStandardMaterial({
			color: 1709586,
			roughness: .9,
			metalness: .1
		});
		const bezel = new Mesh(new TorusGeometry(.2, .028, 12, 36), brass);
		const tube = new Mesh(new CylinderGeometry(.2, .23, .12, 24, 1, true), brass);
		tube.rotation.x = Math.PI / 2;
		tube.position.z = .07;
		const throat = new Mesh(new CircleGeometry(.19, 28), dark);
		throat.position.z = -.015;
		this.hinge.position.y = .2;
		const door = new Mesh(new CylinderGeometry(.198, .198, .034, 28), brass);
		door.rotation.x = Math.PI / 2;
		door.position.set(0, -.2, .055);
		const knob = new Mesh(new SphereGeometry(.028, 12, 10), brass);
		knob.position.set(0, -.2, .05);
		this.hinge.add(door, knob);
		this.chute.add(bezel, tube, throat, this.hinge);
		this.layoutAperture();
		this.plaqueMap = this.makePlaque();
		this.plaque = new Mesh(new CylinderGeometry(1.08, 1.16, .3, 48, 1, true, -.78, 1.56), new MeshBasicMaterial({ map: this.plaqueMap }));
		this.plaque.position.y = -1.38;
		this.shell.add(this.plaque);
		this.buildGrate(brass, dark);
		const column = new Mesh(new CylinderGeometry(1, 1, 1, 40, 1, true), new MeshBasicMaterial({
			color: 12051698,
			transparent: true,
			opacity: .2,
			depthWrite: false,
			side: 2
		}));
		const ring = new Mesh(new TorusGeometry(1, .018, 8, 64), new MeshBasicMaterial({
			color: 13017434,
			transparent: true,
			opacity: .95,
			depthWrite: false
		}));
		ring.rotation.x = Math.PI / 2;
		this.windColumn = column;
		this.windRing = ring;
		this.windGuide.add(column, ring);
		this.windGuide.position.copy(CENTER);
		this.windGuide.visible = false;
		this.shell.add(this.windGuide);
		this.shell.add(this.windStreaks);
		this.updateWindGuide();
		this.camera.position.set(.28, 1.18, 5.65);
		this.hooks.onWebgl(true);
	}
	makePlaque() {
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
		ctx.font = "600 92px \"Cormorant Garamond\", serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("САВЕТОДАВНО ТЕЛО", canvas.width / 2, canvas.height / 2 + 4);
		const texture = new CanvasTexture(canvas);
		texture.colorSpace = SRGBColorSpace;
		texture.needsUpdate = true;
		return texture;
	}
	relabel() {
		if (this.plaqueMap && this.plaque) {
			const next = this.makePlaque();
			this.plaqueMap.dispose();
			this.plaqueMap = next;
			const mat = this.plaque.material;
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
	layoutAperture() {
		const s = Math.max(.001, this.span());
		this.holeRadius = Math.min(.36 * s, Math.max(.1 * s, this.ballRadius * 1.34));
		this.mouth.copy(CENTER).addScaledVector(this.holeAxis, 1.408);
		this.chute.position.copy(this.mouth);
		const z = this.holeAxis;
		const worldUp = this.tmp.set(0, 1, 0);
		const x = this.tmp2.crossVectors(worldUp, z);
		if (x.lengthSq() < 1e-6) x.set(1, 0, 0);
		x.normalize();
		const y = this.axis.crossVectors(z, x).normalize();
		const basis = new Matrix4().makeBasis(x, y, z);
		this.chute.quaternion.setFromRotationMatrix(basis);
		this.chute.scale.setScalar(this.holeRadius / s / .2);
		this.hinge.rotation.x = -2.15 * this.gate;
		this.mouth.copy(CENTER).multiplyScalar(s).addScaledVector(this.holeAxis, this.sphereR - .012 * s);
	}
	span() {
		return this.sphereR / SPHERE_R;
	}
	applyFit() {
		const n = this.names.length;
		if (n === 0) {
			this.sphereR = SPHERE_R * this.machineUser;
			this.ballRadius = .16 * this.ballUser;
		} else {
			const fit = fitSizes(n, this.ballUser, this.machineUser);
			this.sphereR = fit.sphereR;
			this.ballRadius = fit.ballRadius;
		}
		this.shell.scale.setScalar(this.span());
		this.halo.scale.setScalar(Math.max(this.span(), this.ballRadius / .16));
		this.hero.set(0, 1.22, 2.45).multiplyScalar(this.span());
		this.layoutAperture();
	}
	ensureGeo(n) {
		const seg = n > 240 ? 12 : n > 100 ? 18 : n > 40 ? 28 : 48;
		if (this.ballSeg === seg) return;
		const height = n > 100 ? Math.max(8, Math.round(seg * .62)) : Math.round(seg * .72);
		this.ballGeo.dispose();
		this.ballGeo = new SphereGeometry(1, seg, height);
		this.ballSeg = seg;
	}
	setHooks(hooks) {
		this.hooks = hooks;
	}
	setHud(copy) {
		this.hudText = copy;
	}
	setSpeed(speed) {
		this.speed = Math.min(4, Math.max(.5, speed));
	}
	setMixSeconds(seconds) {
		this.mixSeconds = Math.min(60, Math.max(2, seconds));
	}
	setPhysics(settings) {
		this.gravity = Math.min(36, Math.max(0, settings.gravity));
		this.agitation = Math.min(2.5, Math.max(0, settings.agitation));
		this.bounce = Math.min(.95, Math.max(0, settings.bounce));
		this.drag = Math.min(2.4, Math.max(0, settings.drag));
	}
	setRods(on) {
		this.rodsOn = on;
		this.rodsGroup.visible = on;
	}
	setRodSpeed(value) {
		this.rodSpeed = Math.min(3, Math.max(0, value));
	}
	setRodCount(count) {
		const next = Math.min(12, Math.max(1, Math.round(count)));
		if (next === this.rodCount && this.rods.length === next) return;
		this.layoutRods(next);
	}
	setWindWidth(value) {
		this.windWidth = Math.min(1, Math.max(.2, value));
		this.updateWindGuide();
	}
	setWindHeight(value) {
		this.windHeight = Math.min(1, Math.max(.15, value));
		this.updateWindGuide();
	}
	setWindPreview(on) {
		this.windPreview = on;
	}
	buildGrate(brass, dark) {
		const y = COLLAR_TOP;
		const radius = .56;
		const grate = new Group();
		const mouth = new Mesh(new CircleGeometry(radius * .9, 40), dark);
		mouth.rotation.x = -Math.PI / 2;
		mouth.position.y = -.9400000000000001;
		grate.add(mouth);
		for (const ringR of [
			.16,
			.32,
			.46,
			radius
		]) {
			const ring = new Mesh(new TorusGeometry(ringR, .02, 8, 36), brass);
			ring.rotation.x = Math.PI / 2;
			ring.position.y = y;
			ring.castShadow = true;
			ring.receiveShadow = true;
			grate.add(ring);
		}
		for (let i = 0; i < 8; i++) {
			const slat = new Mesh(new BoxGeometry(radius * 1.92, .022, .032), brass);
			slat.position.y = -.908;
			slat.rotation.y = i * Math.PI / 8;
			slat.castShadow = true;
			slat.receiveShadow = true;
			grate.add(slat);
		}
		this.shell.add(grate);
		const streakGeo = new BoxGeometry(.018, .2, .018);
		for (let i = 0; i < 10; i++) {
			const mesh = new Mesh(streakGeo, new MeshBasicMaterial({
				color: 15201528,
				transparent: true,
				opacity: .16,
				depthWrite: false
			}));
			this.windStreaks.add(mesh);
			this.streaks.push({
				mesh,
				phase: i / 10,
				turn: i / 10 * Math.PI * 2
			});
		}
		this.windStreaks.visible = this.windOn;
	}
	buildSky() {
		const geo = new SphereGeometry(1, 64, 40);
		const mat = new MeshBasicMaterial({
			color: 16777215,
			side: 1,
			depthWrite: false,
			toneMapped: false
		});
		const sky = new Mesh(geo, mat);
		sky.frustumCulled = false;
		sky.renderOrder = -2;
		sky.scale.setScalar(640);
		sky.rotation.set(.28, 1.22, 0);
		this.sky = sky;
		this.scene.add(sky);
		new TextureLoader().load("/textures/2k_stars_milky_way.jpg", (tex) => {
			if (this.disposed) {
				tex.dispose();
				return;
			}
			tex.colorSpace = SRGBColorSpace;
			tex.wrapS = RepeatWrapping;
			tex.wrapT = ClampToEdgeWrapping;
			tex.anisotropy = Math.min(8, this.renderer?.capabilities.getMaxAnisotropy() ?? 4);
			mat.map = tex;
			mat.color.setRGB(4.2, 4.35, 5.1);
			mat.needsUpdate = true;
			this.skyMap = tex;
		});
	}
	blowStreaks(dt) {
		const on = this.windOn && this.wind > .02;
		this.windStreaks.visible = on;
		if (!on) return;
		const rise = .28 + this.wind * .11;
		const floorY = -.88;
		const travel = Math.max(.25, this.windReachLocal() - floorY);
		for (const streak of this.streaks) {
			streak.phase = (streak.phase + dt * rise) % 1;
			const y = floorY + streak.phase * travel;
			const radius = this.windWidth * .5 * (.45 + .55 * Math.sin(streak.turn * 2));
			const angle = streak.turn + this.windClock * .2;
			streak.mesh.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
			const mat = streak.mesh.material;
			mat.opacity = .04 + Math.sin(streak.phase * Math.PI) * .14;
		}
	}
	layoutRods(count) {
		const n = Math.min(12, Math.max(1, Math.round(count)));
		this.rodCount = n;
		const steel = this.rodSteel;
		const brass = this.rodBrass;
		if (!steel || !brass) return;
		for (const child of [...this.rodsGroup.children]) {
			child.traverse((obj) => {
				obj.geometry?.dispose();
			});
			this.rodsGroup.remove(child);
		}
		const span = AXLE_HALF * 2;
		const rods = [];
		for (let i = 0; i < n; i++) {
			const y = -1.3135 + (i + 1) / (n + 1) * span;
			const radial = Math.sqrt(Math.max(.2, SPHERE_R * SPHERE_R - y * y));
			const outer = Math.max(.42, radial * .82);
			rods.push({
				angle: i * Math.PI * 2 / n,
				y,
				inner: 0,
				outer,
				radius: .034
			});
		}
		this.rods = rods;
		for (const rod of rods) {
			const pivot = new Group();
			pivot.rotation.y = rod.angle;
			const length = rod.outer - rod.inner;
			const bar = new Mesh(new CylinderGeometry(rod.radius, rod.radius * .82, length, 8), steel);
			bar.rotation.z = Math.PI / 2;
			bar.position.set(rod.inner + length / 2, rod.y, 0);
			bar.castShadow = true;
			const tip = new Mesh(new SphereGeometry(rod.radius * 1.35, 8, 6), brass);
			tip.position.set(rod.outer, rod.y, 0);
			tip.castShadow = true;
			const hub = new Mesh(new TorusGeometry(.058, Math.max(.02, rod.radius * .95), 6, 12), brass);
			hub.rotation.x = Math.PI / 2;
			hub.position.set(0, rod.y, 0);
			pivot.add(bar, tip, hub);
			this.rodsGroup.add(pivot);
		}
	}
	windReachLocal() {
		const ny = -1 + this.windHeight * 2;
		return CENTER.y + ny * SPHERE_R;
	}
	updateWindGuide() {
		const radius = Math.max(.12, this.windWidth * .52);
		const height = Math.max(.16, this.windReachLocal() - COLLAR_TOP);
		this.windColumn?.scale.set(radius, height, radius);
		if (this.windColumn) this.windColumn.position.y = height / 2;
		this.windRing?.scale.set(radius, radius, 1);
		if (this.windRing) this.windRing.position.y = height;
		this.windGuide.position.set(0, COLLAR_TOP, 0);
	}
	setSuction(value) {
		this.suction = Math.min(3, Math.max(0, value));
	}
	setWind(on, strength) {
		this.windOn = on;
		this.wind = Math.min(12, Math.max(0, strength));
	}
	setScale(ball, machine) {
		const nextBall = Math.min(2.4, Math.max(.45, ball));
		const nextMachine = Math.min(2.4, Math.max(.65, machine));
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
	setDrawCount(count) {
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
	setNames(names) {
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
	replayKey() {
		const count = Math.min(this.drawCount, this.names.length);
		return `${this.namesKey}#${count}`;
	}
	rebuildBalls() {
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
			const material = new MeshStandardMaterial({
				color: 16777215,
				map: texture,
				roughness: .46,
				metalness: .04
			});
			const group = new Group();
			const mesh = new Mesh(this.ballGeo, material);
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			group.add(mesh);
			group.scale.setScalar(this.ballRadius);
			const ball = {
				name,
				listNo: index + 1,
				pos: new Vector3(),
				vel: new Vector3(),
				radius: this.ballRadius,
				group,
				mesh,
				material,
				texture,
				inDrum: true,
				docked: false
			};
			this.placeInside(ball);
			this.balls.push(ball);
			this.ballsGroup.add(group);
		});
		for (let i = 0; i < 18; i++) this.collide();
	}
	placeInside(ball) {
		const s = this.span();
		const origin = this.dockTmp.copy(CENTER).multiplyScalar(s);
		const max = Math.max(ball.radius * .4, this.sphereR - .07 * s - ball.radius);
		for (let i = 0; i < 28; i++) {
			randomInSphere(Math.random, max * .9, this.tmp);
			ball.pos.copy(origin).add(this.tmp);
			let ok = true;
			for (const other of this.balls) {
				if (other === ball || !other.inDrum) continue;
				const min = ball.radius + other.radius + .008;
				if (ball.pos.distanceToSquared(other.pos) < min * min) {
					ok = false;
					break;
				}
			}
			if (ok) break;
		}
		const kick = .25 + Math.min(.35, this.sphereR * .08);
		ball.vel.set((Math.random() - .5) * kick, (Math.random() - .5) * kick * .6, (Math.random() - .5) * kick);
		ball.mesh.quaternion.identity();
	}
	unlock() {
		const Ctx = window.AudioContext || window.webkitAudioContext;
		if (!Ctx) return;
		if (!this.audio) this.audio = new Ctx();
		if (this.audio.state === "suspended") this.audio.resume();
	}
	noteHit(speed) {
		if (speed > this.hitQueued) this.hitQueued = speed;
	}
	flushHits(realDt) {
		this.hitWait = Math.max(0, this.hitWait - realDt);
		if (this.hitWait <= 0 && this.hitQueued > .8) {
			this.knock(Math.min(1, this.hitQueued / 4.5));
			this.hitWait = .062;
		}
		this.hitQueued = 0;
	}
	ensureNoise() {
		const ctx = this.audio;
		if (!ctx || this.noiseBuf) return;
		const rate = ctx.sampleRate;
		const len = Math.floor(rate * .05);
		const buf = ctx.createBuffer(1, len, rate);
		const data = buf.getChannelData(0);
		for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
		this.noiseBuf = buf;
	}
	knock(strength) {
		const ctx = this.audio;
		if (!ctx || ctx.state !== "running") return;
		this.ensureNoise();
		if (!this.noiseBuf) return;
		const now = ctx.currentTime;
		const src = ctx.createBufferSource();
		src.buffer = this.noiseBuf;
		const filter = ctx.createBiquadFilter();
		filter.type = "bandpass";
		filter.frequency.value = 380 + strength * 1400;
		filter.Q.value = .85;
		const gain = ctx.createGain();
		const vol = .03 + strength * .16;
		gain.gain.setValueAtTime(vol, now);
		gain.gain.exponentialRampToValueAtTime(1e-4, now + .045);
		src.connect(filter);
		filter.connect(gain);
		gain.connect(ctx.destination);
		src.start(now);
		const body = ctx.createOscillator();
		body.type = "sine";
		body.frequency.setValueAtTime(180 + strength * 220, now);
		body.frequency.exponentialRampToValueAtTime(90 + strength * 40, now + .04);
		const bodyGain = ctx.createGain();
		bodyGain.gain.setValueAtTime(vol * .55, now);
		bodyGain.gain.exponentialRampToValueAtTime(1e-4, now + .05);
		body.connect(bodyGain);
		bodyGain.connect(ctx.destination);
		body.start(now);
		body.stop(now + .055);
	}
	chime() {
		const ctx = this.audio;
		if (!ctx || ctx.state !== "running") return;
		const t = ctx.currentTime;
		const gain = ctx.createGain();
		gain.gain.setValueAtTime(1e-4, t);
		gain.gain.exponentialRampToValueAtTime(.06, t + .02);
		gain.gain.exponentialRampToValueAtTime(1e-4, t + .65);
		gain.connect(ctx.destination);
		for (const [freq, type] of [[523.25, "sine"], [784, "triangle"]]) {
			const osc = ctx.createOscillator();
			osc.type = type;
			osc.frequency.setValueAtTime(freq, t);
			osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + .2);
			osc.connect(gain);
			osc.start(t);
			osc.stop(t + .7);
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
	recordSize() {
		const aspect = this.viewW / Math.max(1, this.viewH);
		let w = 960;
		let h = Math.round(w / aspect);
		if (h > 720) {
			h = 720;
			w = Math.round(h * aspect);
		}
		if (w % 2) w += 1;
		if (h % 2) h += 1;
		return {
			w: Math.max(640, w),
			h: Math.max(360, h)
		};
	}
	begin(forceNew) {
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
	duration(phase) {
		const s = this.speed;
		if (phase === "mixing") return Math.max(2, this.mixSeconds);
		if (phase === "opening") return Math.max(.45, .9 / s);
		if (phase === "extracting") return Math.max(.7, 1.7 / s);
		if (phase === "presenting") return Math.max(.95, 1.55 / s);
		if (phase === "finale") return 3.1;
		return Infinity;
	}
	startLoop() {
		this.readView();
		this.last = 0;
		this.rafId = requestAnimationFrame(this.onFrame);
	}
	onFrame = (now) => {
		this.frame(now);
	};
	async frame(now) {
		if (this.framing || this.disposed) return;
		this.framing = true;
		try {
			if (!this.renderer) return;
			if (this.last === 0) {
				this.last = now;
				return;
			}
			const wall = Math.min(.05, (now - this.last) / 1e3);
			this.last = now;
			const dt = this.recording ? 1 / 30 : wall;
			this.readView();
			this.applySize();
			this.tick(dt);
			this.paint();
			if (this.recording) {
				while (this.recorder.busy > 2 && !this.disposed) await new Promise((resolve) => setTimeout(resolve, 10));
				if (this.disposed || !this.recording) return;
				this.recorder.capture(this.gl, this.hudCanvas, 1 / 30);
			}
		} finally {
			this.framing = false;
			if (!this.disposed) this.rafId = requestAnimationFrame(this.onFrame);
		}
	}
	readView() {
		const w = this.host.clientWidth;
		const h = this.host.clientHeight;
		if (w > 1 && h > 1) {
			this.viewW = w;
			this.viewH = h;
		}
	}
	applySize() {
		let w;
		let h;
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
	tick(realDt) {
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
			bit.vy += .85 * realDt;
			bit.rot += bit.vr * realDt;
		}
		if (this.bits.length) this.bits = this.bits.filter((bit) => bit.life > 0);
	}
	updateGate(realDt) {
		if (this.phase === "opening") this.gate = smooth(Math.min(1, this.phaseT / Math.max(.001, this.duration("opening"))));
		else if (this.phase === "extracting") this.gate = 1;
		else this.gate += (0 - this.gate) * Math.min(1, realDt * 3.2);
		this.hinge.rotation.x = -2.15 * this.gate;
	}
	stirring() {
		if (this.agitation <= .02) return false;
		if (this.phase === "mixing" || this.phase === "opening") return true;
		return this.phase === "extracting" && !this.escaped;
	}
	physics(realDt) {
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
		this.cage.rotation.y += scaled * (stir ? .22 : .03);
	}
	substep(dt) {
		const stir = this.stirring();
		const blow = this.windOn && this.wind > .02;
		this.windClock += dt;
		const spinRods = this.rodsOn && this.rodSpeed > .01;
		this.paddleOmega = spinRods ? 4.4 * this.rodSpeed : 0;
		this.paddleAngle += dt * this.paddleOmega;
		for (const ball of this.balls) {
			if (!ball.inDrum || ball === this.focus) continue;
			ball.vel.y -= this.gravity * dt;
			const c = this.worldCenter();
			const rx = ball.pos.x - c.x;
			const rz = ball.pos.z - c.z;
			if (stir) {
				const wind = 1.15 * this.agitation * this.sphereR / SPHERE_R;
				ball.vel.x += -rz * wind * dt;
				ball.vel.z += rx * wind * dt;
			}
			if (blow) {
				const scale = this.racing && !this.escaped && this.gate > .4 && (this.phase === "opening" || this.phase === "extracting") ? .22 : 1;
				const span = Math.max(.35, this.sphereR);
				const nx = rx / span;
				const ny = (ball.pos.y - c.y) / span;
				const nz = rz / span;
				const radial = Math.hypot(nx, nz);
				const width = this.windWidth;
				const t = this.windClock;
				const vents = 6;
				const ring = width * .55;
				let jet = 0;
				for (let i = 0; i < vents; i++) {
					const a = i / vents * Math.PI * 2 + t * .4;
					const dx = nx - Math.cos(a) * ring;
					const dz = nz - Math.sin(a) * ring;
					const reach = .16 + width * .2;
					jet = Math.max(jet, Math.max(0, 1 - Math.hypot(dx, dz) / reach));
				}
				const fan = Math.max(0, 1 - radial / Math.max(.22, width));
				const liftMix = Math.max(jet, fan * .7);
				const above = ny - (-1 + this.windHeight * 2);
				const heightGate = above <= 0 ? 1 : Math.max(0, 1 - above / .08);
				const lift = this.wind * (12 + this.gravity) * liftMix * heightGate * scale;
				ball.vel.y += lift * dt;
				const wobble = ball.listNo * 1.37;
				const flutter = this.wind * .55 * scale * dt;
				ball.vel.x += Math.sin(t * 1.1 + wobble) * flutter;
				ball.vel.z += Math.cos(t * .9 + wobble * .8) * flutter;
				ball.vel.x += -rz * this.wind * .28 * scale * dt;
				ball.vel.z += rx * this.wind * .28 * scale * dt;
				if (above > 0) {
					const peel = above * (18 + this.wind * 1.6) * scale;
					ball.vel.y -= peel * dt;
					if (ball.vel.y > 0) ball.vel.y *= Math.max(.15, 1 - above * 6);
					ball.vel.x += nx * peel * .45 * dt;
					ball.vel.z += nz * peel * .45 * dt;
				}
			}
			const dragK = ball === this.chosen && this.gate > .7 && !this.racing ? .08 : blow ? this.drag * .16 + .04 : this.drag * (stir ? .28 : 1.15) + (stir ? .04 : .45);
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
		this.azimuth = .05;
		this.polar = 1.32;
		this.zoom = 1;
		this.pan.set(0, 0, 0);
	}
	slideKeys(dt) {
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
	worldCenter() {
		return this.centerW.copy(CENTER).multiplyScalar(this.span());
	}
	pullToMouth(ball, dt) {
		if (this.racing) this.suck(ball, dt);
		else this.guideChosen(ball, dt);
	}
	suck(ball, dt) {
		if (this.escaped || this.gate < .4) return;
		if (this.phase !== "opening" && this.phase !== "extracting") return;
		this.tmp2.copy(this.mouth).sub(ball.pos);
		const dist = this.tmp2.length();
		if (dist < 1e-4) return;
		this.tmp2.multiplyScalar(1 / dist);
		const reach = this.sphereR * .98;
		const closeness = Math.max(0, 1 - dist / reach);
		const grab = closeness * closeness;
		const impatient = this.phase === "extracting" ? Math.min(2.4, this.phaseT * .5) : Math.min(.45, this.phaseT * .2);
		const pull = (1.6 + grab * 46 + impatient * 12) * Math.max(.4, this.gate) * this.suction;
		ball.vel.addScaledVector(this.tmp2, pull * dt);
		if (dist < this.holeRadius * 3.4) ball.vel.addScaledVector(this.holeAxis, (14 + impatient * 8) * this.suction * dt);
	}
	guideChosen(ball, dt) {
		if (ball !== this.chosen || this.gate < .72 || !ball.inDrum) return;
		if (this.phase !== "opening" && this.phase !== "extracting") return;
		this.tmp2.copy(this.mouth).sub(ball.pos);
		const dist = this.tmp2.length();
		if (dist < 1e-4) return;
		this.tmp2.multiplyScalar(1 / dist);
		const urge = (6 + Math.min(4.5, this.phase === "extracting" ? this.phaseT : this.phaseT * .45) * 10) * (.45 + this.agitation) * this.suction;
		ball.vel.addScaledVector(this.tmp2, urge * dt);
		if (dist < this.holeRadius * 2.6) ball.vel.addScaledVector(this.holeAxis, 14 * this.suction * dt);
	}
	contain(ball, dt) {
		const c = this.worldCenter();
		this.tmp.copy(ball.pos).sub(c);
		const dist = this.tmp.length();
		if (dist < 1e-6) return;
		this.tmp.multiplyScalar(1 / dist);
		const s = this.span();
		const limit = this.sphereR - .02 * s - ball.radius;
		const align = this.tmp.dot(this.holeAxis);
		const clearance = Math.max(.03 * s, this.holeRadius - ball.radius * .72);
		const holeCos = Math.cos(Math.asin(Math.min(.94, clearance / Math.max(.2, this.sphereR))));
		const nearMouth = ball.pos.distanceToSquared(this.mouth) < (this.holeRadius * 2.5) ** 2;
		const corridor = align > .72 || nearMouth;
		const openRace = this.racing && !this.escaped && this.gate > .72 && ball.inDrum;
		const openGuided = !this.racing && this.gate > .8 && ball === this.chosen && ball.inDrum;
		if ((openRace || openGuided) && corridor) {
			if (dist > this.sphereR - ball.radius * .22) this.escape(ball);
			return;
		}
		if (!openRace && this.gate > .8 && ball !== this.chosen && align > holeCos - .04) ball.vel.addScaledVector(this.tmp, -10 * dt);
		if (dist <= limit) return;
		ball.pos.copy(c).addScaledVector(this.tmp, limit);
		const vn = ball.vel.dot(this.tmp);
		if (vn > 0) {
			if (vn > 1.15) this.noteHit(vn * .65);
			ball.vel.addScaledVector(this.tmp, -(1 + this.bounce) * vn);
			const tangent = this.velTmp(ball);
			ball.vel.addScaledVector(tangent, -.08);
		}
	}
	velTmp(ball) {
		const vn = ball.vel.dot(this.tmp);
		return this.tmp2.copy(ball.vel).addScaledVector(this.tmp, -vn);
	}
	escape(ball) {
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
	pushRods(ball, dt, stir) {
		if (this.gate > .4 && ball === this.chosen && !this.racing) return;
		if (this.racing && this.gate > .45 && ball.pos.distanceToSquared(this.mouth) < (this.holeRadius * 3.2) ** 2) return;
		const s = this.span();
		const c = this.worldCenter();
		const axleR = .03 * s + ball.radius;
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
				if (rvn < -1.1) this.noteHit(-rvn * .55);
				const jn = (1 + this.bounce) * rvn;
				ball.vel.x -= jn * nx;
				ball.vel.y -= jn * ny;
				ball.vel.z -= jn * nz;
			}
			if (!stir) continue;
			const blend = Math.min(.75, 6 * dt * Math.max(.35, this.rodSpeed));
			ball.vel.x += vx * blend;
			ball.vel.z += vz * blend;
			ball.vel.y += (.55 + Math.max(0, c.y - ball.pos.y) * .35) * this.agitation * dt * 6;
		}
	}
	collide() {
		const list = this.balls;
		const inside = [];
		for (const ball of list) if (ball.inDrum) inside.push(ball);
		if (inside.length < 48) {
			for (let i = 0; i < inside.length; i++) {
				const a = inside[i];
				for (let j = i + 1; j < inside.length; j++) this.separate(a, inside[j]);
			}
			return;
		}
		const cell = Math.max(.02, this.ballRadius * 2);
		const grid = /* @__PURE__ */ new Map();
		const keyOf = (ix, iy, iz) => `${ix}|${iy}|${iz}`;
		for (const ball of inside) {
			const key = keyOf(Math.floor(ball.pos.x / cell), Math.floor(ball.pos.y / cell), Math.floor(ball.pos.z / cell));
			const bucket = grid.get(key);
			if (bucket) bucket.push(ball);
			else grid.set(key, [ball]);
		}
		const neighbors = [
			[
				1,
				0,
				0
			],
			[
				0,
				1,
				0
			],
			[
				0,
				0,
				1
			],
			[
				1,
				1,
				0
			],
			[
				1,
				-1,
				0
			],
			[
				1,
				0,
				1
			],
			[
				1,
				0,
				-1
			],
			[
				0,
				1,
				1
			],
			[
				0,
				1,
				-1
			],
			[
				1,
				1,
				1
			],
			[
				1,
				1,
				-1
			],
			[
				1,
				-1,
				1
			],
			[
				1,
				-1,
				-1
			]
		];
		for (const [key, bucket] of grid) {
			for (let i = 0; i < bucket.length; i++) {
				const a = bucket[i];
				for (let j = i + 1; j < bucket.length; j++) this.separate(a, bucket[j]);
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
	separate(a, b) {
		const e = this.bounce;
		this.tmp.copy(b.pos).sub(a.pos);
		let dist = this.tmp.length();
		const min = a.radius + b.radius;
		if (dist === 0) {
			this.tmp.set(1, 0, 0);
			dist = 1e-4;
		}
		if (dist >= min) return;
		this.tmp.multiplyScalar(1 / dist);
		const corr = (min - dist - 4e-4) * .75;
		if (corr > 0) {
			a.pos.addScaledVector(this.tmp, -corr * .5);
			b.pos.addScaledVector(this.tmp, corr * .5);
		}
		const relN = this.tmp.dot(b.vel) - this.tmp.dot(a.vel);
		if (relN < 0) {
			if (relN < -.85) this.noteHit(-relN);
			const jn = -(1 + e) * relN / 2;
			a.vel.addScaledVector(this.tmp, -jn);
			b.vel.addScaledVector(this.tmp, jn);
		}
		this.tmp2.copy(b.vel).sub(a.vel);
		const vn = this.tmp2.dot(this.tmp);
		this.tmp2.addScaledVector(this.tmp, -vn);
		a.vel.addScaledVector(this.tmp2, .08);
		b.vel.addScaledVector(this.tmp2, -.08);
	}
	spinBall(ball, dt) {
		if (!ball.inDrum || ball.docked) return;
		this.tmp.set(ball.vel.x, ball.vel.y, ball.vel.z);
		const speed = this.tmp.length();
		if (speed < .04) return;
		const c = this.worldCenter();
		this.tmp2.set(ball.pos.x - c.x, ball.pos.y - c.y, ball.pos.z - c.z);
		if (this.tmp2.lengthSq() < 1e-6) return;
		this.axis.crossVectors(this.tmp2, this.tmp);
		const mag = this.axis.length();
		if (mag < 1e-5) return;
		this.axis.multiplyScalar(1 / mag);
		this.q.setFromAxisAngle(this.axis, speed / ball.radius * dt);
		ball.mesh.quaternion.premultiply(this.q);
	}
	nearestInDrum() {
		let best = null;
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
	advance(realDt) {
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
				const limit = this.racing ? 4.2 : 3.1 / Math.max(.45, Math.min(1.2, this.speed));
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
				const ball = name ? this.balls.find((item) => item.inDrum && item.name === name) : void 0;
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
			if (this.recording) this.finishRecording();
		}
	}
	enterFinale() {
		this.focus = null;
		this.halo.visible = false;
		this.phase = "finale";
		this.phaseT = 0;
		this.completedPlan = this.plan.slice();
		this.completedKey = this.replayKey();
		this.hooks.onPhase("finale");
	}
	dockFocus() {
		const ball = this.focus;
		if (!ball) return;
		this.slotPosition(this.planIndex, ball.pos);
		ball.docked = true;
		ball.group.scale.setScalar(ball.radius * this.dockMul());
		this.focus = null;
		this.halo.visible = false;
	}
	dockMul() {
		return this.plan.length > 24 ? .58 : .8;
	}
	slotPosition(index, target) {
		const n = Math.max(1, this.plan.length);
		const cols = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(n * 1.7))));
		const col = index % cols;
		const row = Math.floor(index / cols);
		const rows = Math.ceil(n / cols);
		const s = this.span();
		const diameter = this.ballRadius * this.dockMul() * 2;
		const gap = Math.min(.42 * s, Math.max(diameter * 1.25, .16 * s));
		const x = (col - (Math.min(cols, n) - 1) / 2) * gap;
		const z = TRAY_Z * s + (row - (rows - 1) / 2) * gap * .72;
		const y = -1.705 * s + this.ballRadius * this.dockMul();
		target.set(x, y, z);
	}
	updateFocus() {
		const ball = this.focus;
		const showHalo = this.phase === "presenting" || this.phase === "extracting" && this.escaped;
		this.halo.visible = showHalo && !!ball;
		if (!ball) return;
		if (this.phase === "extracting" && this.escaped) {
			const e = smooth(Math.min(1, this.phaseT / this.duration("extracting")));
			this.chuteExit(this.dockTmp);
			if (e < .42) ball.pos.lerpVectors(this.focusFrom, this.dockTmp, smooth(e / .42));
			else ball.pos.lerpVectors(this.dockTmp, this.hero, smooth((e - .42) / .58));
			const mul = e < .4 ? 1 : 1 + 1.15 * smooth((e - .4) / .6);
			ball.group.scale.setScalar(ball.radius * mul);
			if (e > .45) ball.mesh.quaternion.slerp(this.upright, Math.min(1, (e - .45) * 1.6));
		} else if (this.phase === "presenting") {
			const t = Math.min(1, this.phaseT / this.duration("presenting"));
			ball.mesh.quaternion.slerp(this.upright, .18);
			if (t < .76) {
				ball.pos.copy(this.hero);
				ball.pos.y += Math.sin(this.phaseT * 3.2) * .035;
				ball.group.scale.setScalar(ball.radius * 2.15);
			} else {
				const k = smooth((t - .76) / .24);
				this.slotPosition(this.planIndex, this.dockTmp);
				ball.pos.lerpVectors(this.hero, this.dockTmp, k);
				const mul = 2.15 + (this.dockMul() - 2.15) * k;
				ball.group.scale.setScalar(ball.radius * mul);
			}
		}
		this.halo.position.set(this.hero.x, this.hero.y - .55, this.hero.z);
	}
	chuteExit(target) {
		const reach = .28 * (this.holeRadius / .2);
		target.copy(this.mouth).addScaledVector(this.holeAxis, reach);
	}
	spawnConfetti() {
		const count = this.reduced ? 18 : 84;
		for (let i = 0; i < count; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = .18 + Math.random() * .55;
			this.bits.push({
				x: .5 + (Math.random() - .5) * .08,
				y: .4,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed * .65 - .35,
				rot: Math.random() * Math.PI,
				vr: (Math.random() - .5) * 8,
				w: .008 + Math.random() * .012,
				h: .014 + Math.random() * .02,
				color: CONFETTI[i % CONFETTI.length],
				life: 1.15 + Math.random() * .7,
				max: 1.6
			});
		}
	}
	paint() {
		if (!this.renderer) return;
		this.windGuide.visible = this.windPreview && !this.recording;
		this.placeCamera();
		this.fitSky();
		this.renderer.render(this.scene, this.camera);
		this.drawHud();
	}
	placeCamera() {
		const dist = 5.7 * this.span() * this.zoom;
		const target = this.worldCenter();
		target.add(this.pan);
		const sp = Math.sin(this.polar);
		this.camera.position.set(target.x + dist * sp * Math.sin(this.azimuth), target.y + dist * Math.cos(this.polar), target.z + dist * sp * Math.cos(this.azimuth));
		this.camera.lookAt(target);
		this.camera.near = Math.max(.05, dist * .012);
	}
	fitSky() {
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
	drawHud() {
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
	drawCeremony(ctx, w, h, u) {
		const shown = Math.min(this.plan.length, this.drawn.length + (this.phase === "extracting" || this.phase === "mixing" || this.phase === "opening" ? 1 : 0));
		const label = `${Math.max(shown, this.drawn.length)} ${this.hudText.of} ${this.plan.length}`;
		ctx.save();
		ctx.font = `600 ${Math.round(18 * u)}px Manrope, sans-serif`;
		const padX = 16 * u;
		const pillW = ctx.measureText(label).width + padX * 2;
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
		const cardW = Math.min(w * .8, 680 * u);
		const cardH = Math.max(120 * u, Math.min(h * .24, 180 * u));
		const cx = (w - cardW) / 2;
		const cy = h * .7;
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
		ctx.fillText(this.hudText.kicker.split("").join("  "), w / 2, cy + cardH * .28);
		ctx.fillStyle = INK;
		let fontSize = Math.round(54 * u);
		const maxWidth = cardW * .86;
		let drawnName = false;
		for (; fontSize > 18 * u; fontSize -= 2) {
			ctx.font = `600 ${fontSize}px "Cormorant Garamond", serif`;
			const lines = wrapLines(ctx, inscription, maxWidth);
			if (!(lines.length <= 3 && lines.every((line) => ctx.measureText(line).width <= maxWidth)) && fontSize > 20 * u) continue;
			const lh = fontSize * 1.05;
			const start = cy + cardH * .62 - (lines.length - 1) * lh / 2;
			for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], w / 2, start + i * lh, maxWidth);
			drawnName = true;
			break;
		}
		if (!drawnName) ctx.fillText(inscription, w / 2, cy + cardH * .62, maxWidth);
		ctx.restore();
	}
	drawBoard(ctx, w, h, u) {
		ctx.save();
		ctx.fillStyle = "rgba(20, 18, 14, 0.72)";
		ctx.fillRect(0, 0, w, h);
		const names = this.drawn;
		const cols = names.length > 18 ? 3 : names.length > 7 ? 2 : 1;
		const rows = Math.max(1, Math.ceil(names.length / cols));
		const panelW = Math.min(w * .88, (cols === 1 ? 640 : cols === 2 ? 920 : 1100) * u);
		const titleH = 78 * u;
		const rowH = Math.max(22 * u, Math.min(42 * u, (h * .62 - titleH) / rows));
		const panelH = Math.min(h * .84, titleH + rows * rowH + 28 * u);
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
		ctx.fillText(this.hudText.resultTitle, w / 2, y + titleH * .55);
		ctx.font = `600 ${Math.round(Math.min(22, rowH * .46))}px Manrope, sans-serif`;
		const colW = panelW / cols;
		names.forEach((name, index) => {
			const col = index % cols;
			const row = Math.floor(index / cols);
			const tx = x + col * colW + colW / 2;
			const ty = y + titleH + row * rowH + rowH / 2;
			const line = `${this.drawnNos[index] ?? index + 1}. ${name}`;
			ctx.fillStyle = index === names.length - 1 ? SEAL : INK;
			ctx.fillText(line, tx, ty, colW - 24 * u);
		});
		ctx.restore();
	}
	drawBits(ctx, w, h) {
		for (const bit of this.bits) {
			const alpha = Math.max(0, Math.min(1, bit.life / (bit.max * .45)));
			ctx.save();
			ctx.translate(bit.x * w, bit.y * h);
			ctx.rotate(bit.rot);
			ctx.globalAlpha = alpha;
			ctx.fillStyle = bit.color;
			ctx.fillRect(-bit.w * w / 2, -bit.h * h / 2, bit.w * w, bit.h * h);
			ctx.restore();
		}
	}
	async finishRecording() {
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
		this.gl.removeEventListener("wheel", this.onWheel);
		this.gl.removeEventListener("contextmenu", this.onContext);
		window.removeEventListener("keydown", this.onKeyDown);
		window.removeEventListener("keyup", this.onKeyUp);
		this.recorder.cancel();
		for (const ball of this.balls) {
			ball.texture.dispose();
			ball.material.dispose();
		}
		this.ballGeo.dispose();
		this.plaqueMap?.dispose();
		this.skyMap?.dispose();
		this.sky?.geometry.dispose();
		(this.sky?.material)?.dispose();
		this.renderer?.dispose();
		this.gl.remove();
		this.hudCanvas.remove();
		this.audio?.close();
	}
};
function labelWidth(count) {
	if (count > 320) return 128;
	if (count > 140) return 256;
	if (count > 60) return 384;
	if (count > 28) return 512;
	return 1024;
}
//#endregion
export { LotteryEngine };
