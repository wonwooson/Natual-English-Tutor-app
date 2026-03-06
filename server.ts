import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase initialization
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/data", async (req, res) => {
    try {
      const { data: collection } = await supabase.from("collection").select("data").eq("id", "main").single();
      const { data: practices } = await supabase.from("practices").select("data").eq("id", "main").single();
      const { data: qaHistory } = await supabase.from("qa_history").select("data").eq("id", "main").single();

      res.json({
        collection: collection ? collection.data : [],
        practices: practices ? practices.data : [],
        qaHistory: qaHistory ? qaHistory.data : []
      });
    } catch (error) {
      console.error("Fetch error:", error);
      // If table is empty or doesn't exist yet, return empty arrays
      res.json({ collection: [], practices: [], qaHistory: [] });
    }
  });

  app.post("/api/save", async (req, res) => {
    const { type, data } = req.body;
    try {
      const { error } = await supabase
        .from(type)
        .upsert({ id: "main", data: data });

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error("Save error:", error);
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  app.post("/api/reset", async (req, res) => {
    try {
      await supabase.from("collection").delete().eq("id", "main");
      await supabase.from("practices").delete().eq("id", "main");
      await supabase.from("qa_history").delete().eq("id", "main");
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
