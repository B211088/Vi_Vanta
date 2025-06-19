import dotenv from "dotenv";
dotenv.config();

import { spawn } from "child_process";
import { ChromaClient } from "chromadb";

class ChromaService {
  constructor() {
    this.client = null;
    this.serverProcess = null;
    this.isServerRunning = false;
    this.host = process.env.CHROMA_HOST || "localhost";
    this.port = parseInt(process.env.CHROMA_PORT) || 8000;
  }

  /**
   * Khởi chạy ChromaDB server
   */
  async startServer() {
    return new Promise((resolve, reject) => {
      try {
        console.log(
          `🚀 Starting ChromaDB server on ${this.host}:${this.port}...`
        );

        // Set environment variables for ChromaDB
        const env = {
          ...process.env,
          CHROMA_SERVER_CORS_ALLOW_ORIGINS:
            process.env.CHROMA_CORS_ORIGINS || "*",
        };

        // Spawn ChromaDB server process
        this.serverProcess = spawn(
          "chroma",
          [
            "run",
            "--host",
            this.host,
            "--port",
            this.port.toString(),
            "--path",
            process.env.CHROMA_DATA_PATH || "./chroma_data",
          ],
          {
            env: env,
            stdio: ["pipe", "pipe", "pipe"],
          }
        );

        // Handle server stdout
        this.serverProcess.stdout.on("data", (data) => {
          const output = data.toString();
          console.log(`📊 ChromaDB: ${output.trim()}`);

          // Check if server is ready
          if (
            output.includes("running on") ||
            output.includes("Started server") ||
            output.includes("Uvicorn running")
          ) {
            this.isServerRunning = true;
            console.log("✅ ChromaDB server is ready!");
            resolve();
          }
        });

        // Handle server stderr
        this.serverProcess.stderr.on("data", (data) => {
          const error = data.toString();
          if (!error.includes("WARNING")) {
            console.error(`❌ ChromaDB Error: ${error.trim()}`);
          }
        });

        // Handle server close
        this.serverProcess.on("close", (code) => {
          console.log(`🔴 ChromaDB server exited with code ${code}`);
          this.isServerRunning = false;
        });

        // Handle server error
        this.serverProcess.on("error", (error) => {
          console.error("❌ Failed to start ChromaDB server:", error.message);
          reject(error);
        });

        // Timeout after 15 seconds
        setTimeout(() => {
          if (!this.isServerRunning) {
            reject(
              new Error(
                "ChromaDB server failed to start within 15 seconds. Make sure you have installed ChromaDB: pip install chromadb"
              )
            );
          }
        }, 15000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Khởi tạo client connection
   */
  async initClient() {
    try {
      console.log("🔌 Connecting to ChromaDB...");

      this.client = new ChromaClient({
        path: `http://${this.host}:${this.port}`,
      });

      // Test connection with retry logic
      let retries = 5;
      while (retries > 0) {
        try {
          await this.client.heartbeat();
          console.log("✅ ChromaDB client connected successfully!");
          return this.client;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          console.log(`⏳ Retrying connection... (${5 - retries}/5)`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    } catch (error) {
      console.error("❌ Failed to connect to ChromaDB:", error.message);
      throw error;
    }
  }

  /**
   * Khởi chạy đầy đủ service (server + client)
   */
  async initialize() {
    try {
      // Try to connect to existing server first
      try {
        await this.initClient();
        console.log("📍 Connected to existing ChromaDB server");
        return this.client;
      } catch (error) {
        console.log("🔄 No existing server found, starting new one...");
      }

      // Start new server
      await this.startServer();

      // Wait for server to be fully ready
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Connect client
      await this.initClient();

      return this.client;
    } catch (error) {
      console.error("❌ Failed to initialize ChromaDB service:", error.message);
      throw error;
    }
  }

  /**
   * Dừng ChromaDB server
   */
  async stopServer() {
    return new Promise((resolve) => {
      if (this.serverProcess && this.isServerRunning) {
        console.log("🛑 Stopping ChromaDB server...");

        this.serverProcess.on("close", () => {
          console.log("✅ ChromaDB server stopped");
          resolve();
        });

        this.serverProcess.kill("SIGTERM");

        // Force kill after 5 seconds
        setTimeout(() => {
          if (this.serverProcess) {
            this.serverProcess.kill("SIGKILL");
            resolve();
          }
        }, 5000);
      } else {
        resolve();
      }

      this.serverProcess = null;
      this.isServerRunning = false;
    });
  }

  /**
   * Lấy client instance
   */
  getClient() {
    if (!this.client) {
      throw new Error(
        "ChromaDB client not initialized. Call initialize() first."
      );
    }
    return this.client;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.client)
        return { status: "disconnected", message: "Client not initialized" };

      const start = Date.now();
      await this.client.heartbeat();
      const responseTime = Date.now() - start;

      return {
        status: "healthy",
        responseTime: `${responseTime}ms`,
        server: `${this.host}:${this.port}`,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
      };
    }
  }

  /**
   * Get server info
   */
  getServerInfo() {
    return {
      host: this.host,
      port: this.port,
      isRunning: this.isServerRunning,
      hasClient: !!this.client,
    };
  }

  /**
   * Delete collection
   */
  async deleteCollection(name) {
    try {
      const client = this.getClient();
      await client.deleteCollection({ name });
      console.log(`Collection ${name} deleted successfully`);
      return true;
    } catch (error) {
      if (error.message.includes("does not exist")) {
        console.log(`Collection ${name} does not exist, skipping deletion`);
        return true;
      }
      throw new Error(`Failed to delete collection: ${error.message}`);
    }
  }

  /**
   * Check if collection exists
   */
  async collectionExists(name) {
    try {
      const client = this.getClient();
      const collections = await client.listCollections();
      return collections.some((col) => col.name === name);
    } catch (error) {
      console.error(`Error checking collection: ${error.message}`);
      return false;
    }
  }

  /**
   * Get collection info including dimension
   */
  async getCollectionInfo(name) {
    try {
      const client = this.getClient();
      const collection = await client.getCollection({ name });
      return collection;
    } catch (error) {
      console.error(`Error getting collection info: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete all collections
   */
  async deleteAllCollections() {
    try {
      const client = this.getClient();
      const collections = await client.listCollections();
      for (const collection of collections) {
        await this.deleteCollection(collection.name);
      }
      console.log("🗑️ All collections deleted");
      return true;
    } catch (error) {
      console.error("❌ Error deleting all collections:", error);
      throw error;
    }
  }

  /**
   * Get or create collection with correct settings - FIXED VERSION
   */
  async getOrCreateCollection(name, metadata = {}) {
    try {
      const client = this.getClient();

      // Always delete existing collection to ensure clean state
      try {
        await this.deleteCollection(name);
        console.log(`🗑️ Deleted existing collection: ${name}`);
      } catch (error) {
        console.log("No existing collection to delete");
      }

      // Create new collection with explicit dimension
      const collection = await client.createCollection({
        name,
        metadata: {
          ...metadata,
          "hnsw:space": "cosine",
          dimension: 1536, // OpenAI text-embedding-3-small dimension
        },
      });

      // Verify dimension
      const collectionInfo = await this.getCollectionInfo(name);
      if (collectionInfo?.metadata?.dimension !== 1536) {
        throw new Error(
          `Collection created with wrong dimension: ${collectionInfo?.metadata?.dimension}`
        );
      }

      console.log(`✅ Created collection: ${name} with dimension 1536`);
      return collection;
    } catch (error) {
      throw new Error(`Failed to create collection: ${error.message}`);
    }
  }

  /**
   * Tạo collection
   */
  async createCollection(name, metadata = {}) {
    try {
      const client = this.getClient();
      const collection = await client.createCollection({
        name,
        metadata: {
          ...metadata,
          "hnsw:space": "cosine",
          dimension: 1536,
        },
      });
      return collection;
    } catch (error) {
      throw new Error(`Failed to create collection: ${error.message}`);
    }
  }

  /**
   * Lấy collection
   */
  async getCollection(name) {
    try {
      const client = this.getClient();
      const collection = await client.getCollection({ name });
      return collection;
    } catch (error) {
      throw new Error(`Failed to get collection: ${error.message}`);
    }
  }

  /**
   * Thêm documents vào collection with embeddings
   */
  async addDocuments(
    collectionName,
    documents,
    metadatas = [],
    ids = [],
    embeddings = []
  ) {
    try {
      const collection = await this.getCollection(collectionName);

      // Generate IDs if not provided
      const finalIds =
        ids.length > 0
          ? ids
          : documents.map((_, index) => `doc_${Date.now()}_${index}`);

      const addParams = {
        documents,
        metadatas: metadatas.length > 0 ? metadatas : undefined,
        ids: finalIds,
      };

      // Add embeddings if provided
      if (embeddings && embeddings.length > 0) {
        addParams.embeddings = embeddings;
      }

      await collection.add(addParams);

      return { success: true, addedCount: documents.length, ids: finalIds };
    } catch (error) {
      throw new Error(`Failed to add documents: ${error.message}`);
    }
  }

  /**
   * Query documents
   */
  async queryDocuments(
    collectionName,
    queryTexts,
    nResults = 10,
    where = {},
    queryEmbeddings = null
  ) {
    try {
      const collection = await this.getCollection(collectionName);

      const queryParams = {
        nResults,
        where: Object.keys(where).length > 0 ? where : undefined,
        include: ["documents", "metadatas", "distances"],
      };

      // Add queryEmbeddings or queryTexts to params
      if (queryEmbeddings && queryEmbeddings.length > 0) {
        queryParams.queryEmbeddings = queryEmbeddings;
      } else if (queryTexts) {
        queryParams.queryTexts = Array.isArray(queryTexts)
          ? queryTexts
          : [queryTexts];
      } else {
        throw new Error(
          "At least one of 'queryEmbeddings' or 'queryTexts' must be provided"
        );
      }

      const results = await collection.query(queryParams);
      return results;
    } catch (error) {
      throw new Error(`Failed to query documents: ${error.message}`);
    }
  }

  /**
   * Delete documents by IDs
   */
  async deleteDocuments(collectionName, ids) {
    try {
      const collection = await this.getCollection(collectionName);
      await collection.delete({ ids });
      return { success: true, deletedCount: ids.length };
    } catch (error) {
      throw new Error(`Failed to delete documents: ${error.message}`);
    }
  }

  /**
   * Delete documents by where filter
   */
  async deleteDocumentsByFilter(collectionName, where) {
    try {
      const collection = await this.getCollection(collectionName);
      await collection.delete({ where });
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete documents by filter: ${error.message}`);
    }
  }

  /**
   * Get collection stats
   */
  async getCollectionStats(collectionName) {
    try {
      const collection = await this.getCollection(collectionName);
      const count = await collection.count();
      return {
        name: collectionName,
        count: count,
        metadata: collection.metadata || {},
      };
    } catch (error) {
      throw new Error(`Failed to get collection stats: ${error.message}`);
    }
  }

  /**
   * List all documents in collection
   */
  async listAllDocuments(collectionName, limit = 100) {
    try {
      const collection = await this.getCollection(collectionName);
      const results = await collection.get({
        limit: limit,
        include: ["documents", "metadatas"],
      });

      return {
        documents: results.documents,
        metadatas: results.metadatas,
        ids: results.ids,
        total: results.documents.length,
      };
    } catch (error) {
      throw new Error(`Failed to list documents: ${error.message}`);
    }
  }
}

// Export singleton instance
export default new ChromaService();
