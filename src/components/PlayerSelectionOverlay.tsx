"use client";

import { useState } from "react";
import { useCollectionStore, Player } from "@/store/collectionStore";
import { User, Plus, Lock, LogIn, X } from "lucide-react";

interface PlayerSelectionOverlayProps {
  onClose?: () => void;
}

export default function PlayerSelectionOverlay({ onClose }: PlayerSelectionOverlayProps) {
  const { players, createPlayer, loginPlayer, activePlayerId } = useCollectionStore();

  const [mode, setMode] = useState<"select" | "create" | "login">("select");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [pin, setPin] = useState("");
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState("");

  // If already logged in and this is shown as modal, allow closing
  const canClose = activePlayerId && onClose;

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setMode("login");
    setPin("");
    setError("");
  };

  const handleLogin = () => {
    if (!selectedPlayer) return;

    const success = loginPlayer(selectedPlayer.id, pin);
    if (success) {
      onClose?.();
    } else {
      setError("Spatny PIN!");
      setPin("");
    }
  };

  const handleCreatePlayer = () => {
    if (!newName.trim()) {
      setError("Zadej jmeno!");
      return;
    }
    if (newPin.length < 4) {
      setError("PIN musi mit alespon 4 znaky!");
      return;
    }

    createPlayer(newName.trim(), newPin);
    onClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-md relative">
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#FFCB05] mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {mode === "select" && "Kdo hraje?"}
            {mode === "login" && `Ahoj, ${selectedPlayer?.name}!`}
            {mode === "create" && "Novy hrac"}
          </h2>
        </div>

        {/* Select Player Mode */}
        {mode === "select" && (
          <div className="space-y-4">
            {players.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {players.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => handleSelectPlayer(player)}
                      className="p-4 rounded-xl bg-[#1a1a2e] hover:bg-[#3B4CCA] transition-all flex flex-col items-center gap-2 border-2 border-transparent hover:border-[#FFCB05]"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: player.avatarColor }}
                      >
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-medium">{player.name}</span>
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <button
                    onClick={() => {
                      setMode("create");
                      setError("");
                    }}
                    className="w-full p-3 rounded-xl bg-[#3B4CCA] hover:bg-[#4a5bd9] text-white flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Pridat noveho hrace
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 mb-4">Zatim tu nikdo neni. Vytvor si profil!</p>
                <button
                  onClick={() => {
                    setMode("create");
                    setError("");
                  }}
                  className="w-full p-4 rounded-xl bg-[#FFCB05] hover:bg-[#FFD700] text-black font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Vytvorit profil
                </button>
              </div>
            )}
          </div>
        )}

        {/* Login Mode */}
        {mode === "login" && selectedPlayer && (
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: selectedPlayer.avatarColor }}
              >
                {selectedPlayer.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                Zadej PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleLogin)}
                placeholder="****"
                maxLength={8}
                autoFocus
                className="w-full bg-[#0f0f23] border-2 border-[#3B4CCA] rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest focus:border-[#FFCB05] focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-red-400 text-center text-sm">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={pin.length < 4}
              className="w-full p-4 rounded-xl bg-[#FFCB05] hover:bg-[#FFD700] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              Prihlasit se
            </button>

            <button
              onClick={() => {
                setMode("select");
                setSelectedPlayer(null);
                setPin("");
                setError("");
              }}
              className="w-full p-3 text-gray-400 hover:text-white transition-colors"
            >
              Zpet na vyber
            </button>
          </div>
        )}

        {/* Create Player Mode */}
        {mode === "create" && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Tvoje jmeno
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, () => {})}
                placeholder="napr. Kubik"
                maxLength={20}
                autoFocus
                className="w-full bg-[#0f0f23] border-2 border-[#3B4CCA] rounded-xl px-4 py-3 text-white focus:border-[#FFCB05] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                Vytvor si PIN (min. 4 znaky)
              </label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleCreatePlayer)}
                placeholder="****"
                maxLength={8}
                className="w-full bg-[#0f0f23] border-2 border-[#3B4CCA] rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest focus:border-[#FFCB05] focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-red-400 text-center text-sm">{error}</p>
            )}

            <button
              onClick={handleCreatePlayer}
              disabled={!newName.trim() || newPin.length < 4}
              className="w-full p-4 rounded-xl bg-[#FFCB05] hover:bg-[#FFD700] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Vytvorit profil
            </button>

            {players.length > 0 && (
              <button
                onClick={() => {
                  setMode("select");
                  setNewName("");
                  setNewPin("");
                  setError("");
                }}
                className="w-full p-3 text-gray-400 hover:text-white transition-colors"
              >
                Zpet na vyber
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
