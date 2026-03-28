# Roadmap de Otimização e Melhoria de Banco de Dados - V.HUB Dub Studio

## 1. Otimização de Performance

### 1.1 Índices Adicionais
- **Identificado**: A tabela `takes` possui muitos registros e é filtrada frequentemente por `sessionId`, `characterId` e `voiceActorId`.
- **Recomendação**: Criar índices compostos se as consultas utilizarem múltiplos filtros simultaneamente (ex: `sessionId` + `isPreferred`).
- **Timeline**: Semana 1.

### 1.2 Cache de Consultas
- **Identificado**: Algumas estatísticas do dashboard (como contagem de usuários e sessões) são recalculadas a cada 5 segundos.
- **Recomendação**: Implementar Redis ou cache em memória (LRU) para estatísticas que não mudam com alta frequência.
- **Timeline**: Semana 2.

## 2. Modelagem de Dados e Escalabilidade

### 2.1 Particionamento de Tabelas
- **Identificado**: A tabela `audit_log` crescerá indefinidamente.
- **Recomendação**: Implementar particionamento por data (mensal) para facilitar a manutenção e expurgo de logs antigos.
- **Timeline**: Semana 4.

### 2.2 Normalização de Scripts
- **Identificado**: O campo `script_json` em `productions` armazena o roteiro completo em texto.
- **Recomendação**: Se os roteiros ficarem muito grandes, mover para uma tabela `script_lines` para permitir busca e edição granular sem carregar todo o JSON.
- **Timeline**: Semana 6.

## 3. Segurança e Governança

### 3.1 Least Privilege (Princípio do Menor Privilégio)
- **Ação**: Criar 3 usuários distintos no Postgres:
  1. `app_user`: Apenas DML (SELECT, INSERT, UPDATE, DELETE).
  2. `migration_user`: Permissões DDL para o Drizzle.
  3. `readonly_user`: Para ferramentas de BI e análise de dados.
- **Timeline**: Semana 1.

### 3.2 Auditoria Avançada
- **Ação**: Implementar trigger de banco de dados para capturar mudanças em tabelas sensíveis (como `studios` e `users`), registrando o estado anterior e posterior.
- **Timeline**: Semana 3.

## 4. Métricas de Sucesso (KPIs)

| Métrica | Meta (Target) |
| :--- | :--- |
| Tempo Médio de Query | < 50ms |
| % de Queries Lentas (>100ms) | < 1% |
| Taxa de Erros de Conexão | 0% |
| Utilização do Pool de Conexões | 20-60% em pico |
