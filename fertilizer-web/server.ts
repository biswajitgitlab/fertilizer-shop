import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// --- API ENDPOINTS ---
// All API requests should be handled by the Laravel backend.
// In development, Vite automatically proxies /api to http://localhost:8000
// In production, configure your web server (Nginx/Apache) to route /api to Laravel.

// Serve Vite in dev / static in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Frontend Server listening on port ${PORT}`);
    console.log(`NOTE: Make sure your Laravel backend is running for /api requests.`);
  });
}

startServer();
