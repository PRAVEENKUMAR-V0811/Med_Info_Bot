import pickle
import faiss
import numpy as np
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer

# Load embedding model (lightweight)
model = SentenceTransformer("all-MiniLM-L6-v2")

def chunk_and_embed(pages: list, index_path: str = "vector_store.faiss"):
    """
    Split PDF text into chunks, generate embeddings, and store them in FAISS.

    Args:
        pages (list): List of dicts containing {"page", "content", "source"}.
        index_path (str): Path where FAISS index will be saved.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
    )

    docs, metadata = [], []

    for page in pages:
        chunks = text_splitter.split_text(page["content"])
        for chunk in chunks:
            docs.append(chunk)
            metadata.append({
                "page_number": page["page"],
                "source": page.get("source", "PDF")  # store PDF name
            })

    # Encode chunks into embeddings
    embeddings = model.encode(docs)

    # Build FAISS index
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype("float32"))

    # Save docs and metadata
    with open("metadata.pkl", "wb") as f:
        pickle.dump((docs, metadata), f)

    # Save FAISS index
    faiss.write_index(index, index_path)

    print(f"✅ Stored {len(docs)} chunks from {len(set([m['source'] for m in metadata]))} PDFs in FAISS index")


if __name__ == "__main__":
    from pdf_loader import extract_text_with_page

    # Example for multiple PDFs
    all_pages = []

    for pdf_file in ["rinvoq_pi.pdf"]:  # add multiple PDFs here
        pages = extract_text_with_page(pdf_file)
        for page in pages:
            page["source"] = pdf_file
        all_pages.extend(pages)

    chunk_and_embed(all_pages)
