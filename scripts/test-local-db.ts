import "dotenv/config";
import { pool } from "../server/db";

async function testLocal() {
  const localUrl = "postgresql://postgres:postgres@localhost:5432/postgres";
  console.log("Testando conexao local...");
  const { Pool } = await import("pg");
  const testPool = new Pool({ connectionString: localUrl });
  
  try {
    const client = await testPool.connect();
    console.log("Conexao LOCAL estabelecida!");
    client.release();
    return localUrl;
  } catch (err) {
    console.log("Conexao LOCAL falhou.");
    return null;
  } finally {
    await testPool.end();
  }
}

testLocal().then(res => {
  if (res) console.log("SUCESSO: " + res);
  else console.log("FALHA TOTAL");
});
