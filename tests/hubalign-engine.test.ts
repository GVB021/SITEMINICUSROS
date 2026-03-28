import test from "node:test";
import assert from "node:assert/strict";
import { estimateSyncOffset } from "../client/src/lib/hubalign/audio-sync-engine";

function randomSignal(length: number, seed = 12345) {
  const out = new Float32Array(length);
  let s = seed >>> 0;
  for (let i = 0; i < length; i++) {
    s = (1664525 * s + 1013904223) >>> 0;
    out[i] = ((s / 0xffffffff) * 2 - 1) * 0.8;
  }
  return out;
}

test("estimateSyncOffset detecta offset aproximado", () => {
  const sr = 8000;
  const reference = randomSignal(sr * 6, 77);
  const take = reference.slice(sr * 2, sr * 3);
  const result = estimateSyncOffset({
    reference,
    take,
    sampleRate: sr,
    hintMs: 2000,
    searchWindowMs: 3000,
  });
  assert.ok(Math.abs(result.offsetMs - 2000) < 100);
  assert.ok(result.confidence > 0.7);
});

test("estimateSyncOffset falha para take curto", () => {
  const sr = 8000;
  const reference = randomSignal(sr * 2, 99);
  const take = randomSignal(100, 100);
  assert.throws(() =>
    estimateSyncOffset({
      reference,
      take,
      sampleRate: sr,
    })
  );
});
