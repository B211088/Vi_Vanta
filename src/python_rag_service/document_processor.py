import os
import PyPDF2
from typing import List, Dict
from langchain.text_splitter import RecursiveCharacterTextSplitter
import config
import json

class DocumentProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=config.CHUNK_SIZE,
            chunk_overlap=config.CHUNK_OVERLAP,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
    
    def process_single_pdf(self, pdf_path: str, filename: str) -> List[Dict]:
        """Xử lý một file PDF"""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                
                if text.strip():
                    chunks = self.text_splitter.split_text(text)
                    documents = []
                    
                    for i, chunk in enumerate(chunks):
                        documents.append({
                            'content': chunk,
                            'source': filename,
                            'source_type': 'pdf',
                            'chunk_id': i,
                            'total_chunks': len(chunks)
                        })
                    
                    return documents
                
        except Exception as e:
            print(f"Error processing PDF {filename}: {e}")
            
        return []
    
    def process_mongodb_records(self, collection_name: str, records: List[Dict]) -> List[Dict]:
        """Xử lý dữ liệu từ MongoDB"""
        documents = []
        
        for record in records:
            # Tạo text từ MongoDB record
            text_parts = []
            record_id = str(record.get('_id', ''))
            
            # Loại bỏ _id và __v khỏi text content
            filtered_record = {k: v for k, v in record.items() 
                             if k not in ['_id', '__v'] and v is not None}
            
            # Tạo readable text
            for key, value in filtered_record.items():
                if isinstance(value, (str, int, float)):
                    text_parts.append(f"{key}: {value}")
                elif isinstance(value, dict):
                    # Xử lý nested objects
                    nested_text = self._process_nested_object(key, value)
                    text_parts.append(nested_text)
                elif isinstance(value, list):
                    # Xử lý arrays
                    if value:  # Chỉ xử lý nếu list không rỗng
                        list_text = f"{key}: {', '.join(map(str, value))}"
                        text_parts.append(list_text)
            
            if text_parts:
                full_text = "\n".join(text_parts)
                
                # Chia nhỏ nếu text quá dài
                if len(full_text) > config.CHUNK_SIZE:
                    chunks = self.text_splitter.split_text(full_text)
                    for i, chunk in enumerate(chunks):
                        documents.append({
                            'content': chunk,
                            'source': collection_name,
                            'source_type': 'mongodb',
                            'record_id': record_id,
                            'chunk_id': i,
                            'total_chunks': len(chunks)
                        })
                else:
                    documents.append({
                        'content': full_text,
                        'source': collection_name,
                        'source_type': 'mongodb',
                        'record_id': record_id,
                        'chunk_id': 0,
                        'total_chunks': 1
                    })
        
        return documents
    
    def _process_nested_object(self, parent_key: str, obj: dict, level: int = 1) -> str:
        """Xử lý nested objects trong MongoDB"""
        if level > 3:  # Giới hạn độ sâu để tránh quá phức tạp
            return f"{parent_key}: [Complex Object]"
        
        parts = []
        for key, value in obj.items():
            if isinstance(value, dict):
                nested = self._process_nested_object(f"{parent_key}.{key}", value, level + 1)
                parts.append(nested)
            elif isinstance(value, list):
                if value:
                    parts.append(f"{parent_key}.{key}: {', '.join(map(str, value))}")
            else:
                parts.append(f"{parent_key}.{key}: {value}")
        
        return "\n".join(parts)