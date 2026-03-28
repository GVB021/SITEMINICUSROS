import { db } from "../server/db";
import { users, studioMemberships, userStudioRoles } from "../shared/schema";
import { eq } from "drizzle-orm";

async function rollback() {
  console.log("Iniciando rollback de roles...");

  // 1. Mapeamento reverso
  const roleMap: Record<string, string> = {
    'MASTER': 'platform_owner',
    'ADMINISTRADOR': 'studio_admin',
    'DIRETOR': 'diretor',
    'DUBLADOR': 'dublador',
    'ALUNO': 'aluno'
  };

  // 2. Atualizar tabela users
  console.log("Revertendo tabela users...");
  for (const [newRole, oldRole] of Object.entries(roleMap)) {
    await db.update(users)
      .set({ role: oldRole })
      .where(eq(users.role, newRole));
  }

  // 3. Atualizar tabela studio_memberships
  console.log("Revertendo tabela studio_memberships...");
  for (const [newRole, oldRole] of Object.entries(roleMap)) {
    await db.update(studioMemberships)
      .set({ role: oldRole })
      .where(eq(studioMemberships.role, newRole));
  }

  // 4. Atualizar tabela user_studio_roles
  console.log("Revertendo tabela user_studio_roles...");
  for (const [newRole, oldRole] of Object.entries(roleMap)) {
    await db.update(userStudioRoles)
      .set({ role: oldRole })
      .where(eq(userStudioRoles.role, newRole));
  }

  console.log("Rollback concluido com sucesso!");
}

rollback().catch(err => {
  console.error("Erro no rollback:", err);
  process.exit(1);
});
