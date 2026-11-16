import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Eraser, i as Play, n as Sparkles, o as Clapperboard, r as RotateCcw, s as ChevronDown } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Ee1pkBc6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COPY = {
	sr: {
		subtitle: "Извлачење имена из бубња",
		madeBy: "Направио",
		author: "Марко Његомир",
		langToggle: "English",
		names: "Имена",
		namesHint: "Налепите једно име у сваки ред.",
		howMany: "Колико извући",
		speed: "Брзина симулације",
		mixTime: "Мешање пре отварања",
		mixHint: "Секунде док су све лоптице у кугли. Отвор се тек онда отвара и једна испада.",
		physics: "Физика",
		ballSize: "Величина лоптица",
		machineSize: "Величина апаратуре",
		cameraHint: "Превлачење окреће камеру, точкић зумира, десни тастер или WASD помера.",
		resetCamera: "Ресетуј камеру",
		rods: "Шипке",
		rodCount: "Број шипки",
		rodSpeed: "Брзина шипки",
		wind: "Ветар одоздо",
		windStrength: "Јачина ветра",
		windWidth: "Ширина ветра",
		windHeight: "Висина ветра",
		windHint: "Дува навише кроз решетку. Ширина и висина одређују докле стиже.",
		suction: "Јачина усисавања",
		gravity: "Гравитација",
		agitation: "Снага мешања",
		bounce: "Одскок",
		drag: "Отпор",
		start: "Почни извлачење",
		restart: "Понови извлачење",
		clear: "Обриши списак",
		record: "Извези MP4",
		recording: "Снимање…",
		recordHint: "Снима цело извлачење и коначан списак, па преузима MP4.",
		recordReplayHint: "Поново пушта последње извлачење, истим редом.",
		download: "Преузми MP4",
		drawnTitle: "Извучена имена",
		drawnEmpty: "Још нико није извучен.",
		sample: "Учитај пример",
		statusReady: "Спремно",
		statusMixing: "Мешање у кугли",
		statusOpening: "Отвор усисава",
		statusExtracting: "Лоптица испада",
		statusPresenting: "Извучено",
		statusFinale: "Резултат",
		statusDone: "Завршено",
		unsupported: "Овај прегледач не уме да сними MP4. Отворите страницу у Chrome-у или Edge-у.",
		exportFailed: "Снимање није успело. Покушајте поново.",
		exportSaved: "Видео је сачуван.",
		noWebgl: "Прегледач није покренуо 3Д приказ.",
		tooMany: "Уписано је само првих 500 имена.",
		drawnWord: "ИЗВУЧЕНО",
		resultTitle: "Извучена имена",
		of: "од",
		inDrum: "У бубњу"
	},
	en: {
		subtitle: "Drawing names from the drum",
		madeBy: "Made by",
		author: "Marko Njegomir",
		langToggle: "Српски",
		names: "Names",
		namesHint: "Paste one name per line.",
		howMany: "How many to draw",
		speed: "Simulation speed",
		mixTime: "Spin before opening",
		mixHint: "Seconds all balls stay in the sphere. The hatch then opens and one ball drops out.",
		physics: "Physics",
		ballSize: "Ball size",
		machineSize: "Machine size",
		cameraHint: "Drag orbits the camera, scroll zooms, right-drag or WASD pans.",
		resetCamera: "Reset camera",
		rods: "Beater bars",
		rodCount: "Number of bars",
		rodSpeed: "Bar speed",
		wind: "Wind from below",
		windStrength: "Wind strength",
		windWidth: "Wind width",
		windHeight: "Wind height",
		windHint: "Blows up through the grate. Width and height set how far it reaches.",
		suction: "Suction strength",
		gravity: "Gravity",
		agitation: "Mixing force",
		bounce: "Bounce",
		drag: "Drag",
		start: "Start draw",
		restart: "Restart draw",
		clear: "Clear list",
		record: "Export MP4",
		recording: "Recording…",
		recordHint: "Records the full draw and the final list, then downloads an MP4.",
		recordReplayHint: "Replays the last draw in the same order.",
		download: "Download MP4",
		drawnTitle: "Drawn names",
		drawnEmpty: "No one has been drawn yet.",
		sample: "Load sample",
		statusReady: "Ready",
		statusMixing: "Mixing in the sphere",
		statusOpening: "Hatch drawing in",
		statusExtracting: "Ball dropping",
		statusPresenting: "Drawn",
		statusFinale: "Result",
		statusDone: "Finished",
		unsupported: "This browser can't export MP4. Open the page in Chrome or Edge.",
		exportFailed: "Recording failed. Try again.",
		exportSaved: "Video saved.",
		noWebgl: "This browser couldn't start the 3D view.",
		tooMany: "Only the first 500 names were used.",
		drawnWord: "DRAWN",
		resultTitle: "Drawn names",
		of: "of",
		inDrum: "In the drum"
	}
};
function hudCopy(lang) {
	const t = COPY[lang];
	return {
		kicker: t.drawnWord,
		resultTitle: t.resultTitle,
		of: t.of
	};
}
var SAMPLE_TEXT = [
	"Ана",
	"Бојан",
	"Весна",
	"Гордана",
	"Дејан",
	"Елена",
	"Жељко",
	"Зорица",
	"Иван",
	"Јелена",
	"Катарина",
	"Лазар",
	"Љиљана",
	"Милица",
	"Ненад",
	"Олга",
	"Петар",
	"Радмила",
	"Стефан",
	"Тамара"
].join("\n");
var LEGACY_SAMPLE_TEXT = [
	"Ана Петровић",
	"Бојан Илић",
	"Весна Костић",
	"Гордана Симић",
	"Дејан Поповић",
	"Елена Марковић",
	"Жељко Стојановић",
	"Зорица Ђорђевић",
	"Иван Радић",
	"Јелена Николић",
	"Катарина Вучетић",
	"Лазар Милошевић",
	"Љиљана Његован",
	"Милица Јовановић",
	"Ненад Павловић",
	"Олга Стевановић",
	"Петар Ковачевић",
	"Радмила Живковић",
	"Стефан Томић",
	"Тамара Лазић"
].join("\n");
function parseNames(text) {
	const names = [];
	let truncated = false;
	for (const line of text.split(/\r?\n/)) {
		const name = line.trim();
		if (!name) continue;
		if (names.length >= 500) {
			truncated = true;
			break;
		}
		names.push(name);
	}
	return {
		names,
		truncated
	};
}
var STORAGE_KEY = "savetodavno-telo-v1";
function clampNum(value, fallback, min, max) {
	return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}
function loadSave() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (data.lang !== "sr" && data.lang !== "en") return null;
		if (typeof data.text !== "string") return null;
		const tune = typeof data.tune === "number" ? data.tune : 0;
		const keptRods = tune >= 3;
		const keptWind = tune >= 4;
		return {
			lang: data.lang,
			text: data.text,
			count: data.pickDefault === 1 && typeof data.count === "number" ? data.count : 1,
			speed: clampNum(data.speed, 1, .5, 4),
			mix: clampNum(data.mix, 6, 2, 60),
			gravity: clampNum(data.gravity, 18, 0, 36),
			agitation: clampNum(data.agitation, 1, 0, 2.5),
			bounce: clampNum(data.bounce, .74, 0, .95),
			drag: clampNum(data.drag, .5, 0, 2.4),
			ball: clampNum(data.ball, 1, .45, 2.4),
			machine: clampNum(data.machine, 1, .65, 2.4),
			rods: data.rods !== false,
			rodCount: keptRods ? clampNum(data.rodCount, 2, 1, 12) : 2,
			rodSpeed: clampNum(data.rodSpeed, 1, 0, 3),
			windOn: tune >= 3 ? data.windOn !== false : true,
			wind: keptWind ? clampNum(data.wind, 3, 0, 12) : 3,
			windWidth: tune >= 3 ? clampNum(data.windWidth, .33, .2, 1) : .33,
			windHeight: keptWind ? clampNum(data.windHeight, .9, .15, 1) : .9,
			suction: clampNum(data.suction, 1, 0, 3),
			pickDefault: 1,
			tune: 4
		};
	} catch {
		return null;
	}
}
function statusLabel(phase, t) {
	if (phase === "mixing") return t.statusMixing;
	if (phase === "opening") return t.statusOpening;
	if (phase === "extracting") return t.statusExtracting;
	if (phase === "presenting") return t.statusPresenting;
	if (phase === "finale") return t.statusFinale;
	if (phase === "done") return t.statusDone;
	return t.statusReady;
}
function FlagSerbia() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 18 12",
		className: "h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/30",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "18",
				height: "4",
				fill: "#C6363C"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				y: "4",
				width: "18",
				height: "4",
				fill: "#0C4076"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				y: "8",
				width: "18",
				height: "4",
				fill: "#FFFFFF"
			})
		]
	});
}
function FlagUSA() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 19 10",
		className: "h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/30",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "19",
				height: "10",
				fill: "#B22234"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				y: "1",
				width: "19",
				height: "1",
				fill: "#FFFFFF"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				y: "3",
				width: "19",
				height: "1",
				fill: "#FFFFFF"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				y: "5",
				width: "19",
				height: "1",
				fill: "#FFFFFF"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				y: "7",
				width: "19",
				height: "1",
				fill: "#FFFFFF"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				y: "9",
				width: "19",
				height: "1",
				fill: "#FFFFFF"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "8",
				height: "5.5",
				fill: "#3C3B6E"
			})
		]
	});
}
function Toggle({ id, label, checked, disabled, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex h-11 items-center justify-between gap-3 text-sm font-semibold",
		htmlFor: id,
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			id,
			type: "checkbox",
			checked,
			disabled,
			onChange: (event) => onChange(event.target.checked),
			className: "size-5 accent-brass disabled:opacity-60"
		})]
	});
}
function Slider({ id, label, value, min, max, step, display, disabled, onChange, onGrab, onRelease }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex flex-col gap-1.5 text-sm font-semibold",
		htmlFor: id,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center justify-between gap-3",
			children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium text-brass tabular-nums",
				children: display
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			id,
			type: "range",
			min,
			max,
			step,
			value,
			disabled,
			onChange: (event) => onChange(Number(event.target.value)),
			onPointerDown: () => {
				onGrab?.();
				if (!onRelease) return;
				const end = () => {
					onRelease();
					window.removeEventListener("pointerup", end);
					window.removeEventListener("pointercancel", end);
				};
				window.addEventListener("pointerup", end);
				window.addEventListener("pointercancel", end);
			},
			className: "h-10 w-full accent-brass disabled:opacity-60"
		})]
	});
}
function NameList({ value, disabled, placeholder, onChange }) {
	const gutterRef = (0, import_react.useRef)(null);
	const lines = value.split("\n");
	let count = 0;
	const numbers = lines.map((line) => line.trim() ? ++count : 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-40 flex-1 overflow-hidden rounded-md border border-line bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: gutterRef,
			"aria-hidden": "true",
			className: "w-11 shrink-0 overflow-hidden bg-surface py-3 pr-2 text-right text-sm leading-6 font-semibold text-brass tabular-nums select-none",
			children: numbers.map((num, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-6",
				children: num || ""
			}, index))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			id: "names",
			value,
			disabled,
			spellCheck: false,
			wrap: "off",
			placeholder,
			onScroll: (event) => {
				if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
			},
			onChange: (event) => onChange(event.target.value),
			className: "min-h-40 w-full flex-1 resize-y overflow-auto bg-transparent px-3 py-3 text-base leading-6 whitespace-pre text-fg placeholder:text-muted disabled:opacity-60"
		})]
	});
}
function LotteryApp() {
	const hostRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	const [lang, setLang] = (0, import_react.useState)("sr");
	const [text, setText] = (0, import_react.useState)(SAMPLE_TEXT);
	const [count, setCount] = (0, import_react.useState)(1);
	const [speed, setSpeed] = (0, import_react.useState)(1);
	const [mix, setMix] = (0, import_react.useState)(6);
	const [gravity, setGravity] = (0, import_react.useState)(18);
	const [agitation, setAgitation] = (0, import_react.useState)(1);
	const [bounce, setBounce] = (0, import_react.useState)(.74);
	const [drag, setDrag] = (0, import_react.useState)(.5);
	const [ballScale, setBallScale] = (0, import_react.useState)(1);
	const [machineScale, setMachineScale] = (0, import_react.useState)(1);
	const [rodsOn, setRodsOn] = (0, import_react.useState)(true);
	const [rodCount, setRodCount] = (0, import_react.useState)(2);
	const [rodSpeed, setRodSpeed] = (0, import_react.useState)(1);
	const [windOn, setWindOn] = (0, import_react.useState)(true);
	const [wind, setWind] = (0, import_react.useState)(3);
	const [windWidth, setWindWidth] = (0, import_react.useState)(.33);
	const [windHeight, setWindHeight] = (0, import_react.useState)(.9);
	const [suction, setSuction] = (0, import_react.useState)(1);
	const [drawn, setDrawn] = (0, import_react.useState)([]);
	const [numbers, setNumbers] = (0, import_react.useState)([]);
	const [phase, setPhase] = (0, import_react.useState)("idle");
	const [record, setRecord] = (0, import_react.useState)("idle");
	const [videoUrl, setVideoUrl] = (0, import_react.useState)(null);
	const [webgl, setWebgl] = (0, import_react.useState)(true);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [canReplay, setCanReplay] = (0, import_react.useState)(false);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const t = COPY[lang];
	const parsed = parseNames(text);
	const busy = phase === "mixing" || phase === "opening" || phase === "extracting" || phase === "presenting" || record === "recording";
	const nameCount = parsed.names.length;
	const drawCount = Math.min(Math.max(1, count), Math.max(1, nameCount));
	const namesKey = parsed.names.join("\n");
	const textRef = (0, import_react.useRef)(text);
	const drawCountRef = (0, import_react.useRef)(drawCount);
	const speedRef = (0, import_react.useRef)(speed);
	const mixRef = (0, import_react.useRef)(mix);
	const physicsRef = (0, import_react.useRef)({
		gravity,
		agitation,
		bounce,
		drag
	});
	const scaleRef = (0, import_react.useRef)({
		ball: ballScale,
		machine: machineScale
	});
	const rodsRef = (0, import_react.useRef)(rodsOn);
	const rodCountRef = (0, import_react.useRef)(rodCount);
	const rodSpeedRef = (0, import_react.useRef)(rodSpeed);
	const windRef = (0, import_react.useRef)({
		on: windOn,
		strength: wind,
		width: windWidth,
		height: windHeight
	});
	const suctionRef = (0, import_react.useRef)(suction);
	const langRef = (0, import_react.useRef)(lang);
	textRef.current = text;
	drawCountRef.current = drawCount;
	speedRef.current = speed;
	mixRef.current = mix;
	physicsRef.current = {
		gravity,
		agitation,
		bounce,
		drag
	};
	scaleRef.current = {
		ball: ballScale,
		machine: machineScale
	};
	rodsRef.current = rodsOn;
	rodCountRef.current = rodCount;
	rodSpeedRef.current = rodSpeed;
	windRef.current = {
		on: windOn,
		strength: wind,
		width: windWidth,
		height: windHeight
	};
	suctionRef.current = suction;
	langRef.current = lang;
	const hooksRef = (0, import_react.useRef)({
		onDrawn: () => void 0,
		onPhase: () => void 0,
		onRecord: () => void 0,
		onFile: () => void 0,
		onWebgl: () => void 0
	});
	hooksRef.current.onDrawn = (names, nums) => {
		setDrawn(names);
		setNumbers(nums);
	};
	hooksRef.current.onPhase = (next) => {
		setPhase(next);
		setCanReplay(engineRef.current?.canReplay() ?? false);
	};
	hooksRef.current.onRecord = (state) => setRecord(state);
	hooksRef.current.onFile = (blob) => {
		const url = URL.createObjectURL(blob);
		setVideoUrl((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return url;
		});
		const link = document.createElement("a");
		link.href = url;
		link.download = "savetodavno-telo.mp4";
		link.click();
	};
	hooksRef.current.onWebgl = (ok) => setWebgl(ok);
	(0, import_react.useEffect)(() => {
		const saved = loadSave();
		if (saved) {
			setLang(saved.lang);
			setText(saved.text);
			setCount(saved.count);
			setSpeed(saved.speed);
			setMix(saved.mix);
			setGravity(saved.gravity);
			setAgitation(saved.agitation);
			setBounce(saved.bounce);
			setDrag(saved.drag);
			setBallScale(saved.ball);
			setMachineScale(saved.machine);
			setRodsOn(saved.rods);
			setRodCount(saved.rodCount);
			setRodSpeed(saved.rodSpeed);
			setWindOn(saved.windOn);
			setWind(saved.wind);
			setWindWidth(saved.windWidth);
			setWindHeight(saved.windHeight);
			setSuction(saved.suction);
			if (saved.text === LEGACY_SAMPLE_TEXT) setText(SAMPLE_TEXT);
		}
		setHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		const payload = {
			lang,
			text,
			count,
			speed,
			mix,
			gravity,
			agitation,
			bounce,
			drag,
			ball: ballScale,
			machine: machineScale,
			rods: rodsOn,
			rodCount,
			rodSpeed,
			windOn,
			wind,
			windWidth,
			windHeight,
			suction,
			pickDefault: 1,
			tune: 4
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
		document.documentElement.lang = lang === "sr" ? "sr" : "en";
	}, [
		hydrated,
		lang,
		text,
		count,
		speed,
		mix,
		gravity,
		agitation,
		bounce,
		drag,
		ballScale,
		machineScale,
		rodsOn,
		rodCount,
		rodSpeed,
		windOn,
		wind,
		windWidth,
		windHeight,
		suction
	]);
	(0, import_react.useEffect)(() => {
		if (!hostRef.current) return;
		let dead = false;
		let engine = null;
		import("./engine-YgIejwKk.mjs").then(({ LotteryEngine }) => {
			if (dead || !hostRef.current) return;
			engine = new LotteryEngine(hostRef.current, hooksRef.current);
			engineRef.current = engine;
			engine.setHud(hudCopy(langRef.current));
			engine.setSpeed(speedRef.current);
			engine.setMixSeconds(mixRef.current);
			engine.setPhysics(physicsRef.current);
			engine.setScale(scaleRef.current.ball, scaleRef.current.machine);
			engine.setRods(rodsRef.current);
			engine.setRodCount(rodCountRef.current);
			engine.setRodSpeed(rodSpeedRef.current);
			engine.setWind(windRef.current.on, windRef.current.strength);
			engine.setWindWidth(windRef.current.width);
			engine.setWindHeight(windRef.current.height);
			engine.setSuction(suctionRef.current);
			engine.setDrawCount(drawCountRef.current);
			engine.setNames(parseNames(textRef.current).names);
			engine.startLoop();
			setReady(true);
			setCanReplay(engine.canReplay());
		});
		return () => {
			dead = true;
			engine?.dispose();
			engineRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setHud(hudCopy(lang));
	}, [lang]);
	(0, import_react.useEffect)(() => {
		const handle = window.setTimeout(() => {
			engineRef.current?.setNames(parseNames(textRef.current).names);
			setCanReplay(engineRef.current?.canReplay() ?? false);
		}, 180);
		return () => window.clearTimeout(handle);
	}, [namesKey]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setSpeed(speed);
	}, [speed]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setMixSeconds(mix);
	}, [mix]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setPhysics({
			gravity,
			agitation,
			bounce,
			drag
		});
	}, [
		gravity,
		agitation,
		bounce,
		drag
	]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setScale(ballScale, machineScale);
	}, [ballScale, machineScale]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setRods(rodsOn);
	}, [rodsOn]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setRodCount(rodCount);
	}, [rodCount]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setRodSpeed(rodSpeed);
	}, [rodSpeed]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setWind(windOn, wind);
	}, [windOn, wind]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setWindWidth(windWidth);
	}, [windWidth]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setWindHeight(windHeight);
	}, [windHeight]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setSuction(suction);
	}, [suction]);
	(0, import_react.useEffect)(() => {
		engineRef.current?.setDrawCount(drawCount);
		setCanReplay(engineRef.current?.canReplay() ?? false);
	}, [drawCount]);
	(0, import_react.useEffect)(() => {
		return () => {
			if (videoUrl) URL.revokeObjectURL(videoUrl);
		};
	}, [videoUrl]);
	const recordMessage = record === "unsupported" ? t.unsupported : record === "error" ? t.exportFailed : record === "saved" ? t.exportSaved : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg lg:h-dvh lg:overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-line px-4 py-3 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 shrink-0 place-items-center rounded-full border border-brass",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-3 rounded-full bg-brass" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl leading-none text-fg sm:text-4xl",
						children: "Саветодавно тело"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							t.madeBy,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "text-brass underline decoration-brass/50 underline-offset-2 hover:decoration-brass",
								href: "https://x.com/njmarko",
								target: "_blank",
								rel: "noreferrer",
								children: t.author
							})
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex h-11 items-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-semibold text-fg",
					onClick: () => setLang((current) => current === "sr" ? "en" : "sr"),
					children: [lang === "sr" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlagUSA, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlagSerbia, {}), t.langToggle]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22.5rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-h-[48vh] bg-bg lg:min-h-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							ref: hostRef,
							className: "absolute inset-0"
						}),
						record === "recording" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-none absolute top-4 right-4 z-10 flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-sm text-fg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-seal" }), t.recording]
						}) : null,
						!webgl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "absolute inset-0 grid place-items-center px-6 text-center text-muted",
							children: t.noWebgl
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://www.solarsystemscope.com/textures/",
							target: "_blank",
							rel: "noreferrer",
							className: "absolute bottom-2 left-3 z-10 text-[10px] tracking-wide text-white/40 hover:text-white/70",
							children: "Млечни пут · Solar System Scope · CC BY 4.0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "sr-only",
							"aria-live": "assertive",
							children: phase === "presenting" && drawn.length > 0 ? `${t.drawnWord} ${drawn[drawn.length - 1]}` : ""
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "flex flex-col gap-4 overflow-y-auto border-t border-line p-4 lg:border-t-0 lg:border-l",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-sm font-semibold",
								htmlFor: "names",
								children: t.names
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm text-muted tabular-nums",
								children: [nameCount, nameCount > 0 ? ` · ${t.inDrum}` : ""]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NameList, {
							value: text,
							disabled: busy,
							placeholder: t.namesHint,
							onChange: setText
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: parsed.truncated ? t.tooMany : t.namesHint
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-2 text-sm font-semibold",
							htmlFor: "count",
							children: [t.howMany, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "count",
								type: "number",
								min: 1,
								max: Math.max(1, nameCount),
								disabled: busy || nameCount === 0,
								value: drawCount,
								onChange: (event) => {
									const next = Number(event.target.value);
									if (!Number.isFinite(next)) return;
									setCount(Math.max(1, Math.min(500, Math.round(next))));
								},
								className: "h-11 rounded-md border border-line bg-bg px-3 text-base font-medium text-fg disabled:opacity-60"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
							id: "mix",
							label: t.mixTime,
							value: mix,
							min: 2,
							max: 60,
							step: 1,
							display: `${mix.toFixed(0)} s`,
							disabled: record === "recording",
							onChange: setMix
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "-mt-2 text-sm text-muted",
							children: t.mixHint
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "-mt-2 text-sm text-muted",
							children: t.cameraHint
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => engineRef.current?.resetCamera(),
							className: "inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-semibold text-fg",
							children: t.resetCamera
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
							className: "group rounded-md border border-line bg-surface",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
								className: "flex cursor-pointer list-none items-center justify-between px-3 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden",
								children: [t.physics, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
									className: "size-4 text-muted transition-transform group-open:rotate-180",
									"aria-hidden": "true"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 px-3 pb-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										id: "speed",
										label: t.speed,
										value: speed,
										min: .5,
										max: 4,
										step: .1,
										display: `${speed.toFixed(1)}×`,
										disabled: record === "recording",
										onChange: setSpeed
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										id: "ball-size",
										label: t.ballSize,
										value: ballScale,
										min: .45,
										max: 2.4,
										step: .05,
										display: `${ballScale.toFixed(2)}×`,
										disabled: busy,
										onChange: setBallScale
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										id: "machine-size",
										label: t.machineSize,
										value: machineScale,
										min: .65,
										max: 2.4,
										step: .05,
										display: `${machineScale.toFixed(2)}×`,
										disabled: busy,
										onChange: setMachineScale
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										id: "rods",
										label: t.rods,
										checked: rodsOn,
										disabled: record === "recording",
										onChange: setRodsOn
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										id: "rod-count",
										label: t.rodCount,
										value: rodCount,
										min: 1,
										max: 12,
										step: 1,
										display: `${Math.round(rodCount)}`,
										disabled: record === "recording" || !rodsOn,
										onChange: setRodCount
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										id: "rod-speed",
										label: t.rodSpeed,
										value: rodSpeed,
										min: 0,
										max: 3,
										step: .05,
										display: `${rodSpeed.toFixed(2)}×`,
										disabled: record === "recording" || !rodsOn,
										onChange: setRodSpeed
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
										id: "wind",
										label: t.wind,
										checked: windOn,
										disabled: record === "recording",
										onChange: (value) => {
											engineRef.current?.unlock();
											setWindOn(value);
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										id: "wind-strength",
										label: t.windStrength,
										value: wind,
										min: 0,
										max: 12,
										step: .1,
										display: wind.toFixed(1),
										disabled: record === "recording" || !windOn,
										onChange: setWind
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										id: "wind-width",
										label: t.windWidth,
										value: windWidth,
										min: .2,
										max: 1,
										step: .01,
										display: `${Math.round(windWidth * 100)}%`,
										disabled: record === "recording" || !windOn,
										onChange: setWindWidth,
										onGrab: () => engineRef.current?.setWindPreview(true),
										onRelease: () => engineRef.current?.setWindPreview(false)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										id: "wind-height",
										label: t.windHeight,
										value: windHeight,
										min: .15,
										max: 1,
										step: .01,
										display: `${Math.round(windHeight * 100)}%`,
										disabled: record === "recording" || !windOn,
										onChange: setWindHeight,
										onGrab: () => engineRef.current?.setWindPreview(true),
										onRelease: () => engineRef.current?.setWindPreview(false)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "-mt-1 text-sm text-muted",
										children: t.windHint
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										id: "suction",
										label: t.suction,
										value: suction,
										min: 0,
										max: 3,
										step: .05,
										display: `${suction.toFixed(2)}×`,
										disabled: record === "recording",
										onChange: setSuction
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										id: "gravity",
										label: t.gravity,
										value: gravity,
										min: 0,
										max: 36,
										step: 1,
										display: gravity.toFixed(0),
										disabled: record === "recording",
										onChange: setGravity
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										id: "agitation",
										label: t.agitation,
										value: agitation,
										min: 0,
										max: 2.5,
										step: .05,
										display: `${agitation.toFixed(2)}×`,
										disabled: record === "recording",
										onChange: setAgitation
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										id: "bounce",
										label: t.bounce,
										value: bounce,
										min: 0,
										max: .95,
										step: .01,
										display: bounce.toFixed(2),
										disabled: record === "recording",
										onChange: setBounce
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
										id: "drag",
										label: t.drag,
										value: drag,
										min: 0,
										max: 2.4,
										step: .05,
										display: drag.toFixed(2),
										disabled: record === "recording",
										onChange: setDrag
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							"aria-live": "polite",
							children: [ready ? statusLabel(phase, t) : "…", nameCount > 0 && phase !== "idle" ? ` · ${drawn.length} ${t.of} ${drawCount}` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: !ready || busy || nameCount === 0,
									onClick: () => engineRef.current?.start(),
									className: "col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-seal px-4 text-sm font-semibold text-fg disabled:opacity-40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {
										className: "size-4",
										"aria-hidden": "true"
									}), t.start]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: !ready || record === "recording",
									onClick: () => engineRef.current?.restart(),
									className: "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-semibold text-fg disabled:opacity-40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
										className: "size-4",
										"aria-hidden": "true"
									}), t.restart]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: busy,
									onClick: () => setText(""),
									className: "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-semibold text-fg disabled:opacity-40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eraser, {
										className: "size-4",
										"aria-hidden": "true"
									}), t.clear]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: !ready || busy || nameCount === 0,
									onClick: () => void engineRef.current?.exportVideo(),
									className: "col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brass px-4 text-sm font-semibold text-ink disabled:opacity-40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, {
										className: "size-4",
										"aria-hidden": "true"
									}), record === "recording" ? `${t.recording} ${drawn.length}/${drawCount}` : t.record]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: busy,
									onClick: () => setText(SAMPLE_TEXT),
									className: "col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-brass disabled:opacity-40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
										className: "size-4",
										"aria-hidden": "true"
									}), t.sample]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: canReplay ? t.recordReplayHint : t.recordHint
						}),
						recordMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-fg",
							children: recordMessage
						}) : null,
						videoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: videoUrl,
							download: "savetodavno-telo.mp4",
							className: "inline-flex h-11 items-center justify-center rounded-md border border-brass px-4 text-sm font-semibold text-brass",
							children: t.download
						}) : null
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "max-h-52 shrink-0 overflow-y-auto border-t border-line px-4 py-3 sm:px-6",
				"aria-live": "polite",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold text-muted",
					children: t.drawnTitle
				}), drawn.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: t.drawnEmpty
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-3 flex flex-wrap gap-2",
					children: drawn.map((name, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: `flex max-w-full items-center gap-2 rounded-full border bg-surface px-3 py-2 text-sm ${index === drawn.length - 1 ? "border-brass" : "border-line"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-lg leading-none text-brass tabular-nums",
							children: numbers[index] ?? index + 1
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "break-words",
							children: name
						})]
					}, `${index}-${name}`))
				})]
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LotteryApp, {});
}
//#endregion
export { Home as component };
