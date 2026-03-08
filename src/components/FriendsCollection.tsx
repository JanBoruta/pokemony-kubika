"use client";

import { useState } from "react";
import { PokemonCard } from "@/types/pokemon";
import { useCollectionStore, Player, PlayerData } from "@/store/collectionStore";
import { Users, X, ArrowLeft, Plus, Heart, BookOpen } from "lucide-react";

interface FriendsCollectionProps {
  onClose: () => void;
  onSelectCard: (card: PokemonCard) => void;
}

export default function FriendsCollection({ onClose, onSelectCard }: FriendsCollectionProps) {
  const { players, activePlayerId, getPlayerData, addCard, addFavorite, isInCollection, isFavorite } = useCollectionStore();
  const [selectedFriend, setSelectedFriend] = useState<Player | null>(null);
  const [friendData, setFriendData] = useState<PlayerData | null>(null);

  // Filter out current player
  const friends = players.filter((p) => p.id !== activePlayerId);

  const handleSelectFriend = (friend: Player) => {
    const data = getPlayerData(friend.id);
    setSelectedFriend(friend);
    setFriendData(data);
  };

  const handleBack = () => {
    setSelectedFriend(null);
    setFriendData(null);
  };

  const getImageUrl = (card: PokemonCard) => {
    if (card.image) {
      return `${card.image}/low.webp`;
    }
    return "/placeholder-card.png";
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          {selectedFriend ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: selectedFriend.avatarColor }}
              >
                {selectedFriend.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-white">
                Sbirka - {selectedFriend.name}
              </h2>
            </div>
          ) : (
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-[#FFCB05]" />
              Kamaradi
            </h2>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Friends List */}
        {!selectedFriend && (
          <>
            {friends.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  Zatim zadni kamaradi
                </h3>
                <p className="text-gray-500">
                  Kamaradi se objevi, az si vytori sve profily na tomto zarizeni.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {friends.map((friend) => {
                  const data = getPlayerData(friend.id);
                  return (
                    <button
                      key={friend.id}
                      onClick={() => handleSelectFriend(friend)}
                      className="p-4 rounded-xl bg-[#1a1a2e] hover:bg-[#3B4CCA] transition-all flex flex-col items-center gap-3 border-2 border-transparent hover:border-[#FFCB05]"
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                        style={{ backgroundColor: friend.avatarColor }}
                      >
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{friend.name}</span>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {data?.items.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {data?.favorites.length || 0}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Friend's Collection */}
        {selectedFriend && friendData && (
          <div>
            {/* Stats */}
            <div className="flex gap-4 mb-6">
              <div className="bg-[#1a1a2e] rounded-xl px-4 py-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#FFCB05]" />
                <span className="text-white font-medium">{friendData.items.length} karet</span>
              </div>
              <div className="bg-[#1a1a2e] rounded-xl px-4 py-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-white font-medium">{friendData.favorites.length} oblibenych</span>
              </div>
            </div>

            {/* Cards Grid */}
            {friendData.items.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                {selectedFriend.name} zatim nema zadne karty ve sbirce.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {friendData.items.map((item) => {
                  const inMyCollection = isInCollection(item.card.id);
                  const inMyFavorites = isFavorite(item.card.id);

                  return (
                    <div
                      key={item.id}
                      className="relative group"
                    >
                      <div
                        onClick={() => onSelectCard(item.card)}
                        className="cursor-pointer rounded-xl overflow-hidden bg-[#1a1a2e] border-2 border-transparent hover:border-[#FFCB05] transition-all"
                      >
                        <img
                          src={getImageUrl(item.card)}
                          alt={item.card.name}
                          className="w-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-card.png";
                          }}
                        />
                        <div className="p-2">
                          <div className="text-white font-semibold text-sm truncate">
                            {item.card.name}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-xs truncate">
                              {item.card.set.name}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[#FFCB05] text-xs font-bold">
                                x{item.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addCard(item.card);
                          }}
                          className={`p-1.5 rounded-full transition-all ${
                            inMyCollection
                              ? "bg-green-500 text-white"
                              : "bg-[#3B4CCA] text-white hover:bg-[#FFCB05] hover:text-black"
                          }`}
                          title={inMyCollection ? "Uz mas ve sbirce" : "Pridat do me sbirky"}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addFavorite(item.card);
                          }}
                          className={`p-1.5 rounded-full transition-all ${
                            inMyFavorites
                              ? "bg-red-500 text-white"
                              : "bg-[#3B4CCA] text-white hover:bg-red-500"
                          }`}
                          title={inMyFavorites ? "Uz mas v oblibenych" : "Pridat do oblibenych"}
                        >
                          <Heart className={`w-4 h-4 ${inMyFavorites ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
