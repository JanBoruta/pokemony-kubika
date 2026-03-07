export interface PokemonCard {
  id: string;
  name: string;
  supertype: string; // "Pokémon", "Trainer", "Energy"
  subtypes?: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  rules?: string[];
  ancientTrait?: {
    name: string;
    text: string;
  };
  abilities?: {
    name: string;
    text: string;
    type: string;
  }[];
  attacks?: {
    name: string;
    cost: string[];
    convertedEnergyCost: number;
    damage: string;
    text: string;
  }[];
  weaknesses?: {
    type: string;
    value: string;
  }[];
  resistances?: {
    type: string;
    value: string;
  }[];
  retreatCost?: string[];
  convertedRetreatCost?: number;
  set: {
    id: string;
    name: string;
    series: string;
    printedTotal: number;
    total: number;
    legalities: {
      unlimited?: string;
      standard?: string;
      expanded?: string;
    };
    ptcgoCode?: string;
    releaseDate: string;
    updatedAt: string;
    images: {
      symbol: string;
      logo: string;
    };
  };
  number: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  regulationMark?: string;
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices?: {
      [key: string]: {
        low?: number;
        mid?: number;
        high?: number;
        market?: number;
        directLow?: number;
      };
    };
  };
}

export interface SearchResult {
  data: PokemonCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

export interface CollectionCard {
  id: string;
  user_id: string;
  card_id: string;
  card_data: PokemonCard;
  obtained_at: string;
  notes?: string;
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
  "Pokémon": "Pokémon",
  "Trainer": "Trenér",
  "Energy": "Energie",
};

// České překlady vzácností
export const rarityTranslations: Record<string, string> = {
  "Common": "Běžná",
  "Uncommon": "Neobvyklá",
  "Rare": "Vzácná",
  "Rare Holo": "Vzácná Holo",
  "Rare Holo EX": "Vzácná Holo EX",
  "Rare Holo GX": "Vzácná Holo GX",
  "Rare Holo V": "Vzácná Holo V",
  "Rare Holo VMAX": "Vzácná Holo VMAX",
  "Rare Holo VSTAR": "Vzácná Holo VSTAR",
  "Rare Ultra": "Ultra Vzácná",
  "Rare Secret": "Tajná Vzácná",
  "Promo": "Promo",
  "Amazing Rare": "Úžasná Vzácná",
  "Rare Rainbow": "Duhová Vzácná",
  "Illustration Rare": "Ilustrační Vzácná",
  "Special Illustration Rare": "Speciální Ilustrační Vzácná",
  "Hyper Rare": "Hyper Vzácná",
  "Double Rare": "Dvojitě Vzácná",
};
