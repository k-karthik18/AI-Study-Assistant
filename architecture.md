# StudyFlow AI - System Architecture & Workflow

This document details the system architecture, component design, and data flow of **StudyFlow AI**.

---

## 🏗️ High-Level System Architecture

```mermaid
graph TD
    %% Frontend Layer
    subgraph Frontend [Client Layer (React / Vite)]
        UI[App Workspace UI]
        Clerk[Clerk Auth Widget]
        Uploader[Upload / URL Portal]
        Chat[Chat Interface]
        Quiz[Study Assets Panel]
    end

    %% API Layer
    subgraph Backend [Server Layer (FastAPI)]
        API[FastAPI Router]
        PDF[PyMuPDF Text Extractor]
        Chunker[Text Cleaning & Chunker]
        Embed[all-MiniLM-L6-v2 Embedder]
        Hybrid[Hybrid Search Engine]
    end

    %% Database & Storage Layer
    subgraph Storage [Database & Indexing Layer]
        FAISS[(FAISS User Indices)]
        JSON[(JSON Chunk Metadata)]
        Supa[(Supabase PostgreSQL)]
    end

    %% External Services
    subgraph External [AI Cloud Services]
        Gemini[Google Gemini API]
    end

    %% Relations
    UI --> Clerk
    UI --> API
    API --> PDF
    PDF --> Chunker
    Chunker --> Embed
    Embed --> FAISS
    Chunker --> JSON
    API --> Supa
    API --> Hybrid
    Hybrid --> FAISS
    Hybrid --> JSON
    API --> Gemini
```

---

## 🔄 Core Workflows

### 1. Document Ingestion Workflow
When a user uploads a PDF or submits a URL:
1. **Request Reception:** FastAPI validates the payload and verifies the `X-User-ID` header.
2. **Raw Extraction:** **PyMuPDF** reads the PDF (or scraping services read URLs) to extract clean string data.
3. **Cleaning & Chunking:** RegEx collapses noise, and a **sliding-window splitter** generates chunks of `300 words` with `50 words` overlap.
4. **Vector Embeddings:** A local **SentenceTransformers (`all-MiniLM-L6-v2`)** model converts chunks into `384-dimensional` float vectors.
5. **Disk Serialization:** Vectors are appended to the user's local index file (`{user_id}.index`) and metadata is saved to `{user_id}_metadata.json`.
6. **Relational Database Sync:** The document name, UUID, and chunk count are logged in the **Supabase `documents` table**.

### 2. Hybrid Retrieval-Augmented Generation (RAG) Workflow
When a user submits a question:
1. **Query Embedding:** The question is converted into a 384d vector locally.
2. **Dual-Retrieval (Hybrid Search):**
   * **Dense Retrieval:** FAISS executes a fast nearest-neighbor search based on L2 Euclidean distance.
   * **Sparse Retrieval:** A localized TF-IDF matches exact keyword structures (perfect for codes, names, or values).
3. **Reciprocal Rank Fusion (RRF):** The dense and sparse results are merged to determine the top 5 overall chunks.
4. **Metadata Isolation:** Chunks are filtered to ensure they belong exclusively to the active `doc_id`.
5. **Context Grounding:** The top chunks are formatted into a prompt containing negative constraints ("*Only answer using this context, otherwise refuse...*").
6. **Gemini Generation:** Gemini API synthesizes the context and query into a clear explanation.
7. **Persistency:** The Q&A interaction is saved to the Supabase `chats` table.
