from models import CostEstimate
from config import db
import anthropic
import json
import os
from dotenv import load_dotenv

def get_project_hours(project_size: str) -> int:
    """Return total hours based on project size"""
    project_hours = {
        "small": 100,
        "medium": 200,
        "large": 300
    }
    return project_hours.get(project_size.lower(), 200)  # Default to medium if size not found

def get_industry_focus(industry: str) -> list:
    """Return key focus areas based on industry"""
    industry_focus = {
        "e_commerce": ["payment processing", "inventory", "shopping cart", "order management"],
        "software_development": ["version control", "testing", "deployment", "documentation"],
        "healthcare": ["patient records", "data privacy", "appointment system", "billing"],
        "finance": ["transactions", "security", "reporting", "audit trails"],
        "education": ["content management", "assessment", "user progress", "collaboration"],
        "real_estate": ["property listings", "search", "client management", "scheduling"],
        "manufacturing": ["inventory", "process automation", "quality control", "tracking"]
    }
    return industry_focus.get(industry.lower().replace(" ", "_"), 
                            ["user management", "core features", "reporting", "administration"])


def calculateEstimates(project_id, project_name, project_size, budget, timeline, industry, additional_info, document_content):
    # Initialize the client
    load_dotenv()
    client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))
    
    total_hours = get_project_hours(project_size)
    industry_focus = get_industry_focus(industry)
    
    prompt = f"""Analyze this software project and break it down into tasks and estimates. Key information:

        Project Name: {project_name}
        Project Size: {project_size} ({total_hours} hours)
        Budget: {budget}
        Timeline: {timeline}
        Industry: {industry}
        Key Industry Focus: {', '.join(industry_focus)}

        Additional Context:
        {additional_info}

        Project Documentation:
        {document_content}

        Based on the above information:
        1. Break down the project into major tasks, considering {industry} industry requirements
        2. For each task, create subtasks with time estimates
        3. Total of all subtask hours should sum to approximately {total_hours} hours
        4. Consider standard {industry} industry features and requirements


        Please structure your response as a valid JSON object with this exact schema:

        {{
            "tasks": [
                {{
                    "task": "Major task name",
                    "subtasks": [
                        {{
                            "subtask": "Specific subtask description",
                            "hours": 8,
                            "comments": "Implementation details and technical notes"
                        }}
                    ]
                }}
            ],
            "summary": {{
                "total_hours": {total_hours},
                "num_tasks": "Total number of major tasks",
                "num_subtasks": "Total number of subtasks"
            }}
        }}

        Important guidelines:
        - Keep total hours close to {total_hours} for {project_size} project size
        - Be realistic with time estimates
        - Consider setup time, testing, and challenges
        - Include relevant technical notes in comments
        - Ensure estimates align with timeline of {timeline}
        - Stay within budget of {budget}
        - Consider standard {industry} industry features
        - Format output as valid JSON only

        Do not include any explanatory text outside the JSON structure."""

    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        response_content = response.content[0].text
        estimates_data = json.loads(response_content)
        
        if "tasks" not in estimates_data:
            raise ValueError("Response missing 'tasks' key in JSON structure")

        # Save estimates to database
        for task in estimates_data["tasks"]:
            for subtask in task["subtasks"]:
                cost_estimate = CostEstimate(
                    project_id=project_id,
                    task=task['task'],
                    subtask=subtask['subtask'],
                    development_hours=subtask['hours'],  # Updated to match new schema
                    comments=subtask['comments']  # Updated to match new schema
                )
                db.session.add(cost_estimate)
        
        db.session.commit()
        return estimates_data

    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        raise
    except Exception as e:
        print(f"Error processing estimates: {e}")
        raise