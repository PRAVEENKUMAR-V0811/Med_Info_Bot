import streamlit as st
from retriever import generate_answer
from pdf_loader import extract_text_with_page
from embedding_store import chunk_and_embed
import os

st.set_page_config(page_title="Drug Info Chatbot", layout="wide", page_icon="🤖")

with st.sidebar:
    st.markdown("## ⚙️ Chat Settings")

    st.markdown("---")
    uploaded_file = st.file_uploader("Upload PDF", type=["pdf"])
    if uploaded_file:
        with open("temp.pdf", "wb") as f:
            f.write(uploaded_file.getbuffer())
        if st.button("Process PDF"):
            pages = extract_text_with_page("temp.pdf")
            chunk_and_embed(pages, index_path="user_vector_store.faiss")
            st.success(f"Processed PDF with {len(pages)} pages!")