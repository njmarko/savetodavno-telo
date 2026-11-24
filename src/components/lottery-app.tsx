import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Clapperboard, Eraser, Info, Play, RotateCcw, Settings, Sparkles, Undo2 } from "lucide-react";
import { COPY, hudCopy, type Lang } from "@/lib/i18n";
import { MAX_NAMES, LEGACY_SAMPLE_TEXT, SAMPLE_TEXT, parseNames } from "@/lib/lottery/names";
import type { EngineHooks, LotteryEngine, Phase, PhysicsSettings, RecordState } from "@/lib/lottery/engine";

const STORAGE_KEY = "savetodavno-telo-v1";
const MUSIC_SRC = "/audio/zarathustra.mp3";

type MusicMode = "draw" | "always" | "off";

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
  music: MusicMode;
  musicVolume: number;
  pickDefault: number;
  tune: number;
};

function clampNum(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function musicModeOf(value: unknown): MusicMode {
  return value === "always" || value === "off" || value === "draw" ? value : "draw";
}

const DRAWING: Phase[] = ["mixing", "opening", "extracting", "presenting", "finale"];

function musicShouldPlay(mode: MusicMode, phase: Phase) {
  if (mode === "off") return false;
  if (mode === "always") return true;
  return DRAWING.includes(phase);
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
      windHeight: tune >= 6 ? clampNum(data.windHeight, 0.85, 0.15, 1) : 0.85,
      suction: clampNum(data.suction, 1, 0, 3),
      volume: tune >= 5 ? clampNum(data.volume, 0, 0, 3) : 0,
      music: musicModeOf(data.music),
      musicVolume: clampNum(data.musicVolume, 0.8, 0, 1),
      pickDefault: 1,
      tune: 6,
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
function useFineHover() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setFine(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return fine;
}

function Hinted({
  text,
  label,
  extra,
  children,
}: {
  text?: string;
  label: ReactNode;
  extra?: ReactNode;
  children?: ReactNode;
}) {
  const fine = useFineHover();
  const btn = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState<{ left: number; top: number; width: number; above: boolean } | null>(null);

  function place() {
    const el = btn.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(256, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.left - 8), window.innerWidth - 12 - width);
    const above = window.innerHeight - rect.bottom < 96;
    setTip({ left, top: above ? rect.top - 8 : rect.bottom + 8, width, above });
  }

  return (
    <div className="flex flex-col gap-1.5 text-sm font-semibold">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-0.5">
          {label}
          {text ? (
            <button
              ref={btn}
              type="button"
              aria-label={text}
              aria-expanded={!fine && open}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:text-brass"
              onMouseEnter={() => {
                if (fine) place();
              }}
              onMouseLeave={() => setTip(null)}
              onFocus={() => {
                if (fine) place();
              }}
              onBlur={() => setTip(null)}
              onClick={() => {
                if (fine) return;
                setOpen((value) => !value);
              }}
            >
              <Info className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {extra}
      </div>
      {text && open && !fine ? <p className="text-sm leading-snug font-medium text-muted">{text}</p> : null}
      {children}
      {tip && text
        ? createPortal(
            <div
              role="tooltip"
              style={{
                left: tip.left,
                top: tip.top,
                width: tip.width,
                transform: tip.above ? "translateY(-100%)" : undefined,
              }}
              className="pointer-events-none fixed z-50 rounded-md border border-line bg-surface px-3 py-2 text-sm leading-snug font-medium text-fg shadow-lg"
            >
              {text}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function Toggle({
  id,
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Hinted
      text={hint}
      label={
        <label htmlFor={id} className="min-w-0">
          {label}
        </label>
      }
      extra={
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="size-6 accent-brass disabled:opacity-60"
        />
      }
    />
  );
}

function Slider({
  id,
  label,
  hint,
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
  hint?: string;
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
    <Hinted
      text={hint}
      label={
        <label htmlFor={id} className="min-w-0">
          {label}
        </label>
      }
      extra={<span className="font-medium text-brass tabular-nums">{display}</span>}
    >
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
    </Hinted>
  );
}

function OptionGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group/opt border-t border-line">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open/opt:rotate-180" aria-hidden="true" />
      </summary>
      <div className="grid gap-3 px-3 pb-3">{children}</div>
    </details>
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
    <div className="flex max-h-36 min-h-32 flex-1 overflow-hidden rounded-md border border-line bg-bg lg:max-h-none lg:min-h-40">
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
        className="max-h-36 min-h-32 w-full min-w-0 flex-1 resize-y overflow-auto bg-transparent px-3 py-3 text-base leading-6 whitespace-pre text-fg placeholder:text-muted disabled:opacity-60 lg:max-h-none lg:min-h-40"
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
  const [windHeight, setWindHeight] = useState(0.85);
  const [suction, setSuction] = useState(1);
  const [volume, setVolume] = useState(0);
  const [musicMode, setMusicMode] = useState<MusicMode>("draw");
  const [musicVolume, setMusicVolume] = useState(0.8);
  const [undoText, setUndoText] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
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
  const finePointer = useFineHover();
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
  const musicModeRef = useRef(musicMode);
  const musicVolumeRef = useRef(musicVolume);
  const phaseRef = useRef(phase);
  const musicRef = useRef<HTMLAudioElement | null>(null);
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
  musicModeRef.current = musicMode;
  musicVolumeRef.current = musicVolume;
  phaseRef.current = phase;
  langRef.current = lang;

  const syncMusic = (nextPhase: Phase, mode = musicModeRef.current) => {
    if (!musicRef.current) {
      const audio = new Audio(MUSIC_SRC);
      audio.loop = true;
      audio.preload = "auto";
      musicRef.current = audio;
    }
    const audio = musicRef.current;
    audio.volume = Math.min(1, Math.max(0, musicVolumeRef.current));
    if (!musicShouldPlay(mode, nextPhase)) {
      if (!audio.paused) audio.pause();
      if (mode !== "always") audio.currentTime = 0;
      return;
    }
    if (audio.paused) void audio.play().catch(() => undefined);
  };

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
    phaseRef.current = next;
    setPhase(next);
    setCanReplay(engineRef.current?.canReplay() ?? false);
  };
  hooksRef.current.onRecord = (state) => {
    setRecord(state);
    if (state === "unsupported" || state === "error") syncMusic(phaseRef.current);
  };
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
      setMusicMode(saved.music);
      setMusicVolume(saved.musicVolume);
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
      music: musicMode,
      musicVolume,
      pickDefault: 1,
      tune: 6,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    document.documentElement.lang = lang === "sr" ? "sr" : "en";
  }, [hydrated, lang, text, count, speed, mix, gravity, agitation, bounce, drag, ballScale, machineScale, rodsOn, rodCount, rodSpeed, windOn, wind, windWidth, windHeight, suction, volume, musicMode, musicVolume]);

  useEffect(() => {
    syncMusic(phase);
  }, [phase, musicMode, musicVolume]);

  useEffect(() => {
    const kick = () => syncMusic(phaseRef.current);
    window.addEventListener("pointerdown", kick);
    return () => {
      window.removeEventListener("pointerdown", kick);
      musicRef.current?.pause();
    };
  }, []);

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
    <div className="flex min-h-dvh flex-col bg-bg pb-36 text-fg lg:h-dvh lg:overflow-hidden lg:pb-0">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-6 sm:py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-brass sm:size-11" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-brass sm:size-3" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl leading-none text-fg sm:text-4xl">Саветодавно тело</h1>
            <p className="app-credit mt-1 truncate text-xs text-muted sm:text-sm">
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
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-semibold text-fg sm:px-4"
          onClick={() => setLang((current) => (current === "sr" ? "en" : "sr"))}
        >
          {lang === "sr" ? <FlagUSA /> : <FlagSerbia />}
          {t.langToggle}
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:grid-rows-[minmax(0,1fr)_auto] lg:overflow-hidden">
        <div className="stage-frame relative h-[42dvh] max-h-[calc(100svh-14rem)] min-h-0 shrink-0 bg-bg lg:col-start-1 lg:row-start-1 lg:h-full lg:max-h-none">
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
            className="absolute top-2 left-3 z-10 max-w-[70%] text-xs tracking-wide text-fg/40 hover:text-fg/70"
          >
            Млечни пут 8K · Solar System Scope · CC BY 4.0
          </a>
          <p className="sr-only" aria-live="assertive">
            {phase === "presenting" && drawn.length > 0 ? `${t.drawnWord} ${drawn[drawn.length - 1]}` : ""}
          </p>
        </div>

        <section className="drawn-strip max-h-36 shrink-0 overflow-y-auto border-t border-line px-4 py-3 sm:px-6 lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:max-h-52" aria-live="polite">
          <h2 className="text-sm font-semibold text-muted">{t.drawnTitle}</h2>
          {drawn.length === 0 ? (
            <p className="mt-1 text-sm text-muted">{t.drawnEmpty}</p>
          ) : (
            <ol className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {drawn.map((name, index) => (
                <li
                  key={`${index}-${name}`}
                  className={`flex max-w-full shrink-0 items-center gap-2 rounded-full border bg-surface px-3 py-2 text-sm ${
                    index === drawn.length - 1 ? "border-brass" : "border-line"
                  }`}
                >
                  <span className="font-display text-lg leading-none text-brass tabular-nums">
                    {numbers[index] ?? index + 1}
                  </span>
                  <span className="max-w-48 truncate">{name}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <aside className="flex min-w-0 flex-col gap-4 border-t border-line p-4 lg:col-start-2 lg:row-start-1 lg:overflow-y-auto lg:border-t-0 lg:border-l">
          <div className="order-2 flex flex-col gap-4 lg:order-none">
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
          {undoText !== null ? (
            <div className="flex items-center justify-between gap-3 rounded-md border border-brass bg-surface px-3 py-2">
              <p className="text-sm">{t.cleared}</p>
              <button
                type="button"
                onClick={() => {
                  setText(undoText);
                  setUndoText(null);
                }}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold text-brass"
              >
                <Undo2 className="size-4" aria-hidden="true" />
                {t.undo}
              </button>
            </div>
          ) : null}
          <p className="text-sm text-muted">{parsed.truncated ? t.tooMany : t.namesHint}</p>

          <Hinted text={t.howManyHint} label={<label htmlFor="count">{t.howMany}</label>}>
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
          </Hinted>

          <Slider
            id="mix"
            label={t.mixTime}
            hint={t.mixHint}
            value={mix}
            min={2}
            max={60}
            step={1}
            display={`${mix.toFixed(0)} s`}
            disabled={record === "recording"}
            onChange={setMix}
          />

          <Hinted
            text={finePointer ? t.cameraHint : t.cameraHintTouch}
            label={
              <button
                type="button"
                onClick={() => engineRef.current?.resetCamera()}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-semibold text-fg"
              >
                {t.resetCamera}
              </button>
            }
          />

          <details className="group rounded-md border border-line bg-surface">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <Settings className="size-4 text-brass" aria-hidden="true" />
                {t.options}
              </span>
              <ChevronDown className="size-4 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <OptionGroup title={t.sectionSound}>
              {(
                [
                  ["draw", t.musicDraw, t.musicDrawHint],
                  ["always", t.musicAlways, t.musicAlwaysHint],
                  ["off", t.musicOff, t.musicOffHint],
                ] as const
              ).map(([mode, label, hint]) => (
                <Hinted
                  key={mode}
                  text={hint}
                  label={
                    <label htmlFor={`music-${mode}`} className="flex min-h-11 flex-1 items-center gap-3">
                      <input
                        id={`music-${mode}`}
                        type="radio"
                        name="music-mode"
                        className="size-5 accent-brass"
                        checked={musicMode === mode}
                        onChange={() => {
                          musicModeRef.current = mode;
                          setMusicMode(mode);
                          syncMusic(phaseRef.current, mode);
                        }}
                      />
                      {label}
                    </label>
                  }
                />
              ))}
              <Slider
                id="music-volume"
                label={t.musicVolume}
                hint={t.musicVolumeHint}
                value={musicVolume}
                min={0}
                max={1}
                step={0.05}
                display={`${Math.round(musicVolume * 100)}%`}
                disabled={musicMode === "off"}
                onChange={(value) => {
                  musicVolumeRef.current = value;
                  setMusicVolume(value);
                  if (musicRef.current) musicRef.current.volume = value;
                }}
              />
              <Slider
                id="sound"
                label={t.sound}
                hint={t.soundHint}
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
            </OptionGroup>
            <OptionGroup title={t.sectionSize}>
              <Slider
                id="ball-size"
                label={t.ballSize}
                hint={t.ballSizeHint}
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
                hint={t.machineSizeHint}
                value={machineScale}
                min={0.65}
                max={2.4}
                step={0.05}
                display={`${machineScale.toFixed(2)}×`}
                disabled={busy}
                onChange={setMachineScale}
              />
            </OptionGroup>
            <OptionGroup title={t.sectionRods}>
              <Toggle
                id="rods"
                label={t.rods}
                hint={t.rodsHint}
                checked={rodsOn}
                disabled={record === "recording"}
                onChange={setRodsOn}
              />
              <Slider
                id="rod-count"
                label={t.rodCount}
                hint={t.rodCountHint}
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
                hint={t.rodSpeedHint}
                value={rodSpeed}
                min={0}
                max={3}
                step={0.05}
                display={`${rodSpeed.toFixed(2)}×`}
                disabled={record === "recording" || !rodsOn}
                onChange={setRodSpeed}
              />
            </OptionGroup>
            <OptionGroup title={t.sectionWind}>
              <Toggle
                id="wind"
                label={t.wind}
                hint={t.windHint}
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
                hint={t.windStrengthHint}
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
                hint={t.windWidthHint}
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
                hint={t.windHeightHint}
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
            </OptionGroup>
            <OptionGroup title={t.sectionPhysics}>
              <Slider
                id="speed"
                label={t.speed}
                hint={t.speedHint}
                value={speed}
                min={0.5}
                max={4}
                step={0.1}
                display={`${speed.toFixed(1)}×`}
                disabled={record === "recording"}
                onChange={setSpeed}
              />
              <Slider
                id="suction"
                label={t.suction}
                hint={t.suctionHint}
                value={suction}
                min={0}
                max={3}
                step={0.05}
                display={`${suction.toFixed(2)}×`}
                disabled={record === "recording"}
                onChange={setSuction}
              />
              <Slider
                id="gravity"
                label={t.gravity}
                hint={t.gravityHint}
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
                hint={t.agitationHint}
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
                hint={t.bounceHint}
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
                hint={t.dragHint}
                value={drag}
                min={0}
                max={2.4}
                step={0.05}
                display={drag.toFixed(2)}
                disabled={record === "recording"}
                onChange={setDrag}
              />
            </OptionGroup>
          </details>

          <p className="text-sm text-muted" aria-live="polite">
            {ready ? statusLabel(phase, t) : "…"}
            {nameCount > 0 && phase !== "idle" ? ` · ${drawn.length} ${t.of} ${drawCount}` : ""}
          </p>
          </div>

          <div className="draw-dock fixed inset-x-0 bottom-0 z-30 order-1 border-t border-line bg-bg/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:inset-auto lg:z-auto lg:order-none lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!ready || busy || nameCount === 0}
              onClick={() => {
                engineRef.current?.start();
                syncMusic(phaseRef.current);
              }}
              className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-seal px-4 py-2.5 text-center text-sm leading-tight font-semibold text-fg disabled:opacity-40"
            >
              <Play className="size-4 shrink-0" aria-hidden="true" />
              {t.start}
            </button>
            <button
              type="button"
              disabled={!ready || record === "recording"}
              onClick={() => engineRef.current?.restart()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5 text-center text-sm leading-tight font-semibold text-fg disabled:opacity-40"
            >
              <RotateCcw className="size-4 shrink-0" aria-hidden="true" />
              {t.restart}
            </button>
            <button
              type="button"
              disabled={busy || !text.trim()}
              onClick={() => setConfirmClear(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 py-2.5 text-center text-sm leading-tight font-semibold text-fg disabled:opacity-40"
            >
              <Eraser className="size-4 shrink-0" aria-hidden="true" />
              {t.clear}
            </button>
          </div>
          </div>
          <div className="order-3 flex flex-col gap-3 lg:order-none">
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              disabled={!ready || busy || nameCount === 0}
              onClick={() => {
                if (musicModeRef.current === "draw" && nameCount > 0 && record !== "recording") syncMusic("mixing", "draw");
                void engineRef.current?.exportVideo();
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-brass px-4 py-2.5 text-center text-sm leading-tight font-semibold text-ink disabled:opacity-40"
            >
              <Clapperboard className="size-4 shrink-0" aria-hidden="true" />
              {record === "recording" ? `${t.recording} ${drawn.length}/${drawCount}` : t.record}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setText(SAMPLE_TEXT)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 py-2.5 text-center text-sm leading-tight font-semibold text-brass disabled:opacity-40"
            >
              <Sparkles className="size-4 shrink-0" aria-hidden="true" />
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
          </div>
        </aside>
      </div>
      {confirmClear ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-ink/70 p-4 sm:items-center"
          role="presentation"
          onClick={() => setConfirmClear(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-title"
            className="w-full max-w-sm rounded-lg border border-line bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="clear-title" className="font-display text-2xl leading-tight">
              {t.clearAsk}
            </h2>
            <p className="mt-2 text-sm text-muted">{t.clearAskHint}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-bg px-3 text-sm font-semibold"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setUndoText(text);
                  setText("");
                  setConfirmClear(false);
                }}
                className="inline-flex h-11 items-center justify-center rounded-md bg-seal px-3 text-sm font-semibold text-fg"
              >
                {t.clear}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
