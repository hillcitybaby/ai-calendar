/**
 * Particle engine for the Assistant Mark, ported from design/assistant-mark-prototype.html.
 * Keep the shapes and physics in sync with the prototype; it is the approved motion spec.
 *
 * Every particle has stable randoms (u1, u2, a, k). Each state maps those to a target point
 * inside a simple shape (unit space, roughly -1…1). Particles steer toward their target,
 * pick up a shared "current" while travelling so neighbours move in bands, and leave one
 * side first when the state changes.
 */

export const ASSISTANT_STATES = [
  "idle",
  "summoned",
  "listening",
  "thinking",
  "responding",
  "waiting",
  "done",
  "error",
  "offline",
  "searching",
  "suggesting",
  "scheduling",
] as const;

export type AssistantState = (typeof ASSISTANT_STATES)[number];

type Particle = {
  u1: number;
  u2: number;
  a: number;
  k: number;
  d: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  sz: number;
  al: number;
};

type Point = [number, number];
type ShapeFn = (p: Particle, t: number, tau: number) => Point;

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

function voice(t: number) {
  return clamp(
    Math.abs(Math.sin(t * 3.1) * 0.5 + Math.sin(t * 5.3 + 1.3) * 0.3 + Math.sin(t * 1.7 + 2.1) * 0.4),
    0,
    1,
  );
}

/** Polar point → rounded square (m = roundness, 0 circle … 1 square). */
function squarePt(r: number, th: number, half: number, m: number): Point {
  const c = Math.cos(th);
  const s = Math.sin(th);
  const k = lerp(1, 1 / Math.max(Math.abs(c), Math.abs(s)), m);
  return [c * r * k * half, s * r * k * half];
}

const SHAPES: Record<AssistantState, ShapeFn> = {
  idle: (p, t) => {
    const rho = Math.sqrt(p.u1);
    const R = 0.72 * (1 + 0.05 * Math.sin(p.u2 * TAU * 3 + t * 0.7));
    const th = p.u2 * TAU + t * (0.16 + 0.26 * (1 - rho));
    return [Math.cos(th) * rho * R, Math.sin(th) * rho * R];
  },
  summoned: (p, t) => {
    const rho = Math.sqrt(p.u1);
    const R = 0.42;
    const th = p.u2 * TAU + t * (0.45 + 0.4 * (1 - rho));
    return [Math.cos(th) * rho * R, 0.3 + Math.sin(th) * rho * R];
  },
  listening: (p, t) => {
    const x = (p.u1 * 2 - 1) * 0.9;
    const end = Math.sqrt(clamp(1 - Math.pow(Math.abs(x) / 0.9, 6), 0, 1));
    const h = (0.1 + 0.34 * voice(t * 0.9 - x * 0.7)) * end;
    return [x, (p.u2 * 2 - 1) * h * 0.5];
  },
  thinking: (p, t) => {
    const r = Math.sqrt(0.46 * 0.46 + p.u1 * (0.8 * 0.8 - 0.46 * 0.46));
    const th = p.u2 * TAU + t * (0.7 + 0.25 * p.u1);
    const rr = r + 0.045 * Math.sin(th * 3 - t * 1.4);
    return [Math.cos(th) * rr, Math.sin(th) * rr];
  },
  responding: (p, _t, tau) => {
    const rows: Point[] = [
      [-0.3, 1.5],
      [0, 1.3],
      [0.3, 0.8],
    ];
    const left = -0.75;
    const ri = Math.min(2, Math.floor(p.u2 * 3));
    const fr = (p.u2 * 3) % 1;
    const [ry, w] = rows[ri];
    const head = (tau * 0.55) % 3.6;
    const local = ri + p.u1 - head;
    const bump = Math.exp(-local * local * 30);
    return [left + p.u1 * w + bump * 0.03, ry + (fr - 0.5) * (0.035 + 0.16 * bump)];
  },
  waiting: (p, t) => {
    const b = 1 + 0.03 * Math.sin(t * 1.3);
    return squarePt(Math.sqrt(p.u1), p.u2 * TAU + t * 0.22, 0.6 * b, 0.82);
  },
  done: (p, t) => {
    const rho = Math.sqrt(p.u1);
    const R = 0.3;
    const th = p.u2 * TAU + t * 0.1;
    return [Math.cos(th) * rho * R, 0.32 + Math.sin(th) * rho * R * 0.9];
  },
  error: (p, t) => {
    let a = p.u1;
    let b = p.u2;
    if (a + b > 1) {
      a = 1 - a;
      b = 1 - b;
    }
    const A: Point = [0, -0.62];
    const B: Point = [0.66, 0.5];
    const C: Point = [-0.66, 0.5];
    const x = A[0] + a * (B[0] - A[0]) + b * (C[0] - A[0]);
    const y = A[1] + a * (B[1] - A[1]) + b * (C[1] - A[1]);
    return [x + Math.sin(t * 0.7 + p.a * 9) * 0.03, y + 0.05 + Math.cos(t * 0.6 + p.a * 7) * 0.03];
  },
  offline: (p, t) => [
    (p.u1 * 2 - 1) * 0.95 + Math.sin(t * 0.2 + p.a * 5) * 0.01,
    0.25 + (p.u2 - 0.5) * 0.05,
  ],
  searching: (p, t) => {
    const c = Math.min(2, Math.floor(p.u2 * 3));
    const f = (p.u2 * 3) % 1;
    const orbit = 0.52 + 0.14 * Math.sin(t * 0.8);
    const ang = (c * TAU) / 3 + t * 0.5;
    const rho = Math.sqrt(p.u1) * 0.19;
    const th = f * TAU + t * 1.1;
    return [Math.cos(ang) * orbit + Math.cos(th) * rho, Math.sin(ang) * orbit + Math.sin(th) * rho];
  },
  suggesting: (p, t, tau) => {
    const m = tau % 6.5;
    const rho = Math.sqrt(p.u1);
    const th = p.u2 * TAU + t * 0.6;
    const R = m < 1 ? lerp(0.72, 0.16, ease(m)) : m < 5.4 ? 0.16 : lerp(0.16, 0.72, ease((m - 5.4) / 1.1));
    if (p.k < 0.2 && m > 1.6 && m < 5.4) {
      return [0.78 + Math.cos(th) * rho * 0.09, 0.62 + Math.sin(th) * rho * 0.09];
    }
    return [Math.cos(th) * rho * R, Math.sin(th) * rho * R];
  },
  scheduling: (p, t, tau) => {
    const m = tau % 5.5;
    const fill = m < 3 ? ease(clamp(m / 2.6, 0, 1)) : m < 4.4 ? 1 : 1 - ease((m - 4.4) / 1.1);
    const x = (p.u1 * 2 - 1) * 0.75;
    const row = p.u2;
    if (row <= fill) return [x * 0.98, -0.3 + row * 0.6];
    return [lerp(-0.6, 0.6, p.u1) + Math.sin(t * 1.2 + p.a * 6) * 0.02, -0.62 + (row - fill) * 0.12];
  },
};

type Feel = { speed: number; agile: number; alpha: number; flow: number };
const BASE_FEEL: Feel = { speed: 1.5, agile: 3.2, alpha: 1, flow: 1 };
const FEEL: Partial<Record<AssistantState, Partial<Feel>>> = {
  offline: { speed: 0.45, agile: 1.4, alpha: 0.35, flow: 0.2 },
  done: { speed: 0.9, agile: 2.4, alpha: 1, flow: 0.6 },
  error: { speed: 0.8, agile: 2, alpha: 0.75, flow: 0.7 },
  waiting: { speed: 1, agile: 2.6, alpha: 1, flow: 0.6 },
};
const feelFor = (s: AssistantState): Feel => ({ ...BASE_FEEL, ...FEEL[s] });

/** Shared current: a smooth, time-varying field so neighbours travel in bands. */
function current(x: number, y: number, t: number): Point {
  const a = Math.sin(x * 1.9 + t * 0.45) + Math.sin(y * 2.4 - t * 0.35) + Math.sin((x + y) * 1.3 + t * 0.2);
  const b = Math.cos(x * 2.2 - t * 0.3) - Math.sin(y * 1.6 + t * 0.5) + Math.cos((x - y) * 1.1 - t * 0.25);
  return [Math.cos(a * 1.4), Math.sin(b * 1.4)];
}

/** Time used to pose a still shape (reduced motion). Matches the prototype. */
const STILL_T = 4;

export type SwarmOptions = {
  /** Particle count. */
  n: number;
  /** Dot radius multiplier, in CSS px. */
  size: number;
  /** Shape radius as a fraction of the canvas's shorter side. */
  scale: number;
  state: AssistantState;
  seed: number;
};

export class Swarm {
  private ctx: CanvasRenderingContext2D;
  private parts: Particle[] = [];
  private state: AssistantState;
  private prev: AssistantState;
  private changeT: number;
  private feel: Feel;
  private W = 1;
  private H = 1;
  private U = 1;
  private dpr = 1;
  ink: [number, number, number] = [23, 23, 23];

  constructor(
    private canvas: HTMLCanvasElement,
    private o: SwarmOptions,
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas not available");
    this.ctx = ctx;
    this.state = o.state;
    this.prev = o.state;
    this.changeT = now() - 20;
    this.feel = feelFor(o.state);
    this.resize();

    let s = o.seed * 7919 + 13;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < o.n; i++) {
      this.parts.push({
        u1: r(), u2: r(), a: r(), k: r(), d: r() * 0.55,
        x: (r() - 0.5) * 2, y: (r() - 0.5) * 1.4, vx: 0, vy: 0,
        sz: 0.7 + r() * 0.6, al: 0.45 + r() * 0.5,
      });
    }
    // Start already in shape.
    const t = now();
    for (const p of this.parts) {
      const [x, y] = this.target(p, t, this.state);
      p.x = x;
      p.y = y;
    }
  }

  resize() {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, this.canvas.clientWidth);
    const h = Math.max(1, this.canvas.clientHeight);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.W = this.canvas.width;
    this.H = this.canvas.height;
    this.U = Math.min(this.W, this.H) * this.o.scale;
  }

  set(state: AssistantState) {
    if (state === this.state) return;
    this.prev = this.state;
    this.state = state;
    this.changeT = now();
    this.feel = feelFor(state);
    // Particles leave one side first: order by current x.
    for (const p of this.parts) p.d = clamp((p.x + 1) / 2, 0, 1) * 0.55 + p.a * 0.08;
  }

  private target(p: Particle, t: number, st: AssistantState): Point {
    return SHAPES[st](p, t, t - this.changeT);
  }

  /** Advance and paint one frame. `still` poses every particle exactly on its shape. */
  draw(t: number, dt: number, still = false) {
    const { ctx, U, feel: f } = this;
    const cx = this.W / 2;
    const cy = this.H / 2;
    const since = t - this.changeT;
    const ag = 1 - Math.exp(-dt * f.agile);
    const maxV = f.speed;

    for (const p of this.parts) {
      const st = since < p.d && !still ? this.prev : this.state;
      if (still) {
        const [tx, ty] = SHAPES[st](p, STILL_T, STILL_T);
        p.x = tx;
        p.y = ty;
        p.vx = 0;
        p.vy = 0;
        continue;
      }
      const [tx, ty] = this.target(p, t, st);
      const [hx, hy] = this.target(p, t + 1 / 30, st);
      const dx = tx - p.x;
      const dy = ty - p.y;
      const d = Math.hypot(dx, dy);
      const ff = clamp(1 - d * 4, 0, 1);
      let vx = (hx - tx) * 30 * ff;
      let vy = (hy - ty) * 30 * ff;
      if (d > 1e-4) {
        const sp = Math.min(maxV, d * 3.4);
        vx += (dx / d) * sp;
        vy += (dy / d) * sp;
      }
      const moving = since - p.d < 1.8;
      const tr = moving ? clamp(d * 3, 0, 1) * f.flow : 0;
      if (tr > 0.01) {
        const [fx, fy] = current(p.x, p.y, t);
        vx += fx * 0.55 * tr;
        vy += fy * 0.55 * tr;
      }
      const k = d < 0.12 ? 1 - Math.exp(-dt * 12) : ag;
      p.vx += (vx - p.vx) * k;
      p.vy += (vy - p.vy) * k;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    ctx.clearRect(0, 0, this.W, this.H);
    ctx.fillStyle = `rgb(${this.ink[0]},${this.ink[1]},${this.ink[2]})`;
    // Batch dots into four alpha buckets: one path + fill per bucket.
    const buckets: number[][] = [[], [], [], []];
    for (const p of this.parts) {
      const a = p.al * f.alpha;
      const bi = Math.min(3, Math.floor(a * 4));
      buckets[bi].push(cx + p.x * U, cy + p.y * U, p.sz * this.o.size * this.dpr);
    }
    buckets.forEach((arr, bi) => {
      if (!arr.length) return;
      ctx.globalAlpha = ((bi + 1) / 4) * 0.95;
      ctx.beginPath();
      for (let i = 0; i < arr.length; i += 3) {
        ctx.moveTo(arr[i] + arr[i + 2], arr[i + 1]);
        ctx.arc(arr[i], arr[i + 1], arr[i + 2], 0, TAU);
      }
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
}

function now() {
  return performance.now() / 1000;
}

/* ---------- one shared animation loop for every mark on the page ---------- */

const active = new Set<{ swarm: Swarm; visible: boolean }>();
let rafId = 0;
let last = 0;

function loop(ts: number) {
  const dt = Math.min(0.05, (ts - last) / 1000);
  last = ts;
  for (const entry of active) if (entry.visible) entry.swarm.draw(ts / 1000, dt);
  rafId = active.size ? requestAnimationFrame(loop) : 0;
}

export function startAnimating(entry: { swarm: Swarm; visible: boolean }) {
  active.add(entry);
  if (!rafId) {
    last = performance.now();
    rafId = requestAnimationFrame(loop);
  }
}

export function stopAnimating(entry: { swarm: Swarm; visible: boolean }) {
  active.delete(entry);
  if (!active.size && rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
}

/** Parse a CSS color (hex or rgb()) into an RGB triple. */
export function parseInk(value: string): [number, number, number] | null {
  const v = value.trim();
  if (v.startsWith("#")) {
    const hex = v.length === 4 ? v.slice(1).replace(/./g, (c) => c + c) : v.slice(1, 7);
    const n = parseInt(hex, 16);
    if (Number.isNaN(n)) return null;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = v.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}
