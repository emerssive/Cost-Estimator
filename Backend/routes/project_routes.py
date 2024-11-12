from flask import Blueprint, request, current_app
from config import db
from models import Project
from .utils import calculateEstimates
from file_utils import allowed_file, extract_text_from_txt, extract_text_from_docx, extract_text_from_pdf
from flask import jsonify


# Define the blueprint
project_routes = Blueprint('project_routes', __name__)

@project_routes.route('/projectDetails', methods=['POST'])
def create_project():
    # Retrieve form data
    project_name = request.form['project_name']
    project_size = request.form['project_size']
    budget = request.form['budget']
    timeline = request.form['timeline']
    industry = request.form['industry']
    additional_info = request.form.get('additional_info', '')

    # Handle file upload and extract text
    file = request.files.get('attachment')
    if file and allowed_file(file.filename, current_app.config['ALLOWED_EXTENSIONS']):
        if file.filename.endswith('.txt'):
            document_content = extract_text_from_txt(file)
        elif file.filename.endswith('.docx'):
            document_content = extract_text_from_docx(file)
        elif file.filename.endswith('.pdf'):
            document_content = extract_text_from_pdf(file)
        else:
            return "Unsupported file type", 400

        # Create a new Project instance and save it to the database
        new_project = Project(
            project_name=project_name,
            project_size=project_size,
            budget=budget,
            timeline=timeline,
            industry = industry,
            additional_info=additional_info,
            document_content=document_content
            
        )
        db.session.add(new_project)
        db.session.commit()  # Commit to get the project_id

        # Call calculateEstimates with project details
        estimates = calculateEstimates(
            project_id=new_project.project_id,
            project_name=project_name,
            project_size=project_size,
            budget=budget,
            timeline=timeline,
            industry = industry,
            additional_info=additional_info,
            document_content=document_content
        )

        return jsonify({
            "message": f"Project '{project_name}' and estimates added successfully.",
            "estimates": estimates
        })

    return "No file uploaded or file type is not allowed", 400