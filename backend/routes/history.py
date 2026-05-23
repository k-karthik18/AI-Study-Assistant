from fastapi import APIRouter, Header, HTTPException
from services import database
from typing import List, Dict, Any

router = APIRouter()

@router.get("/documents")
async def get_documents(x_user_id: str = Header(..., description="Clerk User ID of the logged in user")):
    """Fetches all documents uploaded by this user."""
    if not x_user_id:
        raise HTTPException(status_code=400, detail="Missing X-User-ID header.")
    
    try:
        docs = database.get_user_documents(x_user_id)
        return docs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")

@router.get("/history/{doc_id}")
async def get_history(doc_id: str, x_user_id: str = Header(..., description="Clerk User ID of the logged in user")):
    """Fetches chronological chat history for a specific document and user."""
    if not x_user_id:
        raise HTTPException(status_code=400, detail="Missing X-User-ID header.")
    if not doc_id:
        raise HTTPException(status_code=400, detail="Missing doc_id parameter.")
        
    try:
        chats = database.get_chat_history(x_user_id, doc_id)
        return chats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chat history: {str(e)}")
