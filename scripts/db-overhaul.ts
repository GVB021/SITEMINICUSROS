import { pool } from "../server/db";

async function overhaul() {
  console.log("Iniciando reformulacao completa do banco de dados...");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Limpeza de itens obsoletos
    console.log("Removendo tabela obsoleta user_roles...");
    await client.query("DROP TABLE IF EXISTS user_roles CASCADE");

    // 2. Atualizacao da tabela users
    console.log("Atualizando tabela users...");
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
      ALTER COLUMN status SET DEFAULT 'pending',
      ALTER COLUMN role SET DEFAULT 'user'
    `);

    // 3. Criacao de indices para performance
    console.log("Criando indices de performance...");
    const indexes = [
      "CREATE INDEX IF NOT EXISTS studios_is_active_idx ON studios (is_active)",
      "CREATE INDEX IF NOT EXISTS studio_memberships_status_idx ON studio_memberships (status)",
      "CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications (is_read)",
      "CREATE INDEX IF NOT EXISTS productions_status_idx ON productions (status)",
      "CREATE INDEX IF NOT EXISTS characters_voice_actor_id_idx ON characters (voice_actor_id)",
      "CREATE INDEX IF NOT EXISTS rec_sessions_status_idx ON recording_sessions (status)",
      "CREATE INDEX IF NOT EXISTS rec_sessions_scheduled_at_idx ON recording_sessions (scheduled_at)",
      "CREATE INDEX IF NOT EXISTS takes_is_preferred_idx ON takes (is_preferred)",
      "CREATE INDEX IF NOT EXISTS audit_log_action_idx ON audit_log (action)",
      "CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log (created_at)"
    ];
    for (const idx of indexes) {
      await client.query(idx);
    }

    // 4. Ajuste de Constraints de Integridade Referencial (ON DELETE CASCADE)
    console.log("Ajustando integridade referencial...");
    
    // Funcao auxiliar para recriar constraint com ON DELETE
    const updateFK = async (table: string, column: string, refTable: string, refColumn: string, action: string) => {
      // Encontrar nome da constraint atual
      const res = await client.query(`
        SELECT constraint_name 
        FROM information_schema.key_column_usage 
        WHERE table_name = $1 AND column_name = $2
      `, [table, column]);
      
      for (const row of res.rows) {
        await client.query(`ALTER TABLE ${table} DROP CONSTRAINT IF EXISTS ${row.constraint_name}`);
      }
      
      const constraintName = `${table}_${column}_${refTable}_fk`;
      await client.query(`
        ALTER TABLE ${table} 
        ADD CONSTRAINT ${constraintName} 
        FOREIGN KEY (${column}) REFERENCES ${refTable}(${refColumn}) 
        ON DELETE ${action}
      `);
    };

    await updateFK("studios", "owner_id", "users", "id", "RESTRICT");
    await updateFK("studio_memberships", "user_id", "users", "id", "CASCADE");
    await updateFK("studio_memberships", "studio_id", "studios", "id", "CASCADE");
    await updateFK("notifications", "user_id", "users", "id", "CASCADE");
    await updateFK("productions", "studio_id", "studios", "id", "CASCADE");
    await updateFK("characters", "production_id", "productions", "id", "CASCADE");
    await updateFK("characters", "voice_actor_id", "users", "id", "SET NULL");
    await updateFK("recording_sessions", "production_id", "productions", "id", "CASCADE");
    await updateFK("recording_sessions", "studio_id", "studios", "id", "CASCADE");
    await updateFK("recording_sessions", "created_by", "users", "id", "SET NULL");
    await updateFK("session_participants", "session_id", "recording_sessions", "id", "CASCADE");
    await updateFK("session_participants", "user_id", "users", "id", "CASCADE");
    await updateFK("takes", "session_id", "recording_sessions", "id", "CASCADE");
    await updateFK("takes", "character_id", "characters", "id", "CASCADE");
    await updateFK("takes", "voice_actor_id", "users", "id", "CASCADE");
    await updateFK("audit_log", "user_id", "users", "id", "SET NULL");

    // 5. Trigger para updatedAt
    console.log("Configurando triggers de updatedAt...");
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query("COMMIT");
    console.log("Reformulacao do banco de dados concluida com sucesso!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Erro durante a reformulacao:", err);
    process.exit(1);
  } finally {
    client.release();
  }
}

overhaul().catch(console.error);
