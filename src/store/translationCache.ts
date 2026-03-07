import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TranslatedAttack {
  originalName: string;
  czechName: string;
  damage?: number | string;
  originalEffect?: string;
  czechEffect: string;
  explanation: string;
  cost?: string[];
}

interface TranslatedAbility {
  originalName: string;
  czechName: string;
  originalEffect: string;
  czechEffect: string;
  explanation: string;
}

interface CachedTranslation {
  cardId: string;
  attacks: TranslatedAttack[];
  abilities: TranslatedAbility[];
  cachedAt: string;
}

interface TranslationCacheState {
  translations: Record<string, CachedTranslation>;
  getTranslation: (cardId: string) => CachedTranslation | null;
  setTranslation: (cardId: string, attacks: TranslatedAttack[], abilities: TranslatedAbility[]) => void;
  hasTranslation: (cardId: string) => boolean;
  clearCache: () => void;
}

export const useTranslationCache = create<TranslationCacheState>()(
  persist(
    (set, get) => ({
      translations: {},

      getTranslation: (cardId: string) => {
        return get().translations[cardId] || null;
      },

      setTranslation: (cardId: string, attacks: TranslatedAttack[], abilities: TranslatedAbility[]) => {
        set((state) => ({
          translations: {
            ...state.translations,
            [cardId]: {
              cardId,
              attacks,
              abilities,
              cachedAt: new Date().toISOString(),
            },
          },
        }));
      },

      hasTranslation: (cardId: string) => {
        return !!get().translations[cardId];
      },

      clearCache: () => {
        set({ translations: {} });
      },
    }),
    {
      name: "pokemon-translation-cache",
    }
  )
);
