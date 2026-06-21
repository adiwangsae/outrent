import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import apiRouter from "./server/api.js";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
import prisma from "./server/prisma.js";
import { seedOnStartup } from "./server/startup-seeder.js";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  console.log(`Starting Express app on Port ${PORT} with PID ${process.pid}`);

  (async () => {
    try {
      console.log("[Server] Synchronizing local SQLite database...");
      await execAsync("npx prisma db push --skip-generate");
      await prisma.$connect();
      await seedOnStartup(prisma);
      console.log("[Server] Database ready.");
    } catch (e: any) {
      console.error("[Server] Startup Error:", e.message);
    }
  })();

  // 1. Perbaikan CORS: Mengizinkan domain ngrok secara dinamis
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || origin.includes('localhost') || origin.endsWith('.ngrok-free.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
  
  app.use(express.json());
  
  // Serve uploads
  const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  app.use('/uploads', express.static(uploadDir));

  // Mount API
  app.use('/api', apiRouter);

  // 2. Perbaikan Vite Middleware: Catch-all agar tidak putih
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Mounting Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Listening successfully on http://0.0.0.0:${PORT}`);
  });
}

startServer();