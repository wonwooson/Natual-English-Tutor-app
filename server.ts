import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient, User } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase initialization
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface AuthRequest extends Request {
  user?: User;
}

// Auth Middleware: Verify user token and attach user to request
const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) throw error || new Error("Invalid user");
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
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
      const { data: collection } = await supabase.from("collection").select("data").eq("user_id", userId).single();
      const { data: practices } = await supabase.from("practices").select("data").eq("user_id", userId).single();
      const { data: qaHistory } = await supabase.from("qa_history").select("data").eq("user_id", userId).single();

      res.json({
        collection: collection ? collection.data : [],
        practices: practices ? practices.data : [],
        qaHistory: qaHistory ? qaHistory.data : []
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

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error("Save error:", error);
      res.status(500).json({ error: "Failed to save data" });
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
