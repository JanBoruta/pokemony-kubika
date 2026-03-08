"use client";

import { useState } from "react";
import { useCollectionStore, useIsLoggedIn } from "@/store/collectionStore";
import { User, Plus, Lock, X, LogOut } from "lucide-react";

export default function PlayerSelectionOverlay() {
  const isLoggedIn = useIsLoggedIn();
  const hasHydrated = useCollectionStore((state) => state.hasHydrated);
  const players = useCollectionStore((state) => state.players);
  const activePlayerId = useCollectionStore((state) => state.activePlayerId);
  const loginPlayer = useCollectionStore((state) => state.loginPlayer);
  const addPlayer = useCollectionStore((state) => state.addPlayer);
  const logout = useCollectionStore((state) => state.logout);
  const getActivePlayer = useCollectionStore((state) => state.getActivePlayer);

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerPin, setNewPlayerPin] = useState("");
  const [addError, setAddError] = useState("");

  // Nepokažuj nic dokud se store nehydratuje
  if (!hasHydrated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-white text-xl">Načítání...</div>
      </div>
    );
  }

  // Pokud je přihlášen, ukaž malý indikátor hráče
  if (isLoggedIn) {
    const activePlayer = getActivePlayer();
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="flex items-center gap-2 bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-700">
          <User className="w-4 h-4 text-yellow-400" />
          <span className="text-white font-medium">{activePlayer?.name}</span>
          <button
            onClick={logout}
            className="ml-2 p-1 hover:bg-gray-700 rounded-full transition-colors"
            title="Odhlásit se"
          >
            <LogOut className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        </div>
      </div>
    );
  }

  const handleSelectPlayer = (playerId: string) => {
    setSelectedPlayerId(playerId);
    setPin("");
    setError("");
  };

  const handleLogin = () => {
    if (!selectedPlayerId) return;

    const success = loginPlayer(selectedPlayerId, pin);
    if (success) {
      setSelectedPlayerId(null);
      setPin("");
      setError("");
    } else {
      setError("Špatné heslo!");
      setPin("");
    }
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      setAddError("Zadej jméno hráče");
      return;
    }
    if (!newPlayerPin.trim() || newPlayerPin.length < 4) {
      setAddError("Heslo musí mít alespoň 4 znaky");
      return;
    }

    const playerId = addPlayer(newPlayerName.trim(), newPlayerPin);
    setShowAddPlayer(false);
    setNewPlayerName("");
    setNewPlayerPin("");
    setAddError("");

    // Automaticky vyber nově vytvořeného hráče
    setSelectedPlayerId(playerId);
  };

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-gray-600 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-red-500 to-red-600"></div>
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white"></div>
              <div className="absolute inset-x-0 top-1/2 h-1 bg-gray-600 -translate-y-1/2 z-10"></div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border-2 border-gray-600 z-20"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Pokémoni Kubíka</h2>
          <p className="text-gray-400">Vyber si svůj profil</p>
        </div>

        {/* Zadávání PINu pro vybraného hráče */}
        {selectedPlayerId && selectedPlayer && !showAddPlayer && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">{selectedPlayer.name}</h3>
              <p className="text-gray-400 text-sm mt-1">Zadej heslo pro přihlášení</p>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Heslo"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPlayerId(null)}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Zpět
              </button>
              <button
                onClick={handleLogin}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-semibold rounded-lg transition-all"
              >
                Přihlásit
              </button>
            </div>
          </div>
        )}

        {/* Přidání nového hráče */}
        {showAddPlayer && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Nový hráč</h3>
              <button
                onClick={() => {
                  setShowAddPlayer(false);
                  setAddError("");
                }}
                className="p-1 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Jméno</label>
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Zadej jméno"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Heslo (min. 4 znaky)</label>
              <input
                type="password"
                value={newPlayerPin}
                onChange={(e) => setNewPlayerPin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                placeholder="Zadej heslo"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
            </div>

            {addError && (
              <p className="text-red-400 text-sm">{addError}</p>
            )}

            <button
              onClick={handleAddPlayer}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold rounded-lg transition-all"
            >
              Vytvořit hráče
            </button>
          </div>
        )}

        {/* Seznam hráčů */}
        {!selectedPlayerId && !showAddPlayer && (
          <div className="space-y-3">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => handleSelectPlayer(player.id)}
                className="w-full flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-white font-semibold">{player.name}</div>
                  <div className="text-gray-500 text-sm">
                    {player.id === "kubik-default" ? "Výchozí hráč" : "Klikni pro přihlášení"}
                  </div>
                </div>
                <Lock className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </button>
            ))}

            {/* Přidat hráče */}
            <button
              onClick={() => setShowAddPlayer(true)}
              className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 border-2 border-dashed border-gray-700 hover:border-gray-600 rounded-xl transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-left">
                <div className="text-gray-300 font-medium">Přidat hráče</div>
                <div className="text-gray-500 text-sm">Vytvoř nový profil</div>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
