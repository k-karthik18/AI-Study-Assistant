from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from services import database

router = APIRouter()

class AskRequest(BaseModel):
    question: str
    doc_id: str

class AskResponse(BaseModel):
    answer: str
    sources: List[str]

@router.post("/ask", response_model=AskResponse)
async def ask_question(
    request: AskRequest,
    x_user_id: str = Header(..., description="Clerk User ID of the logged in user")
):
    # Retrieve answer (mocked for now, fully wired with Gemini in Phase 4)
    answer_text = f"This is a placeholder answer. You asked: '{request.question}' about document {request.doc_id}. The full Gemini connection will be established in Phase 4."
    source_chunks = ["Mock Source Section 1", "Mock Source Section 2"]
    
    try:
        # Save User Message to database
        database.save_chat_message(
            user_id=x_user_id,
            doc_id=request.doc_id,
            role="user",
            content=request.question
        )
        
        # Save Assistant Response to database
        database.save_chat_message(
            user_id=x_user_id,
            doc_id=request.doc_id,
            role="assistant",
            content=answer_text,
            sources=source_chunks
        )
        
        return AskResponse(
            answer=answer_text,
            sources=source_chunks
        )
    except Exception as e:
        print(f"Error in ask_question pipeline: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database persistent write error: {str(e)}")
