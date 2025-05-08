from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from text_processing import split_texts
from embeddings import generate_embeddings, init_embeddings
from faiss_index import init_faiss_index
from evaluation import load_test_data, analyze_test_results
from interactive import interactive_qa_loop
from training import train_enhanced_model
import time
from data_loading import load_documents, visualize_data
# Définition de la classe de requêtes
class QuestionRequest(BaseModel):
    question: str

# Création de l'application FastAPI
app = FastAPI()

# Initialisation des variables globales
documents = None
chunks = None
embeddings = None
embeddings_model = None
db = None
model = None

@app.on_event("startup")
async def startup():
    global documents, chunks, embeddings, embeddings_model, db, model
    print("🚀 Démarrage du pipeline de traitement...\n")

    try:
        # Chargement des documents
        print("="*50)
        print("ÉTAPE 1: CHARGEMENT DES DOCUMENTS")
        print("="*50)
        start_time = time.time()
        documents = load_documents("pdfs")
        print(f"⏱ Temps écoulé: {time.time() - start_time:.2f}s")

        # Découpage des textes
        print("\n" + "="*50)
        print("ÉTAPE 2: DÉCOUPAGE DES TEXTES")
        print("="*50)
        start_time = time.time()
        chunks = split_texts(documents)
        print(f"⏱ Temps écoulé: {time.time() - start_time:.2f}s")

        # Initialisation du modèle d'embeddings et génération
        print("\n" + "="*50)
        print("ÉTAPE 3: VECTORISATION")
        print("="*50)
        start_time = time.time()
        embeddings_model = init_embeddings()
        embeddings = generate_embeddings(chunks)
        print(f"⏱ Temps écoulé: {time.time() - start_time:.2f}s")

        # Indexation FAISS
        print("\n" + "="*50)
        print("ÉTAPE 4: INDEXATION FAISS")
        print("="*50)
        start_time = time.time()
        db, _ = init_faiss_index(chunks, embeddings_model)
        print(f"⏱ Temps écoulé: {time.time() - start_time:.2f}s")

        # Entraînement du modèle supervisé
        print("\n" + "="*50)
        print("ÉTAPE 5: ENTRAÎNEMENT DU MODÈLE")
        print("="*50)
        start_time = time.time()
        doc_embeddings = embeddings_model.embed_documents([chunk.page_content for chunk in chunks])
        model = train_enhanced_model(doc_embeddings)
        print(f"⏱ Temps écoulé: {time.time() - start_time:.2f}s")

        print("\n✅ Pipeline initialisé avec succès!")

    except Exception as e:
        print(f"\n❌ Erreur dans le pipeline : {str(e)}")
        raise e

# Endpoint pour répondre à une question
@app.post("/api/ask")
async def ask_question(request: QuestionRequest):
    global model, embeddings_model, db
    try:
        # Traiter la question via la boucle interactive
        response = interactive_qa_loop(model, embeddings_model, db, request.question)
        return {"answer": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement de la question : {str(e)}")

# Point d'accès pour tester l'état de l'API
@app.get("/")
async def read_root():
    return {"message": "Bienvenue dans l'API Question-Réponse"}



# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel

# from data_loading import load_documents
# from text_processing import split_texts
# from embeddings import init_embeddings, generate_embeddings
# from faiss_index import init_faiss_index
# from training import train_enhanced_model
# from interactive import get_best_answer
# from fastapi.middleware.cors import CORSMiddleware



# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # ou "*" pour tout autoriser
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# # Requête attendue
# class QueryRequest(BaseModel):
#     question: str

# # Initialisation unique au lancement de l'API
# print("🔧 Initialisation du pipeline...")


# embeddings_model = init_embeddings()
# faiss_index, _ = init_faiss_index("faiss_index_paragraph_v2", embeddings_model)  # Si tu as une méthode de chargement spécifique

# model = train_enhanced_model(embeddings_model)

# print("✅ Prêt à répondre aux questions !")

# @app.post("/api/ask")
# def ask_question(request: QueryRequest):
#     try:
#         answer = get_best_answer(
#             question=request.question,
#             model=model,
#             embeddings_model=embeddings_model,
#             db=faiss_index
#         )
#         return {"answer": answer}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
