"use client";

import { PokemonCard, typeTranslations } from "@/types/pokemon";
import { useCollectionStore } from "@/store/collectionStore";
import { Heart, X, Trash2 } from "lucide-react";

interface FavoritesProps {
  onClose: () => void;
  onSelectCard: (card: PokemonCard) => void;
}

export default function Favorites({ onClose, onSelectCard }: FavoritesProps) {
  const { favorites, removeFavorite, clearFavorites } = useCollectionStore();

  const getImageUrl = (card: PokemonCard) => {
    if (card.image) {
      return `${card.image}/low.webp`;
    }
    return "/placeholder-card.png";
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" />
            Oblíbené karty ({favorites.length})
          </h2>
          <div className="flex items-center gap-2">
            {favorites.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Opravdu chceš smazat všechny oblíbené karty?")) {
                    clearFavorites();
                  }
                }}
                className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Smazat vše
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Zatím nemáš žádné oblíbené karty
            </h3>
            <p className="text-gray-500">
              Přidej karty do oblíbených kliknutím na srdíčko v AI Chatu
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favorites.map((item) => (
              <div
                key={item.id}
                className="relative group"
              >
                <div
                  onClick={() => onSelectCard(item.card)}
                  className="cursor-pointer rounded-xl overflow-hidden bg-[#1a1a2e] border-2 border-transparent hover:border-[#FFCB05] transition-all"
                >
                  <img
                    src={getImageUrl(item.card)}
                    alt={item.card.name}
                    className="w-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-card.png";
                    }}
                  />
                  <div className="p-2">
                    <div className="text-white font-semibold text-sm truncate">
                      {item.card.name}
                    </div>
                    <div className="text-gray-400 text-xs truncate">
                      {item.card.set.name}
                    </div>
                    {item.card.types && item.card.types.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {item.card.types.map((type) => (
                          <span
                            key={type}
                            className={`type-badge type-${type.toLowerCase()} text-xs`}
                          >
                            {typeTranslations[type] || type}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFavorite(item.card.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                  title="Odebrat z oblíbených"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
