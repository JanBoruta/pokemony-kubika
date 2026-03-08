"use client";

import { useState, useEffect, useCallback } from "react";
import { PokemonCard, typeTranslations, rarityTranslations } from "@/types/pokemon";
import { useCollectionStore } from "@/store/collectionStore";
import { useTranslationCache } from "@/store/translationCache";
import { X, Plus, Check, Sparkles, Loader2, Zap, Heart } from "lucide-react";

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
  const { addCard, isInCollection, addFavorite, removeFavorite, isFavorite } = useCollectionStore();
  const translationCache = useTranslationCache();
  const inCollection = isInCollection(card.id);
  const inFavorites = isFavorite(card.id);

  const [translatedAttacks, setTranslatedAttacks] = useState<TranslatedAttack[]>([]);
  const [translatedAbilities, setTranslatedAbilities] = useState<TranslatedAbility[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const translateType = (type: string) => typeTranslations[type] || type;
  const translateRarity = (rarity: string) => rarityTranslations[rarity] || rarity;

  const isRare = card.rarity?.toLowerCase().includes("rare") || card.rarity?.toLowerCase().includes("holo");

  // Načíst překlady při změně karty - s cache
  useEffect(() => {
    let isMounted = true;

    const fetchTranslations = async () => {
      if (!card.attacks?.length && !card.abilities?.length) return;

      // Zkontroluj cache - přímý přístup ke store
      const cached = translationCache.getTranslation(card.id);
      if (cached) {
        if (isMounted) {
          setTranslatedAttacks(cached.attacks);
          setTranslatedAbilities(cached.abilities);
          setFromCache(true);
          setIsTranslating(false);
        }
        return;
      }

      if (isMounted) {
        setIsTranslating(true);
        setTranslationError(null);
        setFromCache(false);
      }

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ card }),
        });

        const data = await response.json();

        // Pokud máme error v odpovědi a není to fallback
        if (data.error && !data.attacks && !data.abilities) {
          throw new Error(data.error);
        }

        const attacks = data.attacks || [];
        const abilities = data.abilities || [];

        if (isMounted) {
          setTranslatedAttacks(attacks);
          setTranslatedAbilities(abilities);

          // Ulož do cache
          if (attacks.length > 0 || abilities.length > 0) {
            translationCache.setTranslation(card.id, attacks, abilities);
          }
        }
      } catch (error) {
        console.error("Translation error:", error);
        if (isMounted) {
          setTranslatedAttacks([]);
          setTranslatedAbilities([]);
        }
      } finally {
        if (isMounted) {
          setIsTranslating(false);
        }
      }
    };

    fetchTranslations();

    return () => {
      isMounted = false;
    };
  }, [card.id]); // Pouze card.id jako dependency

  const getImageUrl = () => {
    if (card.image) {
      return `${card.image}/high.webp`;
    }
    return "/placeholder-card.png";
  };

  return (
    <div className={`glass rounded-2xl p-6 relative ${isRare ? "glow-rare" : ""}`}>
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
            src={getImageUrl()}
            alt={card.name}
            className="w-full max-w-[300px] mx-auto rounded-xl shadow-2xl pokemon-card"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-card.png";
            }}
          />
        </div>

        {/* Detaily karty */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{card.name}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#FFCB05] font-semibold">
                {translateType(card.category)}
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

          {/* Stage / Evolution */}
          {card.stage && (
            <div className="text-gray-400 text-sm">
              {card.stage}
              {card.evolvesFrom && ` (vyvíjí se z ${card.evolvesFrom})`}
            </div>
          )}

          {/* Loading state */}
          {isTranslating && (
            <div className="flex items-center gap-2 text-[#FFCB05] py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Překládám do češtiny...</span>
            </div>
          )}

          {/* Cache indicator */}
          {fromCache && !isTranslating && translatedAttacks.length > 0 && (
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <Zap className="w-3 h-3" />
              <span>Překlad z cache (šetříme tokeny)</span>
            </div>
          )}

          {/* Translation error */}
          {translationError && (
            <div className="text-red-400 text-sm py-2">
              {translationError}
            </div>
          )}

          {/* Abilities - s českým překladem */}
          {card.abilities && card.abilities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#FFCB05]">Schopnosti</h3>
              {card.abilities.map((ability, index) => {
                const translated = translatedAbilities[index];
                return (
                  <div key={index} className="bg-[#3B4CCA]/20 rounded-lg p-3">
                    <div className="font-semibold text-white">
                      {translated?.czechName || ability.name}
                      {translated && translated.czechName !== ability.name && (
                        <span className="text-gray-500 text-sm ml-2">({ability.name})</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      {translated?.czechEffect || ability.effect}
                    </div>
                    {translated?.explanation && (
                      <div className="mt-2 p-2 bg-[#FFCB05]/10 rounded border-l-2 border-[#FFCB05]">
                        <div className="flex items-center gap-1 text-[#FFCB05] text-xs font-semibold mb-1">
                          <Sparkles className="w-3 h-3" />
                          AI Vysvětlení:
                        </div>
                        <div className="text-sm text-gray-200">{translated.explanation}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Attacks - s českým překladem */}
          {card.attacks && card.attacks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#FFCB05]">Útoky</h3>
              {card.attacks.map((attack, index) => {
                const translated = translatedAttacks[index];
                return (
                  <div key={index} className="bg-[#3B4CCA]/20 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-white">
                        {translated?.czechName || attack.name}
                        {translated && translated.czechName !== attack.name && (
                          <span className="text-gray-500 text-sm ml-2">({attack.name})</span>
                        )}
                      </div>
                      {attack.damage && (
                        <div className="text-[#FFCB05] font-bold">{attack.damage}</div>
                      )}
                    </div>
                    {attack.cost && attack.cost.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {attack.cost.map((cost, i) => (
                          <span
                            key={i}
                            className={`energy-symbol energy-${cost.toLowerCase()}`}
                            title={translateType(cost)}
                          />
                        ))}
                      </div>
                    )}
                    {(translated?.czechEffect || attack.effect) && (
                      <div className="text-sm text-gray-300 mt-2">
                        {translated?.czechEffect || attack.effect}
                      </div>
                    )}
                    {translated?.explanation && (
                      <div className="mt-2 p-2 bg-[#FFCB05]/10 rounded border-l-2 border-[#FFCB05]">
                        <div className="flex items-center gap-1 text-[#FFCB05] text-xs font-semibold mb-1">
                          <Sparkles className="w-3 h-3" />
                          AI Vysvětlení:
                        </div>
                        <div className="text-sm text-gray-200">{translated.explanation}</div>
                      </div>
                    )}
                  </div>
                );
              })}
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
            {card.retreat !== undefined && card.retreat > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Ústup</h4>
                <div className="flex gap-1">
                  {Array.from({ length: card.retreat }).map((_, i) => (
                    <span
                      key={i}
                      className="energy-symbol energy-colorless"
                      title="Bezbarvá energie"
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
                <span className="font-semibold">Číslo:</span> {card.localId}
                {card.set.cardCount && `/${card.set.cardCount.official}`}
              </div>
              {card.rarity && (
                <div>
                  <span className="font-semibold">Vzácnost:</span>{" "}
                  <span className="text-[#FFCB05]">{translateRarity(card.rarity)}</span>
                </div>
              )}
              {card.illustrator && (
                <div>
                  <span className="font-semibold">Umělec:</span> {card.illustrator}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {card.description && (
            <div className="italic text-gray-400 text-sm border-l-2 border-[#FFCB05] pl-4">
              {card.description}
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
            <button
              onClick={() => inFavorites ? removeFavorite(card.id) : addFavorite(card)}
              className={`pokemon-btn flex items-center gap-2 ${
                inFavorites
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
            >
              <Heart className={`w-4 h-4 ${inFavorites ? "fill-current" : ""}`} />
              {inFavorites ? "V oblíbených" : "Přidat do oblíbených"}
            </button>
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
