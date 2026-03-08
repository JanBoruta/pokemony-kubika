"use client";

import { useState, useRef, useEffect } from "react";
import { PokemonCard } from "@/types/pokemon";
import { useCollectionStore, useItems, useFavorites } from "@/store/collectionStore";
import { searchCards } from "@/lib/pokemon-api";
import { Bot, Send, Heart, Loader2, Mic, MicOff } from "lucide-react";

interface CardSummary {
  name: string;
  types?: string[];
  hp?: number;
  rarity?: string;
  attacks?: string[];
  abilities?: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  cards?: PokemonCard[];
}

interface AIChatProps {
  onSelectCard: (card: PokemonCard) => void;
}

// Speech Recognition types - use any to avoid conflicts with global declarations
type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: { results: { length: number; [index: number]: { isFinal: boolean; [index: number]: { transcript: string } } }; resultIndex: number }) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
};

export default function AIChat({ onSelectCard }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ahoj! Jsem tvůj Pokémon AI asistent. Můžeš se mě zeptat na cokoliv o kartách. Klikni na mikrofon nebo napiš svůj dotaz!",
    },
  ]);
  const [input, setInput] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const finalTranscriptRef = useRef("");

  const collectionItems = useItems();
  const favorites = useFavorites();
  const { addFavorite, removeFavorite, isFavorite } = useCollectionStore();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        recognitionRef.current = new SpeechRecognitionConstructor() as SpeechRecognitionType;
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "cs-CZ";

        recognitionRef.current.onresult = (event) => {
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.trim();
            if (event.results[i].isFinal) {
              const newFinal = finalTranscriptRef.current
                ? finalTranscriptRef.current + " " + transcript
                : transcript;
              finalTranscriptRef.current = newFinal;
              setInput(newFinal);
              setInterimText("");
            } else {
              interimTranscript += transcript;
            }
          }

          if (interimTranscript) {
            setInterimText(interimTranscript);
          }
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Tvůj prohlížeč nepodporuje hlasové rozpoznávání.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimText("");
    } else {
      finalTranscriptRef.current = input;
      setInterimText("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getImageUrl = (card: PokemonCard) => {
    if (card.image) {
      return `${card.image}/low.webp`;
    }
    return "/placeholder-card.png";
  };

  // Převod karty na souhrn pro API
  const cardToSummary = (card: PokemonCard): CardSummary => ({
    name: card.name,
    types: card.types,
    hp: card.hp,
    rarity: card.rarity,
    attacks: card.attacks?.map(a => a.name),
    abilities: card.abilities?.map(a => a.name),
  });

  // Získat naposledy zobrazené karty z historie
  const getRecentlyShownCards = (): CardSummary[] => {
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === "assistant" && m.cards?.length);
    if (lastAssistantMsg?.cards) {
      return lastAssistantMsg.cards.map(cardToSummary);
    }
    return [];
  };

  const handleSubmit = async () => {
    const messageToSend = input.trim();
    if (!messageToSend || isLoading) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setInput("");
    setInterimText("");
    finalTranscriptRef.current = "";
    setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);
    setIsLoading(true);

    try {
      // Připrav historii konverzace s kartami
      const historyForApi = messages.map(m => ({
        role: m.role,
        content: m.content,
        cards: m.cards?.map(cardToSummary),
      }));

      // Call GPT API s plným kontextem
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          history: historyForApi,
          favoriteCards: favorites.map(f => cardToSummary(f.card)),
          collectionCards: collectionItems.map(i => cardToSummary(i.card)),
          recentlyShownCards: getRecentlyShownCards(),
        }),
      });

      const data = await response.json();

      if (data.error && !data.fallback) {
        throw new Error(data.error);
      }

      let responseText = data.response || "Hmm, něco se pokazilo.";
      let foundCards: PokemonCard[] = [];

      // Handle search command
      if (data.searchTerm) {
        const searchResult = await searchCards(data.searchTerm, 1, 20);
        foundCards = searchResult.data || [];
        if (foundCards.length === 0) {
          responseText += ` Bohužel jsem nenašel žádné karty pro "${data.searchTerm}".`;
        }
      }

      // Handle show favorites
      if (data.showFavorites) {
        foundCards = favorites.map(f => f.card);
        if (foundCards.length === 0) {
          responseText = "Zatím nemáš žádné oblíbené karty. Přidej je kliknutím na srdíčko!";
        }
      }

      // Handle show collection
      if (data.showCollection) {
        foundCards = collectionItems.slice(0, 20).map(i => i.card);
        if (foundCards.length === 0) {
          responseText = "Tvoje sbírka je zatím prázdná. Přidej karty kliknutím na 'Přidat do sbírky'!";
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: responseText, cards: foundCards },
      ]);
    } catch (error) {
      console.error("AI Chat error:", error);

      // Fallback to simple search
      const lowerQuery = messageToSend.toLowerCase();
      let responseText = "";
      let foundCards: PokemonCard[] = [];

      if (lowerQuery.includes("pikachu") || lowerQuery.includes("charizard") || lowerQuery.includes("mewtwo")) {
        const searchTerm = lowerQuery.includes("pikachu") ? "Pikachu" :
                          lowerQuery.includes("charizard") ? "Charizard" : "Mewtwo";
        const searchResult = await searchCards(searchTerm, 1, 15);
        foundCards = searchResult.data || [];
        responseText = foundCards.length > 0
          ? `Našel jsem ${foundCards.length} karet ${searchTerm}!`
          : `Nepodařilo se najít karty ${searchTerm}.`;
      } else {
        const searchResult = await searchCards(messageToSend, 1, 15);
        foundCards = searchResult.data || [];
        responseText = foundCards.length > 0
          ? `Tady máš výsledky pro "${messageToSend}":`
          : `Omlouvám se, nepodařilo se mi odpovědět. Zkus to prosím znovu.`;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: responseText, cards: foundCards },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleFavorite = (card: PokemonCard) => {
    if (isFavorite(card.id)) {
      removeFavorite(card.id);
    } else {
      addFavorite(card);
    }
  };

  const displayValue = interimText ? `${input} ${interimText}`.trim() : input;

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Bot className="w-7 h-7 text-[#FFCB05]" />
        AI Asistent
      </h2>

      {/* Chat Messages */}
      <div className="h-[400px] overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-[#3B4CCA] text-white"
                  : "bg-[#1a1a2e] text-gray-200"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>

              {/* Karty v odpovědi */}
              {message.cards && message.cards.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {message.cards.slice(0, 20).map((card) => (
                    <div
                      key={card.id}
                      className="relative group cursor-pointer"
                    >
                      <img
                        src={getImageUrl(card)}
                        alt={card.name}
                        className="w-full rounded-lg border-2 border-transparent group-hover:border-[#FFCB05] transition-all"
                        onClick={() => onSelectCard(card)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-card.png";
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(card);
                        }}
                        className={`absolute top-1 right-1 p-1 rounded-full transition-all ${
                          isFavorite(card.id)
                            ? "bg-red-500 text-white"
                            : "bg-black/50 text-white hover:bg-red-500"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite(card.id) ? "fill-current" : ""}`} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg truncate">
                        {card.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {message.cards && message.cards.length > 20 && (
                <p className="text-sm text-gray-400 mt-2">
                  ...a dalších {message.cards.length - 20} karet
                </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a2e] rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#FFCB05]" />
              <span className="text-gray-400">Přemýšlím...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={displayValue}
            onChange={(e) => {
              setInput(e.target.value);
              finalTranscriptRef.current = e.target.value;
              setInterimText("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="Zeptej se mě na cokoliv o kartách..."
            disabled={isLoading}
            className="w-full bg-[#0f0f23] border-2 border-[#3B4CCA] rounded-xl px-4 py-3 text-white focus:border-[#FFCB05] focus:outline-none disabled:opacity-50"
          />
          {isListening && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="animate-pulse text-red-500 text-lg">●</span>
            </div>
          )}
        </div>

        {/* Microphone Button */}
        <button
          onClick={toggleListening}
          disabled={isLoading}
          className={`p-3 rounded-xl transition-all ${
            isListening
              ? "bg-red-500 animate-pulse"
              : "bg-[#3B4CCA] hover:bg-[#4a5bd9]"
          } disabled:opacity-50`}
          title={isListening ? "Zastavit nahrávání" : "Nahrát hlas"}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="p-3 rounded-xl bg-[#FFCB05] hover:bg-[#FFD700] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500 mt-2">
        {isListening
          ? "Mluv... Stiskni Enter pro odeslání"
          : "Klikni na mikrofon pro hlasový vstup nebo napiš dotaz"}
      </p>

      {/* Quick Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "Doporuč karty k mým oblíbeným",
          "Moje oblíbené",
          "Jak sestavit balíček?",
          "Najdi Charizard",
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => {
              setInput(suggestion);
              finalTranscriptRef.current = suggestion;
            }}
            className="px-3 py-1 text-sm bg-[#3B4CCA]/30 hover:bg-[#3B4CCA]/50 rounded-full text-gray-300 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
