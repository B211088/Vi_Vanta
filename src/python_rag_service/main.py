from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import asyncio
from rag_system import RAGSystem
from document_processor import DocumentProcessor
import tempfile
import os
import time

app = FastAPI(title="RAG Service", version="1.0.0")

# CORS cho Node.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global RAG system
rag_system = None
doc_processor = DocumentProcessor()

# Pydantic models
class QueryRequest(BaseModel):
    question: str
    top_k: Optional[int] = 5
    user_id: Optional[str] = None

class QueryResponse(BaseModel):
    answer: str
    sources: List[str]
    similarity_scores: List[float]
    processing_time: float

class DocumentUploadResponse(BaseModel):
    message: str
    processed_chunks: int
    document_id: str

class MongoRecord(BaseModel):
    collection: str
    records: List[Dict]

class MongoSyncRequest(BaseModel):
    collection: str
    query: Optional[Dict] = {}
    limit: Optional[int] = 1000

# Startup
@app.on_event("startup")
async def startup_event():
    global rag_system
    rag_system = RAGSystem()
    print("✅ RAG System initialized")

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "RAG Service"}

# Stats
@app.get("/stats")
async def get_stats():
    if not rag_system:
        raise HTTPException(status_code=503, detail="RAG system not initialized")
    
    stats = rag_system.get_database_stats()
    return stats

# Query endpoint
@app.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    if not rag_system:
        raise HTTPException(status_code=503, detail="RAG system not initialized")
    
    start_time = time.time()
    
    try:
        result = rag_system.ask_question(request.question, request.top_k)
        processing_time = time.time() - start_time
        
        return QueryResponse(
            answer=result['answer'],
            sources=result['sources'],
            similarity_scores=result.get('similarity_scores', []),
            processing_time=processing_time
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Upload PDF
@app.post("/upload-pdf", response_model=DocumentUploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    try:
        # Save temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Process PDF
        documents = doc_processor.process_single_pdf(temp_path, file.filename)
        
        # Add to vector DB
        if documents:
            rag_system.add_documents(documents)
            
        # Cleanup
        os.unlink(temp_path)
        
        return DocumentUploadResponse(
            message="PDF processed successfully",
            processed_chunks=len(documents),
            document_id=file.filename
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

# Sync from MongoDB
@app.post("/sync-mongodb")
async def sync_from_mongodb(request: MongoSyncRequest):
    try:
        # Process MongoDB records
        documents = doc_processor.process_mongodb_records(
            request.collection, 
            request.records
        )
        
        if documents:
            rag_system.add_documents(documents)
            
        return {
            "message": f"Synced {len(documents)} documents from {request.collection}",
            "processed_chunks": len(documents)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add MongoDB records directly
@app.post("/add-mongodb-data")
async def add_mongodb_data(request: MongoRecord):
    try:
        documents = doc_processor.process_mongodb_records(
            request.collection,
            request.records
        )
        
        if documents:
            rag_system.add_documents(documents)
            
        return {
            "message": f"Added {len(documents)} documents from {request.collection}",
            "processed_chunks": len(documents)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Delete documents by source
@app.delete("/documents/{source}")
async def delete_documents(source: str):
    try:
        deleted_count = rag_system.delete_documents_by_source(source)
        return {"message": f"Deleted {deleted_count} documents", "source": source}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)