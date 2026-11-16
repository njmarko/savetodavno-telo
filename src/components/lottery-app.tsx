import { useEffect, useRef, useState } from "react";
import { ChevronDown, Clapperboard, Eraser, Play, RotateCcw, Sparkles } from "lucide-react";
import { COPY, hudCopy, type Lang } from "@/lib/i18n";
import { MAX_NAMES, LEGACY_SAMPLE_TEXT, SAMPLE_TEXT, parseNames } from "@/lib/lottery/names";
import type { EngineHooks, LotteryEngine, Phase, PhysicsSettings, RecordState } from "@/lib/lottery/engine";

const STORAGE_KEY = "savetodavno-telo-v1";

type Save = {
  lang: Lang;
  text: string;
  count: number;
  speed: number;
  mix: number;
  gravity: number;
  agitation: number;
  bounce: number;
  drag: number;
  ball: number;
  machine: number;
  rods: boolean;
  rodCount: number;
  rodSpeed: number;
  windOn: boolean;
  wind: number;
  windWidth: number;
  windHeight: number;
  suction: number;
  volume: number;
  pickDefault: number;
  tune: number;
};

function clampNum(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function loadSave(): Save | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<Save>;
    if (data.lang !== "sr" && data.lang !== "en") return null;
    if (typeof data.text !== "string") return null;
    const tune = typeof data.tune === "number" ? data.tune : 0;
    const keptRods = tune >= 3;
    const keptWind = tune >= 4;
    return {
      lang: data.lang,
      text: data.text,
      count: data.pickDefault === 1 && typeof data.count === "number" ? data.count : 1,
      speed: clampNum(data.speed, 1, 0.5, 4),
      mix: clampNum(data.mix, 6, 2, 60),
      gravity: clampNum(data.gravity, 18, 0, 36),
      agitation: clampNum(data.agitation, 1, 0, 2.5),
      bounce: clampNum(data.bounce, 0.74, 0, 0.95),
      drag: clampNum(data.drag, 0.5, 0, 2.4),
      ball: clampNum(data.ball, 1, 0.45, 2.4),
      machine: clampNum(data.machine, 1, 0.65, 2.4),
      rods: data.rods !== false,
      rodCount: keptRods ? clampNum(data.rodCount, 2, 1, 12) : 2,
      rodSpeed: clampNum(data.rodSpeed, 1, 0, 3),
      windOn: tune >= 3 ? data.windOn !== false : true,
      wind: keptWind ? clampNum(data.wind, 3, 0, 12) : 3,
      windWidth: tune >= 3 ? clampNum(data.windWidth, 0.33, 0.2, 1) : 0.33,
      windHeight: keptWind ? clampNum(data.windHeight, 0.9, 0.15, 1) : 0.9,
      suction: clampNum(data.suction, 1, 0, 3),
      volume: clampNum(data.volume, 1, 0, 3),
      pickDefault: 1,
      tune: 4,
    };
  } catch {
    return null;
  }
}

function statusLabel(phase: Phase, t: (typeof COPY)["sr"]) {
  if (phase === "mixing") return t.statusMixing;
  if (phase === "opening") return t.statusOpening;
  if (phase === "extracting") return t.statusExtracting;
  if (phase === "presenting") return t.statusPresenting;
  if (phase === "finale") return t.statusFinale;
  if (phase === "done") return t.statusDone;
  return t.statusReady;
}

function FlagSerbia() {
  return (
    <svg viewBox="0 0 18 12" className="h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/30" aria-hidden="true">
      <rect width="18" height="4" fill="#C6363C" />
      <rect y="4" width="18" height="4" fill="#0C4076" />
      <rect y="8" width="18" height="4" fill="#FFFFFF" />
    </svg>
  );
}

function FlagUSA() {
  return (
    <svg viewBox="0 0 19 10" className="h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/30" aria-hidden="true">
      <rect width="19" height="10" fill="#B22234" />
      <rect y="1" width="19" height="1" fill="#FFFFFF" />
      <rect y="3" width="19" height="1" fill="#FFFFFF" />
      <rect y="5" width="19" height="1" fill="#FFFFFF" />
      <rect y="7" width="19" height="1" fill="#FFFFFF" />
      <rect y="9" width="19" height="1" fill="#FFFFFF" />
      <rect width="8" height="5.5" fill="#3C3B6E" />
    </svg>
  );
}
function Toggle({
  id,
  label,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex h-11 items-center justify-between gap-3 text-sm font-semibold" htmlFor={id}>
      {label}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-brass disabled:opacity-60"
      />
    </label>
  );
}

function Slider({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  disabled,
  onChange,
  onGrab,
  onRelease,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  disabled?: boolean;
  onChange: (value: number) => void;
  onGrab?: () => void;
  onRelease?: () => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold" htmlFor={id}>
      <span className="flex items-center justify-between gap-3">
        {label}
        <span className="font-medium text-brass tabular-nums">{display}</span>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerDown={() => {
          onGrab?.();
          if (!onRelease) return;
          const end = () => {
            onRelease();
            window.removeEventListener("pointerup", end);
            window.removeEventListener("pointercancel", end);
          };
          window.addEventListener("pointerup", end);
          window.addEventListener("pointercancel", end);
        }}
        className="h-10 w-full accent-brass disabled:opacity-60"
      />
    </label>
  );
}

function NameList({
  value,
  disabled,
  placeholder,
  onChange,
}: {
  value: string;
  disabled: boolean;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const lines = value.split("\n");
  let count = 0;
  const numbers = lines.map((line) => (line.trim() ? ++count : 0));
  return (
    <div className="flex min-h-40 flex-1 overflow-hidden rounded-md border border-line bg-bg">
      <div
        ref={gutterRef}
        aria-hidden="true"
        className="w-11 shrink-0 overflow-hidden bg-surface py-3 pr-2 text-right text-sm leading-6 font-semibold text-brass tabular-nums select-none"
      >
        {numbers.map((num, index) => (
          <div key={index} className="h-6">
            {num || ""}
          </div>
        ))}
      </div>
      <textarea
        id="names"
        value={value}
        disabled={disabled}
        spellCheck={false}
        wrap="off"
        placeholder={placeholder}
        onScroll={(event) => {
          if (gutterRef.current) gutterRef.current.scrollTop = event.currentTarget.scrollTop;
        }}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-40 w-full flex-1 resize-y overflow-auto bg-transparent px-3 py-3 text-base leading-6 whitespace-pre text-fg placeholder:text-muted disabled:opacity-60"
      />
    </div>
  );
}

export function LotteryApp() {
  const hostRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LotteryEngine | null>(null);
  const [lang, setLang] = useState<Lang>("sr");
  const [text, setText] = useState(SAMPLE_TEXT);
  const [count, setCount] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [mix, setMix] = useState(6);
  const [gravity, setGravity] = useState(18);
  const [agitation, setAgitation] = useState(1);
  const [bounce, setBounce] = useState(0.74);
  const [drag, setDrag] = useState(0.5);
  const [ballScale, setBallScale] = useState(1);
  const [machineScale, setMachineScale] = useState(1);
  const [rodsOn, setRodsOn] = useState(true);
  const [rodCount, setRodCount] = useState(2);
  const [rodSpeed, setRodSpeed] = useState(1);
  const [windOn, setWindOn] = useState(true);
  const [wind, setWind] = useState(3);
  const [windWidth, setWindWidth] = useState(0.33);
  const [windHeight, setWindHeight] = useState(0.9);
  const [suction, setSuction] = useState(1);
  const [volume, setVolume] = useState(1);
  const [drawn, setDrawn] = useState<string[]>([]);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [record, setRecord] = useState<RecordState>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [webgl, setWebgl] = useState(true);
  const [ready, setReady] = useState(false);
  const [canReplay, setCanReplay] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const t = COPY[lang];
  const parsed = parseNames(text);
  const busy =
    phase === "mixing" ||
    phase === "opening" ||
    phase === "extracting" ||
    phase === "presenting" ||
    record === "recording";
  const nameCount = parsed.names.length;
  const drawCount = Math.min(Math.max(1, count), Math.max(1, nameCount));
  const namesKey = parsed.names.join("\n");

  const textRef = useRef(text);
  const drawCountRef = useRef(drawCount);
  const speedRef = useRef(speed);
  const mixRef = useRef(mix);
  const physicsRef = useRef<PhysicsSettings>({ gravity, agitation, bounce, drag });
  const scaleRef = useRef({ ball: ballScale, machine: machineScale });
  const rodsRef = useRef(rodsOn);
  const rodCountRef = useRef(rodCount);
  const rodSpeedRef = useRef(rodSpeed);
  const windRef = useRef({ on: windOn, strength: wind, width: windWidth, height: windHeight });
  const suctionRef = useRef(suction);
  const volumeRef = useRef(volume);
  const langRef = useRef(lang);
  textRef.current = text;
  drawCountRef.current = drawCount;
  speedRef.current = speed;
  mixRef.current = mix;
  physicsRef.current = { gravity, agitation, bounce, drag };
  scaleRef.current = { ball: ballScale, machine: machineScale };
  rodsRef.current = rodsOn;
  rodCountRef.current = rodCount;
  rodSpeedRef.current = rodSpeed;
  windRef.current = { on: windOn, strength: wind, width: windWidth, height: windHeight };
  suctionRef.current = suction;
  volumeRef.current = volume;
  langRef.current = lang;

  const hooksRef = useRef<EngineHooks>({
    onDrawn: () => undefined,
    onPhase: () => undefined,
    onRecord: () => undefined,
    onFile: () => undefined,
    onWebgl: () => undefined,
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

  useEffect(() => {
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
      setVolume(saved.volume);
      if (saved.text === LEGACY_SAMPLE_TEXT) setText(SAMPLE_TEXT);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: Save = {
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
      volume,
      pickDefault: 1,
      tune: 4,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    document.documentElement.lang = lang === "sr" ? "sr" : "en";
  }, [hydrated, lang, text, count, speed, mix, gravity, agitation, bounce, drag, ballScale, machineScale, rodsOn, rodCount, rodSpeed, windOn, wind, windWidth, windHeight, suction, volume]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let dead = false;
    let engine: LotteryEngine | null = null;
    void import("@/lib/lottery/engine").then(({ LotteryEngine }) => {
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
      engine.setVolume(volumeRef.current);
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

  useEffect(() => {
    engineRef.current?.setHud(hudCopy(lang));
  }, [lang]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      engineRef.current?.setNames(parseNames(textRef.current).names);
      setCanReplay(engineRef.current?.canReplay() ?? false);
    }, 180);
    return () => window.clearTimeout(handle);
  }, [namesKey]);

  useEffect(() => {
    engineRef.current?.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    engineRef.current?.setMixSeconds(mix);
  }, [mix]);

  useEffect(() => {
    engineRef.current?.setPhysics({ gravity, agitation, bounce, drag });
  }, [gravity, agitation, bounce, drag]);

  useEffect(() => {
    engineRef.current?.setScale(ballScale, machineScale);
  }, [ballScale, machineScale]);

  useEffect(() => {
    engineRef.current?.setRods(rodsOn);
  }, [rodsOn]);

  useEffect(() => {
    engineRef.current?.setRodCount(rodCount);
  }, [rodCount]);

  useEffect(() => {
    engineRef.current?.setRodSpeed(rodSpeed);
  }, [rodSpeed]);

  useEffect(() => {
    engineRef.current?.setWind(windOn, wind);
  }, [windOn, wind]);

  useEffect(() => {
    engineRef.current?.setWindWidth(windWidth);
  }, [windWidth]);

  useEffect(() => {
    engineRef.current?.setWindHeight(windHeight);
  }, [windHeight]);

  useEffect(() => {
    engineRef.current?.setSuction(suction);
  }, [suction]);

  useEffect(() => {
    engineRef.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    engineRef.current?.setDrawCount(drawCount);
    setCanReplay(engineRef.current?.canReplay() ?? false);
  }, [drawCount]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const recordMessage =
    record === "unsupported" ? t.unsupported : record === "error" ? t.exportFailed : record === "saved" ? t.exportSaved : "";

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg lg:h-dvh lg:overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-line px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-brass" aria-hidden="true">
            <span className="size-3 rounded-full bg-brass" />
          </span>
          <div>
            <h1 className="font-display text-3xl leading-none text-fg sm:text-4xl">Саветодавно тело</h1>
            <p className="mt-1 text-sm text-muted">
              {t.madeBy}{" "}
              <a
                className="text-brass underline decoration-brass/50 underline-offset-2 hover:decoration-brass"
                href="https://x.com/njmarko"
                target="_blank"
                rel="noreferrer"
              >
                {t.author}
              </a>
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-semibold text-fg"
          onClick={() => setLang((current) => (current === "sr" ? "en" : "sr"))}
        >
          {lang === "sr" ? <FlagUSA /> : <FlagSerbia />}
          {t.langToggle}
        </button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
        <div className="relative min-h-[48vh] bg-bg lg:min-h-0">
          <div ref={hostRef} className="absolute inset-0" />
          {record === "recording" ? (
            <div className="pointer-events-none absolute top-4 right-4 z-10 flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-sm text-fg">
              <span className="size-2 rounded-full bg-seal" />
              {t.recording}
            </div>
          ) : null}
          {!webgl ? (
            <p className="absolute inset-0 grid place-items-center px-6 text-center text-muted">{t.noWebgl}</p>
          ) : null}
          <a
            href="https://www.solarsystemscope.com/textures/"
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-2 left-3 z-10 text-[10px] tracking-wide text-white/40 hover:text-white/70"
          >
            Млечни пут 8K · Solar System Scope · CC BY 4.0
          </a>
          <p className="sr-only" aria-live="assertive">
            {phase === "presenting" && drawn.length > 0 ? `${t.drawnWord} ${drawn[drawn.length - 1]}` : ""}
          </p>
        </div>

        <aside className="flex flex-col gap-4 overflow-y-auto border-t border-line p-4 lg:border-t-0 lg:border-l">
          <div className="flex items-end justify-between gap-3">
            <label className="text-sm font-semibold" htmlFor="names">
              {t.names}
            </label>
            <span className="text-sm text-muted tabular-nums">
              {nameCount}
              {nameCount > 0 ? ` · ${t.inDrum}` : ""}
            </span>
          </div>
          <NameList value={text} disabled={busy} placeholder={t.namesHint} onChange={setText} />
          <p className="text-sm text-muted">{parsed.truncated ? t.tooMany : t.namesHint}</p>

          <label className="flex flex-col gap-2 text-sm font-semibold" htmlFor="count">
            {t.howMany}
            <input
              id="count"
              type="number"
              min={1}
              max={Math.max(1, nameCount)}
              disabled={busy || nameCount === 0}
              value={drawCount}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (!Number.isFinite(next)) return;
                setCount(Math.max(1, Math.min(MAX_NAMES, Math.round(next))));
              }}
              className="h-11 rounded-md border border-line bg-bg px-3 text-base font-medium text-fg disabled:opacity-60"
            />
          </label>

          <Slider
            id="mix"
            label={t.mixTime}
            value={mix}
            min={2}
            max={60}
            step={1}
            display={`${mix.toFixed(0)} s`}
            disabled={record === "recording"}
            onChange={setMix}
          />
          <p className="-mt-2 text-sm text-muted">{t.mixHint}</p>
          <p className="-mt-2 text-sm text-muted">{t.cameraHint}</p>
          <button
            type="button"
            onClick={() => engineRef.current?.resetCamera()}
            className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-semibold text-fg"
          >
            {t.resetCamera}
          </button>

          <details className="group rounded-md border border-line bg-surface">
            <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
              {t.physics}
              <ChevronDown className="size-4 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="grid gap-3 px-3 pb-3">
              <Slider
                id="speed"
                label={t.speed}
                value={speed}
                min={0.5}
                max={4}
                step={0.1}
                display={`${speed.toFixed(1)}×`}
                disabled={record === "recording"}
                onChange={setSpeed}
              />
              <Slider
                id="ball-size"
                label={t.ballSize}
                value={ballScale}
                min={0.45}
                max={2.4}
                step={0.05}
                display={`${ballScale.toFixed(2)}×`}
                disabled={busy}
                onChange={setBallScale}
              />
              <Slider
                id="machine-size"
                label={t.machineSize}
                value={machineScale}
                min={0.65}
                max={2.4}
                step={0.05}
                display={`${machineScale.toFixed(2)}×`}
                disabled={busy}
                onChange={setMachineScale}
              />
              <Toggle
                id="rods"
                label={t.rods}
                checked={rodsOn}
                disabled={record === "recording"}
                onChange={setRodsOn}
              />
              <Slider
                id="rod-count"
                label={t.rodCount}
                value={rodCount}
                min={1}
                max={12}
                step={1}
                display={`${Math.round(rodCount)}`}
                disabled={record === "recording" || !rodsOn}
                onChange={setRodCount}
              />
              <Slider
                id="rod-speed"
                label={t.rodSpeed}
                value={rodSpeed}
                min={0}
                max={3}
                step={0.05}
                display={`${rodSpeed.toFixed(2)}×`}
                disabled={record === "recording" || !rodsOn}
                onChange={setRodSpeed}
              />
              <Toggle
                id="wind"
                label={t.wind}
                checked={windOn}
                disabled={record === "recording"}
                onChange={(value) => {
                  engineRef.current?.unlock();
                  setWindOn(value);
                }}
              />
              <Slider
                id="wind-strength"
                label={t.windStrength}
                value={wind}
                min={0}
                max={12}
                step={0.1}
                display={wind.toFixed(1)}
                disabled={record === "recording" || !windOn}
                onChange={setWind}
              />
              <Slider
                id="wind-width"
                label={t.windWidth}
                value={windWidth}
                min={0.2}
                max={1}
                step={0.01}
                display={`${Math.round(windWidth * 100)}%`}
                disabled={record === "recording" || !windOn}
                onChange={setWindWidth}
                onGrab={() => engineRef.current?.setWindPreview(true)}
                onRelease={() => engineRef.current?.setWindPreview(false)}
              />
              <Slider
                id="wind-height"
                label={t.windHeight}
                value={windHeight}
                min={0.15}
                max={1}
                step={0.01}
                display={`${Math.round(windHeight * 100)}%`}
                disabled={record === "recording" || !windOn}
                onChange={setWindHeight}
                onGrab={() => engineRef.current?.setWindPreview(true)}
                onRelease={() => engineRef.current?.setWindPreview(false)}
              />
              <p className="-mt-1 text-sm text-muted">{t.windHint}</p>
              <Slider
                id="suction"
                label={t.suction}
                value={suction}
                min={0}
                max={3}
                step={0.05}
                display={`${suction.toFixed(2)}×`}
                disabled={record === "recording"}
                onChange={setSuction}
              />
              <Slider
                id="sound"
                label={t.sound}
                value={volume}
                min={0}
                max={3}
                step={0.05}
                display={`${Math.round(volume * 100)}%`}
                disabled={record === "recording"}
                onChange={(value) => {
                  engineRef.current?.unlock();
                  setVolume(value);
                }}
              />
              <Slider
                id="gravity"
                label={t.gravity}
                value={gravity}
                min={0}
                max={36}
                step={1}
                display={gravity.toFixed(0)}
                disabled={record === "recording"}
                onChange={setGravity}
              />
              <Slider
                id="agitation"
                label={t.agitation}
                value={agitation}
                min={0}
                max={2.5}
                step={0.05}
                display={`${agitation.toFixed(2)}×`}
                disabled={record === "recording"}
                onChange={setAgitation}
              />
              <Slider
                id="bounce"
                label={t.bounce}
                value={bounce}
                min={0}
                max={0.95}
                step={0.01}
                display={bounce.toFixed(2)}
                disabled={record === "recording"}
                onChange={setBounce}
              />
              <Slider
                id="drag"
                label={t.drag}
                value={drag}
                min={0}
                max={2.4}
                step={0.05}
                display={drag.toFixed(2)}
                disabled={record === "recording"}
                onChange={setDrag}
              />
            </div>
          </details>

          <p className="text-sm text-muted" aria-live="polite">
            {ready ? statusLabel(phase, t) : "…"}
            {nameCount > 0 && phase !== "idle" ? ` · ${drawn.length} ${t.of} ${drawCount}` : ""}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!ready || busy || nameCount === 0}
              onClick={() => engineRef.current?.start()}
              className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-seal px-4 text-sm font-semibold text-fg disabled:opacity-40"
            >
              <Play className="size-4" aria-hidden="true" />
              {t.start}
            </button>
            <button
              type="button"
              disabled={!ready || record === "recording"}
              onClick={() => engineRef.current?.restart()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-semibold text-fg disabled:opacity-40"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              {t.restart}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setText("")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-semibold text-fg disabled:opacity-40"
            >
              <Eraser className="size-4" aria-hidden="true" />
              {t.clear}
            </button>
            <button
              type="button"
              disabled={!ready || busy || nameCount === 0}
              onClick={() => void engineRef.current?.exportVideo()}
              className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brass px-4 text-sm font-semibold text-ink disabled:opacity-40"
            >
              <Clapperboard className="size-4" aria-hidden="true" />
              {record === "recording" ? `${t.recording} ${drawn.length}/${drawCount}` : t.record}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setText(SAMPLE_TEXT)}
              className="col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold text-brass disabled:opacity-40"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              {t.sample}
            </button>
          </div>
          <p className="text-sm text-muted">{canReplay ? t.recordReplayHint : t.recordHint}</p>
          {recordMessage ? <p className="text-sm text-fg">{recordMessage}</p> : null}
          {videoUrl ? (
            <a
              href={videoUrl}
              download="savetodavno-telo.mp4"
              className="inline-flex h-11 items-center justify-center rounded-md border border-brass px-4 text-sm font-semibold text-brass"
            >
              {t.download}
            </a>
          ) : null}
        </aside>
      </div>

      <section className="max-h-52 shrink-0 overflow-y-auto border-t border-line px-4 py-3 sm:px-6" aria-live="polite">
        <h2 className="text-sm font-semibold text-muted">{t.drawnTitle}</h2>
        {drawn.length === 0 ? (
          <p className="mt-2 text-sm text-muted">{t.drawnEmpty}</p>
        ) : (
          <ol className="mt-3 flex flex-wrap gap-2">
            {drawn.map((name, index) => (
              <li
                key={`${index}-${name}`}
                className={`flex max-w-full items-center gap-2 rounded-full border bg-surface px-3 py-2 text-sm ${
                  index === drawn.length - 1 ? "border-brass" : "border-line"
                }`}
              >
                <span className="font-display text-lg leading-none text-brass tabular-nums">
                  {numbers[index] ?? index + 1}
                </span>
                <span className="break-words">{name}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
