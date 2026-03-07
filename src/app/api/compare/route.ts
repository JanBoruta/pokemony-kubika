import { NextRequest, NextResponse } from "next/server";

interface CardData {
  name: string;
  hp?: number;
  types?: string[];
  attacks?: {
    name: string;
    damage?: number | string;
    effect?: string;
    cost?: string[];
  }[];
  abilities?: {
    name: string;
    effect: string;
  }[];
  weaknesses?: { type: string; value: string }[];
  rarity?: string;
  retreat?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { cards } = await req.json();

    if (!cards || cards.length < 2) {
      return NextResponse.json(
        { error: "Potřebuji alespoň 2 karty k porovnání" },
        { status: 400 }
      );
    }

    // Připravíme data karet pro GPT
    const cardsDescription = cards.map((card: CardData, index: number) => {
      const attacks = card.attacks?.map(a =>
        `- ${a.name}: ${a.damage || 'žádné'} poškození${a.effect ? `, efekt: ${a.effect}` : ''}`
      ).join('\n') || 'Žádné útoky';

      const abilities = card.abilities?.map(a =>
        `- ${a.name}: ${a.effect}`
      ).join('\n') || 'Žádné schopnosti';

      return `
KARTA ${index + 1}: ${card.name}
- HP: ${card.hp || 'N/A'}
- Typ: ${card.types?.join(', ') || 'Neznámý'}
- Vzácnost: ${card.rarity || 'Neznámá'}
- Cena ústupu: ${card.retreat || 0}
- Slabost: ${card.weaknesses?.map(w => `${w.type} ${w.value}`).join(', ') || 'Žádná'}

ÚTOKY:
${attacks}

SCHOPNOSTI:
${abilities}
`;
    }).join('\n---\n');

    // Volání OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Jsi expert na Pokémon TCG karty. Tvým úkolem je:
1. Přeložit všechny anglické texty útoků a schopností do češtiny
2. Vysvětlit, jak každý útok a schopnost funguje v praxi (jednoduše pro děti)
3. Porovnat karty mezi sebou a určit, která je silnější a proč
4. Dát slovní hodnocení obou karet

Odpovídej v češtině, přátelsky a srozumitelně pro děti (8-12 let).
Formátuj odpověď takto:

## Překlad a vysvětlení karet

### [Jméno karty 1]
**Útoky:**
- [Název útoku] ([překlad]): [vysvětlení jak funguje]

**Schopnosti:**
- [Název] ([překlad]): [vysvětlení]

### [Jméno karty 2]
...

## Srovnání karet

[Podrobné srovnání - která je silnější, proč, v jakých situacích]

## Verdikt

[Krátké shrnutí - která karta je lepší a proč, hodnocení obou karet]`
          },
          {
            role: 'user',
            content: `Porovnej tyto Pokémon karty a přelož jejich texty do češtiny s vysvětlením:\n\n${cardsDescription}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      return NextResponse.json(
        { error: "Nepodařilo se získat AI hodnocení" },
        { status: 500 }
      );
    }

    const data = await openaiResponse.json();
    const aiResponse = data.choices[0]?.message?.content || "Nepodařilo se vygenerovat hodnocení";

    return NextResponse.json({ comparison: aiResponse });
  } catch (error) {
    console.error('Compare API error:', error);
    return NextResponse.json(
      { error: "Chyba při porovnávání karet" },
      { status: 500 }
    );
  }
}
