import {
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  Quality,
  canEncodeVideo,
} from "mediabunny";

export class DrawRecorder {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private output: Output | null = null;
  private source: CanvasSource | null = null;
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
    output.setMetadataTags({
      title: "Саветодавно тело",
      artist: "Marko Njegomir",
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
    this.inflight += 1;
    try {
      const job = this.source.add(ts, duration).then(
        () => {
          this.inflight -= 1;
        },
        (error: unknown) => {
          this.inflight -= 1;
          this.failed = error;
        },
      );
      this.pending.push(job);
    } catch (error) {
      this.inflight -= 1;
      this.failed = error;
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
    await output.finalize();
    const buffer = (output.target as BufferTarget).buffer;
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
    if (output && output.state !== "finalized" && output.state !== "canceled") {
      await output.cancel().catch(() => undefined);
    }
  }
}
