export interface SyncEstimateInput {
  reference: Float32Array;
  take: Float32Array;
  sampleRate: number;
  hintMs?: number;
  searchWindowMs?: number;
}

export interface SyncEstimateResult {
  offsetMs: number;
  confidence: number;
  durationMs: number;
}

function rms(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let acc = 0;
  for (let i = 0; i < samples.length; i++) acc += samples[i] * samples[i];
  return Math.sqrt(acc / samples.length);
}

function normalize(samples: Float32Array): Float32Array {
  const out = new Float32Array(samples.length);
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const p = Math.abs(samples[i]);
    if (p > peak) peak = p;
  }
  if (peak === 0) return out;
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] / peak;
  return out;
}

function monoFromBuffer(buffer: AudioBuffer): Float32Array {
  const channels = buffer.numberOfChannels;
  if (channels === 1) {
    const ch = buffer.getChannelData(0);
    const copy = new Float32Array(ch.length);
    copy.set(ch);
    return copy;
  }
  const len = buffer.length;
  const mono = new Float32Array(len);
  for (let c = 0; c < channels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < len; i++) mono[i] += data[i];
  }
  const inv = 1 / channels;
  for (let i = 0; i < len; i++) mono[i] *= inv;
  return mono;
}

function resampleLinear(samples: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return samples;
  const factor = toRate / fromRate;
  const outLen = Math.max(1, Math.floor(samples.length * factor));
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const src = i / factor;
    const i0 = Math.floor(src);
    const i1 = Math.min(samples.length - 1, i0 + 1);
    const t = src - i0;
    out[i] = samples[i0] * (1 - t) + samples[i1] * t;
  }
  return out;
}

function corrCoeffAt(reference: Float32Array, take: Float32Array, start: number): number {
  let dot = 0;
  let refPow = 0;
  let takePow = 0;
  for (let i = 0; i < take.length; i++) {
    const a = reference[start + i];
    const b = take[i];
    dot += a * b;
    refPow += a * a;
    takePow += b * b;
  }
  const den = Math.sqrt(refPow) * Math.sqrt(takePow) + 1e-9;
  return dot / den;
}

export function estimateSyncOffset(input: SyncEstimateInput): SyncEstimateResult {
  const targetRate = 8000;
  const reference = normalize(resampleLinear(input.reference, input.sampleRate, targetRate));
  const take = normalize(resampleLinear(input.take, input.sampleRate, targetRate));
  const minTakeSamples = Math.floor(0.12 * targetRate);
  if (take.length < minTakeSamples) {
    throw new Error("Take muito curto para alinhamento");
  }
  if (reference.length <= take.length + 1) {
    throw new Error("Referência menor que o take");
  }

  const hint = Math.max(0, Math.floor(((input.hintMs ?? 0) / 1000) * targetRate));
  const window = Math.max(take.length, Math.floor(((input.searchWindowMs ?? 8000) / 1000) * targetRate));
  const searchStart = Math.max(0, hint - window);
  const searchEnd = Math.min(reference.length - take.length, hint + window);
  const stride = 64;

  let bestOffset = searchStart;
  let best = -Infinity;
  for (let start = searchStart; start <= searchEnd; start += stride) {
    const c = corrCoeffAt(reference, take, start);
    if (c > best) {
      best = c;
      bestOffset = start;
    }
  }

  const refineStart = Math.max(searchStart, bestOffset - stride);
  const refineEnd = Math.min(searchEnd, bestOffset + stride);
  for (let start = refineStart; start <= refineEnd; start++) {
    const c = corrCoeffAt(reference, take, start);
    if (c > best) {
      best = c;
      bestOffset = start;
    }
  }

  const confidence = Math.max(0, Math.min(1, (best + 1) / 2));
  return {
    offsetMs: (bestOffset / targetRate) * 1000,
    confidence,
    durationMs: (take.length / targetRate) * 1000,
  };
}

export async function decodeAudioFile(file: File): Promise<{ samples: Float32Array; sampleRate: number; rms: number }> {
  const ctx = new AudioContext();
  try {
    const arr = await file.arrayBuffer();
    const buffer = await ctx.decodeAudioData(arr.slice(0));
    const mono = monoFromBuffer(buffer);
    return {
      samples: mono,
      sampleRate: buffer.sampleRate,
      rms: rms(mono),
    };
  } finally {
    await ctx.close();
  }
}
