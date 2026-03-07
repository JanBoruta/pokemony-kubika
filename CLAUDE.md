# Pokémony Kubíka - AI Pokemon Card Scanner

## Přehled projektu
Webová aplikace pro správu sbírky Pokémon TCG karet s AI rozpoznáváním.

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS 4
- **State:** Zustand
- **API:** TCGdex API pro databázi karet
- **AI:** OpenAI GPT-4 Vision pro rozpoznávání karet
- **HEIC konverze:** libheif-js + jpeg-js (čisté WASM)

## Hlavní funkce
- **Vyhledávání karet** - fulltext s našeptávačem
- **Skenování karet** - AI rozpoznávání z fotek (podporuje HEIC z iPhone)
- **Multi-upload** - nahrání více fotek najednou
- **Sbírka** - ukládání karet do kolekce (localStorage)
- **Oblíbené** - srdíčka pro označení favoritů
- **Porovnání** - AI porovnání dvou karet
- **AI Asistent** - chatbot pro dotazy o kartách
- **Hlasový vstup** - rozpoznávání řeči

## Struktura projektu
```
src/
├── app/
│   ├── api/
│   │   ├── scan-card/     # AI rozpoznávání + HEIC konverze
│   │   ├── compare/       # AI porovnání karet
│   │   ├── chat/          # AI asistent
│   │   ├── translate/     # Překlad textů
│   │   └── tts/           # Text-to-speech
│   ├── import/            # Import sbírky
│   └── page.tsx           # Hlavní stránka
├── components/
│   ├── CardScanner.tsx    # Skener karet
│   ├── CardModal.tsx      # Detail karty
│   ├── SearchBox.tsx      # Vyhledávání
│   └── ...
├── lib/
│   └── pokemon-api.ts     # TCGdex API wrapper
├── store/
│   └── collectionStore.ts # Zustand store
└── types/
    ├── pokemon.ts         # TypeScript typy
    └── libheif-js.d.ts    # Typy pro libheif-js
```

## Environment Variables
```env
# Povinné
OPENAI_API_KEY=sk-...

# Volitelné (Azure TTS pro lepší hlas)
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=westeurope
```

## HEIC Konverze
Aplikace používá `libheif-js` (WASM) pro konverzi HEIC fotek na JPEG na serveru.
Toto řešení funguje na Vercel serverless bez nativních závislostí.

Flow:
1. Uživatel nahraje HEIC fotku
2. Server detekuje HEIC MIME type
3. `libheif-js` dekóduje HEIC na RGBA data
4. `jpeg-js` enkóduje RGBA na JPEG
5. JPEG se pošle do OpenAI Vision API

## Deployment
- **Hosting:** Vercel
- **URL:** https://pokemony-kubika.vercel.app
- **Auto-deploy:** z `main` branch

## Důležité poznámky
- TCGdex API má anglické názvy karet
- AI prompt je v češtině, ale vrací anglické názvy
- Filtrování výsledků podle HP, setu a čísla karty
- Sbírka se ukládá do localStorage (není synchronizace)
