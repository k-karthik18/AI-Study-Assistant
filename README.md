# StudyFlow AI - Active Research & Study Workspace

Welcome to **StudyFlow AI**, a production-grade, multi-tenant study workspace designed for students and researchers to interact with textbook materials, generate interactive study assets, and track retrieval quality in real-time.

---

## 🚀 How to Use StudyFlow AI

Follow this quick guide to get started:

```
  [ Sign In ]
       │
       ▼
  [ User Workspace ] ──► (Isolated Document Library)
       │
       ▼
  [ Import Portal ]  ──► (Upload PDFs or Paste YouTube/Web URLs)
       │
       ▼
  [ Chat Playground ] ──► (Ask questions & view cited source chunks)
       │
       ▼
  [ Active Study ]    ──► (Practice interactive Quizzes & 3D Flashcards)
```

1. **Step 1: Secure Sign In:** Authenticate using the Clerk portal. This automatically builds your isolated tenant database and vector store index.
2. **Step 2: Access Your Workspace:** Review your personalized textbook library in the dashboard.
3. **Step 3: Ingest Textbook Sources:** Drag and drop any academic PDF, paste a YouTube lecture URL (to extract the transcript), or submit Web article URLs.
4. **Step 4: Chat Playground:** Ask conceptual questions. The AI will extract relevant textbook passages, display them as source accordions, and write grounded answers.
5. **Step 5: Practice & Study:** Switch tabs to start interactive multiple-choice **Quizzes** (complete with score tracking and explanations) or review **Flashcards** with active-recall spaced repetition scoring.
6. **Step 6: Live Metrics Audit:** Click the evaluation dashboard to audit the system's accuracy (faithfulness and answer relevance stats).

---

## 🛠️ Project Specifications

StudyFlow AI uses a hybrid, locally optimized architecture to ensure speed, security, and low operational overhead:

* **Frontend Framework:** React, Vite, TailwindCSS (for high-fidelity dashboard layout), Axios (HTTP Client), and Lucide React Icons.
* **Security & Auth:** Clerk (JWT-based session authentication with multi-tenant workspace separation).
* **Backend API:** Python FastAPI (native asynchronous routing, Pydantic type safety, auto-generated OpenAPI documentation).
* **Text Extraction Services:** PyMuPDF (`fitz`) for local parsing of uploaded PDFs, custom web scraping, and YouTube transcript API integrations.
* **Vector Embeddings Model:** local `SentenceTransformers` (`all-MiniLM-L6-v2`) outputting highly compact 384-dimensional dense vectors.
* **Vector Store Engine:** FAISS (Facebook AI Similarity Search) FlatL2 in-process indexer for sub-millisecond local math searches.
* **Relational Database:** Supabase (PostgreSQL) for storing structured document registers and chronological chat dialogue logs.
* **Generation Engine:** Google Gemini API (`gemini-2.5-flash`) for synthesizing context and generating educational answers, quizzes, and flashcards.

---

## ✨ What Makes This Project Genuine & Trustable?

Unlike basic, generic RAG wrappers, StudyFlow AI implements enterprise-level retrieval and validation patterns:

1. **Advanced Hybrid Retrieval (FAISS + Keyword):** Pure vector searches often fail when searching for exact terminology, equations, version tags, or acronyms. We merge FAISS L2 Euclidean similarity with a TF-IDF sparse matching algorithm using **Reciprocal Rank Fusion (RRF)**.
2. **Strict Grounding Guardrails (Anti-Hallucination):** The generation engine is configured with negative constraints and strict instructions prohibiting the use of general training knowledge, reducing hallucinations to virtually zero.
3. **RAGAS Quality Metrics (Live Auditing):** Rather than blindly trusting the LLM, we run RAGAS automated evaluations (measuring *Faithfulness*, *Context Precision*, *Context Recall*, and *Answer Relevancy*) to evaluate the system.
4. **Client-Device Friendly:** Offloading vector parsing and keyword matches to low-cost local instances and utilizing the Gemini Cloud API allows the entire platform to run smoothly on machines with limited resources (e.g., i5 CPU / 4GB RAM).
5. **Secure Multi-Tenant Isolation:** User indexes are serialized on disk using Clerk user identifiers. A user can never view or search another user's documents.
