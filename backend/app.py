# app.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pdf_loader import extract_text_with_page
from embedding_store import chunk_and_embed
import shutil, os
import pickle
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import os as os_env
import requests
import time
from dotenv import load_dotenv

# ------------------------------
# Initialization
# ------------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in production, set your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Load environment variables
load_dotenv()

# Embedding model
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

# Load FAISS index and metadata if exists
INDEX_PATH = "vector_store.faiss"
METADATA_PATH = "metadata.pkl"
if os.path.exists(METADATA_PATH) and os.path.exists(INDEX_PATH):
    with open(METADATA_PATH, "rb") as f:
        docs, metadata = pickle.load(f)
    index = faiss.read_index(INDEX_PATH)
else:
    docs, metadata, index = [], [], None

# ------------------------------
# Chat API
# ------------------------------
class ChatRequest(BaseModel):
    query: str

OPENROUTER_API_KEY = os_env.getenv("OPENROUTER_API_KEY")
MODEL_ID = "deepseek/deepseek-r1:free"
API_URL = "https://openrouter.ai/api/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
}

def retrieve(query: str, top_k: int = 10):
    if not index or not docs:
        return []
    query_embedding = embed_model.encode([query]).astype("float32")
    D, I = index.search(np.array(query_embedding), top_k)
    results = [(docs[i], metadata[i]) for i in I[0]]
    return results

def generate_answer(query: str, top_k: int = 3, max_retries: int = 3, retry_delay: int = 5):
    retrieved_docs = retrieve(query, top_k)

    if not retrieved_docs:
        return "Sorry, no relevant information found in the uploaded PDFs."

    context = "\n\n".join(
        [f"{meta['source']} | Page {meta['page_number']}: {chunk}" for chunk, meta in retrieved_docs]
    )

    prompt = f"""
You are a medical assistant chatbot. Answer the user query using ONLY the provided PDF context.

Rules:
- Use the context below to answer the query.
- Keep the answer clear.
- At the end, add citations in this format: Citations: page no: <page numbers>

Context:
{context}

Question: {query}

Answer:
    """

    payload = {
        "model": MODEL_ID,
        "messages": [
            {"role": "system", "content": "You are a helpful AI assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 2048,
    }

    for attempt in range(1, max_retries + 1):
        try:
            response = requests.post(API_URL, headers=HEADERS, json=payload, timeout=30)
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
            elif response.status_code == 429:
                time.sleep(retry_delay)
            else:
                return "We are currently experiencing technical issues. Please try again later."
        except requests.exceptions.RequestException:
            time.sleep(retry_delay)
    return "We are currently experiencing high traffic. Please try again later."

@app.post("/chat")
async def chat(req: ChatRequest):
    answer = generate_answer(req.query)
    return {"answer": answer}

# ------------------------------
# PDF Upload API
# ------------------------------
@app.post("/upload")
async def upload(files: list[UploadFile] = File(...)):
    global docs, metadata, index

    saved_files = []
    all_pages = []

    for f in files:
        path = os.path.join(UPLOAD_DIR, f.filename)
        with open(path, "wb") as buffer:
            shutil.copyfileobj(f.file, buffer)
        saved_files.append(f.filename)

        pages = extract_text_with_page(path)
        for page in pages:
            page["source"] = f.filename
        all_pages.extend(pages)

    # Chunk & embed
    chunk_and_embed(all_pages)

    # Reload docs, metadata, index
    with open("metadata.pkl", "rb") as f:
        docs, metadata = pickle.load(f)
    index = faiss.read_index("vector_store.faiss")

    return {
        "success": True,
        "message": f"Uploaded {len(saved_files)} files and updated index.",
        "files": saved_files,
    }
