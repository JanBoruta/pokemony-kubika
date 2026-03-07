"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { PokemonCard, typeTranslations } from "@/types/pokemon";
import { searchCards } from "@/lib/pokemon-api";

interface SearchInputProps {
  onSelectCard: (card: PokemonCard) => void;
  placeholder?: string;
}

export default function SearchInput({
  onSelectCard,
  placeholder = "Hledej Pokémona nebo Trenéra...",
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PokemonCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const data = await searchCards(query, 1, 5);
          setResults(data.data || []);
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
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#FFCB05] w-6 h-6" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-14 pr-12 py-4 text-lg rounded-2xl bg-[#1a1a2e]/80 border-2 border-[#3B4CCA] focus:border-[#FFCB05] text-white placeholder-gray-400 transition-all"
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
          className="absolute z-50 w-full mt-2 autocomplete-dropdown"
        >
          {results.map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleSelectCard(card)}
              className={`autocomplete-item flex items-center gap-4 ${
                index === selectedIndex ? "bg-[#3B4CCA]/50" : ""
              }`}
            >
              <img
                src={getImageUrl(card)}
                alt={card.name}
                className="w-12 h-16 object-contain rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder-card.png";
                }}
              />
              <div className="flex-1">
                <div className="font-semibold text-white">{card.name}</div>
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <span>{typeTranslations[card.category] || card.category}</span>
                  {card.hp && <span>• {card.hp} HP</span>}
                  {card.types && card.types[0] && (
                    <span className={`type-badge type-${card.types[0]?.toLowerCase()}`}>
                      {typeTranslations[card.types[0]] || card.types[0]}
                    </span>
                  )}
                </div>
              </div>
              {card.rarity && (
                <span className="text-xs text-[#FFCB05]">{card.rarity}</span>
              )}
            </div>
          ))}
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
