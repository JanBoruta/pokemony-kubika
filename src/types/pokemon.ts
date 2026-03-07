// TCGdex API types

export interface PokemonCardBasic {
  id: string;
  localId: string;
  name: string;
  image?: string;
}

export interface PokemonCard {
  id: string;
  localId: string;
  name: string;
  image?: string;
  category: string; // "Pokemon", "Trainer", "Energy"
  illustrator?: string;
  rarity?: string;
  hp?: number;
  types?: string[];
  stage?: string;
  evolvesFrom?: string;
  description?: string;
  attacks?: {
    name: string;
    cost?: string[];
    damage?: number | string;
    effect?: string;
  }[];
  abilities?: {
    name: string;
    effect: string;
    type: string;
  }[];
  weaknesses?: {
    type: string;
    value: string;
  }[];
  resistances?: {
    type: string;
    value: string;
  }[];
  retreat?: number;
  set: {
    id: string;
    name: string;
    logo?: string;
    cardCount?: {
      official: number;
      total: number;
    };
  };
  dexId?: number[];
  legal?: {
    standard: boolean;
    expanded: boolean;
  };
}

export interface SearchResult {
  data: PokemonCard[];
  totalCount: number;
}

// České překlady typů
export const typeTranslations: Record<string, string> = {
  "Grass": "Tráva",
  "Fire": "Oheň",
  "Water": "Voda",
  "Lightning": "Elektro",
  "Psychic": "Psycho",
  "Fighting": "Bojový",
  "Darkness": "Temný",
  "Metal": "Kovový",
  "Fairy": "Víla",
  "Dragon": "Drak",
  "Colorless": "Bezbarvý",
  "Pokemon": "Pokémon",
  "Trainer": "Trenér",
  "Energy": "Energie",
};

// České překlady vzácností
export const rarityTranslations: Record<string, string> = {
  "Common": "Běžná",
  "Uncommon": "Neobvyklá",
  "Rare": "Vzácná",
  "Rare Holo": "Vzácná Holo",
  "Ultra Rare": "Ultra Vzácná",
  "Secret Rare": "Tajná Vzácná",
  "Promo": "Promo",
  "Amazing Rare": "Úžasná Vzácná",
  "Illustration Rare": "Ilustrační Vzácná",
  "Special Illustration Rare": "Speciální Ilustrační Vzácná",
  "Hyper Rare": "Hyper Vzácná",
  "Double Rare": "Dvojitě Vzácná",
  "Shiny Rare": "Třpytivá Vzácná",
  "None": "Žádná",
};

export interface CollectionCard {
  id: string;
  card_id: string;
  card_data: PokemonCard;
  obtained_at: string;
  notes?: string;
}
