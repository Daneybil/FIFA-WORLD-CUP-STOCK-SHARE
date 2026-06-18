import express from "express";
import path from "path";
import dns from "dns";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Set DNS order to prefer IPv4 for consistent local and container networking
dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const app = express();
const PORT = 3000;

// The Football-Data.org API Token (Server-only secret, never exposed to user browser)
const API_TOKEN = process.env.FOOTBALL_DATA_API_TOKEN || "81091c3dff0e4554919567ed8c2fe40c";

// Simple robust in-memory caching mechanism
// Football-Data.org free tier allows only 10 requests per minute.
// We cache the responses for 10 minutes (600,000 ms) to keep API rate-limit flawless.
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes cache

// Helper function to fetch from Football-Data.org API
async function fetchFromFootballData(path: string) {
  const url = `https://api.football-data.org/${path}`;
  console.log(`[Football-Data API] Sending request to: ${url}`);
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Auth-Token": API_TOKEN,
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`External API responded with status ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Caching Proxy Fetcher
async function getCachedFootballData(cacheKey: string, apiPath: string) {
  const now = Date.now();
  const cachedVal = cache[cacheKey];

  if (cachedVal && (now - cachedVal.timestamp < CACHE_DURATION_MS)) {
    console.log(`[Cache Hit] Serving stale data for key: ${cacheKey}`);
    return cachedVal.data;
  }

  try {
    const freshData = await fetchFromFootballData(apiPath);
    cache[cacheKey] = {
      data: freshData,
      timestamp: now
    };
    return freshData;
  } catch (error: any) {
    console.error(`[API Error] Failed to fetch ${apiPath} from external network:`, error.message);
    if (cache[cacheKey]) {
      console.warn(`[API Fallback] Returning expired cache for key: ${cacheKey}`);
      return cache[cacheKey].data;
    }
    throw error;
  }
}

// ========================================== PROXIED API ENDPOINTS

// 1. Teams endpoint: /api/football/teams
app.get("/api/football/teams", async (req, res) => {
  try {
    const data = await getCachedFootballData("teams", "v4/competitions/WC/teams");
    res.json(data);
  } catch (error: any) {
    res.status(502).json({
      error: "Failed to fetch World Cup teams from official API.",
      details: error.message
    });
  }
});

// 2. Standings endpoint: /api/football/standings
app.get("/api/football/standings", async (req, res) => {
  try {
    const data = await getCachedFootballData("standings", "v4/competitions/WC/standings");
    res.json(data);
  } catch (error: any) {
    res.status(502).json({
      error: "Failed to fetch World Cup standings from official API.",
      details: error.message
    });
  }
});

// 3. Matches endpoint: /api/football/matches
app.get("/api/football/matches", async (req, res) => {
  try {
    const data = await getCachedFootballData("matches", "v4/competitions/WC/matches");
    res.json(data);
  } catch (error: any) {
    res.status(502).json({
      error: "Failed to fetch World Cup matches from official API.",
      details: error.message
    });
  }
});

// ========================================== VITE DEVELOPEMENT OR STATIC PRODUCTION MIDDLEWARE

async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode: mount Vite dev server as middleware
    console.log("[Server] Launching in Development mode with active Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve statically built web folder
    console.log("[Server] Launching in Production mode. Serving static index assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server Ready] Listening at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
