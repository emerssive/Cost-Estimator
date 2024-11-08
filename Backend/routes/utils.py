from models import CostEstimate
from config import db

def calculateEstimates(project_id, project_name, project_size, budget, timeline, additional_info, document_content):
    # Generate JSON array of estimates
    estimates_data = [
        {"task": "Design", "subtask": "UI Design", "development_time": 12, "comments": "Initial design phase."},
        {"task": "Development", "subtask": "Backend Setup", "development_time": 20, "comments": "Database and server setup."},
        {"task": "Testing", "subtask": "Unit Testing", "development_time": 8, "comments": "Basic functionality tests."}
    ]
    
    # Save each estimate to the database
    for estimate in estimates_data:
        cost_estimate = CostEstimate(
            project_id=project_id,
            task=estimate['task'],
            subtask=estimate['subtask'],
            development_hours=estimate['development_time'],
            comments=estimate['comments']
        )
        db.session.add(cost_estimate)
    
    db.session.commit()  # Commit all cost estimates to the database

    # Return the JSON formatted estimates data
    return estimates_data