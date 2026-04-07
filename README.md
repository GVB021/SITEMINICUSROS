# 🧳 Concierge Virtual

Assistente inteligente de viagens que combina **3 APIs** para gerar roteiros personalizados com dados reais: locais verificados (Foursquare), preços da web (Tavily) e curadoria IA (Google Gemini).

---

## 🎯 Funcionalidades

- **Formulário intuitivo** — destino, datas, perfil de viagem, orçamento
- **Dados reais** — estabelecimentos verificados com fotos, ratings e websites
- **Preços verificados** — snippets da web com valores atualizados e fontes
- **Roteiro dia a dia** — planejamento completo com custos estimados
- **Sidebar de itinerário** — adicione/remova itens, exporte para .txt
- **Dark theme elegante** — design profissional com animações suaves

---

## 🚀 Instalação

```bash
# Clonar e instalar dependências
cd concierge-virtual
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O app estará em **http://localhost:5173**

---

## 🔑 Configuração de APIs

### **1. Google Gemini (obrigatório)**
- Acesse: https://aistudio.google.com/apikey
- Crie uma chave gratuita (modelo `gemini-2.5-flash-lite`)
- Cole no campo "Google AI Studio" do modal

### **2. Foursquare Places (opcional, mas recomendado)**
- Acesse: https://foursquare.com/developers/signup
- Crie uma conta e gere uma API key
- **Adiciona:** locais reais, fotos 300x200px, ratings, websites, horários

### **3. Tavily Search (opcional, mas recomendado)**
- Acesse: https://tavily.com
- Crie uma conta e copie sua API key
- **Adiciona:** preços reais da web com fontes verificadas (URLs)

As chaves são salvas em **localStorage** (apenas no seu navegador).

---

## 🏗️ Arquitetura

### Pipeline de 3 etapas

```
Formulário → API Pipeline → Resultado
              ├─ Stage 1: Foursquare (paralelo)
              ├─ Stage 2: Tavily Search (paralelo)
              └─ Stage 3: Gemini (organiza tudo em JSON)
```

### Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Estilo:** Tailwind CSS v4 (plugin @tailwindcss/vite)
- **APIs:** Gemini 2.5 Flash-Lite, Foursquare Places v3, Tavily Search
- **Proxies:** Vite dev server (evita CORS)

### Estrutura de pastas

```
src/
├── api.ts              # 3-stage pipeline + prompt builder
├── types.ts            # TypeScript interfaces
├── App.tsx             # Router + modal + screens
├── index.css           # Dark theme + CSS vars
└── components/
    ├── TripForm.tsx            # Formulário de busca
    ├── ConciergePanel.tsx      # Resultados + tabs
    ├── CategorySection.tsx     # Cards com foto/rating/website
    ├── ItinerarySidebar.tsx    # Drawer lateral
    └── BudgetPanel.tsx         # Orçamento + roteiro dia a dia
```

---

## 📦 Build para produção

```bash
npm run build
```

Gera pasta `dist/` pronta para deploy. **Importante:** configure as chaves de API no ambiente de produção via variáveis ou backend proxy.

---

## 🧪 Melhorias futuras

- [ ] Cache de resultados Foursquare/Tavily em sessionStorage
- [ ] Suporte a múltiplos idiomas (i18n)
- [ ] Exportar roteiro em PDF
- [ ] Integração com Google Maps para visualização
- [ ] Persistência de itinerários salvos (backend)

---

## 📄 Licença

MIT — use livremente para projetos pessoais ou comerciais.
