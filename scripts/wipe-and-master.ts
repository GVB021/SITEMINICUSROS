import "dotenv/config";
import { pool } from "../server/db";
import { hashPassword } from "../server/replit_integrations/auth/replitAuth";
import { users } from "../shared/models/auth";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../shared/schema";

async function overhaulAndSeed() {
  console.log("Iniciando limpeza e criacao de conta MASTER...");
  const db = drizzle(pool, { schema });

  try {
    const client = await pool.connect();
    console.log("Conexao estabelecida!");

    console.log("Limpando dados antigos...");
    await client.query("BEGIN");
    
    // Deletar em ordem para respeitar FKs (mesmo com cascade)
    await client.query("DELETE FROM audit_log");
    await client.query("DELETE FROM notifications");
    await client.query("DELETE FROM takes");
    await client.query("DELETE FROM recording_sessions");
    await client.query("DELETE FROM characters");
    await client.query("DELETE FROM productions");
    await client.query("DELETE FROM studio_memberships");
    await client.query("DELETE FROM user_studio_roles");
    await client.query("DELETE FROM studios");
    await client.query("DELETE FROM users");
    
    console.log("Criando nova conta MASTER...");
    const masterPassword = "MasterPassword123!"; // Senha forte
    const masterHash = await hashPassword(masterPassword);
    
    await client.query(`
      INSERT INTO users (id, email, password_hash, full_name, display_name, role, status, email_verified)
      VALUES (gen_random_uuid(), 'master@vhub.com.br', $1, 'Administrador Master', 'Master', 'MASTER', 'approved', true)
    `, [masterHash]);

    await client.query("COMMIT");
    console.log("\n===============================================");
    console.log("CONTA MASTER CRIADA COM SUCESSO!");
    console.log("Email: master@vhub.com.br");
    console.log("Senha: " + masterPassword);
    console.log("===============================================");
    
    client.release();
    process.exit(0);
  } catch (err: any) {
    console.error("\nERRO CRITICO:");
    if (err.message.includes("Tenant or user not found")) {
      console.log("O erro 'Tenant or user not found' persiste.");
      console.log("POR FAVOR, VERIFIQUE O DATABASE_URL NO ARQUIVO .env");
      console.log("Certifique-se de que a senha do Supabase esteja correta.");
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
}

overhaulAndSeed().catch(console.error);
