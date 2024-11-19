from models import CostEstimate
from config import db
import anthropic
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Constants
DEFAULT_INDUSTRY_FOCUS = ["user management", "core features", "reporting", "administration"]

# Predefined dictionaries
PROJECT_HOURS = {
    "small": "40-120 Hours",
    "medium": "120-300 Hours",
    "large": "300-600 Hours and 600 Hours +"
}

INDUSTRY_FOCUS = {
    "e_commerce": ["payment processing", "inventory", "shopping cart", "order management"],
    "software_development": ["version control", "testing", "deployment", "documentation"],
    "healthcare": ["patient records", "data privacy", "appointment system", "billing"],
    "finance": ["transactions", "security", "reporting", "audit trails"],
    "education": ["content management", "assessment", "user progress", "collaboration"],
    "real_estate": ["property listings", "search", "client management", "scheduling"],
    "manufacturing": ["inventory", "process automation", "quality control", "tracking"]
}

# Helper Functions
def get_project_hours(project_size: str) -> str:
    """Return total hours range based on project size."""
    return PROJECT_HOURS.get(project_size.lower(), "120-300 Hours")  # Default to medium range

def get_industry_focus(industry: str) -> list:
    """Return key focus areas based on industry."""
    return INDUSTRY_FOCUS.get(industry.lower().replace(" ", "_"), DEFAULT_INDUSTRY_FOCUS)

def call_anthropic_api(prompt: str, model="claude-3-5-sonnet-20241022", max_tokens=4096):
    """Helper function to call the Anthropics API."""
    client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))
    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text if response.content else None

def parse_json_response(response: str):
    """Parse JSON response from the API."""
    try:
        return json.loads(response)
    except json.JSONDecodeError as e:
        raise ValueError(f"Error parsing JSON response: {e}")

# Core Functions
def generate_tasks_and_subtasks(additional_info: str, document_content: str):
    """Generate tasks and subtasks for the project."""
    prompt = f"""Please analyze the following document content and identify the major tasks and their associated subtasks.

                Document Content:
                {document_content}

                The "Additional Context" provides an overview of the frameworks, tools, libraries, and programming languages to be used in this project:
                {additional_info}

                Based on this information, extract and structure the major tasks along with their subtasks in the following format (valid JSON):

                {{
                    "tasks": [
                        {{
                            "task": "Major task name",
                            "subtasks": [
                                {{
                                    "subtask": "Specific subtask description"
                                }}
                            ]
                        }}
                    ]
                }}

                Key Guidelines:
                1. Ensure the JSON structure is strictly followed.
                2. Only include task names and subtasks—do not include any additional explanations or commentary.
                3. Ensure each task is broken down into clear, actionable subtasks.
                4. Keep the subtasks concise, focusing on specific actions to be taken in the project.

                Do not provide any explanatory text or additional information outside of the JSON format.
                """

    response = call_anthropic_api(prompt)
    if not response:
        raise ValueError("Anthropic API did not return a valid response.")
    tasks_data = parse_json_response(response)
    if "tasks" not in tasks_data:
        raise ValueError("Response missing 'tasks' key.")
    return tasks_data

def generate_estimates(project_id: int, project_name: str, project_size: str, industry: str, additional_info: str, tasks_and_subtasks: dict):
    """Generate time estimates for the project tasks and subtasks."""
    hours_range = get_project_hours(project_size)
    industry_focus = get_industry_focus(industry)

    prompt = f"""Analyze the software project and provide development time estimates.

            Key Information:
            - Project Name: {project_name}
            - Project Size: {project_size} (estimated range: {hours_range} hours)
            - Industry: {industry}
            - Key Focus Areas: {', '.join(industry_focus)}

            Additional Context (Frameworks, Tools, Languages):
            {additional_info}

            Project Tasks and Subtasks:
            {tasks_and_subtasks}

            Please structure your response as a valid JSON object with the following schema:

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
                ]
            }}

            Based on the provided information:
            1. Estimate development time for each task and subtask.
            2. The total hours for all subtasks should sum to approximately {hours_range} hours.
            4. Ensure time estimates are realistic, factoring in setup time, testing, and potential challenges.
            5. Account for standard features and requirements of the {industry} industry.
            6. Include relevant technical notes in the "comments" section for each task and subtask.
            7. Consider Additional Context in estimating the development time by considering setup complexity, integration requirements, and learning curves associated with the selected technologies.
            7. Format the output strictly as valid JSON, with no explanatory text outside the JSON structure.
    """
    response = call_anthropic_api(prompt)
    if not response:
        raise ValueError("Anthropic API did not return a valid response.")
    estimates_data = parse_json_response(response)
    if "tasks" not in estimates_data:
        raise ValueError("Response missing 'tasks' key.")
    
    # Save to database
    for task in estimates_data["tasks"]:
        for subtask in task["subtasks"]:
            db.session.add(CostEstimate(
                project_id=project_id,
                task=task["task"],
                subtask=subtask["subtask"],
                development_hours=subtask["hours"],
                comments=subtask["comments"]
            ))
    db.session.commit()
    return estimates_data

def calculate_summary(data):
    total_hours = 0
    num_tasks = len(data['tasks'])
    num_subtasks = 0

    # Iterate through tasks and subtasks to calculate total hours and number of subtasks
    for task in data['tasks']:
        for subtask in task['subtasks']:
            total_hours += subtask['hours']
            num_subtasks += 1

    # Append the summary to the data
    data['summary'] = {
        'total_hours': total_hours,
        'num_tasks': num_tasks,
        'num_subtasks': num_subtasks
    }

    return data

def calculate_estimates(project_id: int, project_name: str, project_size: str, industry: str, additional_info: str, document_content: str):
    """Calculate estimates by generating tasks and estimates."""
    try:
        tasks_and_subtasks = generate_tasks_and_subtasks(additional_info, document_content)
        estimates_data = generate_estimates(project_id, project_name, project_size, industry, additional_info, tasks_and_subtasks)
        estimates_data = calculate_summary(estimates_data)
        return estimates_data
    except Exception as e:
        print(f"Error during calculation: {e}")
        return None
