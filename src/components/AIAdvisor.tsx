"use client";

import { useState, useEffect, useRef } from "react";
import { PokemonCard, typeTranslations, rarityTranslations } from "@/types/pokemon";
import { Mic, MicOff, Volume2, VolumeX, Bot, X, Sparkles } from "lucide-react";

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
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

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
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "cs-CZ";

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const result = event.results[event.results.length - 1];
          const transcriptText = result[0].transcript;
          setTranscript(transcriptText);

          if (result.isFinal) {
            handleQuestion(transcriptText);
          }
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }

      // Inicializace Speech Synthesis
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
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
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "cs-CZ";
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
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

  const handleQuestion = async (question: string) => {
    setIsLoading(true);
    const lowerQuestion = question.toLowerCase();

    let answer = "";

    // Odpovědi na různé otázky
    if (card) {
      if (lowerQuestion.includes("řekni") || lowerQuestion.includes("popiš") || lowerQuestion.includes("vysvětli") || lowerQuestion.includes("kdo je") || lowerQuestion.includes("co je")) {
        answer = generateCardExplanation(card);
      } else if (lowerQuestion.includes("útok") || lowerQuestion.includes("útoky")) {
        if (card.attacks && card.attacks.length > 0) {
          answer = `${card.name} má tyto útoky: ${card.attacks.map(a => `${a.name}${a.damage ? ` za ${a.damage} poškození` : ""}`).join(", ")}.`;
        } else {
          answer = `${card.name} nemá žádné útoky. To je asi trenérská nebo energetická karta.`;
        }
      } else if (lowerQuestion.includes("život") || lowerQuestion.includes("hp")) {
        answer = card.hp ? `${card.name} má ${card.hp} životů.` : `${card.name} nemá žádné životy. To je asi trenérská nebo energetická karta.`;
      } else if (lowerQuestion.includes("typ")) {
        if (card.types && card.types.length > 0) {
          answer = `${card.name} je ${card.types.map(translateType).join(" a ")} typu.`;
        } else {
          answer = `${card.name} nemá specifický typ.`;
        }
      } else if (lowerQuestion.includes("slabost") || lowerQuestion.includes("slabý")) {
        if (card.weaknesses && card.weaknesses.length > 0) {
          answer = `${card.name} je slabý na ${card.weaknesses.map(w => translateType(w.type)).join(" a ")} typ. To znamená, že takové útoky na něj působí ${card.weaknesses[0].value} silněji!`;
        } else {
          answer = `${card.name} nemá žádnou slabost. To je super!`;
        }
      } else if (lowerQuestion.includes("vzácn") || lowerQuestion.includes("rarity")) {
        answer = card.rarity
          ? `${card.name} má vzácnost ${translateRarity(card.rarity)}. ${card.rarity.toLowerCase().includes("rare") ? "To je celkem vzácná karta!" : ""}`
          : `Nevím, jakou vzácnost má ${card.name}.`;
      } else if (lowerQuestion.includes("schopnost") || lowerQuestion.includes("ability")) {
        if (card.abilities && card.abilities.length > 0) {
          answer = `${card.name} má schopnost ${card.abilities[0].name}: ${card.abilities[0].effect}`;
        } else {
          answer = `${card.name} nemá žádnou speciální schopnost.`;
        }
      } else {
        answer = generateCardExplanation(card);
      }
    } else {
      answer = "Nejdříve vyber nějakou kartu, abych ti o ní mohl něco říct!";
    }

    setResponse(answer);
    setIsLoading(false);
    speak(answer);
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
              <p className="text-gray-400">Ptej se mě na tuhle kartu!</p>
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
                    setTranscript(question);
                    handleQuestion(question);
                  }}
                  className="px-3 py-1.5 bg-[#3B4CCA]/40 hover:bg-[#3B4CCA]/60 rounded-full text-sm text-white transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Voice Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={toggleListening}
            disabled={!card}
            className={`p-4 rounded-full transition-all ${
              isListening
                ? "bg-red-500 animate-pulse"
                : card
                ? "bg-[#3B4CCA] hover:bg-[#4a5bd9]"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>

          <button
            onClick={isSpeaking ? stopSpeaking : () => response && speak(response)}
            disabled={!response}
            className={`p-4 rounded-full transition-all ${
              isSpeaking
                ? "bg-[#FFCB05] animate-pulse"
                : response
                ? "bg-[#3B4CCA] hover:bg-[#4a5bd9]"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            {isSpeaking ? (
              <VolumeX className="w-8 h-8 text-black" />
            ) : (
              <Volume2 className="w-8 h-8 text-white" />
            )}
          </button>
        </div>

        {/* Listening Indicator */}
        {isListening && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full">
              <span className="animate-pulse">●</span>
              Poslouchám...
            </div>
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <div className="mb-4 bg-[#1a1a2e] rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-1">
              Tvoje otázka:
            </h4>
            <p className="text-white">{transcript}</p>
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
            <h4 className="text-sm font-semibold text-[#FFCB05] mb-2 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Odpověď:
            </h4>
            <p className="text-white leading-relaxed">{response}</p>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Klikni na mikrofon a zeptej se česky!</p>
          <p className="mt-1">Nebo použij rychlé otázky výše.</p>
        </div>
      </div>
    </div>
  );
}
