import os
import uuid
import shutil
from fastapi import APIRouter, File, UploadFile, HTTPException, Header
from services import database

router = APIRouter()

# Define the local directory to store uploaded PDF files
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    x_user_id: str = Header(..., description="Clerk User ID of the logged in user")
):
    # Validate file type
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        # Generate a unique document ID
        doc_id = str(uuid.uuid4())
        
        # Define storage path
        file_extension = os.path.splitext(file.filename)[1]
        stored_filename = f"{doc_id}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, stored_filename)
        
        # Save the uploaded file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Log success
        print(f"Saved file to {file_path}")
        
        # Save document metadata to Supabase
        mock_chunk_count = 42 # Stub chunk count until Phase 2 is coded
        database.save_document(
            doc_id=doc_id,
            user_id=x_user_id,
            filename=file.filename,
            chunk_count=mock_chunk_count
        )
        
        # Return standard response
        return {
            "status": "success",
            "message": "File successfully uploaded and stored.",
            "chunk_count": mock_chunk_count, 
            "doc_id": doc_id,
            "filename": file.filename
        }
        
    except Exception as e:
        print(f"Error saving file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
