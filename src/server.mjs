import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./db.js";
import chromaService from "./services/chromadb.service.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to your main database
    console.log("🔗 Connecting to database...");
    await connectDB();
    console.log("✅ Database connected successfully!");

    // Initialize ChromaDB service
    console.log("⏳ Initializing ChromaDB service...");
    await chromaService.initialize();
    console.log("✅ ChromaDB service initialized!");

    // Define routes
    app.get("/", (req, res) => {
      res.json({
        message: "Server is running!",
        timestamp: new Date().toISOString(),
        services: {
          database: "Connected",
          chromadb: "Running",
          server: `http://localhost:${PORT}`,
        },
      });
    });

    // ChromaDB health check route
    app.get("/health/chromadb", async (req, res) => {
      try {
        const health = await chromaService.healthCheck();
        const serverInfo = chromaService.getServerInfo();

        res.json({
          ...health,
          ...serverInfo,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
      console.log(
        `📊 ChromaDB running at http://localhost:${
          process.env.CHROMA_PORT || 8000
        }`
      );
      console.log(`🔍 Health check: http://localhost:${PORT}/health/chromadb`);
      console.log("\n🎉 All services started successfully!");
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

      try {
        console.log("⏳ Stopping ChromaDB service...");
        await chromaService.stopServer();
        console.log("✅ ChromaDB service stopped");
      } catch (error) {
        console.error("❌ Error stopping ChromaDB service:", error.message);
      }

      process.exit(0);
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ Lỗi khi chạy server:", error.message);

    // Provide helpful error messages
    if (error.message.includes("ChromaDB server failed to start")) {
      console.log("\n💡 Troubleshooting ChromaDB:");
      console.log("   1. Kiểm tra Python: python --version");
      console.log("   2. Cài đặt ChromaDB: pip install chromadb");
      console.log(
        "   3. Hoặc dùng Docker: docker run -p 8000:8000 chromadb/chroma"
      );
    }

    if (
      error.message.includes("database") ||
      error.message.includes("connect")
    ) {
      console.log("\n💡 Troubleshooting Database:");
      console.log("   1. Kiểm tra database connection string");
      console.log("   2. Đảm bảo database server đang chạy");
    }

    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start the server
startServer();
