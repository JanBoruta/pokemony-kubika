import { PokemonCard, PokemonCardBasic } from "@/types/pokemon";

// TCGdex API - free, reliable Pokemon TCG API
const API_BASE = "https://api.tcgdex.net/v2/en";

export async function searchCards(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: PokemonCard[]; totalCount: number }> {
  try {
    // TCGdex search endpoint
    const url = `${API_BASE}/cards?name=${encodeURIComponent(query)}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      return { data: [], totalCount: 0 };
    }

    const basicCards: PokemonCardBasic[] = await response.json();

    if (!basicCards || basicCards.length === 0) {
      return { data: [], totalCount: 0 };
    }

    // Limit results for autocomplete
    const limitedCards = basicCards.slice(0, pageSize);

    // Fetch full details for each card
    const detailedCards = await Promise.all(
      limitedCards.map(async (card) => {
        try {
          const detailResponse = await fetch(`${API_BASE}/cards/${card.id}`);
          if (detailResponse.ok) {
            return await detailResponse.json();
          }
          // Return basic card info if detail fetch fails
          return {
            ...card,
            category: "Pokemon",
            set: { id: "", name: "Unknown" },
          };
        } catch {
          return {
            ...card,
            category: "Pokemon",
            set: { id: "", name: "Unknown" },
          };
        }
      })
    );

    return {
      data: detailedCards as PokemonCard[],
      totalCount: basicCards.length
    };
  } catch (error) {
    console.error("Search error:", error);
    return { data: [], totalCount: 0 };
  }
}

export async function getCardById(id: string): Promise<PokemonCard | null> {
  try {
    const url = `${API_BASE}/cards/${id}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Get card error:", error);
    return null;
  }
}

export async function getRandomCards(count: number = 6): Promise<PokemonCard[]> {
  try {
    // Get cards from a popular set (Scarlet & Violet base)
    const sets = ["sv03", "sv02", "sv01", "swsh12", "swsh11"];
    const randomSet = sets[Math.floor(Math.random() * sets.length)];

    const url = `${API_BASE}/sets/${randomSet}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      return [];
    }

    const setData = await response.json();

    if (!setData.cards || setData.cards.length === 0) {
      return [];
    }

    // Shuffle and pick random cards
    const shuffled = [...setData.cards].sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, count);

    // Fetch full details for selected cards
    const detailedCards = await Promise.all(
      selectedCards.map(async (card: PokemonCardBasic) => {
        try {
          const detailResponse = await fetch(`${API_BASE}/cards/${card.id}`);
          if (detailResponse.ok) {
            return await detailResponse.json();
          }
          return null;
        } catch {
          return null;
        }
      })
    );

    return detailedCards.filter((card): card is PokemonCard => card !== null);
  } catch (error) {
    console.error("Get random cards error:", error);
    return [];
  }
}

export async function getSets(): Promise<{ id: string; name: string }[]> {
  try {
    const url = `${API_BASE}/sets`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`API Error: ${response.status}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Get sets error:", error);
    return [];
  }
}
