import {
  AudioBufferSource,
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  Quality,
  canEncodeAudio,
  canEncodeVideo,
  getFirstEncodableAudioCodec,
} from "mediabunny";

type Cue = { kind: "knock" | "chime"; t: number; strength: number; volume: number };

export class DrawRecorder {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private output: Output | null = null;
  private source: CanvasSource | null = null;
  private audioSource: AudioBufferSource | null = null;
  private mixCtx: AudioContext | null = null;
  private rate = 48000;
  private cues: Cue[] = [];
  private music: AudioBuffer | null = null;
  private musicGain = 0;
  private pending: Promise<unknown>[] = [];
  private inflight = 0;
  private failed: unknown = null;
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

  setScore(music: AudioBuffer | null, gain: number) {
    this.music = music;
    this.musicGain = gain;
  }

  knock(strength: number, volume: number) {
    if (!this.active || !this.audioSource || volume <= 0.001) return;
    this.cues.push({ kind: "knock", t: this.time, strength, volume });
  }

  chime(volume: number) {
    if (!this.active || !this.audioSource || volume <= 0.001) return;
    this.cues.push({ kind: "chime", t: this.time, strength: 1, volume });
  }

  async open(width: number, height: number): Promise<boolean> {
    const w = Math.max(2, width - (width % 2));
    const h = Math.max(2, height - (height % 2));
    let ok = false;
    try {
      ok = await canEncodeVideo("avc", { width: w, height: h, bitrate: new Quality("medium") });
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
      target,
    });
    const source = new CanvasSource(this.canvas, {
      codec: "avc",
      bitrate: new Quality("medium"),
    });
    output.addVideoTrack(source);
    let audioSource: AudioBufferSource | null = null;
    let mixCtx: AudioContext | null = null;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) {
        mixCtx = new Ctx();
        this.rate = mixCtx.sampleRate;
        const codec = await getFirstEncodableAudioCodec(["aac", "opus"], {
          numberOfChannels: 2,
          sampleRate: this.rate,
        });
        if (codec) {
          audioSource = new AudioBufferSource({
            codec,
            quality: new Quality("medium"),
            transform: codec === "opus" ? { sampleRate: 48000, numberOfChannels: 2 } : undefined,
          });
          output.addAudioTrack(audioSource);
        } else {
          void mixCtx.close();
          mixCtx = null;
        }
      }
    } catch {
      audioSource = null;
      void mixCtx?.close();
      mixCtx = null;
    }
    output.setMetadataTags({
      title: "Саветодавно тело",
      artist: "Marko Njegomir",
    });
    await output.start();
    this.output = output;
    this.source = source;
    this.audioSource = audioSource;
    this.mixCtx = mixCtx;
    this.cues = [];
    this.pending = [];
    this.inflight = 0;
    this.failed = null;
    this.time = 0;
    this.active = true;
    return true;
  }

  capture(gl: HTMLCanvasElement, hud: HTMLCanvasElement, duration: number) {
    if (!this.active || !this.source || this.failed) return;
    const w = this.width;
    const h = this.height;
    this.ctx.fillStyle = "#14120e";
    this.ctx.fillRect(0, 0, w, h);
    this.ctx.drawImage(gl, 0, 0, w, h);
    this.ctx.drawImage(hud, 0, 0, w, h);
    const ts = this.time;
    this.time += duration;
    this.enqueue(this.source.add(ts, duration));
    if (this.audioSource && this.mixCtx) {
      const buffer = this.renderAudio(ts, duration);
      if (buffer) this.enqueue(this.audioSource.add(buffer));
    }
  }

  private enqueue(job: Promise<unknown>) {
    this.inflight += 1;
    const tracked = job.then(
      () => {
        this.inflight -= 1;
      },
      (error: unknown) => {
        this.inflight -= 1;
        this.failed = error;
      },
    );
    this.pending.push(tracked);
  }

  private renderAudio(start: number, duration: number) {
    const ctx = this.mixCtx;
    if (!ctx) return null;
    const rate = this.rate;
    const a0 = Math.round(start * rate);
    const a1 = Math.round((start + duration) * rate);
    const n = Math.max(1, a1 - a0);
    const buffer = ctx.createBuffer(2, n, rate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    this.mixMusic(left, right, a0, rate);
    for (const cue of this.cues) {
      if (cue.kind === "knock") mixKnock(left, right, rate, start, cue);
      else mixChime(left, right, rate, start, cue);
    }
    const horizon = start - 0.8;
    if (this.cues.length > 8) this.cues = this.cues.filter((cue) => cue.t > horizon);
    for (let i = 0; i < n; i++) {
      left[i] = Math.tanh(left[i]);
      right[i] = Math.tanh(right[i]);
    }
    return buffer;
  }

  private mixMusic(left: Float32Array, right: Float32Array, a0: number, rate: number) {
    const music = this.music;
    const gain = this.musicGain;
    if (!music || gain <= 0.001) return;
    const ch0 = music.getChannelData(0);
    const ch1 = music.numberOfChannels > 1 ? music.getChannelData(1) : ch0;
    const len = ch0.length;
    if (len < 2) return;
    const mRate = music.sampleRate;
    for (let i = 0; i < left.length; i++) {
      const pos = (((a0 + i) / rate) * mRate) % len;
      const i0 = Math.floor(pos);
      const i1 = (i0 + 1) % len;
      const f = pos - i0;
      left[i] += (ch0[i0] * (1 - f) + ch0[i1] * f) * gain;
      right[i] += (ch1[i0] * (1 - f) + ch1[i1] * f) * gain;
    }
  }

  get busy() {
    return this.inflight;
  }

  async finish(): Promise<Blob> {
    this.active = false;
    await Promise.all(this.pending);
    if (this.failed) throw this.failed instanceof Error ? this.failed : new Error("encode");
    const output = this.output;
    const source = this.source;
    if (!output || !source) throw new Error("recorder");
    source.close();
    this.audioSource?.close();
    await output.finalize();
    const buffer = (output.target as BufferTarget).buffer;
    this.output = null;
    this.source = null;
    this.audioSource = null;
    this.pending = [];
    this.cues = [];
    void this.mixCtx?.close();
    this.mixCtx = null;
    if (!buffer) throw new Error("empty");
    return new Blob([buffer], { type: "video/mp4" });
  }

  async cancel() {
    this.active = false;
    const output = this.output;
    this.output = null;
    this.source = null;
    this.audioSource = null;
    this.pending = [];
    this.cues = [];
    void this.mixCtx?.close();
    this.mixCtx = null;
    if (output && output.state !== "finalized" && output.state !== "canceled") {
      await output.cancel().catch(() => undefined);
    }
  }
}

function mixKnock(left: Float32Array, right: Float32Array, rate: number, frameStart: number, cue: Cue) {
  const dur = 0.055;
  const vol = (0.03 + cue.strength * 0.16) * cue.volume;
  const f0 = 180 + cue.strength * 220;
  const f1 = 90 + cue.strength * 40;
  const n = left.length;
  const i0 = Math.max(0, Math.floor((cue.t - frameStart) * rate));
  const i1 = Math.min(n, Math.ceil((cue.t + dur - frameStart) * rate));
  const seed = Math.floor(cue.t * 1000) ^ Math.floor(cue.strength * 100);
  for (let i = i0; i < i1; i++) {
    const t = frameStart + (i + 0.5) / rate - cue.t;
    if (t < 0 || t > dur) continue;
    const tt = Math.min(t, 0.04);
    const phase = f0 * tt + ((f1 - f0) * tt * tt) / (2 * 0.04);
    const body = Math.sin(phase * Math.PI * 2) * vol * 0.55 * Math.exp(-t * 48);
    const white = ((((seed + i) * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
    const noise = t < 0.045 ? white * vol * Math.exp(-t * 70) * 0.65 : 0;
    const sample = body + noise;
    left[i] += sample;
    right[i] += sample;
  }
}

function mixChime(left: Float32Array, right: Float32Array, rate: number, frameStart: number, cue: Cue) {
  const dur = 0.7;
  const peak = 0.06 * cue.volume;
  const n = left.length;
  const i0 = Math.max(0, Math.floor((cue.t - frameStart) * rate));
  const i1 = Math.min(n, Math.ceil((cue.t + dur - frameStart) * rate));
  for (let i = i0; i < i1; i++) {
    const t = frameStart + (i + 0.5) / rate - cue.t;
    if (t < 0 || t > dur) continue;
    const env = t < 0.02 ? peak * (t / 0.02) : t > 0.65 ? 0 : peak * Math.exp(-((t - 0.02) / 0.63) * 6);
    const sweep = Math.min(t, 0.2) / 0.2;
    const low = 523.25 * (1 + sweep * 0.5);
    const high = 784 * (1 + sweep * 0.5);
    const sine = Math.sin(low * t * Math.PI * 2);
    const triPhase = (high * t) % 1;
    const tri = triPhase < 0.5 ? 4 * triPhase - 1 : 3 - 4 * triPhase;
    const sample = (sine * 0.7 + tri * 0.35) * env;
    left[i] += sample;
    right[i] += sample;
  }
}
