#!/usr/bin/env node
/**
 * Synthesizes royalty-free sound effects into public/sfx/ as 16-bit mono WAV.
 * No dependencies. Deterministic (seeded noise), so output is identical every run.
 *
 *   node scripts/generate-sfx.js
 */
const fs = require("fs");
const path = require("path");

const SR = 44100;
const OUT_DIR = path.join(__dirname, "..", "public", "sfx");

// ---------- helpers ----------
let seed = 1337;
const rand = () => {
  // mulberry32
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const noise = () => rand() * 2 - 1;
const buffer = (seconds) => new Float32Array(Math.ceil(seconds * SR));
const TAU = Math.PI * 2;

/** One-pole low-pass, returns a filter function. */
const lowpass = (cutoffHz) => {
  let y = 0;
  const a = 1 - Math.exp((-TAU * cutoffHz) / SR);
  return (x) => (y += a * (x - y));
};

/** Chamberlin state-variable band-pass with modulatable center frequency. */
const bandpass = (q = 0.7) => {
  let low = 0;
  let band = 0;
  return (x, fc) => {
    const f = 2 * Math.sin((Math.PI * Math.min(fc, SR / 6)) / SR);
    low += f * band;
    const high = x - low - q * band;
    band += f * high;
    return band;
  };
};

const normalize = (buf, peak = 0.89) => {
  let max = 0;
  for (const v of buf) max = Math.max(max, Math.abs(v));
  if (max === 0) return buf;
  for (let i = 0; i < buf.length; i++) buf[i] = (buf[i] / max) * peak;
  return buf;
};

/** Short fades on both ends so there are no clicks. */
const declick = (buf, ms = 3) => {
  const n = Math.floor((ms / 1000) * SR);
  for (let i = 0; i < n && i < buf.length; i++) {
    buf[i] *= i / n;
    buf[buf.length - 1 - i] *= i / n;
  }
  return buf;
};

const writeWav = (file, buf) => {
  const data = Buffer.alloc(buf.length * 2);
  for (let i = 0; i < buf.length; i++) {
    const s = Math.max(-1, Math.min(1, buf[i]));
    data.writeInt16LE(Math.round(s * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([header, data]));
  console.log(`  ✓ ${path.relative(process.cwd(), file)}  (${(buf.length / SR).toFixed(2)}s)`);
};

// ---------- sounds ----------

/** Mechanical clock tick: a noise transient plus two damped resonances. */
const tick = () => {
  const buf = buffer(0.12);
  const bp = bandpass(0.25);
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    const click = noise() * Math.exp(-t * 900);
    const body = Math.sin(TAU * 2400 * t) * Math.exp(-t * 120) * 0.6;
    const wood = Math.sin(TAU * 820 * t) * Math.exp(-t * 60) * 0.35;
    buf[i] = bp(click, 3200) * 2 + body + wood;
  }
  return declick(normalize(buf, 0.7), 1);
};

/** Sub-bass thud (pitch drop 90→38 Hz) followed by a two-note warning chime. */
const alert = () => {
  const buf = buffer(1.3);
  let phase = 0;
  const lp = lowpass(180);
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    const f = 38 + 52 * Math.exp(-t * 9);
    phase += (TAU * f) / SR;
    const thud = Math.sin(phase) * Math.exp(-t * 4.5) * (1 - Math.exp(-t * 400));
    const knock = lp(noise()) * Math.exp(-t * 40) * 3;
    let chime = 0;
    const c1 = t - 0.08;
    if (c1 > 0) {
      const env = Math.exp(-c1 * 5) * (1 - Math.exp(-c1 * 300));
      chime += (Math.sin(TAU * 880 * c1) + 0.4 * Math.sin(TAU * 1760 * c1)) * env * 0.28;
    }
    const c2 = t - 0.26;
    if (c2 > 0) {
      const env = Math.exp(-c2 * 4) * (1 - Math.exp(-c2 * 300));
      chime += (Math.sin(TAU * 660 * c2) + 0.4 * Math.sin(TAU * 1320 * c2)) * env * 0.28;
    }
    buf[i] = thud * 1.0 + knock + chime;
  }
  return declick(normalize(buf));
};

/** Descending digital blips (square-ish, 1400 → 300 Hz). */
const cashDrop = () => {
  const buf = buffer(0.42);
  const blips = 4;
  const blipLen = 0.085;
  let phase = 0;
  const lp = lowpass(5000);
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    const idx = Math.floor(t / blipLen);
    if (idx >= blips) {
      buf[i] = 0;
      continue;
    }
    const local = t - idx * blipLen;
    const startF = 1400 * Math.pow(0.62, idx);
    const f = startF * Math.pow(0.7, local / blipLen);
    phase += (TAU * f) / SR;
    const sq = Math.tanh(Math.sin(phase) * 4); // soft square
    const env = Math.exp(-local * 38) * (1 - Math.exp(-local * 2000));
    buf[i] = lp(sq * env * (1 - idx * 0.12));
  }
  return declick(normalize(buf, 0.75));
};

/** Filtered white-noise sweep, band-pass center 250 → 3500 → 600 Hz. */
const whoosh = () => {
  const dur = 0.7;
  const buf = buffer(dur);
  const bp1 = bandpass(0.9);
  const bp2 = bandpass(0.9);
  for (let i = 0; i < buf.length; i++) {
    const t = i / SR;
    const x = t / dur;
    const fc = x < 0.55 ? 250 * Math.pow(3500 / 250, x / 0.55) : 3500 * Math.pow(600 / 3500, (x - 0.55) / 0.45);
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, x * 1.15)), 2.2);
    const n = noise();
    buf[i] = (bp1(n, fc) + 0.5 * bp2(n, fc * 1.6)) * env;
  }
  return declick(normalize(buf, 0.8), 6);
};

// ---------- main ----------
fs.mkdirSync(OUT_DIR, { recursive: true });
console.log("Generating SFX →", path.relative(process.cwd(), OUT_DIR) || OUT_DIR);
writeWav(path.join(OUT_DIR, "tick.wav"), tick());
writeWav(path.join(OUT_DIR, "alert.wav"), alert());
writeWav(path.join(OUT_DIR, "cash_drop.wav"), cashDrop());
writeWav(path.join(OUT_DIR, "whoosh.wav"), whoosh());
console.log("Done.");
