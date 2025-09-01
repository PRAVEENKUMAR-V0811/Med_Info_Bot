#retriever.py

import faiss
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer, util
import requests, os
from dotenv import load_dotenv

load_dotenv()

# Load FAISS index and metadata
with open("metadata.pkl", "rb") as f:
    docs, metadata = pickle.load(f)

index = faiss.read_index("vector_store.faiss")
embed_model = SentenceTransformer('all-MiniLM-L6-v2')

def retrieve(query, top_k=10):
    query_embedding = embed_model.encode([query]).astype('float32')
    D, I = index.search(np.array(query_embedding), top_k)
    results = []
    for i in I[0]:
        if i != -1 and i < len(docs):
            results.append((docs[i], metadata[i]))
    return results


OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL_ID = "openai/gpt-3.5-turbo-16k"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json"
}

def generate_answer(query, top_k=3):
    retrieved_docs = retrieve(query, top_k)
    if not retrieved_docs:
        return "Sorry, I could not find relevant information in the dataset/PDF."

    
    # Combine exact text chunks with page numbers
    context = "\n\n".join([f"Page {meta['page_number']}: {chunk}" for chunk, meta in retrieved_docs])
    
    prompt = f"""
Answer the following question using **only the text from the context below**.
Do NOT paraphrase. Include page numbers in your answer for each statement.

Context:
{context}

Question: {query}
Answer:
"""
    payload = {
        "model": MODEL_ID,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0,
        "max_tokens": 512
    }
    
    response = requests.post(API_URL, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return f"Error: {response.status_code} {response.text}"
    

if __name__ == "__main__":
    query = "What are the symptoms of fever"
    print(generate_answer(query))