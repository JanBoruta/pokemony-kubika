"use client";

import { useState, useEffect } from "react";
import { PokemonCard } from "@/types/pokemon";
import { useCollectionStore } from "@/store/collectionStore";
import { searchCards } from "@/lib/pokemon-api";
import { Sparkles, RefreshCw, Plus, Check, Heart } from "lucide-react";

interface RecommendationsProps {
  onSelectCard: (card: PokemonCard) => void;
}

// Funkce pro určení úrovně vzácnosti
const getRarityLevel = (rarity?: string): "common" | "uncommon" | "rare" | "ultra" | "secret" => {
  if (!rarity) return "common";
  const r = rarity.toLowerCase();
  if (r.includes("secret") || r.includes("special art") || r.includes("hyper") || r.includes("gold")) return "secret";
  if (r.includes("ultra") || r.includes("full art") || r.includes("alt") || r.includes("illustration") ||
      r.includes("vmax") || r.includes("vstar") || r.includes("v ") || r.includes(" v")) return "ultra";
  if (r.includes("rare") || r.includes("holo") || r.includes(" ex") || r.includes("ex ") || r.includes("-ex")) return "rare";
  if (r.includes("uncommon")) return "uncommon";
  return "common";
};

export default function Recommendations({ onSelectCard }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<PokemonCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reason, setReason] = useState<string>("");
  const { items, addCard, isInCollection, addFavorite, removeFavorite, isFavorite } = useCollectionStore();

  useEffect(() => {
    generateRecommendations();
  }, [items.length]);

  const generateRecommendations = async () => {
    setIsLoading(true);

    try {
      if (items.length === 0) {
        // Pokud nemá sbírku, ukáž populární karty
        const popular = await searchCards("ex", 1, 6);
        setRecommendations(popular.data || []);
        setReason("Populární karty pro začátek tvé sbírky");
        return;
      }

      // Analyzuj sbírku
      const collectionCards = items.map(i => i.card);

      // Najdi nejčastější typy
      const typeCounts: Record<string, number> = {};
      collectionCards.forEach(card => {
        card.types?.forEach(type => {
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
      });

      const favoriteType = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      // Najdi karty s evolvesFrom - potenciální evoluce
      const evolutionNames = collectionCards
        .filter(c => c.evolvesFrom)
        .map(c => c.evolvesFrom)
        .filter((name): name is string => !!name);

      // Najdi základní formy pro vysoké stage karty
      const stage2Cards = collectionCards.filter(c =>
        c.stage?.toLowerCase().includes("stage 2") ||
        c.stage?.toLowerCase().includes("vmax") ||
        c.stage?.toLowerCase().includes("vstar")
      );

      let searchQuery = "";
      let reasonText = "";

      // Strategie doporučení
      const strategy = Math.floor(Math.random() * 3);

      if (strategy === 0 && evolutionNames.length > 0) {
        // Doporuč základní formy pro evoluce
        const randomEvolution = evolutionNames[Math.floor(Math.random() * evolutionNames.length)];
        searchQuery = randomEvolution;
        reasonText = `Základní formy pro tvé evoluce (${randomEvolution})`;
      } else if (strategy === 1 && stage2Cards.length > 0) {
        // Doporuč nižší stage
        const randomStage2 = stage2Cards[Math.floor(Math.random() * stage2Cards.length)];
        if (randomStage2.evolvesFrom) {
          searchQuery = randomStage2.evolvesFrom;
          reasonText = `Pro evoluci do ${randomStage2.name}`;
        } else {
          searchQuery = randomStage2.name.split(" ")[0]; // První slovo jména
          reasonText = `Další verze ${randomStage2.name.split(" ")[0]}`;
        }
      } else if (favoriteType) {
        // Doporuč karty oblíbeného typu
        searchQuery = favoriteType;
        reasonText = `${favoriteType} typ - tvůj oblíbený!`;
      } else {
        // Fallback na populární karty
        searchQuery = "ex";
        reasonText = "Silné ex karty";
      }

      const results = await searchCards(searchQuery, 1, 12);
      let cards = results.data || [];

      // Filtruj karty které už má ve sbírce
      cards = cards.filter(c => !isInCollection(c.id));

      // Omez na 6 karet
      cards = cards.slice(0, 6);

      if (cards.length === 0) {
        // Fallback
        const fallback = await searchCards("Pokemon", 1, 6);
        cards = (fallback.data || []).filter(c => !isInCollection(c.id)).slice(0, 6);
        reasonText = "Další karty k objevení";
      }

      setRecommendations(cards);
      setReason(reasonText);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      setRecommendations([]);
      setReason("Nepodařilo se načíst doporučení");
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (card: PokemonCard) => {
    if (card.image) {
      return `${card.image}/low.webp`;
    }
    return "/placeholder-card.png";
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#FFCB05]" />
          Mohlo by se ti líbit
        </h2>
        <button
          onClick={generateRecommendations}
          disabled={isLoading}
          className="p-2 rounded-full bg-[#3B4CCA]/50 hover:bg-[#3B4CCA] transition-colors disabled:opacity-50"
          title="Nová doporučení"
        >
          <RefreshCw className={`w-5 h-5 text-white ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {reason && (
        <p className="text-[#FFCB05] text-sm mb-4 font-medium">{reason}</p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFCB05] border-t-transparent"></div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          Žádná doporučení k zobrazení.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommendations.map((card) => {
            const inCollection = isInCollection(card.id);
            const inFavorites = isFavorite(card.id);
            const rarityLevel = getRarityLevel(card.rarity);
            const rarityClasses = {
              common: "rarity-common",
              uncommon: "rarity-uncommon",
              rare: "rarity-rare",
              ultra: "rarity-ultra",
              secret: "rarity-secret",
            };
            return (
              <div
                key={card.id}
                className={`pokemon-card cursor-pointer rounded-xl overflow-hidden bg-[#1a1a2e] relative group ${rarityClasses[rarityLevel]}`}
              >
                <img
                  src={getImageUrl(card)}
                  alt={card.name}
                  className="w-full"
                  onClick={() => onSelectCard(card)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-card.png";
                  }}
                />
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addCard(card);
                    }}
                    className={`p-1.5 rounded-full transition-all ${
                      inCollection
                        ? "bg-green-500 text-white"
                        : "bg-[#3B4CCA] text-white hover:bg-[#FFCB05] hover:text-black"
                    }`}
                    title={inCollection ? "Ve sbírce" : "Přidat do sbírky"}
                  >
                    {inCollection ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      inFavorites ? removeFavorite(card.id) : addFavorite(card);
                    }}
                    className={`p-1.5 rounded-full transition-all ${
                      inFavorites
                        ? "bg-red-500 text-white"
                        : "bg-[#3B4CCA] text-white hover:bg-red-500"
                    }`}
                    title={inFavorites ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
                  >
                    <Heart className={`w-4 h-4 ${inFavorites ? "fill-current" : ""}`} />
                  </button>
                </div>
                <div className="p-2">
                  <div className="text-white font-semibold text-sm truncate">
                    {card.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs truncate">{card.set.name}</span>
                    {card.rarity && rarityLevel !== "common" && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        rarityLevel === "secret" ? "bg-pink-500/30 text-pink-300" :
                        rarityLevel === "ultra" ? "bg-yellow-500/30 text-yellow-300" :
                        rarityLevel === "rare" ? "bg-blue-500/30 text-blue-300" :
                        "bg-green-500/30 text-green-300"
                      }`}>
                        {rarityLevel === "secret" ? "✨" : rarityLevel === "ultra" ? "⭐" : rarityLevel === "rare" ? "💎" : "●"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
