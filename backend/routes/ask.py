from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from services import database, embedding_service, vector_store, llm_service

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
    try:
        # Step 1: Generate vector embedding for the user's question
        query_embedding = embedding_service.generate_query_embedding(request.question)
        
        # Step 2: Search the FAISS vector store for top K matching chunks
        # We pass x_user_id to ensure we only search within the logged-in user's index
        # We pass doc_id to restrict the search to the currently active textbook
        source_chunks = vector_store.search_index(
            query_embedding=query_embedding, 
            user_id=x_user_id, 
            doc_id=request.doc_id, 
            k=5
        )
        
        # Step 3: Pass the retrieved chunks to Gemini to formulate an answer
        answer_text = llm_service.generate_answer_with_context(request.question, source_chunks)
        
        # Step 4: Persist the Chat History to Supabase
        
        # Save User Message
        database.save_chat_message(
            user_id=x_user_id,
            doc_id=request.doc_id,
            role="user",
            content=request.question
        )
        
        # Save Assistant Response
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
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")

