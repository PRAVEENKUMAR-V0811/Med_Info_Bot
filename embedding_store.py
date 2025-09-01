#embedding_store.py

from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle

model = SentenceTransformer('all-MiniLM-L6-v2')  # Lightweight embedding model

def chunk_and_embed(pages, index_path="vector_store.faiss"):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = []
    metadata = []

    for page in pages:
        chunks = text_splitter.split_text(page["content"])
        for chunk in chunks:
            docs.append(chunk)
            # Store metadata as dictionary
            metadata.append({"page_number": page["page"], "source": page.get("source", "PDF")})

    embeddings = model.encode(docs)
    dim = embeddings.shape[1]

    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype('float32'))  # ensure correct dtype

    # Save docs and metadata
    with open("metadata.pkl", "wb") as f:
        pickle.dump((docs, metadata), f)
    faiss.write_index(index, index_path)
    print(f"Stored {len(docs)} chunks in FAISS index")

if __name__ == "__main__":
    from pdf_loader import extract_text_with_page
    pages = extract_text_with_page("rinvoq_pi.pdf")
    chunk_and_embed(pages)
