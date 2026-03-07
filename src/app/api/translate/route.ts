import { NextRequest, NextResponse } from "next/server";

interface Attack {
  name: string;
  damage?: number | string;
  effect?: string;
  cost?: string[];
}

interface Ability {
  name: string;
  effect: string;
  type?: string;
}

interface CardData {
  name: string;
  attacks?: Attack[];
  abilities?: Ability[];
  description?: string;
}

interface TranslatedAttack {
  originalName: string;
  czechName: string;
  damage?: number | string;
  originalEffect?: string;
  czechEffect: string;
  explanation: string;
  cost?: string[];
}

interface TranslatedAbility {
  originalName: string;
  czechName: string;
  originalEffect: string;
  czechEffect: string;
  explanation: string;
}

export async function POST(req: NextRequest) {
  try {
    const { card } = await req.json();

    if (!card) {
      return NextResponse.json({ error: "Chybí data karty" }, { status: 400 });
    }

    const cardData = card as CardData;

    // Pokud není API klíč, vrátíme fallback překlady
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log("No OpenAI API key, returning fallback translations");
      return NextResponse.json({
        attacks: (cardData.attacks || []).map((attack) => ({
          originalName: attack.name,
          czechName: attack.name,
          damage: attack.damage,
          originalEffect: attack.effect,
          czechEffect: attack.effect || "",
          explanation: "Pro překlad je potřeba nastavit OpenAI API klíč.",
          cost: attack.cost,
        })),
        abilities: (cardData.abilities || []).map((ability) => ({
          originalName: ability.name,
          czechName: ability.name,
          originalEffect: ability.effect,
          czechEffect: ability.effect,
          explanation: "Pro překlad je potřeba nastavit OpenAI API klíč.",
        })),
      });
    }

    // Připravíme text pro GPT
    let prompt = `Přelož následující Pokémon kartu do češtiny a vysvětli každý útok a schopnost jednoduše pro děti (8-12 let).

KARTA: ${cardData.name}

`;

    if (cardData.attacks && cardData.attacks.length > 0) {
      prompt += "ÚTOKY:\n";
      cardData.attacks.forEach((attack, i) => {
        prompt += `${i + 1}. ${attack.name}`;
        if (attack.damage) prompt += ` (${attack.damage} poškození)`;
        if (attack.effect) prompt += `\n   Efekt: ${attack.effect}`;
        prompt += "\n";
      });
    }

    if (cardData.abilities && cardData.abilities.length > 0) {
      prompt += "\nSCHOPNOSTI:\n";
      cardData.abilities.forEach((ability, i) => {
        prompt += `${i + 1}. ${ability.name}\n   Efekt: ${ability.effect}\n`;
      });
    }

    prompt += `
Odpověz POUZE v tomto JSON formátu (bez markdown, bez code blocks):
{
  "attacks": [
    {
      "originalName": "původní anglický název",
      "czechName": "český překlad názvu",
      "czechEffect": "český překlad efektu",
      "explanation": "jednoduché vysvětlení pro děti jak útok funguje a kdy ho použít"
    }
  ],
  "abilities": [
    {
      "originalName": "původní anglický název",
      "czechName": "český překlad názvu",
      "czechEffect": "český překlad efektu",
      "explanation": "jednoduché vysvětlení pro děti jak schopnost funguje"
    }
  ]
}`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Jsi expert na Pokémon TCG. Překládáš karty do češtiny a vysvětluješ je dětem. Vždy odpovídej POUZE validním JSON bez markdown formátování."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      // Vrátíme fallback místo chyby
      return NextResponse.json({
        attacks: (cardData.attacks || []).map((attack) => ({
          originalName: attack.name,
          czechName: attack.name,
          damage: attack.damage,
          originalEffect: attack.effect,
          czechEffect: attack.effect || "",
          explanation: "",
          cost: attack.cost,
        })),
        abilities: (cardData.abilities || []).map((ability) => ({
          originalName: ability.name,
          czechName: ability.name,
          originalEffect: ability.effect,
          czechEffect: ability.effect,
          explanation: "",
        })),
      });
    }

    const data = await openaiResponse.json();
    let content = data.choices[0]?.message?.content || "{}";

    // Očistíme od markdown code blocks pokud jsou
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    try {
      const translations = JSON.parse(content);

      // Spojíme překlady s původními daty
      const translatedAttacks: TranslatedAttack[] = (cardData.attacks || []).map((attack, i) => {
        const translation = translations.attacks?.[i] || {};
        return {
          originalName: attack.name,
          czechName: translation.czechName || attack.name,
          damage: attack.damage,
          originalEffect: attack.effect,
          czechEffect: translation.czechEffect || attack.effect || "",
          explanation: translation.explanation || "",
          cost: attack.cost,
        };
      });

      const translatedAbilities: TranslatedAbility[] = (cardData.abilities || []).map((ability, i) => {
        const translation = translations.abilities?.[i] || {};
        return {
          originalName: ability.name,
          czechName: translation.czechName || ability.name,
          originalEffect: ability.effect,
          czechEffect: translation.czechEffect || ability.effect,
          explanation: translation.explanation || "",
        };
      });

      return NextResponse.json({
        attacks: translatedAttacks,
        abilities: translatedAbilities,
      });
    } catch (parseError) {
      console.error("JSON parse error:", parseError, content);
      // Vrátíme fallback místo chyby
      return NextResponse.json({
        attacks: (cardData.attacks || []).map((attack) => ({
          originalName: attack.name,
          czechName: attack.name,
          damage: attack.damage,
          originalEffect: attack.effect,
          czechEffect: attack.effect || "",
          explanation: "",
          cost: attack.cost,
        })),
        abilities: (cardData.abilities || []).map((ability) => ({
          originalName: ability.name,
          czechName: ability.name,
          originalEffect: ability.effect,
          czechEffect: ability.effect,
          explanation: "",
        })),
      });
    }
  } catch (error) {
    console.error("Translate API error:", error);
    return NextResponse.json({
      attacks: [],
      abilities: [],
    });
  }
}
