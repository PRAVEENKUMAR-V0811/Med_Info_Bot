# app.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from retriever import generate_answer
from pdf_loader import extract_text_with_page
from embedding_store import chunk_and_embed
import shutil, os

app = FastAPI()

# Allow frontend (Vite) to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to ["http://localhost:5173"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ----------------------------
# Chat endpoint (JSON request)
# ----------------------------
class ChatRequest(BaseModel):
    query: str

@app.post("/chat")
async def chat(req: ChatRequest):
    """Chat endpoint for users (expects JSON {query: ...})."""
    answer = generate_answer(req.query)
    return {"answer": answer}

# ----------------------------
# PDF Upload endpoint (Admin)
# ----------------------------
@app.post("/upload")
async def upload(files: list[UploadFile] = File(...)):
    """Admin upload endpoint for PDFs."""
    saved_files = []
    all_pages = []

    for f in files:
        path = os.path.join(UPLOAD_DIR, f.filename)
        with open(path, "wb") as buffer:
            shutil.copyfileobj(f.file, buffer)
        saved_files.append(f.filename)

        # Extract text + page metadata
        pages = extract_text_with_page(path)
        for p in pages:
            p["source"] = f.filename
        all_pages.extend(pages)

    # Embed & update FAISS index
    chunk_and_embed(all_pages)

    return {
        "success": True,
        "message": f"Uploaded {len(saved_files)} files and updated index.",
        "files": saved_files,
    }
