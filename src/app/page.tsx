"use client";

import { useState, useEffect } from "react";
import { PokemonCard } from "@/types/pokemon";
import { getRandomCards } from "@/lib/pokemon-api";
import { useCollectionStore } from "@/store/collectionStore";
import SearchInput from "@/components/SearchInput";
import PokemonCardDisplay from "@/components/PokemonCardDisplay";
import CompareCards from "@/components/CompareCards";
import Collection from "@/components/Collection";
import AIAdvisor from "@/components/AIAdvisor";
import { Sparkles, ArrowLeftRight, BookOpen, Bot } from "lucide-react";

export default function Home() {
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [compareCards, setCompareCards] = useState<PokemonCard[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  const [featuredCards, setFeaturedCards] = useState<PokemonCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const collectionItems = useCollectionStore((state) => state.items);

  useEffect(() => {
    loadFeaturedCards();
  }, []);

  const loadFeaturedCards = async () => {
    try {
      setLoadError(null);
      const cards = await getRandomCards(6);
      setFeaturedCards(cards);
    } catch (error) {
      console.error("Error loading featured cards:", error);
      setLoadError("Nepodařilo se načíst karty. Zkus to znovu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCard = (card: PokemonCard) => {
    setSelectedCard(card);
  };

  const handleAddToCompare = (card: PokemonCard) => {
    if (compareCards.length >= 4) {
      alert("Můžeš porovnat maximálně 4 karty najednou!");
      return;
    }
    if (compareCards.find((c) => c.id === card.id)) {
      alert("Tato karta už je v porovnání!");
      return;
    }
    setCompareCards([...compareCards, card]);
  };

  const handleRemoveFromCompare = (cardId: string) => {
    setCompareCards(compareCards.filter((c) => c.id !== cardId));
  };

  const getImageUrl = (card: PokemonCard) => {
    if (card.image) {
      return `${card.image}/low.webp`;
    }
    return "/placeholder-card.png";
  };

  return (
    <main className="min-h-screen">
      {/* Header - Indigo League styl */}
      <header className="py-8 px-4 relative overflow-hidden">
        {/* Pikachu ilustrace */}
        <div className="absolute -left-8 md:left-8 top-1/2 -translate-y-1/2 opacity-20 md:opacity-40 pointer-events-none">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
            alt="Pikachu"
            className="w-32 md:w-48 h-auto drop-shadow-2xl animate-bounce"
            style={{ animationDuration: '3s' }}
          />
        </div>
        <div className="absolute -right-8 md:right-8 top-1/2 -translate-y-1/2 opacity-20 md:opacity-40 pointer-events-none">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
            alt="Charizard"
            className="w-32 md:w-48 h-auto drop-shadow-2xl"
            style={{ transform: 'scaleX(-1)' }}
          />
        </div>
        <div className="container mx-auto text-center relative z-10">
          {/* Pokéball dekorace nad logem */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-red-500 to-red-700 border-4 border-gray-700 relative">
              <div className="absolute inset-x-0 top-1/2 h-1 bg-gray-700 -translate-y-1/2"></div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-700"></div>
            </div>
          </div>
          <h1 className="pokemon-logo text-4xl md:text-6xl font-bold mb-2">
            Pokémony Kubíka
          </h1>
          <p className="text-gray-300 text-lg font-medium">
            Hledej, porovnávej a objevuj svět Pokémon karet
          </p>
          <p className="text-yellow-500 text-sm mt-2 font-semibold tracking-wider">
            ⚡ INDIGO LEAGUE EDICE ⚡
          </p>
        </div>
      </header>

      {/* Search Section */}
      <section className="px-4 mb-8">
        <div className="container mx-auto">
          <SearchInput onSelectCard={handleSelectCard} />
        </div>
      </section>

      {/* Action Buttons */}
      <section className="px-4 mb-8">
        <div className="container mx-auto flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => setShowCompare(true)}
            disabled={compareCards.length === 0}
            className={`pokemon-btn flex items-center gap-2 ${
              compareCards.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ArrowLeftRight className="w-5 h-5" />
            Porovnat karty ({compareCards.length})
          </button>
          <button
            onClick={() => setShowCollection(true)}
            className="pokemon-btn-yellow pokemon-btn flex items-center gap-2"
          >
            <BookOpen className="w-5 h-5" />
            Moje sbírka ({collectionItems.length})
          </button>
          <button
            onClick={() => setShowAIAdvisor(true)}
            className="pokemon-btn-red pokemon-btn flex items-center gap-2"
          >
            <Bot className="w-5 h-5" />
            AI Rádce
          </button>
        </div>
      </section>

      {/* Selected Card Display */}
      {selectedCard && (
        <section className="px-4 mb-8">
          <div className="container mx-auto max-w-4xl relative">
            <PokemonCardDisplay
              card={selectedCard}
              onClose={() => setSelectedCard(null)}
              onCompare={handleAddToCompare}
            />
          </div>
        </section>
      )}

      {/* Featured Cards */}
      <section className="px-4 py-8">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#FFCB05]" />
            Nejnovější karty
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FFCB05] border-t-transparent"></div>
            </div>
          ) : loadError ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{loadError}</p>
              <button
                onClick={loadFeaturedCards}
                className="pokemon-btn"
              >
                Zkusit znovu
              </button>
            </div>
          ) : featuredCards.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Žádné karty k zobrazení. Zkus vyhledat pomocí pole výše.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleSelectCard(card)}
                  className="pokemon-card cursor-pointer rounded-xl overflow-hidden bg-[#1a1a2e] border-2 border-transparent hover:border-[#FFCB05]"
                >
                  <img
                    src={getImageUrl(card)}
                    alt={card.name}
                    className="w-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-card.png";
                    }}
                  />
                  <div className="p-2">
                    <div className="text-white font-semibold text-sm truncate">
                      {card.name}
                    </div>
                    <div className="text-gray-400 text-xs">{card.set.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Compare Indicator */}
      {compareCards.length > 0 && !showCompare && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setShowCompare(true)}
            className="pokemon-btn-yellow pokemon-btn flex items-center gap-2 shadow-2xl"
          >
            <ArrowLeftRight className="w-5 h-5" />
            <span className="hidden sm:inline">Porovnat</span>
            <span className="bg-[#3B4CCA] text-white px-2 py-0.5 rounded-full text-sm">
              {compareCards.length}
            </span>
          </button>
        </div>
      )}

      {/* Compare Modal */}
      {showCompare && (
        <CompareCards
          cards={compareCards}
          onRemoveCard={handleRemoveFromCompare}
          onClose={() => setShowCompare(false)}
        />
      )}

      {/* Collection Modal */}
      {showCollection && (
        <Collection
          onClose={() => setShowCollection(false)}
          onSelectCard={(card) => {
            setSelectedCard(card);
            setShowCollection(false);
          }}
        />
      )}

      {/* AI Advisor Modal */}
      {showAIAdvisor && (
        <AIAdvisor
          card={selectedCard}
          onClose={() => setShowAIAdvisor(false)}
        />
      )}

      {/* Footer */}
      <footer className="py-8 px-4 mt-8 border-t border-white/10">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <p>Data poskytuje TCGdex API</p>
          <p className="mt-1">
            Pokémon a všechny související názvy jsou ochranné známky Nintendo,
            Creatures Inc. a GAME FREAK inc.
          </p>
        </div>
      </footer>
    </main>
  );
}
