import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Types
interface Player {
  id: string;
  name: string;
  pin: string;
  createdAt: string;
  avatarColor: string;
}

interface PlayerData {
  items: unknown[];
  favorites: unknown[];
}

interface StoredData {
  players: Player[];
  playerData: Record<string, PlayerData>;
}

// Initialize Redis - will use UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
const getRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
};

const STORAGE_KEY = "pokemon-collection-shared";

// GET - Get all players and their data
export async function GET() {
  try {
    const redis = getRedis();

    if (!redis) {
      return NextResponse.json(
        { error: "Redis not configured", players: [], playerData: {} },
        { status: 200 }
      );
    }

    const data = await redis.get<StoredData>(STORAGE_KEY);

    if (!data) {
      return NextResponse.json({ players: [], playerData: {} });
    }

    // Return players without PINs for security (PINs only for login verification)
    const playersWithoutPins = data.players.map(({ pin, ...player }) => player);

    return NextResponse.json({
      players: playersWithoutPins,
      playerData: data.playerData,
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players", players: [], playerData: {} },
      { status: 500 }
    );
  }
}

// POST - Create new player or verify PIN
export async function POST(request: NextRequest) {
  try {
    const redis = getRedis();

    if (!redis) {
      return NextResponse.json(
        { error: "Redis not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { action, playerId, name, pin } = body;

    const data = await redis.get<StoredData>(STORAGE_KEY) || {
      players: [],
      playerData: {},
    };

    // Verify PIN for login
    if (action === "verify") {
      const player = data.players.find((p) => p.id === playerId);
      if (!player) {
        return NextResponse.json({ success: false, error: "Player not found" });
      }
      const isValid = player.pin === pin;
      return NextResponse.json({ success: isValid });
    }

    // Create new player
    if (action === "create") {
      if (!name || !pin) {
        return NextResponse.json(
          { error: "Name and PIN required" },
          { status: 400 }
        );
      }

      const AVATAR_COLORS = [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
        "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
        "#BB8FCE", "#85C1E9", "#F8B500", "#00CED1"
      ];

      const newPlayer: Player = {
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        name,
        pin,
        createdAt: new Date().toISOString(),
        avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      };

      data.players.push(newPlayer);
      data.playerData[newPlayer.id] = { items: [], favorites: [] };

      await redis.set(STORAGE_KEY, data);

      // Return player without PIN
      const { pin: _, ...playerWithoutPin } = newPlayer;
      return NextResponse.json({ success: true, player: playerWithoutPin });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in POST /api/players:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update player data (collection, favorites)
export async function PATCH(request: NextRequest) {
  try {
    const redis = getRedis();

    if (!redis) {
      return NextResponse.json(
        { error: "Redis not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { playerId, items, favorites } = body;

    if (!playerId) {
      return NextResponse.json(
        { error: "Player ID required" },
        { status: 400 }
      );
    }

    const data = await redis.get<StoredData>(STORAGE_KEY);

    if (!data) {
      return NextResponse.json(
        { error: "No data found" },
        { status: 404 }
      );
    }

    const player = data.players.find((p) => p.id === playerId);
    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    // Update player data
    data.playerData[playerId] = {
      items: items ?? data.playerData[playerId]?.items ?? [],
      favorites: favorites ?? data.playerData[playerId]?.favorites ?? [],
    };

    await redis.set(STORAGE_KEY, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /api/players:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
