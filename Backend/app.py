from flask import Flask, render_template, request
from io import BytesIO
from docx import Document
import PyPDF2
import pdfplumber

app = Flask(__name__)

# Configure the allowed extensions
app.config['ALLOWED_EXTENSIONS'] = {'txt', 'docx', 'pdf'}

# Function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Function to extract text from a .txt file
def extract_text_from_txt(file):
    return file.read().decode('utf-8')

# Function to extract text from a .docx file
def extract_text_from_docx(file):
    doc = Document(BytesIO(file.read()))  # Read the file into memory
    text = '\n'.join([para.text for para in doc.paragraphs])
    return text

# Function to extract text from a .pdf file
def extract_text_from_pdf(file):
    text = ""
    with pdfplumber.open(BytesIO(file.read())) as pdf:  # Read the file into memory
        for page in pdf.pages:
            text += page.extract_text()
    return text

@app.route('/projectDetails', methods=['POST'])
def project_details():
    if request.method == 'POST':
        # Retrieve form data
        project_size = request.form['project_size']
        budget = request.form['budget']
        timeline = request.form['timeline']
        additional_info = request.form['additional_info']

        # Handle file upload
        file = request.files['attachment']
        extracted_text = None

        if file and allowed_file(file.filename):
            filename = file.filename

            # Extract text based on file extension
            if filename.endswith('.txt'):
                extracted_text = extract_text_from_txt(file)
            elif filename.endswith('.docx'):
                extracted_text = extract_text_from_docx(file)
            elif filename.endswith('.pdf'):
                extracted_text = extract_text_from_pdf(file)

        # Print all received data
        print(f"Project Size: {project_size}")
        print(f"Budget: {budget}")
        print(f"Timeline: {timeline}")
        print(f"Additional Info: {additional_info}")
        print(f"Attachment: {filename if file else 'None'}")
        print(f"Extracted Text from Attachment: {extracted_text if extracted_text else 'No text extracted'}")

        # Process the form data (e.g., save to a database, etc.)
        return f"Form submitted! Project size: {project_size}, Budget: {budget}, Timeline: {timeline}, Additional Info: {additional_info}, Attachment saved as {filename if file else 'None'}"


if __name__ == '__main__':
    app.run(debug=True)
