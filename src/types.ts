export type TripProfile = 'solo' | 'casal' | 'familia' | 'grupo';

export type TripType =
  | 'ferias'
  | 'aventura'
  | 'gastronomico'
  | 'romantico'
  | 'cultural'
  | 'show'
  | 'negocios';

export interface TripConfig {
  destination: string;
  checkIn: string;
  checkOut: string;
  people: number;
  profile: TripProfile;
  types: TripType[];
  budget?: number;
}

// ── API response types ─────────────────────────────────────────────────────

export interface Accommodation {
  nome: string;
  tipo: string;
  diaria: number;
  descricao: string;
  perfil_ideal: string;
  destaque?: string;
  foto_url?: string | null;
  website?: string | null;
  rating?: number | null;
  fonte_preco?: string | null;
}

export interface Restaurant {
  nome: string;
  cozinha: string;
  preco_por_pessoa: number;
  prato_estrela: string;
  horario: string;
  descricao: string;
  foto_url?: string | null;
  website?: string | null;
  rating?: number | null;
  fonte_preco?: string | null;
}

export interface Attraction {
  nome: string;
  preco: number;
  duracao: string;
  perfil_ideal: string;
  descricao: string;
  foto_url?: string | null;
  website?: string | null;
  rating?: number | null;
  fonte_preco?: string | null;
}

export interface Event {
  nome: string;
  data: string;
  preco: number;
  local: string;
  descricao: string;
  fonte_preco?: string | null;
}

export interface Transport {
  tipo: string;
  descricao: string;
  valor: number;
}

export interface SpecialExperience {
  nome: string;
  preco_por_pessoa: number;
  duracao: string;
  descricao: string;
  foto_url?: string | null;
  website?: string | null;
  rating?: number | null;
  fonte_preco?: string | null;
}

export interface DayItinerary {
  dia: number;
  data: string;
  manha: string;
  tarde: string;
  noite: string;
  custo_estimado: number;
}

export interface BudgetBreakdown {
  hospedagem: number;
  alimentacao: number;
  passeios: number;
  transporte: number;
  eventos: number;
  experiencias: number;
  total: number;
}

export interface ConciergeResponse {
  destino: string;
  clima_estimado: string;
  descricao_destino: string;
  hospedagem: Accommodation[];
  restaurantes: Restaurant[];
  atracoes: Attraction[];
  eventos: Event[];
  transporte: Transport[];
  experiencias: SpecialExperience[];
  roteiro_dia_a_dia?: DayItinerary[];
  resumo_orcamento?: BudgetBreakdown;
  dica_concierge?: string;
}

// ── External API types ──────────────────────────────────────────────────────

export interface FoursquarePhoto {
  prefix: string;
  suffix: string;
}

export interface FoursquarePlace {
  fsq_id: string;
  name: string;
  location: { formatted_address?: string; locality?: string };
  website?: string;
  tel?: string;
  rating?: number;
  price?: number;
  hours?: { display?: string };
  photos?: FoursquarePhoto[];
  photo_url?: string | null;
}

export interface TavilyWebResult {
  title: string;
  url: string;
  description: string;
}

export interface TavilyCategoryResult {
  category: string;
  query: string;
  results: TavilyWebResult[];
}

export interface EnrichmentData {
  foursquare: Record<string, FoursquarePlace[]>;
  tavily: TavilyCategoryResult[];
}

// ── Itinerary item (sidebar) ───────────────────────────────────────────────

export type ItineraryItemType =
  | 'hospedagem'
  | 'restaurante'
  | 'atracao'
  | 'evento'
  | 'transporte'
  | 'experiencia';

export interface ItineraryItem {
  id: string;
  type: ItineraryItemType;
  nome: string;
  preco: number;
  descricao: string;
}
