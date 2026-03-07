import { NextRequest, NextResponse } from "next/server";

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
  cards?: CardSummary[];
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
  favoriteCards: CardSummary[];
  collectionCards: CardSummary[];
  recentlyShownCards?: CardSummary[];
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, favoriteCards, collectionCards, recentlyShownCards } = await req.json() as ChatRequest;

    if (!message) {
      return NextResponse.json({ error: "Chybí zpráva" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API není nakonfigurován", fallback: true },
        { status: 200 }
      );
    }

    // Formát karet pro kontext
    const formatCards = (cards: CardSummary[]): string => {
      if (!cards || cards.length === 0) return "žádné";
      return cards.map(c => {
        let info = c.name;
        if (c.types?.length) info += ` (${c.types.join("/")})`;
        if (c.hp) info += `, ${c.hp} HP`;
        return info;
      }).join("; ");
    };

    const systemPrompt = `Jsi Pokédex AI - expert na Pokémon TCG (Trading Card Game) pro české děti (8-12 let).

## Tvoje osobnost:
- Jsi nadšený, přátelský a povzbuzující
- Mluvíš česky, jednoduše ale ne hloupě
- Používáš občas Pokémon výrazy (super efektivní, evoluce, atd.)
- Nikdy neříkáš "řekni mi co máš" - vždy pracuješ s daty co vidíš

## Tvoje znalosti:
- Znáš všechny Pokémon typy a jejich výhody/nevýhody
- Víš jak sestavit dobrý balíček (deck building)
- Rozumíš synergiím mezi kartami
- Znáš pravidla Pokémon TCG

## Typy a jejich vztahy:
- Oheň > Tráva, Kov | slabý na: Voda
- Voda > Oheň | slabá na: Elektro, Tráva
- Elektro > Voda, Létající | slabé na: Bojový
- Tráva > Voda, Zem | slabá na: Oheň
- Psychic > Bojový, Jedový | slabé na: Temný
- Bojový > Normál, Kov | slabý na: Psychic, Létající
- Temný > Psychic, Duch | slabý na: Bojový, Víla
- Kov > Víla, Led | slabý na: Oheň, Bojový
- Drak > Drak | slabý na: Víla, Led

## Kontext uživatele:
OBLÍBENÉ KARTY: ${formatCards(favoriteCards || [])}
SBÍRKA (${collectionCards?.length || 0} karet): ${formatCards((collectionCards || []).slice(0, 15))}${(collectionCards?.length || 0) > 15 ? "..." : ""}
${recentlyShownCards?.length ? `PRÁVĚ ZOBRAZENÉ KARTY: ${formatCards(recentlyShownCards)}` : ""}

## Jak odpovídáš:
1. VŽDY analyzuj karty které uživatel má nebo které byly právě zobrazeny
2. Doporučuj konkrétní karty které by se hodily k jeho kartám
3. Vysvětli PROČ se karty hodí dohromady (synergie typů, strategie)
4. Buď stručný ale informativní (max 4-5 vět)

## Speciální příkazy (přidej na konec odpovědi):
- Hledání karet: [SEARCH:název_karty]
- Zobrazit sbírku: [SHOW_COLLECTION]
- Zobrazit oblíbené: [SHOW_FAVORITES]

Příklad: "Charizard ex je super volba! K němu by se hodil Arcanine pro podporu ohně a Bibarel pro tahání karet. [SEARCH:Arcanine]"`;

    // Připrav historii konverzace pro API
    const conversationHistory = (history || []).slice(-6).map(msg => {
      let content = msg.content;
      if (msg.cards && msg.cards.length > 0) {
        content += `\n[Zobrazené karty: ${msg.cards.map(c => c.name).join(", ")}]`;
      }
      return {
        role: msg.role as "user" | "assistant",
        content
      };
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", await response.text());
      return NextResponse.json({ error: "Chyba při komunikaci s AI" }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "Hmm, něco se pokazilo. Zkus to znovu!";

    // Parse special commands
    let searchTerm = null;
    let showCollection = false;
    let showFavorites = false;
    let cleanResponse = aiResponse;

    const searchMatch = aiResponse.match(/\[SEARCH:([^\]]+)\]/);
    if (searchMatch) {
      searchTerm = searchMatch[1].trim();
      cleanResponse = aiResponse.replace(/\[SEARCH:[^\]]+\]/g, "").trim();
    }

    if (aiResponse.includes("[SHOW_COLLECTION]")) {
      showCollection = true;
      cleanResponse = aiResponse.replace(/\[SHOW_COLLECTION\]/g, "").trim();
    }

    if (aiResponse.includes("[SHOW_FAVORITES]")) {
      showFavorites = true;
      cleanResponse = aiResponse.replace(/\[SHOW_FAVORITES\]/g, "").trim();
    }

    return NextResponse.json({
      response: cleanResponse,
      searchTerm,
      showCollection,
      showFavorites,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Chyba při zpracování dotazu" }, { status: 500 });
  }
}
