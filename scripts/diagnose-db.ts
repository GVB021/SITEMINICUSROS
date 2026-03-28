import "dotenv/config";
import { pool } from "../server/db";

async function diagnoseAndWipe() {
  console.log("Iniciando diagnostico de conexao e limpeza de dados...");
  
  try {
    const client = await pool.connect();
    console.log("Conexao estabelecida com sucesso!");

    console.log("Limpando todas as tabelas relacionadas a usuarios...");
    
    // Devido ao ON DELETE CASCADE que implementamos, deletar da tabela users deve limpar quase tudo
    // Mas vamos garantir a ordem correta para evitar problemas de FK se algo falhou na migracao anterior
    await client.query("BEGIN");
    
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
    
    await client.query("COMMIT");
    console.log("Banco de dados limpo com sucesso!");
    client.release();
  } catch (err: any) {
    console.error("ERRO CRITICO NO BANCO DE DADOS:");
    console.error("Mensagem:", err.message);
    console.error("Codigo:", err.code);
    console.error("Stack:", err.stack);
    
    if (err.message.includes("Tenant or user not found")) {
      console.log("\n--- ANALISE DA CAUSA RAIZ ---");
      console.log("O erro 'Tenant or user not found' indica que o Supabase/pgbouncer");
      console.log("nao reconheceu o Project ID ou a autenticacao falhou.");
      console.log("Isso geralmente ocorre quando a senha no DATABASE_URL nao coincide");
      console.log("com a senha real definida no painel do Supabase.");
    }
    process.exit(1);
  }
}

diagnoseAndWipe().catch(console.error);
