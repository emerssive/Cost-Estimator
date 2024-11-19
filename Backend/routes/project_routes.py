from flask import Blueprint, request, current_app
from config import db
from models import Project
from .calculateEstimates import calculate_estimates
from file_utils import allowed_file, extract_text_from_txt, extract_text_from_docx, extract_text_from_pdf
from flask import jsonify
from .resourcesAllocation import resourceAllocation

# Define the blueprint
project_routes = Blueprint('project_routes', __name__)

@project_routes.route('/projectDetails', methods=['POST'])
def create_project():
    try:
        # Retrieve form data with safe access using get()
        project_name = request.form.get('project_name', '')
        project_size = request.form.get('project_size', '')
        budget = request.form.get('budget', '')
        timeline = request.form.get('timeline', '')
        industry = request.form.get('industry', '')
        additional_info = request.form.get('additional_info', '')

        # Validate required fields
        if not project_name or not project_size or not budget or not industry:
            return jsonify({
                "success": False,
                "message": "All required fields (project_name, project_size, budget, timeline, industry) must be provided."
            }), 400

        # Handle file upload and extract text
        file = request.files.get('attachment')
        document_content = ''
        if file and allowed_file(file.filename, current_app.config['ALLOWED_EXTENSIONS']):
            # Generalize file processing using a dictionary
            file_processors = {
                'txt': extract_text_from_txt,
                'docx': extract_text_from_docx,
                'pdf': extract_text_from_pdf
            }
            file_extension = file.filename.rsplit('.', 1)[1].lower()

            if file_extension in file_processors:
                document_content = file_processors[file_extension](file)
            else:
                return jsonify({
                    "success": False,
                    "message": f"Unsupported file type. Allowed types are: {', '.join(file_processors.keys())}."
                }), 400

        # Create a new Project instance
        new_project = Project(
            project_name=project_name,
            project_size=project_size,
            budget=budget,
            timeline=timeline,
            industry=industry,
            additional_info=additional_info,
            document_content=document_content
        )

        # Save the project to the database with error handling
        try:
            db.session.add(new_project)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Database error: {e}")
            return jsonify({
                "success": False,
                "message": "Failed to save project to the database.",
                "error": str(e)
            }), 500

        # Calculate estimates with error handling
        try:
            estimates = calculate_estimates(
                project_id=new_project.project_id,
                project_name=project_name,
                project_size=project_size,
                industry=industry,
                additional_info=additional_info,
                document_content=document_content
            )
        except Exception as e:
            current_app.logger.error(f"Error calculating estimates: {e}")
            return jsonify({
                "success": False,
                "message": "Failed to calculate estimates.",
                "error": str(e)
            }), 500

        # Call resourceAllocation function
        resources = resourceAllocation(project_size=project_size)

        # Return success response
        return jsonify({
            "success": True,
            "message": f"Project '{project_name}' and estimates added successfully.",
            "data": {
                "project_id": new_project.project_id,
                "estimates": estimates,
                "resources": resources
            }
        }), 201

    except Exception as e:
        # Catch any unexpected errors
        current_app.logger.error(f"Unexpected error: {e}")
        return jsonify({
            "success": False,
            "message": "An unexpected error occurred.",
            "error": str(e)
        }), 500