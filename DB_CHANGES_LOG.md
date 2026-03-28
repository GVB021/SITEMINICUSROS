# Registro de Reformulação do Banco de Dados - V.HUB Dub Studio

Este documento detalha as melhorias estruturais e de performance aplicadas ao banco de dados Postgres da aplicação.

## 1. Mudanças Estruturais

### 1.1 Remoção de Itens Obsoletos
- **Tabela `user_roles`**: Removida por ser redundante, uma vez que a tabela `users` já possui uma coluna `role` e a tabela `user_studio_roles` gerencia as roles específicas de cada estúdio.

### 1.2 Melhorias na Tabela `users`
- **Nova Coluna `last_login_at`**: Adicionada para rastrear o último acesso do usuário.
- **Trigger `update_users_updated_at`**: Adicionada para atualizar automaticamente a coluna `updated_at` sempre que um registro de usuário for modificado.

### 1.3 Integridade Referencial (Cascading)
Implementação de `ON DELETE CASCADE` e `ON DELETE SET NULL` em relacionamentos chave para garantir a integridade dos dados e evitar registros órfãos:
- **Cascade**: `studio_memberships`, `notifications`, `productions`, `characters`, `recording_sessions`, `session_participants`, `takes`.
- **Set Null**: `characters.voice_actor_id`, `recording_sessions.created_by`, `audit_log.user_id`.
- **Restrict**: `studios.owner_id` (impede a exclusão de um dono de estúdio enquanto o estúdio existir).

## 2. Otimização de Performance (Índices)

Foram criados os seguintes índices para acelerar as consultas mais frequentes e operações de filtragem no dashboard:

| Tabela | Coluna(s) | Motivo |
| :--- | :--- | :--- |
| `studios` | `is_active` | Filtragem de estúdios ativos no seletor. |
| `studio_memberships` | `status` | Busca de solicitações pendentes de aprovação. |
| `notifications` | `is_read` | Contagem de notificações não lidas. |
| `productions` | `status` | Agrupamento e filtragem por status de produção. |
| `recording_sessions` | `status`, `scheduled_at` | Ordenação de sessões agendadas e visualização em calendário. |
| `takes` | `is_preferred` | Busca rápida de takes preferenciais para exportação. |
| `audit_log` | `action`, `created_at` | Busca e ordenação de logs de auditoria. |

## 3. Scripts de Manutenção

- **Migração**: `scripts/db-overhaul.ts` - Aplica todas as mudanças descritas acima.
- **Rollback**: `scripts/db-rollback.ts` - Reverte as mudanças estruturais e índices.

## 4. Validação

- **Schema Check**: O arquivo `shared/schema.ts` foi atualizado para refletir a nova estrutura no ORM Drizzle.
- **Conectividade**: Verificada a integração com o Postgres via `Pool` do `pg`.
- **Performance**: Redução esperada no tempo de resposta das queries de listagem e dashboard devido aos novos índices.
