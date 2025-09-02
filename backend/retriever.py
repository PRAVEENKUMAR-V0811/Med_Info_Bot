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

# Load FAISS index and metadata
with open("metadata.pkl", "rb") as f:
    docs, metadata = pickle.load(f)

index = faiss.read_index("vector_store.faiss")

# Load embedding model
embed_model = SentenceTransformer("all-MiniLM-L6-v2")


def retrieve(query: str, top_k: int = 10):
    """Retrieve the top_k most relevant documents for a query."""
    query_embedding = embed_model.encode([query]).astype("float32")
    D, I = index.search(np.array(query_embedding), top_k)
    results = [(docs[i], metadata[i]) for i in I[0]]
    return results


# API configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL_ID = "deepseek/deepseek-r1:free"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
}

def generate_answer(query: str, top_k: int = 3, max_retries: int = 3, retry_delay: int = 5):
    """Generate an answer using retrieved documents and OpenRouter API with user-friendly error handling."""
    retrieved_docs = retrieve(query, top_k)

    if not retrieved_docs:
        return "Sorry, no relevant information found in the uploaded PDFs."

    # Combine text chunks with PDF name and page numbers
    context = "\n\n".join(
        [f"{meta['source']} | Page {meta['page_number']}: {chunk}" for chunk, meta in retrieved_docs]
    )

    prompt = f"""
You are a medical assistant chatbot. Answer the user query using ONLY the provided PDF context.

Rules:
- Use the context below to answer the query.
- Keep the answer clear.
- At the end, add citations in this format:
  Citations: page no: <page numbers>
- Group multiple pages from the same PDF together in citations if applicable.

Context:
{context}

Question: {query}

Answer:
    """

    payload = {
        "model": MODEL_ID,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful AI assistant, like ChatGPT. "
                           "Always answer clearly, conversationally, and cite page numbers at the end of response."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 2048,
    }

    for attempt in range(1, max_retries + 1):
        try:
            response = requests.post(API_URL, headers=headers, json=payload, timeout=30)

            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            elif response.status_code == 429:
                # Rate limit error
                print(f"High traffic detected. Retrying in {retry_delay} seconds... (Attempt {attempt}/{max_retries})")
                time.sleep(retry_delay)
            else:
                # Other API errors
                return "We are currently experiencing technical issues. Please try again later."

        except requests.exceptions.RequestException:
            print(f"Network or API error. Retrying in {retry_delay} seconds... (Attempt {attempt}/{max_retries})")
            time.sleep(retry_delay)

    # After all retries failed
    return "We are currently experiencing high traffic. Please try again after some time."



if __name__ == "__main__":
    query = "What is the use of paracetomol"
    print(generate_answer(query))
