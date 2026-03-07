// Data z Excel souboru pokemon_karty.xlsx
// Typy: Pokémon, Trenér, Energie

import { PokemonCard } from "@/types/pokemon";

interface ImportedCard {
  name: string;
  type: string;
  hp: number | null;
  attack1: string;
  damage1: string;
  attack2: string;
  damage2: string;
  description: string;
  cardNumber: string;
  rarity: string;
  quantity: number;
  category: "Pokémon" | "Trainer" | "Energy";
}

// Mapování českých typů na anglické
const typeMap: Record<string, string> = {
  "Oheň": "Fire",
  "Voda": "Water",
  "Tráva": "Grass",
  "Elektro": "Lightning",
  "Psycho": "Psychic",
  "Bojová": "Fighting",
  "Temno": "Darkness",
  "Kov": "Metal",
  "Víla": "Fairy",
  "Drak": "Dragon",
  "Normál": "Colorless",
  "Létající": "Colorless",
  "Led": "Water",
  "Kámen": "Fighting",
  "Zemní": "Fighting",
  "Jedová": "Psychic",
  "Brouk": "Grass",
  "Duch": "Psychic",
  "Energie": "Energy",
  "Trenér": "Trainer",
};

// Mapování vzácnosti
const rarityMap: Record<string, string> = {
  "Kolečko": "Common",
  "Kosočtverec": "Uncommon",
  "Hvězdička": "Rare Holo",
  "Dvě hvězdičky": "Rare Holo EX",
};

export const importedCards: ImportedCard[] = [
  { name: "Cinderace", type: "Oheň", hp: 160, attack1: "Explosiveness", damage1: "-", attack2: "Turbo Flare", damage2: "50", description: "Schopnost: Jednou za tah můžeš připojit základní Ohnivou energii z ruky k tomuto Pokémonovi.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Duraludon", type: "Kov", hp: 130, attack1: "Hyper Beam", damage1: "70", attack2: "-", damage2: "-", description: "Odhoď energii z tohoto Pokémona.", cardNumber: "", rarity: "Kolečko", quantity: 2, category: "Pokémon" },
  { name: "Torkoal", type: "Oheň", hp: 130, attack1: "Live Coal", damage1: "20", attack2: "Heat Blast", damage2: "110", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Raboot", type: "Oheň", hp: 100, attack1: "Jumping Kick", damage1: "-", attack2: "Wild Kick", damage2: "70", description: "Jumping Kick: Vyměň tohoto Pokémona za jednoho na lavici.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Darmanitan (Zen Mode)", type: "Oheň", hp: 140, attack1: "Back Draft", damage1: "30+", attack2: "Flamebody Cannon", damage2: "90", description: "Back Draft: +30 poškození za každou základní Ohnivou energii připojenou k soupeřovým Pokémonům.", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Mega Camerupt EX", type: "Oheň", hp: 220, attack1: "Roasting Heat", damage1: "-", attack2: "Volcanic Meteor", damage2: "200", description: "Roasting Heat: Umísti 4 žetony poškození na soupeřovy Pokémony.", cardNumber: "M Camerupt EX", rarity: "Hvězdička", quantity: 2, category: "Pokémon" },
  { name: "Darmanitan", type: "Oheň", hp: 150, attack1: "Blaze Ball", damage1: "40+", attack2: "-", damage2: "-", description: "+40 poškození za každou připojenou Ohnivou energii.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Alakazam", type: "Psycho", hp: 140, attack1: "Psychic Draw", damage1: "-", attack2: "Powerful Hand", damage2: "-", description: "Schopnost: Jednou za tah lízni 1 kartu.", cardNumber: "", rarity: "Hvězdička", quantity: 1, category: "Pokémon" },
  { name: "Abra", type: "Psycho", hp: 50, attack1: "Teleportation Attack", damage1: "10", attack2: "-", damage2: "-", description: "Vyměň tohoto Pokémona za jednoho z lavice.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Kadabra", type: "Psycho", hp: 80, attack1: "Psychic Draw", damage1: "-", attack2: "Super Psy Bolt", damage2: "30", description: "Schopnost: Jednou za tah lízni 2 karty.", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Beldum", type: "Psycho", hp: 60, attack1: "Sbírej sílu", damage1: "-", attack2: "Kovový paprsek", damage2: "30", description: "Základní kovový Pokémon - evolvuje v Metang a pak Metagross.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Zacian", type: "Kov", hp: 130, attack1: "Limit Break", damage1: "50+", attack2: "-", damage2: "-", description: "Pokud má soupeř 3 nebo méně karet odměn, útok dává +90 poškození.", cardNumber: "", rarity: "Hvězdička", quantity: 1, category: "Pokémon" },
  { name: "Brambleghast", type: "Tráva", hp: 100, attack1: "Prison Panic", damage1: "-", attack2: "Psychic Sphere", damage2: "80", description: "Schopnost: Když zahraješ tohoto Pokémona, soupeřův aktivní Pokémon je Zmatený.", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Xerneas", type: "Víla", hp: 120, attack1: "Geo Gate", damage1: "-", attack2: "Bright Horns", damage2: "120", description: "Geo Gate: Vyhledej až 3 základní Pokémony a dej je na lavici.", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Charizard EX", type: "Oheň", hp: 330, attack1: "Infernal Reign", damage1: "-", attack2: "Burning Darkness", damage2: "180+", description: "Schopnost: Když zahraješ tohoto Pokémona, můžeš hledat až 3 základní Ohnivé energie a připojit je.", cardNumber: "125/197", rarity: "Dvě hvězdičky", quantity: 1, category: "Pokémon" },
  { name: "Gholdengo", type: "Kov", hp: 150, attack1: "Vytvoř zlatou minci", damage1: "-", attack2: "Zlatá střela", damage2: "140", description: "Schopnost: Jednou za tah můžeš přidat 1 kovovou energii z ruky.", cardNumber: "", rarity: "Hvězdička", quantity: 1, category: "Pokémon" },
  { name: "Zamazenta V", type: "Kov", hp: 220, attack1: "Kovový dráp", damage1: "30", attack2: "Pomsta", damage2: "120", description: "Pomsta: +30 poškození za každého poraženého Pokémona na tvé lavici.", cardNumber: "Coronet", rarity: "Hvězdička", quantity: 1, category: "Pokémon" },
  { name: "Tinkaton", type: "Víla", hp: 160, attack1: "Kovové bušení", damage1: "30", attack2: "Gigantický kladivo", damage2: "160", description: "Víla/Kov Pokémon s obřím kladivem.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Sableye", type: "Temno", hp: 80, attack1: "Zákeřné drápy", damage1: "20", attack2: "-", damage2: "-", description: "Temný/Duch Pokémon s diamantovýma očima.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Roaring Moon", type: "Temno", hp: 130, attack1: "Starověký obchod", damage1: "100", attack2: "-", damage2: "-", description: "Paradoxní Pokémon - při útoku můžeš odhodit kartu z ruky pro +60 poškození.", cardNumber: "", rarity: "Hvězdička", quantity: 1, category: "Pokémon" },
  { name: "Houndour", type: "Temno", hp: 70, attack1: "Zakousnutí", damage1: "10", attack2: "Plameny", damage2: "20", description: "Temný pes - základní forma Houndoom.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Houndoom", type: "Temno", hp: 120, attack1: "Temný plamen", damage1: "30", attack2: "Pekelný oheň", damage2: "100", description: "Temný/Oheň - pekelný pes se smrtícím ohněm.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Rattata", type: "Temno", hp: 60, attack1: "Tackle", damage1: "10", attack2: "Suffocating Gas", damage2: "20", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Gastly", type: "Psycho", hp: 60, attack1: "Playful Kick", damage1: "30", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Scream Tail", type: "Psycho", hp: 150, attack1: "Sand Flinging", damage1: "-", attack2: "Cutting Wind", damage2: "130", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Haunter", type: "Psycho", hp: 80, attack1: "Spooky Shot", damage1: "-", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Cosmog", type: "Psycho", hp: 60, attack1: "Star Protection", damage1: "-", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Gabite", type: "Drak", hp: 100, attack1: "Gentle Slap", damage1: "-", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Kingambit", type: "Temno", hp: 120, attack1: "-", damage1: "-", attack2: "Pitch-Black Fangs", damage2: "120", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Ambipom", type: "Normál", hp: 110, attack1: "Slap", damage1: "50", attack2: "Dual Tail", damage2: "50", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Umbreon", type: "Temno", hp: 110, attack1: "Feint Attack", damage1: "-", attack2: "Night-Black Blade", damage2: "140", description: "Feint Attack: Útok nelze ovlivnit.", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Morelull", type: "Psycho", hp: 70, attack1: "Spórový prach", damage1: "20", attack2: "-", damage2: "-", description: "Soupeřův aktivní Pokémon usne.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Espeon", type: "Psycho", hp: 110, attack1: "Psychická vazba", damage1: "-", attack2: "Psycho útok", damage2: "60", description: "Schopnost: Podívej se na vrchní kartu soupeřova balíčku.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Yungoos", type: "Normál", hp: 70, attack1: "Collect", damage1: "20", attack2: "Gnaw", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Shroodle", type: "Temno", hp: 60, attack1: "Poison Jab", damage1: "20", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Tatsugiri", type: "Drak", hp: 70, attack1: "Vodní proud", damage1: "50", attack2: "-", damage2: "-", description: "Dračí Pokémon vypadající jako sushi.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Linoone", type: "Normál", hp: 100, attack1: "Excited Dash", damage1: "-", attack2: "Slash", damage2: "70", description: "Schopnost: Když zahraješ tohoto Pokémona, může útočit i tento tah.", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Delibird", type: "Létající", hp: 70, attack1: "Quick Gift", damage1: "-", attack2: "Gentle Slap", damage2: "30", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Bewear", type: "Normál", hp: 130, attack1: "Knuckle Punch", damage1: "50", attack2: "Hyper Lariat", damage2: "100+", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Bramblin", type: "Tráva", hp: 50, attack1: "Trnový útok", damage1: "20", attack2: "-", damage2: "-", description: "Duchový keř - kutálí se po poušti.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Fearow", type: "Létající", hp: 100, attack1: "Repeating Drill", damage1: "30+", attack2: "-", damage2: "-", description: "Hoď mincí dokud nebude panna, +30 za každý líc.", cardNumber: "", rarity: "Kolečko", quantity: 2, category: "Pokémon" },
  { name: "Smeargle", type: "Normál", hp: 80, attack1: "Energizing Sketch", damage1: "-", attack2: "Hook", damage2: "40", description: "Energizing Sketch: Připoj základní energii ze smetiště.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Komala", type: "Normál", hp: 100, attack1: "Slumbering Smack", damage1: "-", attack2: "-", damage2: "-", description: "Tento Pokémon může útočit, i když spí.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Sobble", type: "Voda", hp: 70, attack1: "Úder ocasem", damage1: "10", attack2: "Vodní střela", damage2: "30", description: "Základní vodní Pokémon ze Sword & Shield - plachý ještěr.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Grookey", type: "Tráva", hp: 70, attack1: "Odraz", damage1: "10", attack2: "Úder větví", damage2: "30", description: "Základní travní Pokémon ze Sword & Shield - opičák s tyčkou.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Deoxys V", type: "Psycho", hp: 190, attack1: "Psychický paprsek", damage1: "80", attack2: "Síla mysli", damage2: "120", description: "Legendární Pokémon - DNA z vesmíru.", cardNumber: "", rarity: "Hvězdička", quantity: 1, category: "Pokémon" },
  { name: "Milotic", type: "Voda", hp: 120, attack1: "Vodní proud", damage1: "60", attack2: "Vodopád", damage2: "120", description: "Krásný hadovitý Pokémon - nejkrásnější Pokémon.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Metang", type: "Kov", hp: 100, attack1: "Metal Maker", damage1: "-", attack2: "Beam", damage2: "60", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Cobalion", type: "Kov", hp: 130, attack1: "Kovový meč", damage1: "30", attack2: "Posvátný meč", damage2: "100", description: "Legendární Pokémon - jeden ze tří mušketýrů.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Toxtricity", type: "Elektro", hp: 140, attack1: "Ability", damage1: "-", attack2: "Gentle Slap", damage2: "100", description: "Schopnost aktivní.", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Metagross", type: "Kov", hp: 170, attack1: "Wreck Down", damage1: "60", attack2: "Conjoined Beams", damage2: "180+", description: "", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Turtonator", type: "Oheň", hp: 120, attack1: "Fully Siege", damage1: "-", attack2: "Steamship Stomp", damage2: "100", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Hariyama", type: "Bojová", hp: 150, attack1: "Horse-Ho Catcher", damage1: "-", attack2: "Wild Press", damage2: "210", description: "Schopnost: Vyměň soupeřova aktivního Pokémona za jiného.", cardNumber: "", rarity: "Hvězdička", quantity: 1, category: "Pokémon" },
  { name: "Hippopotas", type: "Zemní", hp: 90, attack1: "Tackle", damage1: "70", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 2, category: "Pokémon" },
  { name: "Garganacel", type: "Kámen", hp: 180, attack1: "Powerful X-Salt", damage1: "-", attack2: "Hammer In", damage2: "130", description: "", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Lunatone", type: "Psycho", hp: 110, attack1: "Lunar Cycle", damage1: "-", attack2: "Power Gem", damage2: "50", description: "Schopnost: Jednou za tah přesuň energii.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Makuhita", type: "Bojová", hp: 80, attack1: "Corkscrew Punch", damage1: "-", attack2: "Confront", damage2: "30", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Great Tusk", type: "Zemní", hp: 140, attack1: "Land Collapse", damage1: "-", attack2: "Great Rush", damage2: "120", description: "", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Regirock", type: "Kámen", hp: 130, attack1: "Ricky Break", damage1: "-", attack2: "Breaching Tomb", damage2: "120", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Tauros", type: "Normál", hp: 130, attack1: "Rapids Charge", damage1: "40+", attack2: "Double-Edge", damage2: "70", description: "", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Nacli", type: "Kámen", hp: 110, attack1: "Rock Hurl", damage1: "50", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 2, category: "Pokémon" },
  { name: "Onix", type: "Kámen", hp: 120, attack1: "Bind", damage1: "30", attack2: "Strength", damage2: "100", description: "Bind: Hoď mincí. Při líci soupeřův Pokémon nemůže příště ustoupit.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Trapinch", type: "Zemní", hp: 60, attack1: "Call for Family", damage1: "-", attack2: "Bite", damage2: "20", description: "Call for Family: Najdi základního Pokémona a dej ho na lavici.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Gliscor", type: "Bojová", hp: 120, attack1: "Poison Ring", damage1: "50", attack2: "-", damage2: "-", description: "Soupeřův aktivní Pokémon je otráven.", cardNumber: "", rarity: "Kosočtverec", quantity: 2, category: "Pokémon" },
  { name: "Gurdurr", type: "Bojová", hp: 180, attack1: "Powerful X-Salt", damage1: "-", attack2: "Hammer In", damage2: "130", description: "", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Pupitar", type: "Kámen", hp: 90, attack1: "Sand Spray", damage1: "20", attack2: "Hammer In", damage2: "60", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Gligar", type: "Zemní", hp: 70, attack1: "Poison Jab", damage1: "10", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 2, category: "Pokémon" },
  { name: "Wigglytuff", type: "Normál", hp: 120, attack1: "Round", damage1: "40+", attack2: "Seismic Toss", damage2: "100", description: "Round: +40 poškození za každého Pokémona s útokem Round na tvé straně.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Solrock", type: "Psycho", hp: 110, attack1: "Cosmic Beam", damage1: "70", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Altaria", type: "Drak", hp: 120, attack1: "Humming Charge", damage1: "-", attack2: "Cotton Wings", damage2: "100", description: "", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Toxicroak", type: "Jedová", hp: 130, attack1: "Reckless Charge", damage1: "70", attack2: "-", damage2: "-", description: "Dává 20 poškození i sobě.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Bronzong", type: "Kov", hp: 140, attack1: "Triple Drop", damage1: "40+", attack2: "Tail Drop", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Eternatus", type: "Temno", hp: 150, attack1: "Dyna-Blast", damage1: "10+", attack2: "World Hyper", damage2: "200", description: "", cardNumber: "", rarity: "Hvězdička", quantity: 1, category: "Pokémon" },
  { name: "Solgaleo", type: "Kov", hp: 170, attack1: "Solar Geyser", damage1: "100", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Solgaleo vzácná", type: "Kov", hp: 170, attack1: "Sluneční gejzír", damage1: "100", attack2: "-", damage2: "-", description: "Vzácná plná umělecká karta.", cardNumber: "", rarity: "Hvězdička", quantity: 1, category: "Pokémon" },
  { name: "Drakloark", type: "Drak", hp: 90, attack1: "Rescue Directive", damage1: "-", attack2: "Dragon Headbutt", damage2: "70", description: "", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Kecleon", type: "Normál", hp: 70, attack1: "Expert Hider", damage1: "-", attack2: "Lick Whip", damage2: "-", description: "Schopnost: Typ tohoto Pokémona se mění podle připojené energie.", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Corviknight", type: "Kov", hp: 170, attack1: "Steel Through", damage1: "50", attack2: "Steel Wing", damage2: "150", description: "", cardNumber: "", rarity: "Kosočtverec", quantity: 1, category: "Pokémon" },
  { name: "Togedemaru EX", type: "Elektro", hp: 190, attack1: "Stun Needle", damage1: "-", attack2: "Spiky Rolling", damage2: "80+", description: "", cardNumber: "", rarity: "Hvězdička", quantity: 1, category: "Pokémon" },
  { name: "Steelix", type: "Kov", hp: 200, attack1: "Welcoming Tail", damage1: "40+", attack2: "X Slash Bash", damage2: "140", description: "", cardNumber: "", rarity: "Hvězdička", quantity: 1, category: "Pokémon" },
  { name: "Togedemaru", type: "Elektro", hp: 80, attack1: "Slash Bash", damage1: "-", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 2, category: "Pokémon" },
  { name: "Dialga", type: "Kov", hp: 130, attack1: "Temporal Backflow", damage1: "60+", attack2: "Metal Blast", damage2: "-", description: "", cardNumber: "", rarity: "Kosočtverec", quantity: 2, category: "Pokémon" },
  { name: "Nymble", type: "Brouk", hp: 50, attack1: "Skok", damage1: "20", attack2: "-", damage2: "-", description: "Malý cvrček - evolvuje v Lokix.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Meowscarada", type: "Tráva", hp: 160, attack1: "Kouzelnické triky", damage1: "-", attack2: "Kvetoucí drápy", damage2: "90", description: "Schopnost: Můžeš vyměnit soupeřova aktivního Pokémona.", cardNumber: "", rarity: "Hvězdička", quantity: 1, category: "Pokémon" },
  { name: "Noivern", type: "Létající", hp: 120, attack1: "Echový útok", damage1: "60", attack2: "Akrobatický útěk", damage2: "120", description: "Létající/Dračí netopýr se silným sonarem.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Sprigatito", type: "Tráva", hp: 70, attack1: "Scratch", damage1: "20", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Ivysaur", type: "Tráva", hp: 110, attack1: "Razor Leaf", damage1: "-", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Lombre", type: "Voda", hp: 100, attack1: "Leaf Flop", damage1: "-", attack2: "Needle Wall", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Buneary", type: "Normál", hp: 80, attack1: "Bun Grass", damage1: "-", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Exeggutor", type: "Tráva", hp: 140, attack1: "Psychický zmatek", damage1: "30", attack2: "Výbuch semen", damage2: "90", description: "Tropický palmový Pokémon s více hlavami.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Piloswine", type: "Led", hp: 100, attack1: "Rising Lunge", damage1: "30+", attack2: "Frost Smash", damage2: "70", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Shuppet", type: "Duch", hp: 60, attack1: "Spooky Shot", damage1: "20", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Tangrowth", type: "Tráva", hp: 150, attack1: "Jungle Whip", damage1: "30", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Gloom", type: "Tráva", hp: 70, attack1: "Bizarre Dunk", damage1: "20", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Scatterbug", type: "Brouk", hp: 50, attack1: "Bud Bite", damage1: "-", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Scyther", type: "Brouk", hp: 120, attack1: "Wing's Combo", damage1: "10+", attack2: "Speed Attack", damage2: "110", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Politoed", type: "Voda", hp: 150, attack1: "Living Stomp", damage1: "60", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Magnezone", type: "Elektro", hp: 160, attack1: "Hyper Spark", damage1: "-", attack2: "Flashing Bolts", damage2: "160", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Frosmoth", type: "Led", hp: 110, attack1: "Chilling Wings", damage1: "-", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Virizion", type: "Tráva", hp: 110, attack1: "Dvojitý kop", damage1: "30", attack2: "Listový čepel", damage2: "90", description: "Legendární travní jelen.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Slowking", type: "Voda", hp: 130, attack1: "Wash the Slate Clean", damage1: "70", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Corvisquire", type: "Létající", hp: 90, attack1: "Speed Dive", damage1: "30", attack2: "Razor Wing", damage2: "80", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Shuckle", type: "Brouk", hp: 80, attack1: "Fermented Juice", damage1: "-", attack2: "Rollout", damage2: "30", description: "Schopnost: Jednou za tah připoj energii.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Finizen", type: "Voda", hp: 70, attack1: "Akrobatický skok", damage1: "20", attack2: "Vodní střela", damage2: "30", description: "Vodní delfín - evolvuje v Palafin.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Genesect", type: "Brouk", hp: 120, attack1: "Bug's Cannon", damage1: "-", attack2: "Speed Attack", damage2: "110", description: "", cardNumber: "", rarity: "Kosočtverec", quantity: 2, category: "Pokémon" },
  { name: "Magnemite", type: "Elektro", hp: 70, attack1: "Roam", damage1: "10", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Tapu Koko", type: "Elektro", hp: 120, attack1: "Summer Lightning", damage1: "90+", attack2: "Prize Count", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Farfetch'd", type: "Normál", hp: 80, attack1: "Pound", damage1: "30", attack2: "Low Kick", damage2: "50", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Rillaboom", type: "Tráva", hp: 120, attack1: "Bubnový rytmus", damage1: "-", attack2: "Dřevěné bušení", damage2: "140", description: "Schopnost: Připoj 2 travní energie z balíčku.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Vileplume", type: "Tráva", hp: 150, attack1: "Pollen Bomb", damage1: "30", attack2: "Lively Flower", damage2: "60+", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  { name: "Clobbopus", type: "Bojová", hp: 70, attack1: "Spike Intrusion", damage1: "30", attack2: "-", damage2: "-", description: "", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Pokémon" },
  // Trenéři
  { name: "Risky Ruins", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Stadion - speciální efekt pro oba hráče.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Trainer" },
  { name: "Area Zero Underdepths", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Stadion - Hráč může vzít Pokémona z discardu do ruky.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Trainer" },
  { name: "Dizzying Valley", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Stadion - efekt na zmatení.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Trainer" },
  { name: "Wally's Compassion", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Supporter - lízni karty.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Trainer" },
  { name: "Acerola's Mischief", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Supporter - vezmi aktivního Pokémona do ruky.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Trainer" },
  { name: "Counter Gain", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Pokud máš více karet odměn než soupeř, útoky stojí méně energie.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Trainer" },
  { name: "Iron Defender", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Sniž poškození o hodnotu.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Trainer" },
  { name: "Ultra Ball", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Odhoď 2 karty, vyhledej Pokémona.", cardNumber: "", rarity: "Kolečko", quantity: 2, category: "Trainer" },
  { name: "Battle Cage", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Stadion - efekt.", cardNumber: "", rarity: "Kolečko", quantity: 2, category: "Trainer" },
  { name: "Dawn", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Supporter - lízni karty, zamíchej.", cardNumber: "", rarity: "Kolečko", quantity: 2, category: "Trainer" },
  { name: "Professor Sada's Vitality", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Supporter - lízni až 2 karty.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Trainer" },
  { name: "Iris's Fighting Spirit", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Supporter - efekt pro bojové Pokémony.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Trainer" },
  { name: "Binding Mochi", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Item - efekt připojení.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Trainer" },
  { name: "Energy Switch", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Přesuň základní energii z jednoho Pokémona na jiného.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Trainer" },
  { name: "Firebreather", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Supporter - efekt pro ohnivé Pokémony.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Trainer" },
  { name: "Super Potion", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Uzdrav 60 poškození z 1 Pokémona, odhoď energii.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Trainer" },
  { name: "Lt. Surge's Bargain", type: "Trenér", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Supporter - speciální efekt pro líznutí karet.", cardNumber: "", rarity: "Kolečko", quantity: 1, category: "Trainer" },
  // Energie
  { name: "Základní energie - Bojová", type: "Energie", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Základní bojová energie", cardNumber: "", rarity: "-", quantity: 2, category: "Energy" },
  { name: "Základní energie - Psycho", type: "Energie", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Základní psycho energie", cardNumber: "", rarity: "-", quantity: 4, category: "Energy" },
  { name: "Základní energie - Elektrická", type: "Energie", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Základní elektrická energie", cardNumber: "", rarity: "-", quantity: 4, category: "Energy" },
  { name: "Základní energie - Ohnivá", type: "Energie", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Základní ohnivá energie", cardNumber: "", rarity: "-", quantity: 4, category: "Energy" },
  { name: "Základní energie - Kovová", type: "Energie", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Základní kovová energie", cardNumber: "", rarity: "-", quantity: 3, category: "Energy" },
  { name: "Základní energie - Vodní", type: "Energie", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Základní vodní energie", cardNumber: "", rarity: "-", quantity: 4, category: "Energy" },
  { name: "Základní energie - Travní", type: "Energie", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Základní travní energie", cardNumber: "", rarity: "-", quantity: 3, category: "Energy" },
  { name: "Základní energie - Temná", type: "Energie", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Základní temná energie", cardNumber: "", rarity: "-", quantity: 1, category: "Energy" },
  { name: "Spiky Energy", type: "Energie", hp: null, attack1: "-", damage1: "-", attack2: "-", damage2: "-", description: "Speciální energie - poskytuje jakoukoliv energii", cardNumber: "", rarity: "-", quantity: 1, category: "Energy" },
];

// Funkce pro konverzi na PokemonCard formát
export function convertToPokemonCard(card: ImportedCard, index: number): PokemonCard {
  const englishType = typeMap[card.type] || "Colorless";

  return {
    id: `custom-${index}-${card.name.replace(/\s+/g, "-").toLowerCase()}`,
    localId: card.cardNumber || `${index}`,
    name: card.name,
    image: undefined, // Nemáme přímé URL obrázků
    category: card.category,
    hp: card.hp || undefined,
    types: englishType !== "Energy" && englishType !== "Trainer" ? [englishType] : undefined,
    stage: undefined,
    evolvesFrom: undefined,
    attacks: card.attack1 && card.attack1 !== "-" ? [
      {
        name: card.attack1,
        damage: card.damage1 !== "-" ? card.damage1 : undefined,
        effect: card.description || undefined,
        cost: [],
      },
      ...(card.attack2 && card.attack2 !== "-" ? [{
        name: card.attack2,
        damage: card.damage2 !== "-" ? card.damage2 : undefined,
        effect: undefined,
        cost: [],
      }] : []),
    ] : undefined,
    abilities: undefined,
    weaknesses: undefined,
    resistances: undefined,
    retreat: undefined,
    rarity: rarityMap[card.rarity] || card.rarity,
    illustrator: undefined,
    description: card.description || undefined,
    set: {
      id: "custom-collection",
      name: "Kubíkova sbírka",
      logo: undefined,
      cardCount: { total: importedCards.length, official: importedCards.length },
    },
  };
}

// Export všech karet jako PokemonCard
export function getAllImportedCards(): { card: PokemonCard; quantity: number }[] {
  return importedCards.map((card, index) => ({
    card: convertToPokemonCard(card, index),
    quantity: card.quantity,
  }));
}
