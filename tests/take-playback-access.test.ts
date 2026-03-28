import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateTakePlaybackAccess,
  normalizePlaybackRole,
} from "../server/lib/take-playback-access";

test("normalizePlaybackRole mapeia aliases de diretor e dublador", () => {
  assert.equal(normalizePlaybackRole("director"), "diretor");
  assert.equal(normalizePlaybackRole("diretor"), "diretor");
  assert.equal(normalizePlaybackRole("voice_actor"), "dublador");
  assert.equal(normalizePlaybackRole("dublador"), "dublador");
  assert.equal(normalizePlaybackRole("studio_admin"), "outro");
});

test("bloqueia reprodução quando usuário não está ativo na sessão", () => {
  const result = evaluateTakePlaybackAccess({
    isPresent: false,
    role: "diretor",
    isTakeOwner: false,
    isActiveDirector: true,
  });
  assert.equal(result.allowed, false);
});

test("permite reprodução para diretor ativo na sessão", () => {
  const result = evaluateTakePlaybackAccess({
    isPresent: true,
    role: "diretor",
    isTakeOwner: false,
    isActiveDirector: true,
  });
  assert.equal(result.allowed, true);
});

test("permite reprodução para dublador autor do take ativo na sessão", () => {
  const result = evaluateTakePlaybackAccess({
    isPresent: true,
    role: "dublador",
    isTakeOwner: true,
    isActiveDirector: false,
  });
  assert.equal(result.allowed, true);
});

test("cenário de integração de permissões por perfil", () => {
  const scenarios = [
    { role: normalizePlaybackRole("director"), isPresent: true, isTakeOwner: false, isActiveDirector: true, expected: true },
    { role: normalizePlaybackRole("dublador"), isPresent: true, isTakeOwner: true, isActiveDirector: false, expected: true },
    { role: normalizePlaybackRole("dublador"), isPresent: true, isTakeOwner: false, isActiveDirector: false, expected: false },
    { role: normalizePlaybackRole("studio_admin"), isPresent: true, isTakeOwner: false, isActiveDirector: false, expected: false },
    { role: normalizePlaybackRole("director"), isPresent: false, isTakeOwner: false, isActiveDirector: true, expected: false },
  ] as const;

  for (const s of scenarios) {
    const result = evaluateTakePlaybackAccess({
      role: s.role,
      isPresent: s.isPresent,
      isTakeOwner: s.isTakeOwner,
      isActiveDirector: s.isActiveDirector,
    });
    assert.equal(result.allowed, s.expected);
  }
});
