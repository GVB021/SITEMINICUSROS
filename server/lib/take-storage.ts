import fs from "fs";
import path from "path";

function normalizeSegment(input: string) {
  const raw = (input || "").trim() || "sem_nome";
  const noAccents = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const snake = noAccents
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  return snake || "sem_nome";
}

function normalizeTokenUpper(input: string) {
  const raw = (input || "").trim() || "SEM_NOME";
  const noAccents = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const token = noAccents
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
  return token || "SEM_NOME";
}

export function isValidHhMmSs(value: string): boolean {
  return /^\d{2}:[0-5]\d:[0-5]\d$/.test(String(value || "").trim());
}

export function formatSecondsToHhMmSs(seconds: number): string {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hh = String(Math.floor(total / 3600)).padStart(2, "0");
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function resolveTimecodeHhMmSs(input: string | undefined, startTimeSeconds: number | undefined): string {
  const raw = String(input || "").trim();
  if (raw) {
    if (!isValidHhMmSs(raw)) {
      throw new Error("Timecode deve estar no formato HH:MM:SS");
    }
    return raw;
  }
  return formatSecondsToHhMmSs(startTimeSeconds || 0);
}

export function buildTakeRelativePath(params: {
  studioName: string;
  productionName: string;
  sessionName: string;
  characterNameSelected: string;
  voiceActorNameSelected: string;
  timecodeHhMmSs: string;
  ext?: string;
}): string {
  const ext = (params.ext || ".wav").startsWith(".") ? (params.ext || ".wav") : `.${params.ext || "wav"}`;
  const studioFolder = normalizeSegment(params.studioName);
  const productionFolder = normalizeSegment(params.productionName);
  const sessionFolder = normalizeSegment(params.sessionName);
  const characterFolder = normalizeSegment(params.characterNameSelected);
  const voiceActorFolder = normalizeSegment(params.voiceActorNameSelected);
  const characterToken = normalizeTokenUpper(params.characterNameSelected);
  const voiceActorToken = normalizeTokenUpper(params.voiceActorNameSelected);
  const timecodeToken = params.timecodeHhMmSs.replace(/:/g, "");
  const filename = `${characterToken}_${voiceActorToken}_${timecodeToken}${ext.toLowerCase()}`;
  return path.join(studioFolder, productionFolder, sessionFolder, characterFolder, voiceActorFolder, filename);
}

export function ensureDirectoryForRelativeFile(baseDir: string, relativeFilePath: string): string {
  const fullPath = path.join(baseDir, relativeFilePath);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  return fullPath;
}
