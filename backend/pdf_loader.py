# pdf_loader.py

import fitz  # PyMuPDF


def extract_text_with_page(pdf_path: str):
    """
    Extract text from a PDF file along with page numbers.

    Args:
        pdf_path (str): Path to the PDF file.

    Returns:
        list[dict]: List of dictionaries containing page numbers and text.
    """
    doc = fitz.open(pdf_path)
    pages = []

    for page_num, page in enumerate(doc, start=1):
        text = page.get_text().strip()
        if text:
            pages.append({"page": page_num, "content": text})

    return pages


if __name__ == "__main__":
    data = extract_text_with_page("rinvoq_pi.pdf")
    print(f"Extracted {len(data)} pages")
