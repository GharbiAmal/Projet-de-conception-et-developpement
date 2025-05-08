import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import matplotlib.pyplot as plt
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score
)

def train_enhanced_model(embeddings: list, epochs: int = 20):
    """
    Entraîne le modèle EnhancedSimilarityPredictor sur des paires d'embeddings avec suivi des métriques.

    Args:
        embeddings (list): Liste d'embeddings (vecteurs numpy)
        epochs (int): Nombre d'époques

    Returns:
        model: Le modèle entraîné
    """
    print("\n🏋️ Début de l'entraînement...")

    if isinstance(embeddings[0], list):
        embeddings = np.array(embeddings)

    from similarity_model import EnhancedSimilarityPredictor

    input_dim = embeddings[0].shape[0] * 2
    model = EnhancedSimilarityPredictor(input_dim=input_dim)
    criterion = nn.BCELoss()
    optimizer = optim.AdamW(model.parameters(), lr=0.0001, weight_decay=0.01)

    X_train, y_train = [], []
    cos_sim = cosine_similarity(embeddings)

    for i in range(len(embeddings)):
        similar_indices = np.argsort(cos_sim[i])[-4:-1]
        for j in similar_indices:
            X_train.append(np.concatenate([embeddings[i], embeddings[j]]))
            y_train.append(1.0)
        dissimilar_indices = np.argsort(cos_sim[i])[:3]
        for j in dissimilar_indices:
            X_train.append(np.concatenate([embeddings[i], embeddings[j]]))
            y_train.append(0.0)

    X_train = torch.tensor(X_train, dtype=torch.float32)
    y_train = torch.tensor(y_train, dtype=torch.float32)

    loss_history = []
    acc_history = []
    prec_history = []
    rec_history = []
    f1_history = []
    auc_history = []

    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()

        outputs = model(X_train).squeeze()
        loss = criterion(outputs, y_train)
        loss.backward()
        optimizer.step()

        # Conversion en numpy pour métriques
        preds = outputs.detach().numpy()
        labels = y_train.detach().numpy()
        preds_binary = (preds >= 0.5).astype(int)

        loss_history.append(loss.item())
        acc_history.append(accuracy_score(labels, preds_binary))
        prec_history.append(precision_score(labels, preds_binary))
        rec_history.append(recall_score(labels, preds_binary))
        f1_history.append(f1_score(labels, preds_binary))
        try:
            auc_history.append(roc_auc_score(labels, preds))
        except:
            auc_history.append(0.0)

        print(f"Epoch {epoch+1}/{epochs} - Loss: {loss.item():.4f} | Acc: {acc_history[-1]:.4f} | F1: {f1_history[-1]:.4f}")

    torch.save(model.state_dict(), "best_model.pth")
    print("\n✅ Entraînement terminé!")

    # 🎨 Visualisation
    plt.figure(figsize=(12, 6))
    plt.subplot(1, 2, 1)
    plt.plot(loss_history, label='Loss')
    plt.title('Courbe de perte')
    plt.xlabel('Épochs')
    plt.ylabel('Perte')
    plt.legend()

    plt.subplot(1, 2, 2)
    plt.plot(acc_history, label='Accuracy')
    plt.plot(prec_history, label='Précision')
    plt.plot(rec_history, label='Rappel')
    plt.plot(f1_history, label='F1-score')
    plt.plot(auc_history, label='AUC')
    plt.title('Métriques de performance')
    plt.xlabel('Épochs')
    plt.ylabel('Valeur')
    plt.legend()
    plt.tight_layout()
    plt.show()

    return model


# pour api
class SimilarityPredictor:
    def __init__(self, doc_embeddings):
        self.doc_embeddings = doc_embeddings  # Placeholder si besoin

    def predict(self, question, docs):
        """
        Simule une réponse : renvoie le contenu du chunk le plus pertinent.
        """
        return docs[0].page_content  # Simple mock, améliorable plus tard

def train_enhanced_model(doc_embeddings):
    # Entraînement simulé, retourne un modèle simple
    return SimilarityPredictor(doc_embeddings)

