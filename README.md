# Voz & Carreira V2.0 - Portal de Dublagem

Portal de dublagem e fonoaudiologia com 280+ minicursos gratuitos. Versão 2.0 reconstruída com Next.js Static Export + Supabase.

## 🏗️ Arquitetura

- **Frontend:** Next.js 15 (Static Export) - Deploy no Railway
- **Backend:** Supabase (PostgreSQL + Storage + Auth)
- **Styling:** TailwindCSS v4
- **State:** Zustand + React Query
- **Auth:** Supabase Auth

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase (gratuito)
- Conta no Railway (para deploy)

## 🚀 Setup Local

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

#### 2.1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a ANON KEY (em Settings > API)

#### 2.2. Executar Schema SQL

1. Acesse o SQL Editor no Supabase
2. Abra o arquivo `supabase/schema.sql`
3. Copie e execute todo o conteúdo no SQL Editor

#### 2.3. Criar Bucket de Imagens

1. Vá em Storage
2. Crie um novo bucket chamado `course-images`
3. Configure como **público**

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local`:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` e adicione suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 4. Migrar Dados da V1

Execute o script para popular o banco com os 280+ cursos:

```bash
npm run migrate
```

Este script irá:
- Ler todos os cursos de `../src/data/courses.ts`
- Converter para o formato do Supabase
- Inserir no banco de dados

### 5. Criar Usuário Admin

No SQL Editor do Supabase, execute:

```sql
-- Criar usuário admin (substitua email e senha)
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES ('admin@example.com', crypt('sua-senha-forte', gen_salt('bf')), NOW(), 'authenticated');

-- Obter ID do usuário criado
SELECT id FROM auth.users WHERE email = 'admin@example.com';

-- Atualizar perfil para ADMIN (use o ID obtido acima)
UPDATE profiles SET role = 'ADMIN' WHERE id = 'UUID-do-usuario';
```

### 6. Rodar Localmente

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

## 📦 Build para Produção

```bash
npm run build
```

Isso gera a pasta `out/` com os arquivos estáticos.

### Testar Build Localmente

```bash
npx serve out -l 3000 -s
```

## 🚢 Deploy no Railway

Veja [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md) para instruções detalhadas.

**Resumo:**

1. Criar `railway.json` na raiz do projeto (já criado)
2. Conectar repositório ao Railway
3. Configurar variáveis de ambiente
4. Deploy automático

## 📂 Estrutura do Projeto

```
v2/
├── src/
│   ├── app/              # Páginas Next.js
│   ├── components/       # Componentes React
│   ├── services/         # Supabase queries
│   ├── hooks/            # React hooks
│   ├── lib/              # Utilitários
│   └── types/            # TypeScript types
├── supabase/
│   ├── schema.sql        # Schema do banco
│   └── seed.sql          # Dados iniciais
├── scripts/
│   └── migrate-v1.ts     # Migração V1 → V2
└── public/               # Assets estáticos
```

## 🔑 Funcionalidades

### Público
- ✅ Catálogo de 280+ cursos
- ✅ Busca e filtros
- ✅ Visualização de aulas
- ✅ Sistema de favoritos (requer login)
- ✅ Progresso de aulas (requer login)
- ✅ Avaliações

### Admin
- ✅ CRUD de cursos
- ✅ Upload de imagens
- ✅ Gestão de conteúdo
- ✅ Dashboard com analytics

## 🛠️ Comandos Disponíveis

```bash
npm run dev        # Desenvolvimento
npm run build      # Build para produção
npm run lint       # Verificar TypeScript
npm run migrate    # Migrar dados V1 → V2
```

## 📝 Notas Importantes

- **TypeScript Errors:** Os erros de tipo do Supabase são normais até você configurar as credenciais corretas
- **Static Export:** Não há API Routes. Tudo roda via Supabase Client SDK no browser
- **Segurança:** RLS (Row Level Security) do Supabase protege os dados
- **Imagens:** Armazenadas no Supabase Storage (não mais base64)

## 🐛 Troubleshooting

### Erro "Invalid API Key"
- Verifique se copiou corretamente as credenciais do Supabase
- Certifique-se de usar a ANON KEY (não a SERVICE KEY)

### Build Falha
- Execute `npm run lint` para verificar erros TypeScript
- Verifique se todas as dependências estão instaladas

### Dados Não Aparecem
- Confirme que executou o schema SQL
- Confirme que rodou o script de migração
- Verifique as RLS policies no Supabase

## 📄 Licença

Este projeto é de código aberto para fins educacionais.
