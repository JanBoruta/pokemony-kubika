"use client";

import { PokemonCard, typeTranslations, rarityTranslations } from "@/types/pokemon";
import { X, ArrowLeftRight } from "lucide-react";

interface CompareCardsProps {
  cards: PokemonCard[];
  onRemoveCard: (cardId: string) => void;
  onClose: () => void;
}

export default function CompareCards({ cards, onRemoveCard, onClose }: CompareCardsProps) {
  const translateType = (type: string) => typeTranslations[type] || type;
  const translateRarity = (rarity: string) => rarityTranslations[rarity] || rarity;

  const getMaxHP = () => {
    const hps = cards.map((c) => c.hp || 0);
    return Math.max(...hps);
  };

  const maxHP = getMaxHP();

  const getImageUrl = (card: PokemonCard) => {
    if (card.image) {
      return `${card.image}/low.webp`;
    }
    return "/placeholder-card.png";
  };

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-[#FFCB05]" />
            Porovnání karet ({cards.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((card) => {
            const hp = card.hp || 0;
            const isHighestHP = hp === maxHP && maxHP > 0;

            return (
              <div
                key={card.id}
                className={`glass rounded-2xl p-4 relative ${
                  isHighestHP ? "ring-2 ring-[#FFCB05]" : ""
                }`}
              >
                <button
                  onClick={() => onRemoveCard(card.id)}
                  className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 rounded-full p-1 transition-colors z-10"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                {isHighestHP && (
                  <div className="absolute top-2 left-2 bg-[#FFCB05] text-black text-xs font-bold px-2 py-1 rounded-full">
                    Nejvíc HP
                  </div>
                )}

                <img
                  src={getImageUrl(card)}
                  alt={card.name}
                  className="w-full rounded-lg mb-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-card.png";
                  }}
                />

                <h3 className="text-xl font-bold text-white mb-2">{card.name}</h3>

                <div className="space-y-3 text-sm">
                  {/* HP */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">HP:</span>
                    <span
                      className={`font-bold ${
                        isHighestHP ? "text-[#FFCB05]" : "text-white"
                      }`}
                    >
                      {card.hp || "-"}
                    </span>
                  </div>

                  {/* Types */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Typ:</span>
                    <div className="flex gap-1">
                      {card.types?.map((type) => (
                        <span
                          key={type}
                          className={`type-badge type-${type.toLowerCase()} text-xs`}
                        >
                          {translateType(type)}
                        </span>
                      )) || <span className="text-white">-</span>}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Druh:</span>
                    <span className="text-white">{translateType(card.category)}</span>
                  </div>

                  {/* Attacks Count */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Počet útoků:</span>
                    <span className="text-white">{card.attacks?.length || 0}</span>
                  </div>

                  {/* Max Attack Damage */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Max. poškození:</span>
                    <span className="text-white">
                      {card.attacks
                        ? Math.max(
                            ...card.attacks.map((a) => {
                              const damage = typeof a.damage === "number"
                                ? a.damage
                                : parseInt(String(a.damage)) || 0;
                              return damage;
                            })
                          ) || "-"
                        : "-"}
                    </span>
                  </div>

                  {/* Weakness */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Slabost:</span>
                    <div className="flex gap-1">
                      {card.weaknesses?.map((w, i) => (
                        <span
                          key={i}
                          className={`type-badge type-${w.type.toLowerCase()} text-xs`}
                        >
                          {translateType(w.type)}
                        </span>
                      )) || <span className="text-white">-</span>}
                    </div>
                  </div>

                  {/* Retreat Cost */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Cena ústupu:</span>
                    <span className="text-white">{card.retreat || 0}</span>
                  </div>

                  {/* Rarity */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Vzácnost:</span>
                    <span className="text-[#FFCB05]">
                      {card.rarity ? translateRarity(card.rarity) : "-"}
                    </span>
                  </div>

                  {/* Set */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Set:</span>
                    <span className="text-white text-xs truncate max-w-[120px]">
                      {card.set.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {cards.length < 4 && (
          <div className="text-center mt-6 text-gray-400">
            Přidej další karty k porovnání pomocí vyhledávání
          </div>
        )}
      </div>
    </div>
  );
}
