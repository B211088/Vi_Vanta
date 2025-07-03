import fs from "fs";
import path from "path";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import dotenv from "dotenv";
import OpenAI from "openai";
import {
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_MODEL,
} from "../config/openai.config.js";
import chromaService from "./chromadb.service.js";
dotenv.config();

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export class EmbedService {
  async loadFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const ext = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath);

      switch (ext) {
        case ".pdf":
          const pdfLoader = new PDFLoader(filePath);
          return await pdfLoader.load();

        case ".txt":
          const content = fs.readFileSync(filePath, "utf-8");
          return [
            {
              pageContent: content,
              metadata: {
                source: filePath,
                fileName: fileName,
                type: "text",
                createdAt: new Date().toISOString(),
              },
            },
          ];

        case ".md":
          const mdContent = fs.readFileSync(filePath, "utf-8");
          return [
            {
              pageContent: mdContent,
              metadata: {
                source: filePath,
                fileName: fileName,
                type: "markdown",
                createdAt: new Date().toISOString(),
              },
            },
          ];

        case ".json":
          const jsonContent = fs.readFileSync(filePath, "utf-8");
          const jsonData = JSON.parse(jsonContent);
          return [
            {
              pageContent: JSON.stringify(jsonData, null, 2),
              metadata: {
                source: filePath,
                fileName: fileName,
                type: "json",
                createdAt: new Date().toISOString(),
              },
            },
          ];

        default:
          throw new Error(`Unsupported file type: ${ext}`);
      }
    } catch (error) {
      console.error(`Error loading file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Split documents into chunks with sanitized metadata
   */
  chunkTextDocs(docs, chunkSize = 1000, chunkOverlap = 200) {
    const allChunks = [];

    for (const doc of docs) {
      const text = doc.pageContent;
      const chunks = this.splitTextIntoChunks(text, chunkSize, chunkOverlap);

      chunks.forEach((chunk, index) => {
        if (chunk.trim().length > 0) {
          // Sanitize metadata - keep only simple values
          const sanitizedMetadata = {
            source: doc.metadata.source || "",
            page: doc.metadata.page || 0,
            chunkIndex: index,
            chunkId: `${doc.metadata.source || ""}_${index}`,
            createdAt: new Date().toISOString(),
          };

          allChunks.push({
            content: chunk,
            metadata: sanitizedMetadata,
          });
        }
      });
    }

    return allChunks;
  }

  /**
   * Split text into chunks with smart splitting
   */
  splitTextIntoChunks(text, chunkSize = 2000, chunkOverlap = 200) {
    const chunks = [];
    const separators = ["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " "];

    if (text.length <= chunkSize) {
      return [text];
    }

    let start = 0;

    while (start < text.length) {
      let end = start + chunkSize;

      if (end >= text.length) {
        chunks.push(text.slice(start));
        break;
      }

      let bestBreakPoint = end;
      for (const separator of separators) {
        const lastIndex = text.lastIndexOf(separator, end);
        if (lastIndex > start && lastIndex < end) {
          bestBreakPoint = lastIndex + separator.length;
          break;
        }
      }

      chunks.push(text.slice(start, bestBreakPoint));
      start = bestBreakPoint - chunkOverlap;
      if (start < 0) start = 0;
    }

    return chunks;
  }

  /**
   * Generate embedding for a single chunk using OpenAI
   */
  async embedChunk(chunk) {
    try {
      const response = await openai.embeddings.create({
        model: OPENAI_EMBEDDING_MODEL,
        input: chunk.content,
      });
      return {
        ...chunk,
        embedding: response.data[0].embedding,
      };
    } catch (error) {
      console.error("Error embedding chunk with OpenAI:", error.message);
      throw error;
    }
  }

  /**
   * Process chunks in batches with OpenAI
   */
  async embedChunksBatch(chunks, batchSize = 3) {
    const embedded = [];
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map((chunk) => this.embedChunk(chunk))
      );
      embedded.push(...batchResults);

      // Rate limiting - wait 1 second between batches
      if (i + batchSize < chunks.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    return embedded;
  }

  /**
   * Index a file into the vector database - IMPROVED VERSION
   */
  async indexFile(id, filePath, fileName, collectionName, owner, source = "") {
    try {
      console.log(`🚀 Starting indexing for file: ${filePath}`);

      const rawDocs = await this.loadFile(filePath);
      console.log(`📄 Loaded ${rawDocs.length} ${collectionName}`);

      const chunks = this.chunkTextDocs(rawDocs);
      console.log(`✂️ Created ${chunks.length} chunks`);

      const embedded = await this.embedChunksBatch(chunks);
      console.log(`🔢 Generated embeddings for ${embedded.length} chunks`);

      // Get or create collection (won't delete other documents)
      await chromaService.getOrCreateCollection(collectionName, {
        description: `Document embeddings collection`,
      });

      // Prepare metadata - ensure all values are simple types
      const sanitizedMetadata = embedded.map((c) => {
        const metadata = {
          ...c.metadata,
          documentId: id,
          fileName,
          owner,
          source,
          fileType: path.extname(filePath).toLowerCase(),
          chunkIndex: c.metadata.chunkIndex || 0,
          indexedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        // Convert any complex objects to strings
        Object.keys(metadata).forEach((key) => {
          if (typeof metadata[key] === "object" && metadata[key] !== null) {
            metadata[key] = JSON.stringify(metadata[key]);
          }
        });

        // Remove any undefined or null values
        Object.keys(metadata).forEach((key) => {
          if (metadata[key] === undefined || metadata[key] === null) {
            delete metadata[key];
          }
        });

        return metadata;
      });

      // Add new chunks for this document
      const documents = await chromaService.addDocuments(
        collectionName,
        embedded.map((c) => c.content),
        sanitizedMetadata,
        embedded.map((_, i) => `${id}_chunk_${i}`),
        embedded.map((c) => c.embedding)
      );
      console.log({ documents });

      console.log(
        `✅ Successfully indexed ${embedded.length} chunks for document ${id}`
      );
      return embedded.length;
    } catch (error) {
      console.error(`❌ Error indexing file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Query for similar documents - IMPROVED VERSION
   */
  async querySimilar(collectionName, query, k = 5, filters = {}) {
    try {
      console.log(`🔍 Querying: "${query}" with k=${k}`);

      // Generate query embedding
      const response = await openai.embeddings.create({
        model: OPENAI_EMBEDDING_MODEL,
        input: query,
      });
      const queryVector = response.data[0].embedding;
      console.log(
        `🔢 Generated query embedding with dimension: ${queryVector.length}`
      );

      // Query documents with embeddings
      const results = await chromaService.queryDocuments(
        collectionName,
        null, // queryTexts is null since we're using embeddings
        k,
        filters,
        [queryVector] // pass the embedding vector
      );

      const formattedResults = {
        query: query,
        results: results.documents[0].map((doc, i) => ({
          content: doc,
          metadata: results.metadatas[0][i],
          distance: results.distances[0][i],
          id: results.ids[0][i],
        })),
        totalResults: results.documents[0].length,
      };

      console.log(
        `✅ Found ${formattedResults.totalResults} similar documents`
      );
      return formattedResults;
    } catch (error) {
      console.error("❌ Error querying similar documents:", error);
      throw error;
    }
  }

  /**
   * List all documents in the collection - IMPLEMENTED
   */
  async listDocuments(collectionName) {
    try {
      console.log(`📋 Listing all documents of ${collectionName}`);

      const result = await chromaService.listAllDocuments(collectionName, 1000);

      // Group by documentId to get unique documents
      const documentsMap = new Map();

      if (result.metadatas) {
        result.metadatas.forEach((metadata, index) => {
          const docId = metadata.documentId;
          if (!documentsMap.has(docId)) {
            documentsMap.set(docId, {
              documentId: docId,
              fileName: metadata.fileName,
              type: metadata.type,
              createdAt: metadata.createdAt,
              indexedAt: metadata.indexedAt,
              chunks: 0,
            });
          }
          documentsMap.get(docId).chunks++;
        });
      }

      const documents = Array.from(documentsMap.values());
      console.log(`✅ Found ${documents.length} unique documents`);

      return documents;
    } catch (error) {
      console.error("❌ Error listing documents:", error);
      throw error;
    }
  }

  /**
   * Get collection statistics - IMPLEMENTED
   */
  async getStats(collectionName) {
    try {
      console.log(`📊 Getting collection statistics...`);

      const stats = await chromaService.getCollectionStats(collectionName);

      // Get additional info
      const documents = await this.listDocuments(collectionName);

      const result = {
        ...stats,
        totalDocuments: documents.length,
        totalChunks: stats.count,
        documents: documents,
      };

      console.log(
        `✅ Retrieved stats: ${result.totalDocuments} documents, ${result.totalChunks} chunks`
      );
      return result;
    } catch (error) {
      console.error("❌ Error getting collection stats:", error);
      throw error;
    }
  }
}
export default EmbedService;
