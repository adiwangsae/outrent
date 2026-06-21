import { Router } from "express";
import prisma from "./prisma.js";
import authRoutes from "./routes/auth.js";
import inventoryRoutes from "./routes/inventory.js";
import bookingRoutes from "./routes/bookings.js";
import adminRoutes from "./routes/admin.js";
import uploadRoutes from "./routes/upload.js";
import { resetDemoDatabase } from "./db-reseeder.js";

const apiRouter = Router();

apiRouter.post("/sync/reset", async (req, res, next) => {
  try {
    await resetDemoDatabase();
    res.json({ success: true, message: "Database demo berhasil diatur ulang!" });
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/health", async (req, res) => {
  try {
    // Simple query to verify database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: "ok", 
      message: "API running and Database connected",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(503).json({ 
      status: "error", 
      message: "API running but Database disconnected",
      error: error.message
    });
  }
});

apiRouter.use("/auth", authRoutes);
apiRouter.use("/inventory", inventoryRoutes);
apiRouter.use("/bookings", bookingRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/upload", uploadRoutes);

// Global unified error handler
apiRouter.use((err: any, req: any, res: any, next: any) => {
  console.error("[Global API Error]", err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    error: err.message || "Internal server error"
  });
});

export default apiRouter;
