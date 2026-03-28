import { db } from "../server/db";
import { users, studioMemberships, userStudioRoles } from "../shared/schema";
import { eq, or } from "drizzle-orm";

async function migrate() {
  console.log("Iniciando migracao de roles...");

  // 1. Mapeamento de roles
  const roleMap: Record<string, string> = {
    'platform_owner': 'MASTER',
    'studio_admin': 'ADMINISTRADOR',
    'diretor': 'DIRETOR',
    'engenheiro_audio': 'DIRETOR',
    'dublador': 'DUBLADOR',
    'aluno': 'ALUNO',
    'voice_actor': 'DUBLADOR', // Alguns lugares usavam voice_actor
    'director': 'DIRETOR',     // Alguns lugares usavam director
    'engineer': 'DIRETOR'      // Alguns lugares usavam engineer
  };

  // 2. Atualizar tabela users
  console.log("Atualizando tabela users...");
  for (const [oldRole, newRole] of Object.entries(roleMap)) {
    await db.update(users)
      .set({ role: newRole })
      .where(eq(users.role, oldRole));
  }

  // 3. Atualizar tabela studio_memberships
  console.log("Atualizando tabela studio_memberships...");
  for (const [oldRole, newRole] of Object.entries(roleMap)) {
    await db.update(studioMemberships)
      .set({ role: newRole })
      .where(eq(studioMemberships.role, oldRole));
  }

  // 4. Atualizar tabela user_studio_roles
  console.log("Atualizando tabela user_studio_roles...");
  for (const [oldRole, newRole] of Object.entries(roleMap)) {
    await db.update(userStudioRoles)
      .set({ role: newRole })
      .where(eq(userStudioRoles.role, oldRole));
  }

  console.log("Migracao concluida com sucesso!");
}

migrate().catch(err => {
  console.error("Erro na migracao:", err);
  process.exit(1);
});
