import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, ask, evaluate, history

app = FastAPI(
    title="AI Study Assistant API",
    description="Backend services for RAG-based PDF chatbot with integrated RAGAS evaluation",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route routers
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(ask.router, prefix="/api", tags=["Ask"])
app.include_router(evaluate.router, prefix="/api", tags=["Evaluate"])
app.include_router(history.router, prefix="/api", tags=["History"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "AI Study Assistant Backend is running.",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
