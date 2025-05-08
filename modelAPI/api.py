
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import numpy as np
from sklearn.cluster import KMeans
import torch
from torch import nn
import torch.optim as optim
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from typing import List, Tuple, Optional


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    #allow_origins=["http://localhost:4200"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str

class SimilarityPredictor(nn.Module):
    def __init__(self, input_dim: int = 768):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(input_dim * 2, 512),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.fc(x)

def load_documents(pdf_dir: str = "pdfs") -> List[dict]:
    loader = PyPDFDirectoryLoader(pdf_dir)
    documents = loader.load()
    return documents

def split_texts(docs: List[dict], chunk_size: int = 800, chunk_overlap: int = 150) -> List[dict]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        add_start_index=True
    )
    return text_splitter.split_documents(docs)

def init_embeddings() -> HuggingFaceEmbeddings:
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )

def init_faiss_index(texts: List[dict], embeddings: HuggingFaceEmbeddings, index_name: str = "faiss_index_optimized") -> FAISS:
    if os.path.exists(index_name):
        return FAISS.load_local(index_name, embeddings, allow_dangerous_deserialization=True)
    else:
        db = FAISS.from_documents(texts, embeddings)
        db.save_local(index_name)
        return db

def get_document_embeddings(docs: List[dict], embeddings_model: HuggingFaceEmbeddings) -> List[np.ndarray]:
    return [embeddings_model.embed_query(doc.page_content) for doc in docs]

def get_enhanced_answer(question: str, db: FAISS, similarity_model: SimilarityPredictor, embeddings_model: HuggingFaceEmbeddings, k: int = 5, n_clusters: int = 1) -> Tuple[Optional[List[dict]], str]:
    question_embedding = embeddings_model.embed_query(question)
    question_tensor = torch.FloatTensor(question_embedding).unsqueeze(0)
    
    docs = db.similarity_search(question, k=k*1)
    
    if not docs:
        return None, "❌ Aucun contenu pertinent trouvé"
    
    doc_embeddings = get_document_embeddings(docs, embeddings_model)
    
    with torch.no_grad():
        similarities = []
        for doc_emb in doc_embeddings:
            doc_tensor = torch.FloatTensor(doc_emb).unsqueeze(0)
            input_tensor = torch.cat([question_tensor, doc_tensor], dim=1)
            similarities.append(similarity_model(input_tensor).item())
    
    probs = torch.softmax(torch.FloatTensor(similarities), dim=0).numpy()
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    clusters = kmeans.fit_predict(doc_embeddings)
    
    selected_indices = []
    for cluster_id in range(n_clusters):
        cluster_indices = np.where(clusters == cluster_id)[0]
        if len(cluster_indices) > 0:
            best_in_cluster = cluster_indices[np.argmax(probs[cluster_indices])]
            selected_indices.append(best_in_cluster)
    
    selected_indices = sorted(selected_indices, key=lambda i: probs[i], reverse=True)[:k]
    results = [docs[i] for i in selected_indices]
    
    for i, idx in enumerate(selected_indices):
        results[i].metadata['similarity_prob'] = float(probs[idx])
        results[i].metadata['cluster'] = int(clusters[idx])
    
    return results, f"✅ Top probabilité: {max(probs):.2f}, Clusters: {n_clusters}"

# Initialisation au démarrage
documents = load_documents("pdfs")
texts = split_texts(documents)
embeddings_model = init_embeddings()
db = init_faiss_index(texts, embeddings_model)
similarity_model = SimilarityPredictor()

@app.post("/api/ask")
async def ask_question(request: QuestionRequest):
    try:
        results, info = get_enhanced_answer(request.question, db, similarity_model, embeddings_model)
        
        if not results:
            return {
                "success": False,
                "message": f"Aucun résultat trouvé pour: {request.question}",
                "info": info
            }
        
        formatted_results = []
        for doc in results:
            source = os.path.basename(doc.metadata.get('source', 'Document inconnu'))
            page = doc.metadata.get('page', 'N/A')
            content = doc.page_content.replace('\n', ' ').strip()
            prob = doc.metadata.get('similarity_prob', 0)
            cluster = doc.metadata.get('cluster', '?')
            
            formatted_results.append({
                "content": content,
                "source": source,
                "page": page,
                "probability": prob,
                "cluster": cluster,
                "preview": content[:400]
            })
        
        return {
            "success": True,
            "message": f"Résultats pour: {request.question}",
            "info": info,
            "results": formatted_results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "API de questions-réponses opérationnelle"}

#uvicorn api:app --reload
#pip install fastapi uvicorn pydantic numpy scikit-learn 
# torch langchain langchain-community faiss-cpu sentence-transformers huggingface-hub