"use client";

import { useState } from "react";
import { PokemonCard, typeTranslations, rarityTranslations } from "@/types/pokemon";
import { useCollectionStore, CollectionItem, Player, PlayerData } from "@/store/collectionStore";
import { X, User, ArrowLeft, Plus, Heart, BookOpen, Filter } from "lucide-react";

interface FriendsCollectionProps {
  onClose: () => void;
  onSelectCard: (card: PokemonCard) => void;
}

export default function FriendsCollection({ onClose, onSelectCard }: FriendsCollectionProps) {
  const players = useCollectionStore((state) => state?.players ?? []);
  const activePlayerId = useCollectionStore((state) => state?.activePlayerId ?? null);
  const dataByPlayerId = useCollectionStore((state) => state?.dataByPlayerId ?? {});
  const { addCard, isInCollection, addFavorite, isFavorite } = useCollectionStore();

  const [selectedFriend, setSelectedFriend] = useState<Player | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRarity, setFilterRarity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "rarity">("date");

  const translateType = (type: string) => typeTranslations[type] || type;
  const translateRarity = (rarity: string) => rarityTranslations[rarity] || rarity;

  // Kamarádi = všichni hráči kromě aktuálního
  const friends = players.filter((p) => p.id !== activePlayerId);

  // Data vybraného kamaráda
  const friendData: PlayerData | null = selectedFriend
    ? dataByPlayerId[selectedFriend.id] ?? null
    : null;

  const friendItems = friendData?.items ?? [];

  // Získání unikátních typů a vzácností ze sbírky kamaráda
  const uniqueTypes = [...new Set(friendItems.flatMap((item) => item.card.types || []))];
  const uniqueRarities = [...new Set(friendItems.map((item) => item.card.rarity).filter(Boolean))];

  // Filtrování a řazení
  const filteredItems = friendItems
    .filter((item) => {
      if (filterType !== "all" && !item.card.types?.includes(filterType)) return false;
      if (filterRarity !== "all" && item.card.rarity !== filterRarity) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.card.name.localeCompare(b.card.name);
      if (sortBy === "date") return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      if (sortBy === "rarity") {
        const rarityOrder: Record<string, number> = {
          Common: 1,
          Uncommon: 2,
          Rare: 3,
          "Rare Holo": 4,
          "Ultra Rare": 5,
        };
        return (rarityOrder[b.card.rarity || ""] || 0) - (rarityOrder[a.card.rarity || ""] || 0);
      }
      return 0;
    });

  const getImageUrl = (card: PokemonCard) => {
    if (card.image) {
      return `${card.image}/low.webp`;
    }
    return "/placeholder-card.png";
  };

  const handleAddToMyCollection = (card: PokemonCard, e: React.MouseEvent) => {
    e.stopPropagation();
    addCard(card);
  };

  const handleAddToMyFavorites = (card: PokemonCard, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFavorite(card.id)) {
      addFavorite(card);
    }
  };

  // Zobrazení výběru kamaráda
  if (!selectedFriend) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden border border-gray-700 shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <User className="w-7 h-7 text-purple-400" />
                Kamarádi
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-400 mt-2">Vyber kamaráda pro zobrazení jeho sbírky</p>
          </div>

          {/* Seznam kamarádů */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {friends.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">Zatím nemáš žádné kamarády</p>
                <p className="text-gray-500 text-sm mt-2">
                  Kamarádi se přidávají na přihlašovací obrazovce
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => {
                  const friendCollection = dataByPlayerId[friend.id]?.items ?? [];
                  return (
                    <button
                      key={friend.id}
                      onClick={() => setSelectedFriend(friend)}
                      className="w-full flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="text-white font-semibold">{friend.name}</div>
                        <div className="text-gray-500 text-sm">
                          {friendCollection.length} karet ve sbírce
                        </div>
                      </div>
                      <BookOpen className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Zobrazení sbírky kamaráda
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedFriend(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                Sbírka: {selectedFriend.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filtry */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700"
              >
                <option value="all">Všechny typy</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {translateType(type)}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700"
            >
              <option value="all">Všechny vzácnosti</option>
              {uniqueRarities.map((rarity) => (
                <option key={rarity} value={rarity}>
                  {translateRarity(rarity!)}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "date" | "rarity")}
              className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700"
            >
              <option value="date">Nejnovější</option>
              <option value="name">Podle jména</option>
              <option value="rarity">Podle vzácnosti</option>
            </select>
          </div>
        </div>

        {/* Obsah */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">
                {friendItems.length === 0
                  ? `${selectedFriend.name} ještě nemá žádné karty`
                  : "Žádné karty neodpovídají filtrům"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredItems.map((item) => {
                const inMyCollection = isInCollection(item.card.id);
                const inMyFavorites = isFavorite(item.card.id);

                return (
                  <div
                    key={item.id}
                    className="glass rounded-xl p-3 cursor-pointer hover:scale-105 transition-transform group relative"
                    onClick={() => onSelectCard(item.card)}
                  >
                    {/* Obrázek */}
                    <div className="relative">
                      <img
                        src={getImageUrl(item.card)}
                        alt={item.card.name}
                        className="w-full rounded-lg shadow-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-card.png";
                        }}
                      />
                      {/* Počet kusů */}
                      {item.quantity > 1 && (
                        <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {item.quantity}x
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="mt-2">
                      <h4 className="text-white font-semibold text-sm truncate">
                        {item.card.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1">
                        {item.card.types?.map((type) => (
                          <span
                            key={type}
                            className={`type-badge type-${type.toLowerCase()} text-xs`}
                          >
                            {translateType(type)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Akce při hoveru */}
                    <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      <button
                        onClick={(e) => handleAddToMyCollection(item.card, e)}
                        className={`w-full py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                          inMyCollection
                            ? "bg-green-600 text-white"
                            : "bg-yellow-500 hover:bg-yellow-400 text-black"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        {inMyCollection ? "Ve sbírce" : "Do sbírky"}
                      </button>
                      <button
                        onClick={(e) => handleAddToMyFavorites(item.card, e)}
                        className={`w-full py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                          inMyFavorites
                            ? "bg-red-500 text-white"
                            : "bg-pink-600 hover:bg-pink-500 text-white"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${inMyFavorites ? "fill-current" : ""}`} />
                        {inMyFavorites ? "V oblíbených" : "Oblíbit"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="text-center text-gray-400 text-sm">
            Zobrazeno {filteredItems.length} z {friendItems.length} karet
          </div>
        </div>
      </div>
    </div>
  );
}
