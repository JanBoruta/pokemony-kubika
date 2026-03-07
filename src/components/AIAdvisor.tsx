"use client";

import { useState, useEffect, useRef } from "react";
import { PokemonCard, typeTranslations, rarityTranslations } from "@/types/pokemon";
import { Mic, MicOff, Volume2, VolumeX, Bot, X, Sparkles, Send } from "lucide-react";

interface AIAdvisorProps {
  card: PokemonCard | null;
  onClose: () => void;
}

// Typy pro Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function AIAdvisor({ card, onClose }: AIAdvisorProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finalTranscriptRef = useRef("");

  const getImageUrl = (cardData: PokemonCard) => {
    if (cardData.image) {
      return `${cardData.image}/low.webp`;
    }
    return "/placeholder-card.png";
  };

  useEffect(() => {
    // Inicializace Speech Recognition
    if (typeof window !== "undefined") {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        recognitionRef.current = new SpeechRecognitionConstructor();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "cs-CZ";

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.trim();
            if (event.results[i].isFinal) {
              // Přidáme finální text do ref a input
              const newFinal = finalTranscriptRef.current
                ? finalTranscriptRef.current + " " + transcript
                : transcript;
              finalTranscriptRef.current = newFinal;
              setInputText(newFinal);
              setInterimText("");
            } else {
              // Interim text jen zobrazíme, nepřidáváme ho permanentně
              interimTranscript += transcript;
            }
          }

          // Zobrazíme interim text odděleně
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
      if (audioRef.current) {
        audioRef.current.pause();
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
      // Reset pro nové nahrávání
      finalTranscriptRef.current = inputText;
      setInterimText("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Fallback na browserový TTS
  const speakWithBrowserTTS = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "cs-CZ";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  // Přehrát odpověď pomocí OpenAI TTS
  const speak = async (text: string) => {
    try {
      setIsSpeaking(true);

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const contentType = response.headers.get("content-type");

      if (contentType?.includes("audio")) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.pause();
        }

        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        audioRef.current.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          // Fallback na browserový TTS při chybě přehrávání
          speakWithBrowserTTS(text);
        };

        await audioRef.current.play();
      } else {
        // Fallback na browserový TTS když OpenAI není k dispozici
        speakWithBrowserTTS(text);
      }
    } catch (error) {
      console.error("TTS error:", error);
      // Fallback na browserový TTS při chybě
      speakWithBrowserTTS(text);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    // Zastavit i browserový TTS
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const translateType = (type: string) => typeTranslations[type] || type;
  const translateRarity = (rarity: string) => rarityTranslations[rarity] || rarity;

  const generateCardExplanation = (cardData: PokemonCard): string => {
    const parts: string[] = [];

    parts.push(`${cardData.name} je ${translateType(cardData.category).toLowerCase()}.`);

    if (cardData.hp) {
      parts.push(`Má ${cardData.hp} životů.`);
    }

    if (cardData.types && cardData.types.length > 0) {
      const typesText = cardData.types.map(translateType).join(" a ");
      parts.push(`Je to ${typesText} typ.`);
    }

    if (cardData.attacks && cardData.attacks.length > 0) {
      parts.push(`Umí ${cardData.attacks.length} ${cardData.attacks.length === 1 ? "útok" : cardData.attacks.length < 5 ? "útoky" : "útoků"}.`);
      const strongestAttack = cardData.attacks.reduce((max, attack) => {
        const damage = typeof attack.damage === "number" ? attack.damage : parseInt(String(attack.damage)) || 0;
        const maxDamage = typeof max.damage === "number" ? max.damage : parseInt(String(max.damage)) || 0;
        return damage > maxDamage ? attack : max;
      }, cardData.attacks[0]);
      if (strongestAttack.damage) {
        parts.push(`Nejsilnější útok je ${strongestAttack.name}, který dělá ${strongestAttack.damage} poškození.`);
      }
    }

    if (cardData.abilities && cardData.abilities.length > 0) {
      parts.push(`Má také speciální schopnost ${cardData.abilities[0].name}.`);
    }

    if (cardData.weaknesses && cardData.weaknesses.length > 0) {
      const weaknessText = cardData.weaknesses.map(w => translateType(w.type)).join(" a ");
      parts.push(`Pozor, je slabý na ${weaknessText} typ.`);
    }

    if (cardData.rarity) {
      const rarityText = translateRarity(cardData.rarity);
      parts.push(`Je to ${rarityText.toLowerCase()} karta.`);
    }

    return parts.join(" ");
  };

  // Odeslat otázku - volá se POUZE při kliknutí na tlačítko nebo Enter
  const handleSubmit = async () => {
    if (!inputText.trim() || !card) return;

    // Zastavit nahrávání pokud běží
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsLoading(true);
    setInterimText("");
    finalTranscriptRef.current = "";
    const question = inputText.toLowerCase();
    let answer = "";

    if (question.includes("řekni") || question.includes("popiš") || question.includes("vysvětli") || question.includes("kdo je") || question.includes("co je")) {
      answer = generateCardExplanation(card);
    } else if (question.includes("útok") || question.includes("útoky")) {
      if (card.attacks && card.attacks.length > 0) {
        answer = `${card.name} má tyto útoky: ${card.attacks.map(a => `${a.name}${a.damage ? ` za ${a.damage} poškození` : ""}`).join(", ")}.`;
      } else {
        answer = `${card.name} nemá žádné útoky. To je asi trenérská nebo energetická karta.`;
      }
    } else if (question.includes("život") || question.includes("hp")) {
      answer = card.hp ? `${card.name} má ${card.hp} životů.` : `${card.name} nemá žádné životy. To je asi trenérská nebo energetická karta.`;
    } else if (question.includes("typ")) {
      if (card.types && card.types.length > 0) {
        answer = `${card.name} je ${card.types.map(translateType).join(" a ")} typu.`;
      } else {
        answer = `${card.name} nemá specifický typ.`;
      }
    } else if (question.includes("slabost") || question.includes("slabý")) {
      if (card.weaknesses && card.weaknesses.length > 0) {
        answer = `${card.name} je slabý na ${card.weaknesses.map(w => translateType(w.type)).join(" a ")} typ. To znamená, že takové útoky na něj působí ${card.weaknesses[0].value} silněji!`;
      } else {
        answer = `${card.name} nemá žádnou slabost. To je super!`;
      }
    } else if (question.includes("vzácn") || question.includes("rarity")) {
      answer = card.rarity
        ? `${card.name} má vzácnost ${translateRarity(card.rarity)}. ${card.rarity.toLowerCase().includes("rare") ? "To je celkem vzácná karta!" : ""}`
        : `Nevím, jakou vzácnost má ${card.name}.`;
    } else if (question.includes("schopnost") || question.includes("ability")) {
      if (card.abilities && card.abilities.length > 0) {
        answer = `${card.name} má schopnost ${card.abilities[0].name}: ${card.abilities[0].effect}`;
      } else {
        answer = `${card.name} nemá žádnou speciální schopnost.`;
      }
    } else {
      answer = generateCardExplanation(card);
    }

    setResponse(answer);
    setInputText("");
    setIsLoading(false);

    // Přehrát odpověď
    speak(answer);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickQuestions = [
    "Popiš tuhle kartu",
    "Jaké má útoky?",
    "Kolik má životů?",
    "Jaká je slabost?",
    "Je vzácná?",
  ];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-8 h-8 text-[#FFCB05]" />
            Pokémon Rádce
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Selected Card */}
        {card ? (
          <div className="flex items-center gap-4 mb-6 bg-[#3B4CCA]/20 rounded-xl p-4">
            <img
              src={getImageUrl(card)}
              alt={card.name}
              className="w-20 h-28 object-contain rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-card.png";
              }}
            />
            <div>
              <h3 className="text-xl font-bold text-white">{card.name}</h3>
              <p className="text-gray-400">Napiš otázku nebo mluv a stiskni Enter</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-[#3B4CCA]/20 rounded-xl mb-6">
            <Sparkles className="w-12 h-12 text-[#FFCB05] mx-auto mb-2" />
            <p className="text-gray-400">
              Vyber kartu, abych ti o ní mohl něco říct!
            </p>
          </div>
        )}

        {/* Quick Questions */}
        {card && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">
              Rychlé otázky:
            </h4>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => {
                    setInputText(question);
                    finalTranscriptRef.current = question;
                    setInterimText("");
                    setTimeout(() => handleSubmit(), 100);
                  }}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-[#3B4CCA]/40 hover:bg-[#3B4CCA]/60 rounded-full text-sm text-white transition-colors disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        {card && (
          <div className="mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={interimText ? `${inputText} ${interimText}`.trim() : inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    finalTranscriptRef.current = e.target.value;
                    setInterimText("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Napiš svou otázku..."
                  disabled={isLoading}
                  className="w-full bg-[#0f0f23] border-2 border-[#3B4CCA] rounded-xl px-4 py-3 text-white focus:border-[#FFCB05] focus:outline-none disabled:opacity-50"
                />
                {isListening && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="animate-pulse text-red-500">●</span>
                    <span className="text-xs text-gray-400">Nahrávám...</span>
                  </div>
                )}
              </div>

              {/* Mikrofon */}
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

              {/* Odeslat */}
              <button
                onClick={handleSubmit}
                disabled={!inputText.trim() || isLoading}
                className="p-3 rounded-xl bg-[#FFCB05] hover:bg-[#FFD700] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Odeslat (Enter)"
              >
                <Send className="w-6 h-6 text-black" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isListening ? "Mluv... Až domluvíš, stiskni Enter pro odeslání" : "Stiskni Enter pro odeslání nebo klikni na mikrofon pro hlasový vstup"}
            </p>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#FFCB05] border-t-transparent mx-auto"></div>
          </div>
        )}

        {/* Response */}
        {response && !isLoading && (
          <div className="bg-gradient-to-br from-[#3B4CCA]/30 to-[#FFCB05]/10 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-semibold text-[#FFCB05] flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Odpověď:
              </h4>
              <button
                onClick={() => isSpeaking ? stopSpeaking() : speak(response)}
                className={`p-2 rounded-full transition-all ${
                  isSpeaking
                    ? "bg-[#FFCB05] animate-pulse"
                    : "bg-[#3B4CCA] hover:bg-[#4a5bd9]"
                }`}
                title={isSpeaking ? "Zastavit" : "Přehrát"}
              >
                {isSpeaking ? (
                  <VolumeX className="w-5 h-5 text-black" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
            <p className="text-white leading-relaxed">{response}</p>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Napiš otázku a stiskni Enter, nebo použij mikrofon</p>
        </div>
      </div>
    </div>
  );
}
