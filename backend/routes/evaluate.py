import os
import asyncio
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import List

from services import embedding_service, vector_store, llm_service
from datasets import Dataset

try:
    from ragas import evaluate
    from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall
    from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
except ImportError:
    pass

router = APIRouter()

class QAExample(BaseModel):
    question: str
    ground_truth: str

class EvaluateRequest(BaseModel):
    doc_id: str
    dataset: List[QAExample]

class EvaluateResponse(BaseModel):
    faithfulness: float
    answer_relevancy: float
    context_precision: float
    context_recall: float

def run_ragas_eval(dataset_dict, api_key):
    dataset = Dataset.from_dict(dataset_dict)
    ragas_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key)
    ragas_embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=api_key)
    
    result = evaluate(
        dataset=dataset,
        metrics=[faithfulness, answer_relevancy, context_precision, context_recall],
        llm=ragas_llm,
        embeddings=ragas_embeddings
    )
    return result

@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_rag(
    request: EvaluateRequest,
    x_user_id: str = Header(..., description="Clerk User ID of the logged in user")
):
    try:
        # Cap to 3 for live demo to prevent long timeouts and rate limits
        test_examples = request.dataset[:3] 
        
        questions = []
        answers = []
        contexts = []
        ground_truths = []
        
        for example in test_examples:
            # Generate Answer using our RAG pipeline
            query_embedding = embedding_service.generate_query_embedding(example.question)
            source_chunks = vector_store.search_index(
                query_embedding=query_embedding, 
                user_id=x_user_id, 
                doc_id=request.doc_id, 
                k=5
            )
            answer_text = llm_service.generate_answer_with_context(example.question, source_chunks)
            
            questions.append(example.question)
            answers.append(answer_text)
            contexts.append(source_chunks)
            ground_truths.append(example.ground_truth)
            
        dataset_dict = {
            'question': questions,
            'answer': answers,
            'contexts': contexts,
            'ground_truth': ground_truths
        }
        
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        # Run Ragas evaluation in a separate thread so it doesn't block the FastAPI event loop
        result = await asyncio.to_thread(run_ragas_eval, dataset_dict, gemini_api_key)
        
        return EvaluateResponse(
            faithfulness=result.get('faithfulness', 0.0),
            answer_relevancy=result.get('answer_relevancy', 0.0),
            context_precision=result.get('context_precision', 0.0),
            context_recall=result.get('context_recall', 0.0)
        )
        
    except Exception as e:
        print(f"RAGAS Evaluation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

