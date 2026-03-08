"use client";

import { useState } from "react";
import { PokemonCard } from "@/types/pokemon";
import { useCollectionStore } from "@/store/collectionStore";
import HydrationGuard from "@/components/HydrationGuard";
import PlayerSelectionOverlay from "@/components/PlayerSelectionOverlay";
import SearchInput from "@/components/SearchInput";
import PokemonCardDisplay from "@/components/PokemonCardDisplay";
import CompareCards from "@/components/CompareCards";
import Collection from "@/components/Collection";
import AIAdvisor from "@/components/AIAdvisor";
import AIChat from "@/components/AIChat";
import Favorites from "@/components/Favorites";
import FriendsCollection from "@/components/FriendsCollection";
import Recommendations from "@/components/Recommendations";
import CardScanner from "@/components/CardScanner";
import { ArrowLeftRight, BookOpen, Heart, Download, Upload, Camera, Users, LogOut, User } from "lucide-react";

function AppContent() {
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [compareCards, setCompareCards] = useState<PokemonCard[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);

  const items = useCollectionStore((state) => state.items);
  const favorites = useCollectionStore((state) => state.favorites);
  const activePlayerId = useCollectionStore((state) => state.activePlayerId);
  const players = useCollectionStore((state) => state.players);
  const logoutPlayer = useCollectionStore((state) => state.logoutPlayer);
  const exportData = useCollectionStore((state) => state.exportData);
  const importData = useCollectionStore((state) => state.importData);

  const activePlayer = players.find((p) => p.id === activePlayerId);
  const hasFriends = players.length > 1;

  // Show player selection if no active player
  if (!activePlayerId) {
    return <PlayerSelectionOverlay />;
  }

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pokemon-sbirka-${activePlayer?.name || "export"}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const success = importData(content);
          if (success) {
            alert("Sbirka byla uspesne importovana!");
          } else {
            alert("Chyba pri importu. Zkontroluj format souboru.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSelectCard = (card: PokemonCard) => {
    setSelectedCard(card);
  };

  const handleAddToCompare = (card: PokemonCard) => {
    if (compareCards.length >= 4) {
      alert("Muzes porovnat maximalne 4 karty najednou!");
      return;
    }
    if (compareCards.find((c) => c.id === card.id)) {
      alert("Tato karta uz je v porovnani!");
      return;
    }
    setCompareCards([...compareCards, card]);
  };

  const handleRemoveFromCompare = (cardId: string) => {
    setCompareCards(compareCards.filter((c) => c.id !== cardId));
  };

  const handleOpenAIAdvisor = () => {
    setShowAIAdvisor(true);
  };

  return (
    <main className="min-h-screen">
      {/* Player Indicator */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowPlayerSelect(true)}
          className="flex items-center gap-2 bg-[#1a1a2e]/90 backdrop-blur-sm rounded-full px-3 py-2 border border-white/10 hover:border-[#FFCB05] transition-all"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: activePlayer?.avatarColor || "#FFCB05" }}
          >
            {activePlayer?.name.charAt(0).toUpperCase() || "?"}
          </div>
          <span className="text-white text-sm font-medium hidden sm:inline">
            {activePlayer?.name}
          </span>
        </button>
        <button
          onClick={logoutPlayer}
          className="p-2 bg-[#1a1a2e]/90 backdrop-blur-sm rounded-full border border-white/10 hover:border-red-500 hover:bg-red-500/20 transition-all"
          title="Odhlasit se"
        >
          <LogOut className="w-4 h-4 text-gray-400 hover:text-red-400" />
        </button>
      </div>

      {/* Header */}
      <header className="py-8 px-4 relative overflow-hidden">
        <div className="absolute -left-8 md:left-8 top-1/2 -translate-y-1/2 opacity-20 md:opacity-40 pointer-events-none">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
            alt="Pikachu"
            className="w-32 md:w-48 h-auto drop-shadow-2xl"
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
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full border-4 border-gray-700 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-red-500 to-red-600"></div>
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white"></div>
              <div className="absolute inset-x-0 top-1/2 h-1 bg-gray-700 -translate-y-1/2 z-10"></div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-700 z-20"></div>
            </div>
          </div>
          <h1 className="pokemon-logo text-4xl md:text-6xl font-bold mb-2">
            Pokemony Kubika
          </h1>
          <p className="text-gray-300 text-lg font-medium">
            Hledej, porovnavej a objevuj svet Pokemon karet
          </p>
          <p className="text-yellow-500 text-sm mt-2 font-semibold tracking-wider">
            INDIGO LEAGUE EDICE
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
            Moje sbirka ({items.length})
          </button>
          <button
            onClick={() => setShowFavorites(true)}
            className="pokemon-btn flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #e91e63, #c2185b)" }}
          >
            <Heart className="w-5 h-5" />
            Oblibene ({favorites.length})
          </button>
          {hasFriends && (
            <button
              onClick={() => setShowFriends(true)}
              className="pokemon-btn flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #9C27B0, #7B1FA2)" }}
            >
              <Users className="w-5 h-5" />
              Kamaradi
            </button>
          )}
          <button
            onClick={() => setShowScanner(true)}
            className="pokemon-btn flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >
            <Camera className="w-5 h-5" />
            Skenovat
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
              onOpenAIAdvisor={handleOpenAIAdvisor}
            />
          </div>
        </section>
      )}

      {/* Recommendations */}
      <section className="px-4 py-8">
        <div className="container mx-auto">
          <Recommendations onSelectCard={handleSelectCard} />
        </div>
      </section>

      {/* AI Chat Section */}
      <section className="px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <AIChat onSelectCard={handleSelectCard} />
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

      {/* Favorites Modal */}
      {showFavorites && (
        <Favorites
          onClose={() => setShowFavorites(false)}
          onSelectCard={(card) => {
            setSelectedCard(card);
            setShowFavorites(false);
          }}
        />
      )}

      {/* Friends Collection Modal */}
      {showFriends && (
        <FriendsCollection
          onClose={() => setShowFriends(false)}
          onSelectCard={(card) => {
            setSelectedCard(card);
            setShowFriends(false);
          }}
        />
      )}

      {/* Card Scanner Modal */}
      {showScanner && (
        <CardScanner
          onClose={() => setShowScanner(false)}
          onCardFound={(card) => {
            setSelectedCard(card);
            setShowScanner(false);
          }}
        />
      )}

      {/* Player Selection Modal (when clicking on player indicator) */}
      {showPlayerSelect && (
        <PlayerSelectionOverlay onClose={() => setShowPlayerSelect(false)} />
      )}

      {/* Footer */}
      <footer className="py-8 px-4 mt-8 border-t border-white/10">
        <div className="container mx-auto">
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
              title="Zalohovat sbirku"
            >
              <Download className="w-4 h-4" />
              Zaloha sbirky
            </button>
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-gray-300"
              title="Obnovit sbirku ze zalohy"
            >
              <Upload className="w-4 h-4" />
              Obnovit
            </button>
          </div>

          <div className="text-center text-gray-500 text-sm">
            <p>Data poskytuje TCGdex API</p>
            <p className="mt-1">
              Pokemon a vsechny souvisejici nazvy jsou ochranne znamky Nintendo,
              Creatures Inc. a GAME FREAK inc.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <HydrationGuard>
      <AppContent />
    </HydrationGuard>
  );
}
