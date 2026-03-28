export type PlaybackRole = "diretor" | "dublador" | "outro";

export interface PlaybackAccessInput {
  isPresent: boolean;
  role: PlaybackRole;
  isTakeOwner: boolean;
  isActiveDirector: boolean;
}

export interface PlaybackAccessResult {
  allowed: boolean;
  reason?: string;
}

export function normalizePlaybackRole(rawRole: string): PlaybackRole {
  const role = String(rawRole || "").trim().toLowerCase();
  if (role === "diretor" || role === "director") return "diretor";
  if (role === "dublador" || role === "voice_actor") return "dublador";
  return "outro";
}

export function evaluateTakePlaybackAccess(input: PlaybackAccessInput): PlaybackAccessResult {
  if (!input.isPresent) {
    return { allowed: false, reason: "Usuario nao esta ativo na sessao" };
  }
  if (input.isActiveDirector && input.role === "diretor") {
    return { allowed: true };
  }
  if (input.isTakeOwner && input.role === "dublador") {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: "Permissao de reproducao restrita ao diretor ativo ou dublador autor do take",
  };
}
