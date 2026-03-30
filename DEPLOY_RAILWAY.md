# Deploy no Railway - V2.0

Guia completo para fazer deploy da aplicação V2.0 no Railway usando Static Export.

## 📋 Pré-requisitos

- Conta no [Railway](https://railway.app) (gratuita)
- Repositório Git configurado
- Supabase configurado e rodando

## 🚀 Passo a Passo

### 1. Preparar o Repositório

Certifique-se de que o `railway.json` está configurado corretamente na **raiz do projeto**:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd v2 && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npx serve v2/out -l $PORT -s",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. Fazer Build Local (Teste)

Antes de deployar, teste localmente:

```bash
cd v2
npm install
npm run build
```

Deve gerar a pasta `out/` sem erros.

Testar o build:

```bash
npx serve out -l 3000 -s
```

Abra http://localhost:3000 e verifique se funciona.

### 3. Commit e Push

```bash
git add .
git commit -m "feat: v2.0 with Next.js Static Export + Supabase"
git push origin main
```

### 4. Criar Projeto no Railway

#### 4.1. Login no Railway

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub

#### 4.2. Criar Novo Projeto

1. Click em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha seu repositório
4. Railway detectará automaticamente o `railway.json`

### 5. Configurar Variáveis de Ambiente

No painel do Railway:

1. Vá em "Variables"
2. Adicione as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

**⚠️ IMPORTANTE:** Use a **ANON KEY**, não a SERVICE KEY!

### 6. Deploy Automático

Railway irá:

1. Detectar mudanças no repositório
2. Executar o build command (`cd v2 && npm install && npm run build`)
3. Gerar a pasta `v2/out/`
4. Servir via `npx serve v2/out -l $PORT -s`

### 7. Verificar Deploy

1. Railway mostrará a URL do deploy (algo como `https://seu-app.up.railway.app`)
2. Acesse a URL
3. Verifique se a página carrega corretamente

### 8. Domínio Customizado (Opcional)

1. No Railway, vá em "Settings" > "Domains"
2. Click em "Generate Domain" para domínio `.railway.app`
3. Ou adicione seu próprio domínio

## 🔧 Troubleshooting

### Build Falha

**Erro:** `npm install` falha

**Solução:**
- Verifique se `package.json` existe em `v2/`
- Confirme que todas as dependências estão listadas

**Erro:** `npm run build` falha

**Solução:**
- Execute localmente para ver o erro real
- Verifique erros TypeScript com `npm run lint`

### Página em Branco

**Erro:** Deploy bem-sucedido mas página não carrega

**Solução:**
- Verifique se a pasta `out/` foi gerada
- Confirme que o `startCommand` está correto
- Verifique logs no Railway

### Assets 404

**Erro:** HTML carrega mas CSS/JS dão 404

**Solução:**
- Verifique se `trailingSlash: true` está no `next.config.ts`
- Confirme que `output: 'export'` está configurado
- Use o flag `-s` no `serve` (spa mode)

### Variáveis de Ambiente Não Funcionam

**Erro:** Supabase retorna erro de autenticação

**Solução:**
- Confirme que as variáveis começam com `NEXT_PUBLIC_`
- Verifique se copiou corretamente do Supabase
- Faça redeploy após adicionar variáveis

## 📊 Monitoramento

### Logs

Ver logs em tempo real:

1. No Railway, vá em "Deployments"
2. Click no deploy ativo
3. Veja "Logs" tab

### Métricas

1. Vá em "Metrics"
2. Veja CPU, RAM, Network usage

## 🔄 Updates

Para atualizar a aplicação:

1. Faça mudanças no código
2. Commit e push

```bash
git add .
git commit -m "update: nova feature"
git push origin main
```

3. Railway fará redeploy automático

## 💰 Custos

**Railway Free Tier:**
- 500 horas de execução/mês
- $5 de crédito/mês
- Suficiente para projetos pequenos

**Static sites são MUITO baratos:**
- Apenas servindo arquivos estáticos
- Baixo uso de CPU/RAM
- ~1-2 horas de execução contínua

## 🎯 Checklist de Deploy

- [ ] `railway.json` configurado na raiz
- [ ] Build local testado e funcionando
- [ ] Variáveis de ambiente configuradas no Railway
- [ ] Código commitado e pushed
- [ ] Deploy bem-sucedido no Railway
- [ ] URL acessível e funcionando
- [ ] Supabase conectado corretamente
- [ ] Domínio customizado configurado (opcional)

## 📝 Notas Finais

- **Sempre teste localmente** antes de fazer deploy
- **Monitore os logs** após deploy
- **Configure alertas** no Railway para falhas
- **Use Preview Deployments** para testar antes de produção

## 🆘 Suporte

Se tiver problemas:

1. Verifique [Railway Docs](https://docs.railway.app)
2. Veja logs no painel do Railway
3. Teste build localmente
4. Confirme variáveis de ambiente

---

**🎉 Deploy concluído com sucesso!**

Sua aplicação está rodando em produção com:
- Frontend estático (rápido e barato)
- Backend Supabase (escalável e gerenciado)
- HTTPS automático
- Deploy contínuo
