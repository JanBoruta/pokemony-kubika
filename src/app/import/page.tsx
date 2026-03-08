"use client";

import { useState } from "react";
import { useCollectionStore } from "@/store/collectionStore";
import { getAllImportedCards } from "@/data/import-cards";
import { Check, Trash2, Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ImportPage() {
  const [imported, setImported] = useState(false);
  const [cleared, setCleared] = useState(false);
  const { clearCollection, addCard, items } = useCollectionStore();

  const handleClearAndImport = () => {
    // Smazat sbírku
    clearCollection();
    setCleared(true);

    // Import karet
    const cardsToImport = getAllImportedCards();
    let totalCards = 0;

    cardsToImport.forEach(({ card, quantity }) => {
      for (let i = 0; i < quantity; i++) {
        addCard(card);
        totalCards++;
      }
    });

    setImported(true);
    console.log(`Importováno ${totalCards} karet`);
  };

  const handleClearOnly = () => {
    clearCollection();
    setCleared(true);
    setImported(false);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[#FFCB05] flex items-center gap-2 mb-8 hover:underline">
          <ArrowLeft className="w-5 h-5" />
          Zpět na hlavní stránku
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8">Import karet z Excelu</h1>

        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Aktuální stav sbírky</h2>
          <p className="text-gray-300 mb-4">
            Ve sbírce máš aktuálně <span className="text-[#FFCB05] font-bold">{items.length}</span> karet.
          </p>

          {cleared && !imported && (
            <div className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Sbírka byla smazána!
            </div>
          )}

          {imported && (
            <div className="bg-green-500/20 text-green-300 p-4 rounded-lg mb-4 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Karty byly úspěšně importovány! ({items.length} karet ve sbírce)
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Akce</h2>

          <div className="space-y-4">
            <button
              onClick={handleClearAndImport}
              className="w-full pokemon-btn flex items-center justify-center gap-2 py-4"
            >
              <Upload className="w-5 h-5" />
              Smazat sbírku a importovat karty z Excelu
            </button>

            <button
              onClick={handleClearOnly}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Pouze smazat sbírku
            </button>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Info o importu</h2>
          <p className="text-gray-300 text-sm">
            Import načte karty z Excel souboru <code className="bg-[#1a1a2e] px-2 py-1 rounded">pokemon_karty.xlsx</code>.
            Obsahuje Pokémony, Trenéry i Energie z tvé sbírky.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Poznámka: Obrázky karet nejsou k dispozici, protože v Excelu jsou pouze Google Drive odkazy.
          </p>
        </div>
      </div>
    </main>
  );
}
