import os
import google.generativeai as genai

# Configure the Gemini API globally
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

def generate_answer_with_context(question: str, context_chunks: list) -> str:
    """Constructs prompt and queries Gemini API to generate the final grounded response."""
    if not context_chunks:
        return "I could not find any relevant information in the uploaded document to answer your question."

    context_text = "\n\n---\n\n".join(context_chunks)
    
    prompt = f"""You are a helpful AI Study Assistant. Your task is to answer the user's question STRICTLY based on the provided textbook context below.

Rules:
1. Do not use outside general knowledge to answer the question. Only use the provided context.
2. If the answer is not contained in the context, explicitly say: "I cannot answer this based on the provided document."
3. Keep the answer concise, educational, and easy to understand for a student.

CONTEXT:
{context_text}

USER QUESTION:
{question}

ANSWER:
"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error querying Gemini API: {e}")
        return "Sorry, I encountered an error while trying to generate the answer. Please try again later."

def generate_summary(text_chunks: list) -> str:
    """Summarizes text chunks using the Gemini API."""
    # Not used in the main flow yet, but stub provided for future expansion
    return "Summary generation not fully implemented."

