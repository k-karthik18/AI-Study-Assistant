import fitz  # PyMuPDF
import re

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts raw text from an uploaded PDF file."""
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text() + "\n"
        doc.close()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""
    return text

def clean_text(text: str) -> str:
    """Cleans raw text to remove noise (headers, footers, etc.)."""
    # Remove multiple spaces
    text = re.sub(r'[ \t]+', ' ', text)
    # Remove multiple newlines
    text = re.sub(r'\n+', '\n', text)
    text = text.strip()
    return text

def split_text_into_chunks(text: str, chunk_size: int = 300, overlap: int = 50) -> list:
    """Splits a single text block into overlapping chunks of approx. 300 words."""
    words = text.split()
    chunks = []
    
    if not words:
        return chunks

    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
        
    return chunks
