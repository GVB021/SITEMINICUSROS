# Overhaul do Sistema de Roles e Permissões - V.HUB Dub Studio

Este documento detalha a reestruturação do sistema de autenticação e autorização da plataforma, consolidando as roles anteriores em uma hierarquia simplificada de 5 níveis.

## 1. Matriz de Permissões

| Funcionalidade | MASTER | ADMINISTRADOR | DIRETOR | DUBLADOR | ALUNO |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Gestão de Plataforma** (Estúdios, Usuários globais, Logs, Configurações) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Gestão de Estúdio** (Membros, Configurações de Estúdio) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Gestão de Produções** (Criar, Editar, Excluir produções) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Gestão de Sessões** (Criar, Agendar sessões) | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Acesso ao Estúdio de Gravação** (Entrar em salas virtuais) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Visualização de Staff** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Gestão de Administradores** | ✅ | ❌ | ❌ | ❌ | ❌ |

## 2. Mapeamento de Transição

As roles antigas foram mapeadas da seguinte forma:

- `platform_owner` ➡️ **MASTER**
- `studio_admin` ➡️ **ADMINISTRADOR**
- `diretor` ➡️ **DIRETOR**
- `engenheiro_audio` ➡️ **DIRETOR**
- `dublador` ➡️ **DUBLADOR**
- `aluno` ➡️ **ALUNO**
- `user` (default) ➡️ **user** (mantido para novos cadastros pendentes)

## 3. Procedimentos de Migração

Para migrar os dados existentes no banco de dados, execute o script de migração:

```bash
npx tsx scripts/migrate-roles.ts
```

Este script atualizará as tabelas `users`, `studio_memberships` e `user_studio_roles`.

## 4. Validação e Testes

O novo sistema foi validado através de:
1. **Middleware de Autorização**: Implementado em `server/middleware/auth.ts` com verificações hierárquicas.
2. **Rotas Protegidas**: Todas as rotas em `server/routes.ts` foram atualizadas para as novas roles.
3. **Frontend Dinâmico**: O `app-sidebar.tsx` e `admin.tsx` utilizam `filteredNav` para exibir menus baseados na role.
4. **Logs de Auditoria**: Todas as ações administrativas são registradas na tabela `audit_logs`.

## 5. Scripts de Rollback

Caso ocorra alguma falha crítica, os dados podem ser revertidos para o estado anterior executando:

```bash
npx tsx scripts/rollback-roles.ts
```

## 6. Hierarquia de Gestão

Foi implementada uma trava de segurança onde:
- **MASTER** pode criar, editar e remover **ADMINISTRADORES**.
- **ADMINISTRADOR** pode gerenciar membros do estúdio (**DIRETOR**, **DUBLADOR**, **ALUNO**), mas não pode gerenciar outros **ADMINISTRADORES** ou **MASTER**.
