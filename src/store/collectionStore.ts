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

interface CollectionState {
  items: CollectionItem[];
  addCard: (card: PokemonCard, notes?: string) => void;
  removeCard: (cardId: string) => void;
  updateQuantity: (cardId: string, quantity: number) => void;
  updateNotes: (cardId: string, notes: string) => void;
  isInCollection: (cardId: string) => boolean;
  getCard: (cardId: string) => CollectionItem | undefined;
  clearCollection: () => void;
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      items: [],

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
    }),
    {
      name: "pokemon-collection",
    }
  )
);
