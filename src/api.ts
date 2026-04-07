import type { TripConfig, ConciergeResponse, PlaceDetail } from './types';

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_PROXY_URL = `/api/gemini/v1beta/models/${GEMINI_MODEL}:generateContent`;
const TAVILY_EXTRACT_URL = '/api/tavily/extract';

const SYSTEM_PROMPT =
  'Você é um concierge de viagens brasileiro especialista e meticuloso. ' +
  'Responda APENAS com um objeto JSON válido. Sem markdown, sem blocos de código, sem texto antes ou depois. Apenas o JSON puro. ' +
  'REGRA ABSOLUTA: inclua SOMENTE estabelecimentos reais que possuem site oficial verificável na internet.'

// ── Gemini-only prompt ─────────────────────────────────────────────────────

function buildGeminiDirectPrompt(config: TripConfig): string {
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
  const budgetConstraint = config.budget
    ? `\nORÇAMENTO: R$ ${config.budget.toLocaleString('pt-BR')} total para ${config.people} pessoa(s) por ${nights} noite(s). Priorize opções acessíveis — hospedagem ideal até R$ ${Math.round(config.budget * 0.4 / nights).toLocaleString('pt-BR')}/noite, refeições até R$ ${Math.round(config.budget * 0.2 / config.people / nights).toLocaleString('pt-BR')}/pessoa. Inclua variedade de preços mas liste as opções mais econômicas primeiro.`
    : '';

  return `Retorne SOMENTE um objeto JSON puro. Sem markdown, sem blocos de código, sem texto antes ou depois.

Dados da viagem:
- Destino: ${config.destination}
- Período: ${config.checkIn} a ${config.checkOut} (${nights} noite(s))
- Pessoas: ${config.people}
- Perfil: ${perfil}
- Tipo: ${tiposViagem}${budgetConstraint}

REGRAS CRÍTICAS (seguir à risca):
1. Inclua SOMENTE estabelecimentos REAIS que existem em ${config.destination}
2. "site_oficial" — inclua SE você conhecer a URL real (ex: "https://www.pousadaxyz.com.br"). Se não souber, deixe null. NÃO invente URLs
3. "foto_url" — se souber a URL de uma foto real, inclua. Caso contrário, deixe null
4. "telefone" — inclua o telefone real se conhecer, senão null
5. NUNCA invente URLs, telefones ou nomes de lugares que não existem
6. Inclua o máximo de opções reais que você conhece do destino, com ou sem site_oficial
7. "descricao" deve ser precisa e baseada em fatos reais do lugar

QUANTIDADE (não exceder):
- Hospedagem: 5-7 opções
- Restaurantes: 6-8 opções
- Atrações: 5-7 opções
- Experiências: 3-5 opções
- Transporte: 2-3 opções
- Eventos: apenas os que realmente ocorrem no período ${config.checkIn} a ${config.checkOut}

DESCRIÇÕES CURTAS: máximo 20 palavras por campo descricao, perfil_ideal, prato_estrela, destaque.

CAMPOS POR ARRAY:
- hospedagem[]: nome, tipo, diaria(number), descricao, perfil_ideal, destaque, foto_url, site_oficial, telefone, rating
- restaurantes[]: nome, cozinha, preco_por_pessoa(number), prato_estrela, horario, descricao, foto_url, site_oficial, telefone, rating
- atracoes[]: nome, preco(number), duracao, perfil_ideal, descricao, foto_url, site_oficial, telefone, rating
- eventos[]: nome, data, preco(number), local, descricao, foto_url, site_oficial, telefone
- transporte[]: tipo, descricao, valor(number)
- experiencias[]: nome, preco_por_pessoa(number), duracao, descricao, foto_url, site_oficial, telefone

Campos raiz: destino, clima_estimado, descricao_destino, dica_concierge

Priorize o perfil "${perfil}" e tipo "${tiposViagem}".`;
}

// ── Tavily Extract + Gemini parse ──────────────────────────────────────────

async function extractWithTavily(url: string, tavilyKey: string): Promise<string> {
  try {
    const r = await fetch(TAVILY_EXTRACT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tavilyKey}`,
      },
      body: JSON.stringify({ urls: [url] }),
    });
    if (!r.ok) return '';
    const data = await r.json();
    const result = data.results?.[0];
    return result?.raw_content ?? result?.content ?? '';
  } catch {
    return '';
  }
}

function buildDetailParsePrompt(
  nome: string,
  categoria: string,
  siteUrl: string,
  rawContent: string
): string {
  const categoryInstructions: Record<string, string> = {
    hospedagem: `Extraia do conteúdo:
- "quartos": array de tipos de quarto com tipo, preco (R$/noite), descricao, capacidade
- "comodidades": array de strings (wifi, piscina, café da manhã, etc)
- "checkin" e "checkout": horários
- "telefone": número de telefone para reservas
- "endereco": endereço completo
- "horario": horário de atendimento se disponível`,
    restaurante: `Extraia do conteúdo:
- "menu": array de seções com { secao: string, itens: [{ nome, descricao, preco }] }
- "telefone": número para reservas
- "horario": dias e horários de funcionamento
- "endereco": endereço completo`,
    atracao: `Extraia do conteúdo:
- "ingressos": array de tipos [{ tipo, preco, descricao }]
- "horario": dias e horários de funcionamento
- "duracao": tempo médio de visita
- "como_chegar": instruções de acesso
- "telefone": contato`,
    evento: `Extraia do conteúdo:
- "ingressos": array de lotes/setores [{ tipo, preco, descricao }]
- "horario": data e hora do evento
- "endereco": local do evento
- "telefone": contato`,
    experiencia: `Extraia do conteúdo:
- "ingressos": array de pacotes/opções [{ tipo, preco, descricao }]
- "duracao": duração da experiência
- "horario": horários disponíveis
- "telefone": contato para reserva
- "como_chegar": ponto de encontro`,
  };

  const instructions = categoryInstructions[categoria] ?? categoryInstructions['atracao'];

  return `Analise o conteúdo extraído do site oficial de "${nome}" (${siteUrl}) e retorne um JSON estruturado.

Conteúdo extraído:
---
${rawContent.slice(0, 6000)}
---

${instructions}
- "descricao_completa": descrição detalhada do lugar (2-4 frases)
- "fotos": array de URLs de imagens encontradas no conteúdo (máximo 4)

Se um campo não for encontrado no conteúdo, use null.
Retorne APENAS JSON puro, sem markdown:
{
  "nome": "${nome}",
  "site_oficial": "${siteUrl}",
  "telefone": null,
  "endereco": null,
  "horario": null,
  "descricao_completa": null,
  "fotos": [],
  "quartos": [],
  "comodidades": [],
  "checkin": null,
  "checkout": null,
  "menu": [],
  "ingressos": [],
  "duracao": null,
  "como_chegar": null
}`;
}

export interface ApiKeys {
  gemini: string;
  tavily: string;
}

function buildGeminiKnowledgePrompt(nome: string, categoria: string, destination: string): string {
  const categoryInstructions: Record<string, string> = {
    hospedagem: `- "quartos": 3-5 tipos de quarto típicos com tipo, preco (R$/noite estimado), descricao, capacidade
- "comodidades": array de comodidades típicas do local (wifi, piscina, café, etc)
- "checkin": horário típico de check-in
- "checkout": horário típico de check-out`,
    restaurante: `- "menu": 2-3 seções do menu com itens típicos { secao, itens: [{ nome, descricao, preco }] }
- "horario": horário de funcionamento típico`,
    atracao: `- "ingressos": tipos de ingresso com preços estimados [{ tipo, preco, descricao }]
- "horario": horário de funcionamento
- "duracao": tempo médio de visita
- "como_chegar": como chegar ao local`,
    evento: `- "ingressos": tipos de ingresso [{ tipo, preco, descricao }]
- "horario": horário do evento`,
    experiencia: `- "ingressos": pacotes disponíveis [{ tipo, preco, descricao }]
- "duracao": duração da experiência
- "como_chegar": ponto de encontro`,
  };
  const instructions = categoryInstructions[categoria] ?? categoryInstructions['atracao'];

  return `Com base no seu conhecimento de treinamento, forneça detalhes realistas sobre "${nome}", um(a) ${categoria} em ${destination}.

Retorne JSON puro sem markdown:
{
  "nome": "${nome}",
  "site_oficial": null,
  "descricao_completa": "descrição detalhada em 2-3 frases",
  "telefone": null,
  "endereco": null,
  "horario": null,
  "fotos": [],
  "quartos": [],
  "comodidades": [],
  "checkin": null,
  "checkout": null,
  "menu": [],
  "ingressos": [],
  "duracao": null,
  "como_chegar": null
}

${instructions}

Use valores estimados realistas para ${destination}. Se não souber detalhes específicos, deixe null.`;
}

export async function extractPlaceDetails(
  nome: string,
  categoria: string,
  siteOficial: string,
  keys: ApiKeys,
  destination = ''
): Promise<PlaceDetail> {
  const rawContent = await extractWithTavily(siteOficial, keys.tavily);

  if (rawContent) {
    const prompt = buildDetailParsePrompt(nome, categoria, siteOficial, rawContent);
    try {
      const detail = await callGeminiRaw<PlaceDetail>(prompt, keys.gemini);
      return { ...detail, nome, site_oficial: siteOficial };
    } catch {
      // fall through to Gemini knowledge fallback
    }
  }

  // Gemini knowledge fallback — always returns useful content
  const fallbackPrompt = buildGeminiKnowledgePrompt(nome, categoria, destination || siteOficial);
  try {
    const detail = await callGeminiRaw<PlaceDetail>(fallbackPrompt, keys.gemini);
    return { ...detail, nome, site_oficial: siteOficial };
  } catch {
    return { nome, site_oficial: siteOficial };
  }
}

// ── Shared Gemini JSON parser ───────────────────────────────────────────────

async function callGeminiRaw<T>(prompt: string, geminiKey: string, maxTokens = 4096): Promise<T> {
  const url = `${GEMINI_PROXY_URL}?key=${encodeURIComponent(geminiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { temperature: 0.4, maxOutputTokens: maxTokens, response_mime_type: 'application/json' },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = (errorData as { error?: { message?: string } })?.error?.message || `HTTP ${response.status}`;
    console.error('[Gemini] HTTP error:', msg);
    throw new Error(`Erro na API Gemini: ${msg}`);
  }

  const data = await response.json();
  const finishReason = data.candidates?.[0]?.finishReason;
  const rawText: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!rawText) {
    console.error('[Gemini] Empty response. Full data:', JSON.stringify(data));
    throw new Error('A API não retornou conteúdo. Verifique sua chave.');
  }

  if (finishReason === 'MAX_TOKENS') {
    console.warn('[Gemini] Response truncated by MAX_TOKENS. Increase maxOutputTokens.');
  }

  console.log(`[Gemini] finishReason=${finishReason}, chars=${rawText.length}, maxTokens=${maxTokens}`);

  const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const end = cleaned.lastIndexOf('}');
  if (end === -1) throw new Error('JSON inválido.');

  let depth = 0, start = -1;
  for (let i = end; i >= 0; i--) {
    if (cleaned[i] === '}') depth++;
    else if (cleaned[i] === '{') { depth--; if (depth === 0) { start = i; break; } }
  }
  if (start === -1) throw new Error('JSON inválido.');

  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}

async function callGemini(prompt: string, geminiKey: string): Promise<ConciergeResponse> {
  return callGeminiRaw<ConciergeResponse>(prompt, geminiKey, 32768);
}

export async function fetchConciergeData(
  config: TripConfig,
  keys: ApiKeys
): Promise<ConciergeResponse> {
  const prompt = buildGeminiDirectPrompt(config);
  return callGemini(prompt, keys.gemini);
}

// ── Budget plan (separate call) ────────────────────────────────────────────

export interface BudgetPlan {
  hospedagem_sugerida: string;
  restaurantes_sugeridos: string[];
  roteiro_dia_a_dia: import('./types').DayItinerary[];
  resumo_orcamento: import('./types').BudgetBreakdown;
  dica_economia?: string;
}

function buildBudgetPlanPrompt(config: TripConfig, listedItems: ConciergeResponse): string {
  const nights = Math.max(
    1,
    Math.ceil((new Date(config.checkOut).getTime() - new Date(config.checkIn).getTime()) / 86400000)
  );

  const hotels = (listedItems.hospedagem ?? []).map(h => `${h.nome} (R$${h.diaria}/noite)`).join(', ');
  const restaurants = (listedItems.restaurantes ?? []).map(r => `${r.nome} (R$${r.preco_por_pessoa}/pessoa)`).join(', ');
  const attractions = (listedItems.atracoes ?? []).map(a => `${a.nome} (R$${a.preco})`).join(', ');
  const experiences = (listedItems.experiencias ?? []).map(x => `${x.nome} (R$${x.preco_por_pessoa}/pessoa)`).join(', ');
  const transport = (listedItems.transporte ?? []).map(t => `${t.tipo} (R$${t.valor})`).join(', ');

  return `Retorne SOMENTE JSON puro. Sem markdown.

Viagem: ${config.destination}, ${nights} noite(s), ${config.people} pessoa(s).
Orçamento TOTAL: R$ ${config.budget!.toLocaleString('pt-BR')}. NÃO ultrapasse esse valor.

Opções disponíveis:
Hospedagem: ${hotels}
Restaurantes: ${restaurants}
Atrações: ${attractions}
Experiências: ${experiences}
Transporte: ${transport}

Monte o melhor roteiro completo dentro do orçamento. Selecione 1 hospedagem, refeições e passeios para cada dia.

Campos obrigatórios:
- hospedagem_sugerida: nome exato da hospedagem escolhida (string)
- restaurantes_sugeridos: array de nomes escolhidos
- roteiro_dia_a_dia[]: dia(number), data, manha, tarde, noite, custo_estimado(number)
- resumo_orcamento{}: hospedagem, alimentacao, passeios, transporte, eventos, experiencias, total (todos numbers, total ≤ R$${config.budget})
- dica_economia: dica rápida para economizar`;
}

export async function fetchBudgetPlan(
  config: TripConfig,
  listedItems: ConciergeResponse,
  keys: ApiKeys
): Promise<BudgetPlan> {
  const prompt = buildBudgetPlanPrompt(config, listedItems);
  return callGeminiRaw<BudgetPlan>(prompt, keys.gemini, 8192);
}
