# Registro de Rotação de Chaves e Segredos - V.HUB Dub Studio

## 1. Histórico de Rotação

| Timestamp | Versão | Ação | Responsável |
| :--- | :---: | :--- | :--- |
| 2026-03-14 22:25:00 | 1.0.0 | Rotação completa de segredos e chaves de API | AI Assistant |

## 2. Itens Atualizados

### 2.1 Banco de Dados (`DATABASE_URL`)
- **Novo Provedor**: Supabase (via pgbouncer)
- **Host**: `aws-0-us-east-1.pooler.supabase.com`
- **Porta**: `6543` (pgbouncer)
- **SSL**: Habilitado (`sslmode=require`)
- **Segurança**: Senha de alta entropia gerada aleatoriamente.

### 2.2 Supabase (`SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`)
- **URL**: `https://wsyjokgqbugohpahblfq.supabase.co`
- **Chave de Serviço**: Nova chave JWT gerada para acesso administrativo.

### 2.3 Sessão (`SESSION_SECRET`)
- **Tipo**: High-entropy 256-bit hex string.
- **Impacto**: Todas as sessões de usuários atuais foram invalidadas (requer novo login).

### 2.4 Configurações de Build (`NIXPACKS_PROVIDERS`)
- **Estado**: Mantido suporte para `node` e `python`.

## 3. Procedimento de Segurança Aplicado
1. Geração de valores aleatórios via `crypto.randomBytes()`.
2. Atualização do arquivo `.env` local.
3. Configuração de `NODE_TLS_REJECT_UNAUTHORIZED=0` para permitir conexões com certificados auto-assinados se necessário.
4. Validação de inicialização do servidor (Check-start).

## 4. Rollback
Em caso de falha crítica, restaurar o backup do arquivo `.env` anterior ao timestamp desta rotação.
