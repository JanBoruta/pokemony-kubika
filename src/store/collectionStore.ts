import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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

export interface Player {
  id: string;
  name: string;
  pin: string;
  createdAt: number;
}

export interface PlayerData {
  items: CollectionItem[];
  favorites: FavoriteItem[];
}

interface CollectionState {
  // Multi-player support
  players: Player[];
  activePlayerId: string | null;
  dataByPlayerId: Record<string, PlayerData>;
  hasHydrated: boolean;

  // Player management
  addPlayer: (name: string, pin: string) => string;
  loginPlayer: (playerId: string, pin: string) => boolean;
  logout: () => void;
  removePlayer: (playerId: string) => void;
  getActivePlayer: () => Player | null;
  setHasHydrated: (value: boolean) => void;

  // Collection functions (operate on active player)
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

  // Getters for current player data
  getItems: () => CollectionItem[];
  getFavorites: () => FavoriteItem[];
}

const emptyPlayerData = (): PlayerData => ({
  items: [],
  favorites: [],
});

const DEFAULT_PLAYER: Player = {
  id: "kubik-default",
  name: "Kubík",
  pin: "1212",
  createdAt: 0, // Fixed value to avoid SSR/client mismatch
};

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      players: [DEFAULT_PLAYER],
      activePlayerId: null,
      dataByPlayerId: {
        [DEFAULT_PLAYER.id]: emptyPlayerData(),
      },
      hasHydrated: false,

      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

      addPlayer: (name: string, pin: string) => {
        const id = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const player: Player = {
          id,
          name,
          pin,
          createdAt: Date.now(),
        };

        set((state) => ({
          players: [...state.players, player],
          dataByPlayerId: {
            ...state.dataByPlayerId,
            [id]: emptyPlayerData(),
          },
        }));

        return id;
      },

      loginPlayer: (playerId: string, pin: string) => {
        const player = get().players.find((p) => p.id === playerId);
        if (!player || player.pin !== pin) return false;

        set({ activePlayerId: playerId });
        return true;
      },

      logout: () => {
        set({ activePlayerId: null });
      },

      removePlayer: (playerId: string) => {
        // Nelze smazat výchozího hráče
        if (playerId === DEFAULT_PLAYER.id) return;

        set((state) => {
          const players = state.players.filter((p) => p.id !== playerId);
          const { [playerId]: _, ...rest } = state.dataByPlayerId;

          return {
            players,
            dataByPlayerId: rest,
            activePlayerId:
              state.activePlayerId === playerId ? null : state.activePlayerId,
          };
        });
      },

      getActivePlayer: () => {
        const { activePlayerId, players } = get();
        return players.find((p) => p.id === activePlayerId) ?? null;
      },

      getItems: () => {
        const { activePlayerId, dataByPlayerId } = get();
        if (!activePlayerId) return [];
        return dataByPlayerId[activePlayerId]?.items ?? [];
      },

      getFavorites: () => {
        const { activePlayerId, dataByPlayerId } = get();
        if (!activePlayerId) return [];
        return dataByPlayerId[activePlayerId]?.favorites ?? [];
      },

      addCard: (card: PokemonCard, notes?: string) => {
        const { activePlayerId, dataByPlayerId } = get();
        if (!activePlayerId) return;

        const currentData = dataByPlayerId[activePlayerId] ?? emptyPlayerData();
        const existing = currentData.items.find((item) => item.card.id === card.id);

        if (existing) {
          set({
            dataByPlayerId: {
              ...dataByPlayerId,
              [activePlayerId]: {
                ...currentData,
                items: currentData.items.map((item) =>
                  item.card.id === card.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                ),
              },
            },
          });
        } else {
          set({
            dataByPlayerId: {
              ...dataByPlayerId,
              [activePlayerId]: {
                ...currentData,
                items: [
                  ...currentData.items,
                  {
                    id: `${card.id}-${Date.now()}`,
                    card,
                    addedAt: new Date().toISOString(),
                    notes,
                    quantity: 1,
                  },
                ],
              },
            },
          });
        }
      },

      removeCard: (cardId: string) => {
        const { activePlayerId, dataByPlayerId } = get();
        if (!activePlayerId) return;

        const currentData = dataByPlayerId[activePlayerId] ?? emptyPlayerData();

        set({
          dataByPlayerId: {
            ...dataByPlayerId,
            [activePlayerId]: {
              ...currentData,
              items: currentData.items.filter((item) => item.card.id !== cardId),
            },
          },
        });
      },

      updateQuantity: (cardId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeCard(cardId);
          return;
        }

        const { activePlayerId, dataByPlayerId } = get();
        if (!activePlayerId) return;

        const currentData = dataByPlayerId[activePlayerId] ?? emptyPlayerData();

        set({
          dataByPlayerId: {
            ...dataByPlayerId,
            [activePlayerId]: {
              ...currentData,
              items: currentData.items.map((item) =>
                item.card.id === cardId ? { ...item, quantity } : item
              ),
            },
          },
        });
      },

      updateNotes: (cardId: string, notes: string) => {
        const { activePlayerId, dataByPlayerId } = get();
        if (!activePlayerId) return;

        const currentData = dataByPlayerId[activePlayerId] ?? emptyPlayerData();

        set({
          dataByPlayerId: {
            ...dataByPlayerId,
            [activePlayerId]: {
              ...currentData,
              items: currentData.items.map((item) =>
                item.card.id === cardId ? { ...item, notes } : item
              ),
            },
          },
        });
      },

      isInCollection: (cardId: string) => {
        return get().getItems().some((item) => item.card.id === cardId);
      },

      getCard: (cardId: string) => {
        return get().getItems().find((item) => item.card.id === cardId);
      },

      clearCollection: () => {
        const { activePlayerId, dataByPlayerId } = get();
        if (!activePlayerId) return;

        const currentData = dataByPlayerId[activePlayerId] ?? emptyPlayerData();

        set({
          dataByPlayerId: {
            ...dataByPlayerId,
            [activePlayerId]: {
              ...currentData,
              items: [],
            },
          },
        });
      },

      addFavorite: (card: PokemonCard) => {
        const { activePlayerId, dataByPlayerId } = get();
        if (!activePlayerId) return;

        const currentData = dataByPlayerId[activePlayerId] ?? emptyPlayerData();
        const existing = currentData.favorites.find((item) => item.card.id === card.id);

        if (!existing) {
          set({
            dataByPlayerId: {
              ...dataByPlayerId,
              [activePlayerId]: {
                ...currentData,
                favorites: [
                  ...currentData.favorites,
                  {
                    id: `fav-${card.id}-${Date.now()}`,
                    card,
                    addedAt: new Date().toISOString(),
                  },
                ],
              },
            },
          });
        }
      },

      removeFavorite: (cardId: string) => {
        const { activePlayerId, dataByPlayerId } = get();
        if (!activePlayerId) return;

        const currentData = dataByPlayerId[activePlayerId] ?? emptyPlayerData();

        set({
          dataByPlayerId: {
            ...dataByPlayerId,
            [activePlayerId]: {
              ...currentData,
              favorites: currentData.favorites.filter((item) => item.card.id !== cardId),
            },
          },
        });
      },

      isFavorite: (cardId: string) => {
        return get().getFavorites().some((item) => item.card.id === cardId);
      },

      clearFavorites: () => {
        const { activePlayerId, dataByPlayerId } = get();
        if (!activePlayerId) return;

        const currentData = dataByPlayerId[activePlayerId] ?? emptyPlayerData();

        set({
          dataByPlayerId: {
            ...dataByPlayerId,
            [activePlayerId]: {
              ...currentData,
              favorites: [],
            },
          },
        });
      },

      exportData: () => {
        const { activePlayerId, dataByPlayerId, getActivePlayer } = get();
        if (!activePlayerId) return "{}";

        const currentData = dataByPlayerId[activePlayerId] ?? emptyPlayerData();
        const player = getActivePlayer();

        const exportObj = {
          version: 2,
          exportedAt: new Date().toISOString(),
          playerName: player?.name ?? "Unknown",
          items: currentData.items,
          favorites: currentData.favorites,
        };
        return JSON.stringify(exportObj, null, 2);
      },

      importData: (jsonData: string) => {
        try {
          const data = JSON.parse(jsonData);
          const { activePlayerId, dataByPlayerId } = get();
          if (!activePlayerId) return false;

          if (data.items && Array.isArray(data.items)) {
            set({
              dataByPlayerId: {
                ...dataByPlayerId,
                [activePlayerId]: {
                  items: data.items,
                  favorites: data.favorites || [],
                },
              },
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
      name: "pokemon-collection-v2",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;

        // Pokud nemáme players pole, inicializuj ho
        if (!state.players || !Array.isArray(state.players)) {
          state.players = [DEFAULT_PLAYER];
        }

        // Pokud nemáme dataByPlayerId, inicializuj ho
        if (!state.dataByPlayerId || typeof state.dataByPlayerId !== 'object') {
          state.dataByPlayerId = {
            [DEFAULT_PLAYER.id]: emptyPlayerData(),
          };
        }

        // Zajisti, že default player existuje
        const players = state.players as Player[];
        if (!players.find(p => p.id === DEFAULT_PLAYER.id)) {
          players.unshift(DEFAULT_PLAYER);
        }

        // Zajisti, že default player má data
        const dataByPlayerId = state.dataByPlayerId as Record<string, PlayerData>;
        if (!dataByPlayerId[DEFAULT_PLAYER.id]) {
          dataByPlayerId[DEFAULT_PLAYER.id] = emptyPlayerData();
        }

        return state as unknown as CollectionState;
      },
      version: 1,
    }
  )
);

// Selektory pro snadnější použití
export const useActivePlayer = () =>
  useCollectionStore((state) =>
    state.players.find((p) => p.id === state.activePlayerId) ?? null
  );

export const useIsLoggedIn = () =>
  useCollectionStore((state) => state.activePlayerId !== null);

export const useItems = () =>
  useCollectionStore((state) => {
    if (!state.activePlayerId) return [];
    return state.dataByPlayerId[state.activePlayerId]?.items ?? [];
  });

export const useFavorites = () =>
  useCollectionStore((state) => {
    if (!state.activePlayerId) return [];
    return state.dataByPlayerId[state.activePlayerId]?.favorites ?? [];
  });
