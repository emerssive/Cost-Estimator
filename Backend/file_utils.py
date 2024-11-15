from io import BytesIO
from docx import Document
import pdfplumber

# Function to check allowed file extensions
def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

# Function to extract text from a .txt file
def extract_text_from_txt(file):
    return file.read().decode('utf-8')

# Function to extract text from a .docx file
def extract_text_from_docx(file):
    doc = Document(BytesIO(file.read()))
    return '\n'.join([para.text for para in doc.paragraphs])

# Function to extract text from a .pdf file
def extract_text_from_pdf(file):
    text = ""
    with pdfplumber.open(BytesIO(file.read())) as pdf:
        for page in pdf.pages:
            text += page.extract_text()
    return text
