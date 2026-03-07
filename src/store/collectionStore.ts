import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PokemonCard } from "@/types/pokemon";

export interface CollectionItem {
  id: string;
  card: PokemonCard;
  addedAt: string;
  notes?: string;
  quantity: number;
}

export interface FavoriteItem {
  id: string;
  card: PokemonCard;
  addedAt: string;
}

interface CollectionState {
  items: CollectionItem[];
  favorites: FavoriteItem[];
  addCard: (card: PokemonCard, notes?: string) => void;
  removeCard: (cardId: string) => void;
  updateQuantity: (cardId: string, quantity: number) => void;
  updateNotes: (cardId: string, notes: string) => void;
  isInCollection: (cardId: string) => boolean;
  getCard: (cardId: string) => CollectionItem | undefined;
  clearCollection: () => void;
  addFavorite: (card: PokemonCard) => void;
  removeFavorite: (cardId: string) => void;
  isFavorite: (cardId: string) => boolean;
  clearFavorites: () => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      items: [],
      favorites: [],

      addCard: (card: PokemonCard, notes?: string) => {
        const existing = get().items.find((item) => item.card.id === card.id);

        if (existing) {
          // Zvýšíme množství, pokud karta už existuje
          set((state) => ({
            items: state.items.map((item) =>
              item.card.id === card.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          }));
        } else {
          // Přidáme novou kartu
          set((state) => ({
            items: [
              ...state.items,
              {
                id: `${card.id}-${Date.now()}`,
                card,
                addedAt: new Date().toISOString(),
                notes,
                quantity: 1,
              },
            ],
          }));
        }
      },

      removeCard: (cardId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.card.id !== cardId),
        }));
      },

      updateQuantity: (cardId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeCard(cardId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.card.id === cardId ? { ...item, quantity } : item
          ),
        }));
      },

      updateNotes: (cardId: string, notes: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.card.id === cardId ? { ...item, notes } : item
          ),
        }));
      },

      isInCollection: (cardId: string) => {
        return get().items.some((item) => item.card.id === cardId);
      },

      getCard: (cardId: string) => {
        return get().items.find((item) => item.card.id === cardId);
      },

      clearCollection: () => {
        set({ items: [] });
      },

      addFavorite: (card: PokemonCard) => {
        const existing = get().favorites.find((item) => item.card.id === card.id);
        if (!existing) {
          set((state) => ({
            favorites: [
              ...state.favorites,
              {
                id: `fav-${card.id}-${Date.now()}`,
                card,
                addedAt: new Date().toISOString(),
              },
            ],
          }));
        }
      },

      removeFavorite: (cardId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((item) => item.card.id !== cardId),
        }));
      },

      isFavorite: (cardId: string) => {
        return get().favorites.some((item) => item.card.id === cardId);
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },

      exportData: () => {
        const state = get();
        const exportObj = {
          version: 1,
          exportedAt: new Date().toISOString(),
          items: state.items,
          favorites: state.favorites,
        };
        return JSON.stringify(exportObj, null, 2);
      },

      importData: (jsonData: string) => {
        try {
          const data = JSON.parse(jsonData);
          if (data.items && Array.isArray(data.items)) {
            set({
              items: data.items,
              favorites: data.favorites || [],
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "pokemon-collection",
    }
  )
);
