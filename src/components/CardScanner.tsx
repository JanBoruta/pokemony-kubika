"use client";

import { useState, useRef } from "react";
import { Camera, X, Loader2, Check, Plus, AlertCircle, Upload, Trash2, Search, Sparkles, Heart } from "lucide-react";
import { PokemonCard } from "@/types/pokemon";
import { useCollectionStore } from "@/store/collectionStore";
import { searchCards } from "@/lib/pokemon-api";

interface CardScannerProps {
  onClose: () => void;
  onCardFound: (card: PokemonCard) => void;
}

interface ScanResult {
  name: string;
  set?: string;
  number?: string;
  hp?: string;
  confidence: string;
}

type ScanStatus = "pending" | "converting" | "uploading" | "analyzing" | "searching" | "done" | "error";

interface ScannedCard {
  id: string;
  file: File;
  previewUrl: string;
  status: ScanStatus;
  statusText: string;
  error?: string;
  scanResult?: ScanResult;
  matchedCards: PokemonCard[];
}

export default function CardScanner({ onClose, onCardFound }: CardScannerProps) {
  const [scannedCards, setScannedCards] = useState<ScannedCard[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addCard, isInCollection, addFavorite, removeFavorite, isFavorite } = useCollectionStore();

  const updateCard = (id: string, updates: Partial<ScannedCard>) => {
    setScannedCards(prev => prev.map(card =>
      card.id === id ? { ...card, ...updates } : card
    ));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Vytvoř záznamy pro každý soubor
    const newCards: ScannedCard[] = await Promise.all(files.map(async (file) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      let previewUrl = "";

      // Pro HEIC musíme konvertovat pro náhled
      if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
        previewUrl = ""; // Bude nastaveno po konverzi
      } else {
        previewUrl = URL.createObjectURL(file);
      }

      return {
        id,
        file,
        previewUrl,
        status: "pending" as ScanStatus,
        statusText: "Čeká na zpracování...",
        matchedCards: [],
      };
    }));

    setScannedCards(prev => [...prev, ...newCards]);

    // Zpracuj každý soubor
    for (const card of newCards) {
      processCard(card);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload HEIC do Cloudinary a získání JPEG URL
  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Upload do Cloudinary selhal");
    }

    return data.jpg_url;
  };

  const processCard = async (card: ScannedCard) => {
    console.log("[CardScanner] Processing card:", card.file.name, "Type:", card.file.type, "Size:", card.file.size);

    try {
      const isHeic = card.file.type === "image/heic" ||
                     card.file.type === "image/heif" ||
                     card.file.name.toLowerCase().endsWith(".heic") ||
                     card.file.name.toLowerCase().endsWith(".heif");

      let apiPayload: { image?: string; imageUrl?: string };

      // Pro HEIC použijeme Cloudinary pro konverzi
      if (isHeic) {
        console.log("[CardScanner] HEIC detected, uploading to Cloudinary...");
        updateCard(card.id, { status: "converting", statusText: "Nahrávám HEIC do cloudu..." });

        const jpgUrl = await uploadToCloudinary(card.file);
        console.log("[CardScanner] Cloudinary upload successful:", jpgUrl);

        // Nastav náhled z Cloudinary URL
        updateCard(card.id, { previewUrl: jpgUrl });

        apiPayload = { imageUrl: jpgUrl };
      } else {
        // Pro ostatní formáty použijeme base64
        console.log("[CardScanner] Converting to base64...");
        updateCard(card.id, { status: "uploading", statusText: "Nahrávám fotku..." });

        const base64 = await fileToBase64(card.file);
        console.log("[CardScanner] Base64 length:", base64.length);

        if (!base64 || !base64.startsWith("data:image/")) {
          throw new Error("Nepodařilo se převést obrázek na base64");
        }

        apiPayload = { image: base64 };
      }

      // AI analýza
      console.log("[CardScanner] Calling API...");
      updateCard(card.id, { status: "analyzing", statusText: "AI rozpoznává kartu..." });

      const response = await fetch("/api/scan-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      console.log("[CardScanner] API response status:", response.status);
      const data = await response.json();
      console.log("[CardScanner] API response data:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.result?.name) {
        throw new Error("AI nerozpoznala kartu na obrázku");
      }

      console.log("[CardScanner] Card recognized:", data.result.name);
      updateCard(card.id, { scanResult: data.result });

      // Vyhledávání v databázi
      updateCard(card.id, { status: "searching", statusText: `Hledám "${data.result.name}"...` });

      const searchQuery = data.result.name;
      const searchResult = await searchCards(searchQuery, 1, 30);
      let matchedCards = searchResult.data || [];
      console.log("[CardScanner] Initial search results:", matchedCards.length);

      // Filtruj podle HP pokud je známé
      if (data.result.hp && matchedCards.length > 1) {
        const targetHP = parseInt(data.result.hp, 10);
        if (!isNaN(targetHP)) {
          const hpFiltered = matchedCards.filter(c => c.hp === targetHP);
          if (hpFiltered.length > 0) {
            matchedCards = hpFiltered;
            console.log("[CardScanner] Filtered by HP:", targetHP, "->", hpFiltered.length, "cards");
          }
        }
      }

      // Filtruj podle setu pokud je známý
      if (data.result.set && matchedCards.length > 1) {
        const targetSet = data.result.set.toLowerCase();
        const setFiltered = matchedCards.filter(c =>
          c.set.name.toLowerCase().includes(targetSet) ||
          targetSet.includes(c.set.name.toLowerCase())
        );
        if (setFiltered.length > 0) {
          matchedCards = setFiltered;
          console.log("[CardScanner] Filtered by set:", targetSet, "->", setFiltered.length, "cards");
        }
      }

      // Filtruj podle čísla karty pokud je známé
      if (data.result.number && matchedCards.length > 1) {
        const targetNumber = data.result.number.split("/")[0];
        const numberFiltered = matchedCards.filter(c =>
          c.localId === targetNumber ||
          c.localId === targetNumber.replace(/^0+/, "")
        );
        if (numberFiltered.length > 0) {
          matchedCards = numberFiltered;
          console.log("[CardScanner] Filtered by number:", targetNumber, "->", numberFiltered.length, "cards");
        }
      }

      // Seřaď - přesné shody HP první
      if (data.result.hp) {
        const targetHP = parseInt(data.result.hp, 10);
        matchedCards.sort((a, b) => {
          const aMatch = a.hp === targetHP ? 0 : 1;
          const bMatch = b.hp === targetHP ? 0 : 1;
          return aMatch - bMatch;
        });
      }

      updateCard(card.id, {
        status: "done",
        statusText: `Nalezeno ${matchedCards.length} karet`,
        matchedCards: matchedCards
      });

    } catch (err) {
      console.error("[CardScanner] Error:", err);
      updateCard(card.id, {
        status: "error",
        statusText: "Chyba",
        error: err instanceof Error ? err.message : "Nepodařilo se rozpoznat kartu"
      });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const removeCard = (id: string) => {
    setScannedCards(prev => prev.filter(card => card.id !== id));
  };

  const retryCard = (card: ScannedCard) => {
    updateCard(card.id, {
      status: "pending",
      statusText: "Čeká na zpracování...",
      error: undefined,
      scanResult: undefined,
      matchedCards: []
    });
    processCard(card);
  };

  const handleAddCard = (card: PokemonCard) => {
    addCard(card);
  };

  const getImageUrl = (card: PokemonCard) => {
    if (card.image) {
      return `${card.image}/low.webp`;
    }
    return "/placeholder-card.png";
  };

  const getStatusIcon = (status: ScanStatus) => {
    switch (status) {
      case "pending":
        return <div className="w-4 h-4 rounded-full border-2 border-gray-400" />;
      case "converting":
      case "uploading":
        return <Upload className="w-4 h-4 text-blue-400 animate-pulse" />;
      case "analyzing":
        return <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case "searching":
        return <Search className="w-4 h-4 text-purple-400 animate-pulse" />;
      case "done":
        return <Check className="w-4 h-4 text-green-400" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: ScanStatus) => {
    switch (status) {
      case "pending": return "text-gray-400";
      case "converting":
      case "uploading": return "text-blue-400";
      case "analyzing": return "text-yellow-400";
      case "searching": return "text-purple-400";
      case "done": return "text-green-400";
      case "error": return "text-red-400";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Camera className="w-7 h-7 text-[#FFCB05]" />
            Skenovat karty
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#3B4CCA] rounded-xl p-8 text-center cursor-pointer hover:border-[#FFCB05] hover:bg-[#FFCB05]/5 transition-all mb-6"
        >
          <Camera className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-300 mb-2 text-lg">Klikni pro výběr fotek karet</p>
          <p className="text-[#FFCB05] font-semibold mb-2">Můžeš vybrat více fotek najednou!</p>
          <p className="text-gray-500 text-sm">Podporuje HEIC, JPG, PNG</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Scanned cards list */}
        {scannedCards.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">
                Nahrané karty ({scannedCards.length})
              </h3>
              <button
                onClick={() => setScannedCards([])}
                className="text-gray-400 hover:text-red-400 text-sm transition-colors"
              >
                Vymazat vše
              </button>
            </div>

            {scannedCards.map((card) => (
              <div key={card.id} className="bg-[#1a1a2e] rounded-xl p-4 border border-white/10">
                {/* Card header */}
                <div className="flex gap-4">
                  {/* Preview */}
                  <div className="w-24 h-32 flex-shrink-0 bg-[#0a0a15] rounded-lg overflow-hidden flex items-center justify-center">
                    {card.previewUrl ? (
                      <img
                        src={card.previewUrl}
                        alt="Náhled"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        {card.status === "converting" ? (
                          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                        ) : (
                          <Camera className="w-8 h-8 text-gray-600 mx-auto" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium truncate">{card.file.name}</p>
                      <div className="flex items-center gap-2">
                        {card.status === "error" && (
                          <button
                            onClick={() => retryCard(card)}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            Zkusit znovu
                          </button>
                        )}
                        <button
                          onClick={() => removeCard(card.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 mb-2">
                      {(card.status !== "done" && card.status !== "error" && card.status !== "pending") && (
                        <Loader2 className="w-4 h-4 animate-spin text-[#FFCB05]" />
                      )}
                      {(card.status === "done" || card.status === "error" || card.status === "pending") && (
                        getStatusIcon(card.status)
                      )}
                      <span className={`text-sm ${getStatusColor(card.status)}`}>
                        {card.statusText}
                      </span>
                    </div>

                    {/* Error message */}
                    {card.error && (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 mb-2">
                        <p className="text-red-300 text-sm">{card.error}</p>
                      </div>
                    )}

                    {/* Scan result */}
                    {card.scanResult && card.status === "done" && (
                      <div className="bg-[#3B4CCA]/20 rounded-lg p-2 mb-2">
                        <p className="text-[#FFCB05] text-sm font-medium">
                          Rozpoznáno: {card.scanResult.name}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-1">
                          {card.scanResult.set && <span>Set: {card.scanResult.set}</span>}
                          {card.scanResult.number && <span>#{card.scanResult.number}</span>}
                          {card.scanResult.hp && <span>{card.scanResult.hp} HP</span>}
                          <span className="text-gray-500">({card.scanResult.confidence})</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Matched cards */}
                {card.matchedCards.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-400 text-sm mb-3">Nalezené karty:</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {card.matchedCards.map((matchedCard) => {
                        const inCollection = isInCollection(matchedCard.id);
                        const inFavorites = isFavorite(matchedCard.id);
                        return (
                          <div
                            key={matchedCard.id}
                            className="flex-shrink-0 w-20 relative group"
                          >
                            <img
                              src={getImageUrl(matchedCard)}
                              alt={matchedCard.name}
                              className="w-full rounded-lg cursor-pointer hover:ring-2 hover:ring-[#FFCB05] transition-all"
                              onClick={() => onCardFound(matchedCard)}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder-card.png";
                              }}
                            />
                            <p className="text-white text-xs mt-1 truncate">{matchedCard.name}</p>
                            {/* Action buttons */}
                            <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddCard(matchedCard);
                                }}
                                className={`p-1 rounded-full transition-all ${
                                  inCollection
                                    ? "bg-green-500 text-white"
                                    : "bg-[#3B4CCA] text-white hover:bg-[#FFCB05] hover:text-black"
                                }`}
                                title={inCollection ? "Ve sbírce" : "Přidat do sbírky"}
                              >
                                {inCollection ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  inFavorites ? removeFavorite(matchedCard.id) : addFavorite(matchedCard);
                                }}
                                className={`p-1 rounded-full transition-all ${
                                  inFavorites
                                    ? "bg-red-500 text-white"
                                    : "bg-[#3B4CCA] text-white hover:bg-red-500"
                                }`}
                                title={inFavorites ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
                              >
                                <Heart className={`w-3 h-3 ${inFavorites ? "fill-current" : ""}`} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                                          </div>
                  </div>
                )}

                {/* No matches found */}
                {card.status === "done" && card.matchedCards.length === 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <p className="text-gray-400 text-sm">Nenalezena žádná odpovídající karta v databázi.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {scannedCards.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            <p>Tip: Foť karty rovně s dobrým osvětlením pro nejlepší výsledky</p>
          </div>
        )}
      </div>
    </div>
  );
}
