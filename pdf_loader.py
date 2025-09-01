# pdf_loader.py
import fitz

def extract_text_with_page(pdf_path):
    doc = fitz.open(pdf_path)
    pages = []
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text().strip()
        if text.strip():
            pages.append({"page": page_num, "content": text})
    return pages

if __name__ == "__main__":
    data = extract_text_with_page("rinvoq_pi.pdf")
    print(f"Extracted {len(data)} pages")
