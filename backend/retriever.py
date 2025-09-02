import os
import pickle
import requests
import faiss
import time
import numpy as np
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Load embedding model
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize docs, metadata, and FAISS index safely
if os.path.exists("metadata.pkl") and os.path.exists("vector_store.faiss"):
    with open("metadata.pkl", "rb") as f:
        docs, metadata = pickle.load(f)
    index = faiss.read_index("vector_store.faiss")
    print(f"✅ Loaded {len(docs)} chunks from existing FAISS index")
else:
    docs, metadata = [], []
    index = None
    print("⚠️  metadata.pkl or vector_store.faiss not found. Upload PDFs first to create the index.")

def retrieve(query: str, top_k: int = 5):
    """Retrieve the top_k most relevant documents for a query."""
    if index is None or not docs:
        return []  # No index yet
    query_embedding = embed_model.encode([query]).astype("float32")
    D, I = index.search(np.array(query_embedding), top_k)
    results = [(docs[i], metadata[i]) for i in I[0]]
    return results

# API configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
# MODEL_ID = "deepseek/deepseek-r1:free"
MODEL_ID = "openai/gpt-4-turbo"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
}

def generate_answer(query: str, top_k: int = 3, max_retries: int = 3, retry_delay: int = 5):
    """Generate a formatted answer using retrieved documents and OpenRouter API."""
    retrieved_docs = retrieve(query, top_k)

    # If no documents retrieved, fallback message
    if not retrieved_docs:
        return (
            "Response:\nSorry, we couldn't find relevant information about your query in our PDF database.\n"
            "Please fill out the contact form to request adding this drug to our documentation.\n\n"
            "Citations: None\n"
            "Disclaimer: For informational purposes only. Always consult a doctor."
        )

    # Combine chunks for analysis
    context = "\n\n".join(
        [f"{meta['source']} | Page {meta['page_number']}: {chunk}" for chunk, meta in retrieved_docs]
    )

    # Check if query (drug name) appears in context (case-insensitive)
    if query.lower() not in context.lower():
        return (
            f"Response:\nThe drug '{query}' was not found in the existing PDF documentation.\n"
            "Please fill out the contact form to request adding this drug to our records.\n\n"
            "Citations: None\n"
            "Disclaimer: For informational purposes only. Always consult a doctor."
        )

    # Prepare prompt for OpenRouter API
    prompt = f"""
You are a medical assistant chatbot. Answer the user query using ONLY the provided PDF context.

Rules:
- Use the context below to answer the query.
- Keep the answer clear and concise.
- At the end, add citations in this format: Citations: page numbers
- Group multiple pages from the same PDF together if applicable.

Context:
{context}

Question: {query}

Answer:
    """

    payload = {
        "model": MODEL_ID,
        "messages": [
            {"role": "system", "content": "You are a helpful AI assistant. Answer clearly and cite page numbers."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 2048,
    }

    # Call API with retry
    answer_text = ""
    for attempt in range(1, max_retries + 1):
        try:
            response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                answer_text = response.json()["choices"][0]["message"]["content"]
                break
            elif response.status_code == 429:
                time.sleep(retry_delay)
            else:
                answer_text = "We are currently experiencing technical issues. Please try again later."
                break
        except requests.exceptions.RequestException:
            time.sleep(retry_delay)
    else:
        answer_text = "We are currently experiencing high traffic. Please try again later."

    # Format the final response neatly
    formatted_response = (
        f"Response:\n{answer_text.strip()}\n\n"
        f"Citations: {', '.join(str(meta['page_number']) for _, meta in retrieved_docs)}\n"
        "Disclaimer: For informational purposes only. Always consult a doctor."
    )

    return formatted_response


# if __name__ == "__main__":
#     query = "What is rinvoq?"
#     print(generate_answer(query))
