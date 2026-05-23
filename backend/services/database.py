import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Check if credentials are valid and not placeholders
is_supabase_active = False
supabase_client = None

if SUPABASE_URL and SUPABASE_KEY:
    if "your_supabase_url_here" not in SUPABASE_URL and "your_supabase_anon_key_here" not in SUPABASE_KEY:
        try:
            from supabase import create_client
            supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
            is_supabase_active = True
            print("Successfully initialized Supabase connection!")
        except Exception as e:
            print(f"Error initializing Supabase client: {str(e)}")
            print("Falling back to local in-memory mock store.")
    else:
        print("Supabase credentials appear to be placeholders. Falling back to in-memory mock store.")
else:
    print("Supabase environment variables not set. Falling back to in-memory mock store.")

# Local mock database storage to prevent crashes
_mock_documents = []
_mock_chats = []

def save_document(doc_id: str, user_id: str, filename: str, chunk_count: int) -> dict:
    """Saves document metadata to Supabase (or fallback local mock store)."""
    payload = {
        "id": doc_id,
        "user_id": user_id,
        "filename": filename,
        "chunk_count": chunk_count
    }
    
    if is_supabase_active:
        try:
            response = supabase_client.table("documents").insert(payload).execute()
            print(f"Successfully saved document {doc_id} to Supabase.")
            return payload
        except Exception as e:
            print(f"Supabase write error in save_document: {str(e)}")
            # Fallback
            
    # Mock fallback
    _mock_documents.append(payload)
    print(f"[Mock DB] Saved document {doc_id} to local in-memory store.")
    return payload

def get_user_documents(user_id: str) -> list:
    """Retrieves all uploaded PDF documents metadata for the specified user."""
    if is_supabase_active:
        try:
            response = supabase_client.table("documents").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return response.data or []
        except Exception as e:
            print(f"Supabase select error in get_user_documents: {str(e)}")
            
    # Mock fallback
    user_docs = [doc for doc in _mock_documents if doc["user_id"] == user_id]
    if not user_docs:
        # Provide sample documents so a new user has visual examples
        user_docs = [
            {"id": "mock-doc-1234", "user_id": user_id, "filename": "Operating_Systems_Galvin.pdf", "chunk_count": 142},
            {"id": "mock-doc-5678", "user_id": user_id, "filename": "Database_Systems_Korth.pdf", "chunk_count": 87}
        ]
    return user_docs

def save_chat_message(user_id: str, doc_id: str, role: str, content: str, sources: list = None) -> dict:
    """Saves a single conversation block (from student or assistant) to chats history."""
    import uuid
    payload = {
        "user_id": user_id,
        "doc_id": doc_id,
        "role": role,
        "content": content,
        "sources": sources or []
    }
    
    if is_supabase_active:
        try:
            response = supabase_client.table("chats").insert(payload).execute()
            print("Successfully saved chat message to Supabase.")
            return payload
        except Exception as e:
            print(f"Supabase write error in save_chat_message: {str(e)}")
            
    # Mock fallback
    payload["id"] = str(uuid.uuid4())
    _mock_chats.append(payload)
    print("[Mock DB] Saved chat message to local in-memory store.")
    return payload

def get_chat_history(user_id: str, doc_id: str) -> list:
    """Retrieves chronological chat dialogue logs for a given document and user."""
    if is_supabase_active:
        try:
            response = supabase_client.table("chats").select("*").eq("user_id", user_id).eq("doc_id", doc_id).order("created_at", desc=False).execute()
            return response.data or []
        except Exception as e:
            print(f"Supabase select error in get_chat_history: {str(e)}")
            
    # Mock fallback
    history = [chat for chat in _mock_chats if chat["user_id"] == user_id and chat["doc_id"] == doc_id]
    if not history:
        # Provide welcoming mock thread
        history = [
            {
                "id": "welcome-mock",
                "user_id": user_id,
                "doc_id": doc_id,
                "role": "assistant",
                "content": f"Hello! This is a restored chat history for document {doc_id}. Feel free to ask me anything about the content!",
                "sources": []
            }
        ]
    return history
