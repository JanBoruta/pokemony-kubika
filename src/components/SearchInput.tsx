"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus, Check, Heart } from "lucide-react";
import { PokemonCard, typeTranslations } from "@/types/pokemon";
import { searchCards } from "@/lib/pokemon-api";
import { useCollectionStore } from "@/store/collectionStore";

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

interface SearchInputProps {
  onSelectCard: (card: PokemonCard) => void;
  placeholder?: string;
}

export default function SearchInput({
  onSelectCard,
  placeholder = "Hledej Pokémona (např. Charizard 280)...",
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PokemonCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addCard, isInCollection, addFavorite, removeFavorite, isFavorite } = useCollectionStore();

  // Parsovat HP filtr z query (např. "Charizard 280", "Charizard HP280", nebo jen "280")
  const parseHPFilter = (q: string): { searchTerm: string; minHP: number | null } => {
    // Nejdřív zkus HP prefix
    const hpMatch = q.match(/HP\s*(\d+)/i);
    if (hpMatch) {
      const hp = parseInt(hpMatch[1], 10);
      const searchTerm = q.replace(/HP\s*\d+/i, "").trim();
      return { searchTerm: searchTerm || "Pokemon", minHP: hp };
    }

    // Pak zkus číslo na konci (např. "Charizard 280")
    const numberAtEnd = q.match(/^(.+?)\s+(\d{2,3})$/);
    if (numberAtEnd) {
      const hp = parseInt(numberAtEnd[2], 10);
      if (hp >= 10 && hp <= 999) { // Realistické HP rozmezí
        return { searchTerm: numberAtEnd[1].trim(), minHP: hp };
      }
    }

    // Jen číslo (např. "280")
    const justNumber = q.match(/^(\d{2,3})$/);
    if (justNumber) {
      const hp = parseInt(justNumber[1], 10);
      if (hp >= 10 && hp <= 999) {
        return { searchTerm: "Pokemon", minHP: hp };
      }
    }

    return { searchTerm: q, minHP: null };
  };

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const { searchTerm, minHP } = parseHPFilter(query);
          const data = await searchCards(searchTerm, 1, 30); // Načteme více výsledků pro filtrování
          let filteredResults = data.data || [];

          // Filtruj dle HP pokud je zadáno
          if (minHP !== null) {
            filteredResults = filteredResults.filter(card =>
              card.hp && card.hp >= minHP
            );
          }

          setResults(filteredResults.slice(0, 15)); // Omez na 15 výsledků
          setShowDropdown(true);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelectCard(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleSelectCard = (card: PokemonCard) => {
    onSelectCard(card);
    setQuery("");
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const clearInput = () => {
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const getImageUrl = (card: PokemonCard) => {
    if (card.image) {
      return `${card.image}/low.webp`;
    }
    return "/placeholder-card.png";
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-5 pr-12 py-4 text-lg rounded-2xl bg-[#1a1a2e]/80 border-2 border-[#3B4CCA] focus:border-[#FFCB05] text-white placeholder-gray-400 transition-all"
        />
        {query && (
          <button
            onClick={clearInput}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#FFCB05] border-t-transparent"></div>
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 autocomplete-dropdown overflow-y-auto"
          style={{ maxHeight: Math.min(results.length * 160 + 40, 500) }}
        >
          <div className="sticky top-0 bg-[#1E293B] px-4 py-2 text-xs text-gray-400 border-b border-red-500/30 z-10">
            Nalezeno {results.length} výsledků {results.length > 3 && "• Scrolluj pro více"}
          </div>
          {results.map((card, index) => {
            const inCollection = isInCollection(card.id);
            const inFavorites = isFavorite(card.id);
            const rarityLevel = getRarityLevel(card.rarity);
            const rarityClasses = {
              common: "",
              uncommon: "border-l-4 border-l-green-500",
              rare: "border-l-4 border-l-blue-500",
              ultra: "border-l-4 border-l-yellow-400",
              secret: "border-l-4 border-l-pink-500",
            };
            return (
              <div
                key={card.id}
                className={`autocomplete-item flex items-center gap-4 p-3 ${
                  index === selectedIndex ? "bg-[#3B4CCA]/50" : ""
                } ${rarityClasses[rarityLevel]}`}
              >
                <img
                  src={getImageUrl(card)}
                  alt={card.name}
                  className="w-24 h-32 object-contain rounded-lg shadow-lg border border-white/10 cursor-pointer hover:border-[#FFCB05] transition-colors"
                  onClick={() => handleSelectCard(card)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-card.png";
                  }}
                />
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleSelectCard(card)}>
                  <div className="font-bold text-white text-lg">{card.name}</div>
                  <div className="text-sm text-gray-400 flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[#FFCB05]">{typeTranslations[card.category] || card.category}</span>
                    {card.hp && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs font-bold">{card.hp} HP</span>}
                  </div>
                  {card.types && card.types.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {card.types.map((type) => (
                        <span key={type} className={`type-badge type-${type.toLowerCase()} text-xs`}>
                          {typeTranslations[type] || type}
                        </span>
                      ))}
                    </div>
                  )}
                  {card.set && (
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      Set: {card.set.name}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {card.rarity && (
                    <span className="text-xs text-[#FFCB05] font-semibold bg-[#FFCB05]/10 px-2 py-1 rounded">
                      {card.rarity}
                    </span>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addCard(card);
                      }}
                      className={`p-2 rounded-full transition-all ${
                        inCollection
                          ? "bg-green-500 text-white"
                          : "bg-[#3B4CCA] text-white hover:bg-[#FFCB05] hover:text-black"
                      }`}
                      title={inCollection ? "Ve sbírce" : "Přidat do sbírky"}
                    >
                      {inCollection ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        inFavorites ? removeFavorite(card.id) : addFavorite(card);
                      }}
                      className={`p-2 rounded-full transition-all ${
                        inFavorites
                          ? "bg-red-500 text-white"
                          : "bg-[#3B4CCA] text-white hover:bg-red-500"
                      }`}
                      title={inFavorites ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
                    >
                      <Heart className={`w-5 h-5 ${inFavorites ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showDropdown && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-2 autocomplete-dropdown p-4 text-center text-gray-400">
          Žádné výsledky pro &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}
