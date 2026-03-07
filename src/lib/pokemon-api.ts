import { PokemonCard, SearchResult } from "@/types/pokemon";

const API_BASE = "https://api.pokemontcg.io/v2";

// Volitelně můžeš přidat API klíč pro vyšší limity
const API_KEY = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY || "";

const headers: HeadersInit = {
  "Content-Type": "application/json",
};

if (API_KEY) {
  headers["X-Api-Key"] = API_KEY;
}

export async function searchCards(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> {
  const searchQuery = encodeURIComponent(`name:${query}*`);
  const url = `${API_BASE}/cards?q=${searchQuery}&page=${page}&pageSize=${pageSize}`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export async function searchCardsAdvanced(
  query: string,
  options?: {
    types?: string[];
    supertype?: string;
    rarity?: string;
    set?: string;
  },
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> {
  const queryParts: string[] = [];

  if (query) {
    queryParts.push(`name:${query}*`);
  }

  if (options?.types?.length) {
    queryParts.push(`types:${options.types.join(" OR types:")}`);
  }

  if (options?.supertype) {
    queryParts.push(`supertype:${options.supertype}`);
  }

  if (options?.rarity) {
    queryParts.push(`rarity:"${options.rarity}"`);
  }

  if (options?.set) {
    queryParts.push(`set.id:${options.set}`);
  }

  const searchQuery = encodeURIComponent(queryParts.join(" "));
  const url = `${API_BASE}/cards?q=${searchQuery}&page=${page}&pageSize=${pageSize}`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export async function getCardById(id: string): Promise<PokemonCard> {
  const url = `${API_BASE}/cards/${id}`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

export async function getRandomCards(count: number = 5): Promise<PokemonCard[]> {
  // Získáme náhodné karty z populárních setů
  const url = `${API_BASE}/cards?pageSize=${count}&orderBy=-set.releaseDate`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data: SearchResult = await response.json();
  return data.data;
}

export async function getSets(): Promise<{ id: string; name: string; releaseDate: string }[]> {
  const url = `${API_BASE}/sets?orderBy=-releaseDate`;

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}
