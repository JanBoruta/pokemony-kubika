"use client";

import { PokemonCard, typeTranslations, rarityTranslations } from "@/types/pokemon";
import { useCollectionStore } from "@/store/collectionStore";
import { X, Plus, Check } from "lucide-react";

interface PokemonCardDisplayProps {
  card: PokemonCard;
  onClose?: () => void;
  onCompare?: (card: PokemonCard) => void;
  showCompareButton?: boolean;
  showCollectionButton?: boolean;
}

export default function PokemonCardDisplay({
  card,
  onClose,
  onCompare,
  showCompareButton = true,
  showCollectionButton = true,
}: PokemonCardDisplayProps) {
  const { addCard, isInCollection } = useCollectionStore();
  const inCollection = isInCollection(card.id);

  const translateType = (type: string) => typeTranslations[type] || type;
  const translateRarity = (rarity: string) => rarityTranslations[rarity] || rarity;

  const isRare = card.rarity?.includes("Rare") || card.rarity?.includes("Holo");

  return (
    <div className={`glass rounded-2xl p-6 ${isRare ? "glow-rare" : ""}`}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Obrázek karty */}
        <div className="flex-shrink-0">
          <img
            src={card.images.large}
            alt={card.name}
            className="w-full max-w-[300px] mx-auto rounded-xl shadow-2xl pokemon-card"
          />
        </div>

        {/* Detaily karty */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{card.name}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#FFCB05] font-semibold">
                {translateType(card.supertype)}
              </span>
              {card.hp && (
                <span className="text-white bg-red-500/80 px-3 py-1 rounded-full text-sm font-bold">
                  {card.hp} HP
                </span>
              )}
              {card.types?.map((type) => (
                <span
                  key={type}
                  className={`type-badge type-${type.toLowerCase()}`}
                >
                  {translateType(type)}
                </span>
              ))}
            </div>
          </div>

          {/* Abilities */}
          {card.abilities && card.abilities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#FFCB05]">Schopnosti</h3>
              {card.abilities.map((ability, index) => (
                <div key={index} className="bg-[#3B4CCA]/20 rounded-lg p-3">
                  <div className="font-semibold text-white">{ability.name}</div>
                  <div className="text-sm text-gray-300">{ability.text}</div>
                </div>
              ))}
            </div>
          )}

          {/* Attacks */}
          {card.attacks && card.attacks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#FFCB05]">Útoky</h3>
              {card.attacks.map((attack, index) => (
                <div key={index} className="bg-[#3B4CCA]/20 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-white">{attack.name}</div>
                    {attack.damage && (
                      <div className="text-[#FFCB05] font-bold">{attack.damage}</div>
                    )}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {attack.cost.map((cost, i) => (
                      <span
                        key={i}
                        className={`w-5 h-5 rounded-full type-${cost.toLowerCase()} inline-flex items-center justify-center text-xs`}
                      />
                    ))}
                  </div>
                  {attack.text && (
                    <div className="text-sm text-gray-300 mt-2">{attack.text}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Weaknesses & Resistances */}
          <div className="flex flex-wrap gap-4">
            {card.weaknesses && card.weaknesses.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Slabost</h4>
                <div className="flex gap-2">
                  {card.weaknesses.map((w, i) => (
                    <span key={i} className={`type-badge type-${w.type.toLowerCase()}`}>
                      {translateType(w.type)} {w.value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {card.resistances && card.resistances.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Odolnost</h4>
                <div className="flex gap-2">
                  {card.resistances.map((r, i) => (
                    <span key={i} className={`type-badge type-${r.type.toLowerCase()}`}>
                      {translateType(r.type)} {r.value}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {card.retreatCost && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Ústup</h4>
                <div className="flex gap-1">
                  {card.retreatCost.map((cost, i) => (
                    <span
                      key={i}
                      className={`w-5 h-5 rounded-full type-${cost.toLowerCase()}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Set & Rarity Info */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <div>
                <span className="font-semibold">Set:</span> {card.set.name}
              </div>
              <div>
                <span className="font-semibold">Číslo:</span> {card.number}/{card.set.printedTotal}
              </div>
              {card.rarity && (
                <div>
                  <span className="font-semibold">Vzácnost:</span>{" "}
                  <span className="text-[#FFCB05]">{translateRarity(card.rarity)}</span>
                </div>
              )}
              {card.artist && (
                <div>
                  <span className="font-semibold">Umělec:</span> {card.artist}
                </div>
              )}
            </div>
          </div>

          {/* Flavor Text */}
          {card.flavorText && (
            <div className="italic text-gray-400 text-sm border-l-2 border-[#FFCB05] pl-4">
              {card.flavorText}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            {showCollectionButton && (
              <button
                onClick={() => addCard(card)}
                className={`pokemon-btn flex items-center gap-2 ${
                  inCollection ? "bg-green-600 hover:bg-green-700" : ""
                }`}
              >
                {inCollection ? (
                  <>
                    <Check className="w-4 h-4" />
                    Ve sbírce
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Přidat do sbírky
                  </>
                )}
              </button>
            )}
            {showCompareButton && onCompare && (
              <button
                onClick={() => onCompare(card)}
                className="pokemon-btn-yellow pokemon-btn"
              >
                Přidat k porovnání
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
