"use client";

import { useState } from "react";
import { PokemonCard, typeTranslations, rarityTranslations } from "@/types/pokemon";
import { useCollectionStore, useItems, CollectionItem } from "@/store/collectionStore";
import { X, Trash2, Plus, Minus, Edit3, Check, BookOpen, Filter, Heart } from "lucide-react";

interface CollectionProps {
  onClose: () => void;
  onSelectCard: (card: PokemonCard) => void;
}

export default function Collection({ onClose, onSelectCard }: CollectionProps) {
  const items = useItems();
  const { removeCard, updateQuantity, updateNotes, addFavorite, removeFavorite, isFavorite } = useCollectionStore();
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRarity, setFilterRarity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "rarity">("date");

  const translateType = (type: string) => typeTranslations[type] || type;
  const translateRarity = (rarity: string) => rarityTranslations[rarity] || rarity;

  const handleEditNotes = (item: CollectionItem) => {
    setEditingNotes(item.card.id);
    setTempNotes(item.notes || "");
  };

  const handleSaveNotes = (cardId: string) => {
    updateNotes(cardId, tempNotes);
    setEditingNotes(null);
    setTempNotes("");
  };

  const getUniqueTypes = () => {
    const types = new Set<string>();
    items.forEach((item) => {
      item.card.types?.forEach((type) => types.add(type));
    });
    return Array.from(types);
  };

  const getUniqueRarities = () => {
    const rarities = new Set<string>();
    items.forEach((item) => {
      if (item.card.rarity) rarities.add(item.card.rarity);
    });
    return Array.from(rarities).sort();
  };

  // Funkce pro určení úrovně vzácnosti (pro vizuální efekty)
  const getRarityLevel = (rarity?: string): "common" | "uncommon" | "rare" | "ultra" | "secret" => {
    if (!rarity) return "common";
    const r = rarity.toLowerCase();
    // Secret - nejcennější
    if (r.includes("secret") || r.includes("special art") || r.includes("hyper") || r.includes("gold")) return "secret";
    // Ultra - velmi vzácné (ex, V, VMAX, VSTAR, Full Art, Alt Art)
    if (r.includes("ultra") || r.includes("full art") || r.includes("alt") || r.includes("illustration") ||
        r.includes("vmax") || r.includes("vstar") || r.includes("v ") || r.includes(" v")) return "ultra";
    // Rare - vzácné (Rare Holo, Rare, ex karty)
    if (r.includes("rare") || r.includes("holo") || r.includes(" ex") || r.includes("ex ")) return "rare";
    // Uncommon
    if (r.includes("uncommon")) return "uncommon";
    return "common";
  };

  const filteredAndSortedItems = items
    .filter((item) => {
      const typeMatch = filterType === "all" || item.card.types?.includes(filterType);
      const rarityMatch = filterRarity === "all" || item.card.rarity === filterRarity;
      return typeMatch && rarityMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.card.name.localeCompare(b.card.name);
        case "rarity":
          return (a.card.rarity || "").localeCompare(b.card.rarity || "");
        case "date":
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });

  const totalCards = items.reduce((sum, item) => sum + item.quantity, 0);

  const getImageUrl = (card: PokemonCard) => {
    if (card.image) {
      return `${card.image}/low.webp`;
    }
    return "/placeholder-card.png";
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#FFCB05]" />
              Moje sbírka
            </h2>
            <span className="bg-[#3B4CCA] text-white px-3 py-1 rounded-full text-sm">
              {totalCards} {totalCards === 1 ? "karta" : totalCards < 5 ? "karty" : "karet"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Filters */}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#1a1a2e] border border-[#3B4CCA] rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="all">Všechny typy</option>
                {getUniqueTypes().map((type) => (
                  <option key={type} value={type}>
                    {translateType(type)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Vzácnost:</span>
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="bg-[#1a1a2e] border border-[#3B4CCA] rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="all">Všechny</option>
                {getUniqueRarities().map((rarity) => (
                  <option key={rarity} value={rarity}>
                    {translateRarity(rarity)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Řadit:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "date" | "rarity")}
                className="bg-[#1a1a2e] border border-[#3B4CCA] rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="date">Datum přidání</option>
                <option value="name">Název</option>
                <option value="rarity">Vzácnost</option>
              </select>
            </div>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Tvoje sbírka je prázdná
            </h3>
            <p className="text-gray-400">
              Najdi karty pomocí vyhledávání a přidej je do své sbírky
            </p>
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedItems.map((item) => {
            const rarityLevel = getRarityLevel(item.card.rarity);
            const rarityClasses = {
              common: "rarity-common",
              uncommon: "rarity-uncommon",
              rare: "rarity-rare",
              ultra: "rarity-ultra",
              secret: "rarity-secret",
            };
            return (
              <div
                key={item.id}
                className={`glass rounded-xl p-4 relative group ${rarityClasses[rarityLevel]}`}
              >
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 z-10">
                <button
                  onClick={() => isFavorite(item.card.id) ? removeFavorite(item.card.id) : addFavorite(item.card)}
                  className={`rounded-full p-1.5 transition-colors ${
                    isFavorite(item.card.id)
                      ? "bg-red-500 text-white"
                      : "bg-pink-600/80 hover:bg-pink-600 text-white"
                  }`}
                  title={isFavorite(item.card.id) ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
                >
                  <Heart className={`w-4 h-4 ${isFavorite(item.card.id) ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => removeCard(item.card.id)}
                  className="bg-red-500/80 hover:bg-red-500 rounded-full p-1.5 transition-colors"
                  title="Odebrat ze sbírky"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Card Image */}
              <div
                onClick={() => onSelectCard(item.card)}
                className="cursor-pointer"
              >
                <img
                  src={getImageUrl(item.card)}
                  alt={item.card.name}
                  className="w-full rounded-lg mb-3 pokemon-card"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-card.png";
                  }}
                />
              </div>

              {/* Card Info */}
              <div className="space-y-2">
                <h3 className="font-bold text-white truncate">{item.card.name}</h3>

                <div className="flex items-center gap-2 text-sm">
                  {item.card.types?.map((type) => (
                    <span
                      key={type}
                      className={`type-badge type-${type.toLowerCase()} text-xs`}
                    >
                      {translateType(type)}
                    </span>
                  ))}
                </div>

                {item.card.rarity && (
                  <div className={`rarity-badge rarity-badge-${rarityLevel}`}>
                    {rarityLevel === "secret" && <span className="mr-1">✨</span>}
                    {rarityLevel === "ultra" && <span className="mr-1">⭐</span>}
                    {translateRarity(item.card.rarity)}
                  </div>
                )}

                {/* Quantity Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-gray-400 text-sm">Počet:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.card.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-[#3B4CCA] hover:bg-[#4a5bd9] flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3 text-white" />
                    </button>
                    <span className="text-white font-bold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.card.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-[#3B4CCA] hover:bg-[#4a5bd9] flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="pt-2">
                  {editingNotes === item.card.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Poznámka..."
                        className="flex-1 text-sm px-2 py-1 rounded bg-[#1a1a2e] border border-[#3B4CCA] text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveNotes(item.card.id)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleEditNotes(item)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      {item.notes || "Přidat poznámku..."}
                    </div>
                  )}
                </div>

                {/* Added Date */}
                <div className="text-xs text-gray-500">
                  Přidáno: {new Date(item.addedAt).toLocaleDateString("cs-CZ")}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
