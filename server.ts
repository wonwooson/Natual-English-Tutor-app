import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient, User } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase initialization with crash-prevention
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";

const isValidUrl = (url: string) => {
  try {
    return url.startsWith('http') && new URL(url);
  } catch {
    return false;
  }
};

let supabase: any;

if (!isValidUrl(supabaseUrl) || !supabaseKey || supabaseUrl.includes("YOUR_SUPABASE")) {
  console.warn("⚠️  Supabase environment variables are NOT correctly configured.");
  console.warn("Backend storage (Supabase) will be disabled. App will only use local storage.");
  // Create a dummy client that returns errors instead of crashing
  supabase = {
    from: () => ({
      select: () => ({ eq: () => Promise.resolve({ data: [], error: { message: "Supabase not configured" } }) }),
      upsert: () => Promise.resolve({ error: { message: "Supabase not configured" } }),
      delete: () => ({ eq: () => Promise.resolve({ error: { message: "Supabase not configured" } }) }),
      single: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } })
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: { message: "Supabase not configured" } })
    }
  };
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Supabase client initialized.");
  } catch (err) {
    console.error("❌ Failed to initialize Supabase client:", err);
    // Fallback to dummy
    supabase = { from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: [] }) }), upsert: () => Promise.resolve({}), delete: () => ({ eq: () => Promise.resolve({}) }) }), auth: { getUser: () => Promise.resolve({ data: { user: null } }) } };
  }
}

interface AuthRequest extends Request {
  user?: User;
}

// Auth Middleware: Verify user token and attach user to request
const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  // If supabase is not configured, we might want to bypass auth in dev, 
  // but for now let's just fail gracefully.
  if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      // If we are in local dev with no supabase, maybe we use a guest user?
      // For now, keep strict for security.
      throw error || new Error("Invalid user");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Unauthorized: Invalid token or Supabase not configured" });
  }
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Routes (Protected)
  app.get("/api/data", authenticateUser as any, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user.id;

      // Fetch each independently and safely
      const fetchTable = async (table: string) => {
        const { data, error } = await supabase.from(table).select("data").eq("user_id", userId);
        if (error) {
          console.error(`Error fetching ${table}:`, error);
          return [];
        }
        // If multiple rows exist for some reason, take the newest (upsert should prevent this, but let's be safe)
        return data && data.length > 0 ? data[data.length - 1].data : [];
      };

      const [collection, practices, qaHistory] = await Promise.all([
        fetchTable("collection"),
        fetchTable("practices"),
        fetchTable("qa_history")
      ]);

      res.json({
        collection,
        practices,
        qaHistory
      });
    } catch (error) {
      console.error("Fetch error:", error);
      res.json({ collection: [], practices: [], qaHistory: [] });
    }
  });

  app.post("/api/save", authenticateUser as any, async (req: AuthRequest, res: Response) => {
    const { type, data } = req.body;
    const userId = req.user.id;
    try {
      const { error } = await supabase
        .from(type)
        .upsert({ user_id: userId, data: data }, { onConflict: 'user_id' });

      if (error) {
        // If it's a configuration error, don't return 500
        if (error.message?.includes("not configured")) {
          return res.json({ success: false, warning: "Supabase not configured, data saved locally only." });
        }
        throw error;
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Save error:", error);
      // Still return 200 to keep the frontend happy, but log the error
      res.json({ success: false, error: "Failed to save to cloud" });
    }
  });

  app.post("/api/reset", authenticateUser as any, async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    try {
      await supabase.from("collection").delete().eq("user_id", userId);
      await supabase.from("practices").delete().eq("user_id", userId);
      await supabase.from("qa_history").delete().eq("user_id", userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Reset error:", error);
      res.status(500).json({ error: "Failed to reset data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist in production
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
