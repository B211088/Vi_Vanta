import { OPENAI_EMBEDDING_MODEL } from "../config/openai.config";
import { getCollectionByIdHandle } from "./collection.service";

export const querySimilarQuestions = async (
  collectionId,
  query,
  k = 5,
  filters = {}
) => {
  try {
    console.log(`🔍 Querying: "${query}" with k=${k}`);
    const collection = await getCollectionByIdHandle(collectionId);
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
      collection.name,
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

    console.log(`✅ Found ${formattedResults.totalResults} similar documents`);
    return formattedResults;
  } catch (error) {
    console.error("❌ Error querying similar documents:", error);
    throw error;
  }
};
