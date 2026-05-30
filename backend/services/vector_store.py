import os
import json
import faiss
import numpy as np

VECTORSTORE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "vectorstore")
os.makedirs(VECTORSTORE_DIR, exist_ok=True)

def add_to_index(embeddings: list, chunks: list, user_id: str, doc_id: str):
    """Adds embeddings to a user's FAISS index and stores chunk metadata."""
    if not embeddings:
        return

    index_path = os.path.join(VECTORSTORE_DIR, f"{user_id}.index")
    metadata_path = os.path.join(VECTORSTORE_DIR, f"{user_id}_metadata.json")

    # Load or create FAISS index
    dim = len(embeddings[0])
    if os.path.exists(index_path):
        index = faiss.read_index(index_path)
    else:
        index = faiss.IndexFlatL2(dim)

    # Convert to numpy array and add
    embeddings_np = np.array(embeddings).astype('float32')
    index.add(embeddings_np)
    faiss.write_index(index, index_path)

    # Load or create metadata
    metadata = []
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)

    # Append new chunks with their doc_id
    for chunk in chunks:
        metadata.append({
            "doc_id": doc_id,
            "text": chunk
        })

    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

def search_index(query_embedding: list, user_id: str, doc_id: str = None, k: int = 5) -> list:
    """Searches a user's FAISS index, optionally filtering by doc_id."""
    index_path = os.path.join(VECTORSTORE_DIR, f"{user_id}.index")
    metadata_path = os.path.join(VECTORSTORE_DIR, f"{user_id}_metadata.json")

    if not os.path.exists(index_path) or not os.path.exists(metadata_path):
        return []

    index = faiss.read_index(index_path)
    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)

    query_np = np.array([query_embedding]).astype('float32')
    
    # We might need to fetch more than k if we are filtering by doc_id
    search_k = k if not doc_id else min(k * 10, index.ntotal)
    if search_k == 0:
        return []
        
    distances, indices = index.search(query_np, search_k)
    
    results = []
    for idx in indices[0]:
        if idx == -1 or idx >= len(metadata):
            continue
            
        chunk_meta = metadata[idx]
        if doc_id and chunk_meta.get("doc_id") != doc_id:
            continue
            
        results.append(chunk_meta["text"])
        if len(results) >= k:
            break
            
    return results

