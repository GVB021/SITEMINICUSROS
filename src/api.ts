import type {
  TripConfig,
  ConciergeResponse,
  FoursquarePlace,
  TavilyCategoryResult,
  EnrichmentData,
} from './types';

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_PROXY_URL = `/api/gemini/v1beta/models/${GEMINI_MODEL}:generateContent`;
const FSQ_BASE = '/api/foursquare/v3/places';
const TAVILY_BASE = '/api/tavily/search';

const SYSTEM_PROMPT =
  'Você é um concierge de viagens brasileiro especialista e meticuloso. ' +
  'Responda APENAS com um objeto JSON válido. Sem markdown, sem blocos de código, sem texto antes ou depois. Apenas o JSON puro. ' +
  'REGRA ABSOLUTA: inclua SOMENTE itens com preços reais estimados em reais (R$). Nunca invente preços ou locais que não existem.';

// ── Stage 1: Foursquare ────────────────────────────────────────────────────

const FSQ_CATEGORIES: Record<string, string> = {
  hospedagem:   'pousada hotel',
  restaurantes: 'restaurante',
  atracoes:     'atração turística pontos turísticos',
  eventos:      'show evento teatro',
  experiencias: 'passeio experiência ecoturismo',
};

async function fetchPlacePhoto(fsqId: string, fsqKey: string): Promise<string | null> {
  try {
    const r = await fetch(`${FSQ_BASE}/${fsqId}/photos?limit=1`, {
      headers: { Authorization: fsqKey },
    });
    if (!r.ok) return null;
    const photos = await r.json();
    if (!Array.isArray(photos) || photos.length === 0) return null;
    return `${photos[0].prefix}300x200${photos[0].suffix}`;
  } catch {
    return null;
  }
}

async function fetchFoursquarePlaces(
  destination: string,
  fsqKey: string
): Promise<Record<string, FoursquarePlace[]>> {
  const results: Record<string, FoursquarePlace[]> = {};

  await Promise.all(
    Object.entries(FSQ_CATEGORIES).map(async ([category, query]) => {
      try {
        const params = new URLSearchParams({
          query,
          near: destination,
          limit: '8',
          fields: 'fsq_id,name,location,website,rating,price,hours,tel',
        });
        const r = await fetch(`${FSQ_BASE}/search?${params}`, {
          headers: { Authorization: fsqKey },
        });
        if (!r.ok) { results[category] = []; return; }
        const data = await r.json();
        const places: FoursquarePlace[] = data.results ?? [];

        // Fetch one photo per place (up to 4 in parallel to avoid throttling)
        const withPhotos = await Promise.all(
          places.slice(0, 8).map(async (p) => ({
            ...p,
            photo_url: await fetchPlacePhoto(p.fsq_id, fsqKey),
          }))
        );
        results[category] = withPhotos;
      } catch {
        results[category] = [];
      }
    })
  );

  return results;
}

// ── Stage 2: Tavily Search ─────────────────────────────────────────────────

const TAVILY_QUERIES: Record<string, (dest: string, dates: string) => string> = {
  hospedagem:   (d, _)  => `diária preço pousada hotel ${d} 2026`,
  restaurantes: (d, _)  => `cardápio preços restaurante ${d} 2026`,
  atracoes:     (d, _)  => `ingresso entrada atração turística ${d} 2026`,
  eventos:      (d, dt) => `shows eventos ${d} ${dt} ingresso preço`,
  experiencias: (d, _)  => `passeio ecoturismo experiência preço ${d} 2026`,
};

async function fetchTavilyPrices(
  destination: string,
  dates: string,
  tavilyKey: string
): Promise<TavilyCategoryResult[]> {
  const entries = Object.entries(TAVILY_QUERIES);

  const results = await Promise.all(
    entries.map(async ([category, buildQuery]) => {
      const query = buildQuery(destination, dates);
      try {
        const r = await fetch(TAVILY_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tavilyKey}`,
          },
          body: JSON.stringify({
            query,
            search_depth: 'basic',
            max_results: 5,
          }),
        });
        if (!r.ok) return { category, query, results: [] };
        const data = await r.json();
        const webResults = (data.results ?? []).map((item: { title: string; url: string; content: string }) => ({
          title: item.title,
          url: item.url,
          description: item.content,
        }));
        return { category, query, results: webResults };
      } catch {
        return { category, query, results: [] };
      }
    })
  );

  return results;
}

// ── Prompt with enrichment data ────────────────────────────────────────────

function buildEnrichedPrompt(config: TripConfig, enrichment: EnrichmentData): string {
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(config.checkOut).getTime() - new Date(config.checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const profileLabels: Record<string, string> = {
    solo: 'viajante solo', casal: 'casal',
    familia: 'família com crianças', grupo: 'grupo de amigos',
  };
  const typeLabels: Record<string, string> = {
    ferias: 'Férias & Relaxamento', aventura: 'Aventura & Natureza',
    gastronomico: 'Gastronômico', romantico: 'Romântico',
    cultural: 'Cultural', show: 'Show/Evento', negocios: 'Negócios',
  };

  const perfil = profileLabels[config.profile];
  const tiposViagem = config.types.map((t) => typeLabels[t]).join(', ');
  const budgetInfo = config.budget
    ? `Orçamento total: R$ ${config.budget.toLocaleString('pt-BR')} para ${config.people} pessoa(s). Monte roteiro dia a dia dentro desse orçamento.`
    : '';

  const fsqSummary = Object.entries(enrichment.foursquare)
    .map(([cat, places]) => {
      if (!places.length) return '';
      const items = places.map(p =>
        `- ${p.name} | endereço: ${p.location.formatted_address ?? 'N/A'} | rating: ${p.rating ?? 'N/A'} | website: ${p.website ?? 'N/A'} | horário: ${p.hours?.display ?? 'N/A'} | foto: ${p.photo_url ?? 'N/A'}`
      ).join('\n');
      return `${cat.toUpperCase()}:\n${items}`;
    }).filter(Boolean).join('\n\n');

  const tavilySummary = enrichment.tavily
    .map(t => {
      if (!t.results.length) return '';
      const snippets = t.results.map(r => `  [${r.title}] ${r.description} (${r.url})`).join('\n');
      return `${t.category.toUpperCase()} — query: "${t.query}":\n${snippets}`;
    }).filter(Boolean).join('\n\n');

  return `Retorne SOMENTE um objeto JSON, sem nenhum texto, sem markdown, sem explicações. Apenas { } JSON puro.

Dados da viagem:
- Destino: ${config.destination}
- Período: ${config.checkIn} a ${config.checkOut} (${nights} noite(s))
- Pessoas: ${config.people}
- Perfil: ${perfil}
- Tipo: ${tiposViagem}
${budgetInfo}

=== LOCAIS REAIS DO FOURSQUARE (use estes nomes e dados) ===
${fsqSummary || 'Nenhum dado disponível — use seu conhecimento do destino.'}

=== PREÇOS E INFORMAÇÕES DA WEB (Tavily Search) ===
${tavilySummary || 'Nenhum dado disponível — estime com base no perfil do destino.'}

REGRAS CRÍTICAS:
1. Use os nomes EXATOS dos locais do Foursquare quando disponíveis
2. Para preços: extraia valores reais dos snippets do Tavily Search. Se encontrar preço nos snippets, preencha "preco_reais" com o valor numérico e "fonte_preco" com a URL de origem
3. Se não encontrou preço real nos snippets, use "preco_reais": null e "fonte_preco": "consulte o local"
4. SEMPRE inclua os campos "foto_url", "website", "rating" dos dados do Foursquare quando disponíveis (mesmo se null)
5. Não invente dados — use apenas informações dos snippets fornecidos ou seu conhecimento verificável

JSON esperado:
{
  "destino": "${config.destination}",
  "clima_estimado": "...",
  "descricao_destino": "...",
  "dica_concierge": "...",
  "hospedagem": [
    {
      "nome": "nome do Foursquare",
      "tipo": "pousada|hotel|chalé|hostel",
      "diaria": 350,
      "preco_reais": 350,
      "fonte_preco": "https://...",
      "descricao": "...",
      "perfil_ideal": "...",
      "destaque": "...",
      "foto_url": "url da foto do Foursquare ou null",
      "website": "url do website ou null",
      "rating": 8.5
    }
  ],
  "restaurantes": [
    {
      "nome": "nome do Foursquare",
      "cozinha": "...",
      "preco_por_pessoa": 80,
      "preco_reais": 80,
      "fonte_preco": "https://...",
      "prato_estrela": "...",
      "horario": "...",
      "descricao": "...",
      "foto_url": null,
      "website": null,
      "rating": null
    }
  ],
  "atracoes": [
    {
      "nome": "nome do Foursquare",
      "preco": 40,
      "preco_reais": 40,
      "fonte_preco": "https://...",
      "duracao": "2h",
      "perfil_ideal": "...",
      "descricao": "...",
      "foto_url": null,
      "website": null,
      "rating": null
    }
  ],
  "eventos": [
    {
      "nome": "...",
      "data": "${config.checkIn}",
      "preco": 60,
      "preco_reais": 60,
      "fonte_preco": "https://...",
      "local": "...",
      "descricao": "..."
    }
  ],
  "transporte": [
    { "tipo": "...", "descricao": "...", "valor": 30 }
  ],
  "experiencias": [
    {
      "nome": "nome do Foursquare",
      "preco_por_pessoa": 150,
      "preco_reais": 150,
      "fonte_preco": "https://...",
      "duracao": "3h",
      "descricao": "...",
      "foto_url": null,
      "website": null
    }
  ]${
    config.budget
      ? `,
  "roteiro_dia_a_dia": [
    {
      "dia": 1,
      "data": "${config.checkIn}",
      "manha": "...",
      "tarde": "...",
      "noite": "...",
      "custo_estimado": 200
    }
  ],
  "resumo_orcamento": {
    "hospedagem": 0, "alimentacao": 0, "passeios": 0,
    "transporte": 0, "eventos": 0, "experiencias": 0, "total": 0
  }`
      : ''
  }
}

QUANTIDADE MÍNIMA OBRIGATÓRIA (não negocie estes números):
- 12 hospedagens (pousadas, hotéis, chalés, hostels em diferentes faixas de preço)
- 15 restaurantes (diversas cozinhas: brasileira, italiana, pizza, contemporânea, regional, etc)
- 12 atrações (mix de pagas e gratuitas: natureza, cultura, aventura, mirantes)
- 6 experiências únicas (passeios, ecoturismo, atividades especiais)
- 3 opções de transporte
- 4 eventos (se houver no período; caso contrário, retorne array vazio)

INSTRUÇÕES CRÍTICAS PARA QUANTIDADE:
1. Use TODOS os dados do Foursquare fornecidos acima (geralmente 8 por categoria)
2. Se Foursquare trouxer 8 e você precisa de 12-15, COMPLETE com estabelecimentos reais e conhecidos do destino ${config.destination}
3. Cada opção adicional DEVE ter: nome real verificável, tipo/cozinha, descrição realista, preço estimado baseado no perfil do destino
4. Para itens do Foursquare: mantenha foto_url, website, rating
5. Para itens que você adicionar: deixe foto_url: null, website: null, rating: null
6. NUNCA invente nomes genéricos como "Restaurante Centro" ou "Hotel Local" - use nomes reais de estabelecimentos
7. Priorize diversidade: varie preços, estilos, localizações dentro do destino

Priorize opções para o perfil "${perfil}" e tipo "${tiposViagem}".`;
}

export interface ApiKeys {
  gemini: string;
  foursquare: string;
  tavily: string;
}

async function callGemini(prompt: string, geminiKey: string): Promise<ConciergeResponse> {
  const url = `${GEMINI_PROXY_URL}?key=${encodeURIComponent(geminiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        response_mime_type: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMsg =
      (errorData as { error?: { message?: string } })?.error?.message ||
      `HTTP ${response.status}`;
    throw new Error(`Erro na API Gemini: ${errorMsg}`);
  }

  const data = await response.json();
  const rawText: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!rawText) {
    console.error('Gemini response:', JSON.stringify(data));
    throw new Error('A API não retornou conteúdo. Verifique sua chave e tente novamente.');
  }

  // Strip markdown fences
  const cleaned = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Find the last complete { ... } block — model may emit chain-of-thought before the JSON
  const end = cleaned.lastIndexOf('}');
  if (end === -1) {
    console.error('Raw Gemini response:', rawText);
    throw new Error('A API não retornou um JSON válido. Tente novamente.');
  }

  // Walk backwards from the last } to find its matching opening {
  let depth = 0;
  let start = -1;
  for (let i = end; i >= 0; i--) {
    if (cleaned[i] === '}') depth++;
    else if (cleaned[i] === '{') {
      depth--;
      if (depth === 0) { start = i; break; }
    }
  }

  if (start === -1) {
    console.error('Raw Gemini response:', rawText);
    throw new Error('A API não retornou um JSON válido. Tente novamente.');
  }

  const jsonStr = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(jsonStr) as ConciergeResponse;
  } catch {
    console.error('Raw Gemini response:', rawText);
    throw new Error('A API retornou um formato inválido. Tente novamente.');
  }
}

export async function fetchConciergeData(
  config: TripConfig,
  keys: ApiKeys
): Promise<ConciergeResponse> {
  const dates = `${config.checkIn} a ${config.checkOut}`;

  // Stage 1 + 2 in parallel — both are independent
  const [foursquareData, tavilyData] = await Promise.all([
    keys.foursquare ? fetchFoursquarePlaces(config.destination, keys.foursquare) : Promise.resolve({}),
    keys.tavily ? fetchTavilyPrices(config.destination, dates, keys.tavily) : Promise.resolve([]),
  ]);

  // Stage 3 — Gemini with enriched context
  const enrichment: EnrichmentData = { foursquare: foursquareData, tavily: tavilyData };
  const prompt = buildEnrichedPrompt(config, enrichment);
  return callGemini(prompt, keys.gemini);
}
