import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PokemonCard } from "@/types/pokemon";

// ============ TYPES ============

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
  createdAt: string;
  avatarColor: string;
}

export interface PlayerData {
  items: CollectionItem[];
  favorites: FavoriteItem[];
}

interface CollectionState {
  // Hydration tracking
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  // Player management
  players: Player[];
  activePlayerId: string | null;
  playerData: Record<string, PlayerData>;

  // Player actions
  createPlayer: (name: string, pin: string) => string;
  loginPlayer: (playerId: string, pin: string) => boolean;
  logoutPlayer: () => void;
  getActivePlayer: () => Player | null;
  getAllPlayers: () => Player[];
  getPlayerData: (playerId: string) => PlayerData | null;

  // Active player's collection (shortcuts)
  items: CollectionItem[];
  favorites: FavoriteItem[];

  // Collection actions (operate on active player)
  addCard: (card: PokemonCard, notes?: string) => void;
  removeCard: (cardId: string) => void;
  updateQuantity: (cardId: string, quantity: number) => void;
  updateNotes: (cardId: string, notes: string) => void;
  isInCollection: (cardId: string) => boolean;
  getCard: (cardId: string) => CollectionItem | undefined;
  clearCollection: () => void;

  // Favorites actions (operate on active player)
  addFavorite: (card: PokemonCard) => void;
  removeFavorite: (cardId: string) => void;
  isFavorite: (cardId: string) => boolean;
  clearFavorites: () => void;

  // Import/Export
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

// ============ HELPER FUNCTIONS ============

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const AVATAR_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
  "#BB8FCE", "#85C1E9", "#F8B500", "#00CED1"
];

const getRandomColor = (): string => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};

const getEmptyPlayerData = (): PlayerData => ({
  items: [],
  favorites: [],
});

// ============ STORE ============

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      // Hydration tracking - starts false, set to true after rehydration
      _hasHydrated: false,
      setHasHydrated: (value: boolean) => set({ _hasHydrated: value }),

      // Player management state
      players: [],
      activePlayerId: null,
      playerData: {},

      // Computed values - will be synced with active player's data
      items: [],
      favorites: [],

      // ============ PLAYER ACTIONS ============

      createPlayer: (name: string, pin: string) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newPlayer: Player = {
          id,
          name,
          pin,
          createdAt: now,
          avatarColor: getRandomColor(),
        };

        set((state) => ({
          players: [...state.players, newPlayer],
          playerData: {
            ...state.playerData,
            [id]: getEmptyPlayerData(),
          },
          activePlayerId: id,
          items: [],
          favorites: [],
        }));

        return id;
      },

      loginPlayer: (playerId: string, pin: string) => {
        const state = get();
        const player = state.players.find((p) => p.id === playerId);

        if (!player || player.pin !== pin) {
          return false;
        }

        const data = state.playerData[playerId] || getEmptyPlayerData();

        set({
          activePlayerId: playerId,
          items: data.items,
          favorites: data.favorites,
        });

        return true;
      },

      logoutPlayer: () => {
        set({
          activePlayerId: null,
          items: [],
          favorites: [],
        });
      },

      getActivePlayer: () => {
        const state = get();
        if (!state.activePlayerId) return null;
        return state.players.find((p) => p.id === state.activePlayerId) || null;
      },

      getAllPlayers: () => {
        return get().players;
      },

      getPlayerData: (playerId: string) => {
        return get().playerData[playerId] || null;
      },

      // ============ COLLECTION ACTIONS ============

      addCard: (card: PokemonCard, notes?: string) => {
        const state = get();
        if (!state.activePlayerId) return;

        const playerItems = state.playerData[state.activePlayerId]?.items || [];
        const existing = playerItems.find((item) => item.card.id === card.id);

        let newItems: CollectionItem[];
        if (existing) {
          newItems = playerItems.map((item) =>
            item.card.id === card.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          const newItem: CollectionItem = {
            id: `${card.id}-${generateId()}`,
            card,
            addedAt: new Date().toISOString(),
            notes,
            quantity: 1,
          };
          newItems = [...playerItems, newItem];
        }

        set((s) => ({
          items: newItems,
          playerData: {
            ...s.playerData,
            [state.activePlayerId!]: {
              ...s.playerData[state.activePlayerId!],
              items: newItems,
            },
          },
        }));
      },

      removeCard: (cardId: string) => {
        const state = get();
        if (!state.activePlayerId) return;

        const newItems = state.items.filter((item) => item.card.id !== cardId);

        set((s) => ({
          items: newItems,
          playerData: {
            ...s.playerData,
            [state.activePlayerId!]: {
              ...s.playerData[state.activePlayerId!],
              items: newItems,
            },
          },
        }));
      },

      updateQuantity: (cardId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeCard(cardId);
          return;
        }

        const state = get();
        if (!state.activePlayerId) return;

        const newItems = state.items.map((item) =>
          item.card.id === cardId ? { ...item, quantity } : item
        );

        set((s) => ({
          items: newItems,
          playerData: {
            ...s.playerData,
            [state.activePlayerId!]: {
              ...s.playerData[state.activePlayerId!],
              items: newItems,
            },
          },
        }));
      },

      updateNotes: (cardId: string, notes: string) => {
        const state = get();
        if (!state.activePlayerId) return;

        const newItems = state.items.map((item) =>
          item.card.id === cardId ? { ...item, notes } : item
        );

        set((s) => ({
          items: newItems,
          playerData: {
            ...s.playerData,
            [state.activePlayerId!]: {
              ...s.playerData[state.activePlayerId!],
              items: newItems,
            },
          },
        }));
      },

      isInCollection: (cardId: string) => {
        return get().items.some((item) => item.card.id === cardId);
      },

      getCard: (cardId: string) => {
        return get().items.find((item) => item.card.id === cardId);
      },

      clearCollection: () => {
        const state = get();
        if (!state.activePlayerId) return;

        set((s) => ({
          items: [],
          playerData: {
            ...s.playerData,
            [state.activePlayerId!]: {
              ...s.playerData[state.activePlayerId!],
              items: [],
            },
          },
        }));
      },

      // ============ FAVORITES ACTIONS ============

      addFavorite: (card: PokemonCard) => {
        const state = get();
        if (!state.activePlayerId) return;

        const playerFavorites = state.playerData[state.activePlayerId]?.favorites || [];
        const existing = playerFavorites.find((item) => item.card.id === card.id);
        if (existing) return;

        const newFavorite: FavoriteItem = {
          id: `fav-${card.id}-${generateId()}`,
          card,
          addedAt: new Date().toISOString(),
        };
        const newFavorites = [...playerFavorites, newFavorite];

        set((s) => ({
          favorites: newFavorites,
          playerData: {
            ...s.playerData,
            [state.activePlayerId!]: {
              ...s.playerData[state.activePlayerId!],
              favorites: newFavorites,
            },
          },
        }));
      },

      removeFavorite: (cardId: string) => {
        const state = get();
        if (!state.activePlayerId) return;

        const newFavorites = state.favorites.filter((item) => item.card.id !== cardId);

        set((s) => ({
          favorites: newFavorites,
          playerData: {
            ...s.playerData,
            [state.activePlayerId!]: {
              ...s.playerData[state.activePlayerId!],
              favorites: newFavorites,
            },
          },
        }));
      },

      isFavorite: (cardId: string) => {
        return get().favorites.some((item) => item.card.id === cardId);
      },

      clearFavorites: () => {
        const state = get();
        if (!state.activePlayerId) return;

        set((s) => ({
          favorites: [],
          playerData: {
            ...s.playerData,
            [state.activePlayerId!]: {
              ...s.playerData[state.activePlayerId!],
              favorites: [],
            },
          },
        }));
      },

      // ============ IMPORT/EXPORT ============

      exportData: () => {
        const state = get();
        const exportObj = {
          version: 2,
          exportedAt: new Date().toISOString(),
          players: state.players,
          activePlayerId: state.activePlayerId,
          playerData: state.playerData,
        };
        return JSON.stringify(exportObj, null, 2);
      },

      importData: (jsonData: string) => {
        try {
          const data = JSON.parse(jsonData);

          // Version 2 format (multi-player)
          if (data.version === 2 && data.players) {
            set({
              players: data.players,
              activePlayerId: data.activePlayerId,
              playerData: data.playerData,
              items: data.activePlayerId ? data.playerData[data.activePlayerId]?.items || [] : [],
              favorites: data.activePlayerId ? data.playerData[data.activePlayerId]?.favorites || [] : [],
            });
            return true;
          }

          // Version 1 format (legacy single player) - migrate to active player
          if (data.items && Array.isArray(data.items)) {
            const state = get();
            if (!state.activePlayerId) return false;

            set((s) => ({
              items: data.items,
              favorites: data.favorites || [],
              playerData: {
                ...s.playerData,
                [state.activePlayerId!]: {
                  items: data.items,
                  favorites: data.favorites || [],
                },
              },
            }));
            return true;
          }

          return false;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "pokemon-collection-v3",
      onRehydrateStorage: () => (state) => {
        // Called when store has been rehydrated from localStorage
        if (state) {
          state.setHasHydrated(true);

          // Sync items/favorites with active player's data after rehydration
          if (state.activePlayerId && state.playerData[state.activePlayerId]) {
            const data = state.playerData[state.activePlayerId];
            state.items = data.items;
            state.favorites = data.favorites;
          }
        }
      },
      // Migrate from old storage format
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<CollectionState> & {
          items?: CollectionItem[];
          favorites?: FavoriteItem[];
        };

        // If we have old format data (items at root level but no players)
        if (state.items && (!state.players || state.players.length === 0)) {
          // Create default player with old data
          const defaultPlayerId = generateId();
          const defaultPlayer: Player = {
            id: defaultPlayerId,
            name: "Kubik",
            pin: "1212",
            createdAt: new Date().toISOString(),
            avatarColor: "#FFCB05",
          };

          return {
            ...state,
            players: [defaultPlayer],
            activePlayerId: defaultPlayerId,
            playerData: {
              [defaultPlayerId]: {
                items: state.items || [],
                favorites: state.favorites || [],
              },
            },
            _hasHydrated: false,
          };
        }

        return state as CollectionState;
      },
      version: 3,
    }
  )
);

// ============ SELECTOR HOOKS ============

export const useHasHydrated = () => useCollectionStore((state) => state._hasHydrated);
export const useActivePlayer = () => useCollectionStore((state) => state.getActivePlayer());
export const useAllPlayers = () => useCollectionStore((state) => state.players);
export const useItems = () => useCollectionStore((state) => state.items);
export const useFavorites = () => useCollectionStore((state) => state.favorites);
