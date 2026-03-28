import test from "node:test";
import assert from "node:assert/strict";
import { extractCharactersFromText } from "../server/lib/character-extraction";

test("extrai personagens em múltiplos formatos e deduplica", () => {
  const text = `
  BATMAN: Onde está o Coringa?
  [ROBIN]
  "character":"Batman"
  MULHER-GATO: Vamos embora.
  ROBIN: Estou aqui.
  `;
  const chars = extractCharactersFromText(text);
  assert.deepEqual([...chars].sort(), ["BATMAN", "MULHER-GATO", "ROBIN"]);
});

test("retorna vazio quando não há personagem identificável", () => {
  const chars = extractCharactersFromText("texto corrido sem marcadores de personagem");
  assert.equal(chars.length, 0);
});
