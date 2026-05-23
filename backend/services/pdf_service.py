# PDF parsing, text cleaning, and chunking service stub
# Fully implemented in Phase 2

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts raw text from an uploaded PDF file."""
    return ""

def clean_text(text: str) -> str:
    """Cleans raw text to remove noise (headers, footers, etc.)."""
    return text

def split_text_into_chunks(text: str, chunk_size: int = 300, overlap: int = 50) -> list:
    """Splits a single text block into overlapping chunks of approx. 300 words."""
    return []
