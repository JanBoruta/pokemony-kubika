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
  _serverSynced: boolean;
  setHasHydrated: (value: boolean) => void;

  // Player management
  players: Player[];
  activePlayerId: string | null;
  playerData: Record<string, PlayerData>;

  // Player actions
  fetchPlayersFromServer: () => Promise<void>;
  createPlayer: (name: string, pin: string) => Promise<string | null>;
  loginPlayer: (playerId: string, pin: string) => Promise<boolean>;
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

  // Sync
  syncToServer: () => Promise<void>;

  // Import/Export
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

// ============ HELPER FUNCTIONS ============

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getEmptyPlayerData = (): PlayerData => ({
  items: [],
  favorites: [],
});

// Debounce sync to server
let syncTimeout: NodeJS.Timeout | null = null;
const debouncedSync = (syncFn: () => Promise<void>) => {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncFn();
  }, 1000);
};

// ============ STORE ============

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      // Hydration tracking
      _hasHydrated: false,
      _serverSynced: false,
      setHasHydrated: (value: boolean) => set({ _hasHydrated: value }),

      // Player management state
      players: [],
      activePlayerId: null,
      playerData: {},

      // Computed values
      items: [],
      favorites: [],

      // ============ SERVER SYNC ============

      fetchPlayersFromServer: async () => {
        try {
          const response = await fetch("/api/players");
          const data = await response.json();

          if (data.players && Array.isArray(data.players)) {
            set((state) => {
              // Merge server players with local (server takes precedence for player list)
              const serverPlayerIds = new Set(data.players.map((p: Player) => p.id));

              // Keep local players that don't exist on server (newly created offline)
              const localOnlyPlayers = state.players.filter(p => !serverPlayerIds.has(p.id));

              // Merge player data
              const mergedPlayerData = { ...state.playerData };
              for (const [playerId, pData] of Object.entries(data.playerData || {})) {
                // Server data takes precedence, but merge if local has more items
                const serverData = pData as PlayerData;
                const localData = state.playerData[playerId];

                if (!localData) {
                  mergedPlayerData[playerId] = serverData;
                } else {
                  // Use whichever has more items (simple merge strategy)
                  mergedPlayerData[playerId] = {
                    items: serverData.items.length >= localData.items.length ? serverData.items : localData.items,
                    favorites: serverData.favorites.length >= localData.favorites.length ? serverData.favorites : localData.favorites,
                  };
                }
              }

              const newPlayers = [...data.players, ...localOnlyPlayers];

              // If we have an active player, update items/favorites
              let newItems = state.items;
              let newFavorites = state.favorites;
              if (state.activePlayerId && mergedPlayerData[state.activePlayerId]) {
                newItems = mergedPlayerData[state.activePlayerId].items;
                newFavorites = mergedPlayerData[state.activePlayerId].favorites;
              }

              return {
                players: newPlayers,
                playerData: mergedPlayerData,
                items: newItems,
                favorites: newFavorites,
                _serverSynced: true,
              };
            });
          }
        } catch (error) {
          console.error("Failed to fetch players from server:", error);
          set({ _serverSynced: true }); // Mark as synced even on error to not block UI
        }
      },

      syncToServer: async () => {
        const state = get();
        if (!state.activePlayerId) return;

        try {
          await fetch("/api/players", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              playerId: state.activePlayerId,
              items: state.items,
              favorites: state.favorites,
            }),
          });
        } catch (error) {
          console.error("Failed to sync to server:", error);
        }
      },

      // ============ PLAYER ACTIONS ============

      createPlayer: async (name: string, pin: string) => {
        try {
          const response = await fetch("/api/players", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "create", name, pin }),
          });

          const data = await response.json();

          if (data.success && data.player) {
            const player = data.player as Player;

            set((state) => ({
              players: [...state.players, player],
              playerData: {
                ...state.playerData,
                [player.id]: getEmptyPlayerData(),
              },
              activePlayerId: player.id,
              items: [],
              favorites: [],
            }));

            return player.id;
          }

          // Fallback to local creation if server fails
          const id = generateId();
          const now = new Date().toISOString();
          const AVATAR_COLORS = [
            "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
            "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
            "#BB8FCE", "#85C1E9", "#F8B500", "#00CED1"
          ];

          const newPlayer: Player = {
            id,
            name,
            createdAt: now,
            avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
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
        } catch (error) {
          console.error("Error creating player:", error);
          return null;
        }
      },

      loginPlayer: async (playerId: string, pin: string) => {
        try {
          // Verify PIN with server
          const response = await fetch("/api/players", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "verify", playerId, pin }),
          });

          const data = await response.json();

          if (!data.success) {
            return false;
          }

          const state = get();
          const playerData = state.playerData[playerId] || getEmptyPlayerData();

          set({
            activePlayerId: playerId,
            items: playerData.items,
            favorites: playerData.favorites,
          });

          return true;
        } catch (error) {
          console.error("Error logging in:", error);
          return false;
        }
      },

      logoutPlayer: () => {
        // Sync before logout
        get().syncToServer();

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

        debouncedSync(() => get().syncToServer());
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

        debouncedSync(() => get().syncToServer());
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

        debouncedSync(() => get().syncToServer());
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

        debouncedSync(() => get().syncToServer());
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

        debouncedSync(() => get().syncToServer());
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

        debouncedSync(() => get().syncToServer());
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

        debouncedSync(() => get().syncToServer());
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

        debouncedSync(() => get().syncToServer());
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
      name: "pokemon-collection-v4",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);

          // Fetch players from server after hydration
          state.fetchPlayersFromServer();

          // Sync items/favorites with active player's data
          if (state.activePlayerId && state.playerData[state.activePlayerId]) {
            const data = state.playerData[state.activePlayerId];
            state.items = data.items;
            state.favorites = data.favorites;
          }
        }
      },
      version: 4,
    }
  )
);

// ============ SELECTOR HOOKS ============

export const useHasHydrated = () => useCollectionStore((state) => state._hasHydrated);
export const useActivePlayer = () => useCollectionStore((state) => state.getActivePlayer());
export const useAllPlayers = () => useCollectionStore((state) => state.players);
export const useItems = () => useCollectionStore((state) => state.items);
export const useFavorites = () => useCollectionStore((state) => state.favorites);
