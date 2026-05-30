from sentence_transformers import SentenceTransformer
import numpy as np

# Load the model locally. It will download once and cache.
model = SentenceTransformer('all-MiniLM-L6-v2')

def generate_embeddings(chunks: list) -> list:
    """Converts text chunks into 384-dimensional embedding vectors locally."""
    if not chunks:
        return []
    embeddings = model.encode(chunks, convert_to_numpy=True)
    return embeddings.tolist()

def generate_query_embedding(query: str) -> list:
    """Converts a query string into a 384-dimensional embedding vector locally."""
    embedding = model.encode(query, convert_to_numpy=True)
    return embedding.tolist()

