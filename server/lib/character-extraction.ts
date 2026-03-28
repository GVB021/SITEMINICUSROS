function normalizeKey(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanupName(input: string) {
  return input
    .replace(/^[-–—\s]+/, "")
    .replace(/[\s:：\-–—]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function maybeCharacterName(name: string): boolean {
  if (!name) return false;
  if (name.length < 2 || name.length > 60) return false;
  if (/\d{3,}/.test(name)) return false;
  return /[A-Za-zÀ-ÿ]/.test(name);
}

export function extractCharactersFromText(text: string): string[] {
  const source = String(text || "");
  const candidates: string[] = [];

  const speakerRegex = /^(?:\s*)([A-ZÀ-Ý][A-ZÀ-Ý0-9'’._\-\s]{1,40})\s*[:：-]/gm;
  let m: RegExpExecArray | null;
  while ((m = speakerRegex.exec(source))) {
    candidates.push(cleanupName(m[1]));
  }

  const bracketRegex = /\[([^\]\n]{2,40})\]/g;
  while ((m = bracketRegex.exec(source))) {
    const value = cleanupName(m[1]);
    if (/^[A-ZÀ-Ý][A-ZÀ-Ý0-9'’._\-\s]+$/.test(value)) candidates.push(value);
  }

  const jsonCharacterRegex = /"(?:character|personagem|char)"\s*:\s*"([^"\n]{2,60})"/gi;
  while ((m = jsonCharacterRegex.exec(source))) {
    candidates.push(cleanupName(m[1]));
  }

  const unique = new Map<string, string>();
  for (const c of candidates) {
    if (!maybeCharacterName(c)) continue;
    const key = normalizeKey(c);
    if (!unique.has(key)) unique.set(key, c);
  }
  return Array.from(unique.values());
}
