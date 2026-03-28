import test from "node:test";
import assert from "node:assert/strict";
import {
  buildTakeRelativePath,
  formatSecondsToHhMmSs,
  isValidHhMmSs,
  resolveTimecodeHhMmSs,
} from "../server/lib/take-storage";

test("formata timecode em HH:MM:SS", () => {
  assert.equal(formatSecondsToHhMmSs(0), "00:00:00");
  assert.equal(formatSecondsToHhMmSs(65), "00:01:05");
  assert.equal(formatSecondsToHhMmSs(3723), "01:02:03");
});

test("valida formato HH:MM:SS", () => {
  assert.equal(isValidHhMmSs("00:00:00"), true);
  assert.equal(isValidHhMmSs("10:59:59"), true);
  assert.equal(isValidHhMmSs("10:99:00"), false);
  assert.equal(isValidHhMmSs("1:2:3"), false);
});

test("resolve timecode com prioridade para valor informado", () => {
  assert.equal(resolveTimecodeHhMmSs("00:05:12", 0), "00:05:12");
  assert.equal(resolveTimecodeHhMmSs(undefined, 74), "00:01:14");
  assert.throws(() => resolveTimecodeHhMmSs("00:99:00", 0));
});

test("gera hierarquia ESTUDIO/PRODUCAO/SESSAO/PERSONAGEM/DUBLADOR", () => {
  const relative = buildTakeRelativePath({
    studioName: "Estúdio Central",
    productionName: "Filme XPTO",
    sessionName: "Sessão 01",
    characterNameSelected: "Batman",
    voiceActorNameSelected: "Carlos Silva",
    timecodeHhMmSs: "00:01:15",
    ext: ".wav",
  }).replace(/\\/g, "/");

  assert.match(relative, /^estudio_central\/filme_xpto\/sessao_01\/batman\/carlos_silva\/BATMAN_CARLOS_SILVA_000115\.wav$/);
});
