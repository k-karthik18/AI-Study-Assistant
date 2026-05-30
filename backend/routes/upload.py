import os
import uuid
import shutil
from fastapi import APIRouter, File, UploadFile, HTTPException, Header
from services import database, pdf_service, embedding_service, vector_store


router = APIRouter()

# Define the local directory to store uploaded PDF files
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Temporary directory for chunks until Phase 3
VECTORSTORE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "vectorstore")
os.makedirs(VECTORSTORE_DIR, exist_ok=True)

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
            
        print(f"Saved file to {file_path}")
        
        # Phase 2: Extract, clean, and chunk text
        raw_text = pdf_service.extract_text_from_pdf(file_path)
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF. It might be empty or image-based.")
            
        cleaned_text = pdf_service.clean_text(raw_text)
        chunks = pdf_service.split_text_into_chunks(cleaned_text, chunk_size=300, overlap=50)
        
        actual_chunk_count = len(chunks)
        
        # Phase 3: Generate embeddings and save to FAISS vector store
        embeddings = embedding_service.generate_embeddings(chunks)
        vector_store.add_to_index(embeddings, chunks, x_user_id, doc_id)
        
        # Save document metadata to Supabase
        database.save_document(
            doc_id=doc_id,
            user_id=x_user_id,
            filename=file.filename,
            chunk_count=actual_chunk_count
        )
        
        # Return standard response
        return {
            "status": "success",
            "message": "File successfully uploaded and processed.",
            "chunk_count": actual_chunk_count, 
            "doc_id": doc_id,
            "filename": file.filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error saving file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
