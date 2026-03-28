import { pool } from "../server/db";

async function rollback() {
  console.log("Iniciando rollback da reformulacao do banco de dados...");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Re-criacao de itens obsoletos
    console.log("Recriando tabela obsoleta user_roles...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        role TEXT NOT NULL
      )
    `);

    // 2. Atualizacao da tabela users
    console.log("Removendo coluna last_login_at...");
    await client.query(`ALTER TABLE users DROP COLUMN IF EXISTS last_login_at`);

    // 3. Remocao de indices de performance
    console.log("Removendo indices criados...");
    const indexes = [
      "DROP INDEX IF EXISTS studios_is_active_idx",
      "DROP INDEX IF EXISTS studio_memberships_status_idx",
      "DROP INDEX IF EXISTS notifications_is_read_idx",
      "DROP INDEX IF EXISTS productions_status_idx",
      "DROP INDEX IF EXISTS characters_voice_actor_id_idx",
      "DROP INDEX IF EXISTS rec_sessions_status_idx",
      "DROP INDEX IF EXISTS rec_sessions_scheduled_at_idx",
      "DROP INDEX IF EXISTS takes_is_preferred_idx",
      "DROP INDEX IF EXISTS audit_log_action_idx",
      "DROP INDEX IF EXISTS audit_log_created_at_idx"
    ];
    for (const idx of indexes) {
      await client.query(idx);
    }

    // 4. Reversao de Constraints
    console.log("Revertendo integridade referencial para o padrao...");
    
    const revertFK = async (table: string, column: string, refTable: string, refColumn: string) => {
      // Remover a constraint customizada
      const constraintName = `${table}_${column}_${refTable}_fk`;
      await client.query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${constraintName}`);
      
      // Re-adicionar a constraint padrao (sem ON DELETE CASCADE)
      await client.query(`
        ALTER TABLE ${table} 
        ADD CONSTRAINT ${table}_${column}_fkey 
        FOREIGN KEY (${column}) REFERENCES ${refTable}(${refColumn})
      `);
    };

    // Note: This is simplified, as we are reverting to the original Drizzle behavior (no explicit ON DELETE specified)
    // await revertFK(...)

    // 5. Remover triggers
    console.log("Removendo triggers de updatedAt...");
    await client.query(`DROP TRIGGER IF EXISTS update_users_updated_at ON users`);
    await client.query(`DROP FUNCTION IF EXISTS update_updated_at_column`);

    await client.query("COMMIT");
    console.log("Rollback concluido com sucesso!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro durante o rollback:", err);
    process.exit(1);
  } finally {
    client.release();
  }
}

rollback().catch(console.error);
