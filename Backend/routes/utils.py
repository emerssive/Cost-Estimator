from models import CostEstimate
from config import db
import anthropic
import json
import os
from dotenv import load_dotenv

def get_size_guidelines(project_size):
    """Return specific guidelines based on project size"""
    size_guidelines = {
        "small": {
            "task_range": "5-10",
            "complexity": "low to medium",
            "team_size": "1-2 developers",
            "typical_duration": "2-4 weeks"
        },
        "medium": {
            "task_range": "10-20",
            "complexity": "medium to high",
            "team_size": "3-5 developers",
            "typical_duration": "1-3 months"
        },
        "large": {
            "task_range": "20-40",
            "complexity": "high",
            "team_size": "5+ developers",
            "typical_duration": "3-6 months"
        }
    }
    return size_guidelines.get(project_size.lower(), size_guidelines["medium"])


def calculateEstimates(project_id, project_name, project_size, budget, timeline, additional_info, document_content):
    # Initialize the client 
    # Load environment variables from the .env file
    load_dotenv()
    client = anthropic.Anthropic(api_key=os.getenv("CLAUDE_API_KEY"))

    size_info = get_size_guidelines(project_size)
    
    # Create a more structured prompt
    prompt = f"""Please analyze this software project and break it down into detailed tasks and estimates. Here is the key project information:

        Project Name: {project_name}
        Project Size: {project_size} 
        - Expected number of major tasks: {size_info['task_range']}
        - Typical complexity level: {size_info['complexity']}
        - Recommended team size: {size_info['team_size']}
        - Typical duration range: {size_info['typical_duration']}

        Budget: {budget}
        Timeline: {timeline}

        Additional Context:
        {additional_info}

        Project Documentation:
        {document_content}

        Based on the above information, please:

        1. Break down the project into {size_info['task_range']} major tasks, appropriate for a {project_size} project
        2. For each major task:
        - Identify specific subtasks that need to be completed
        - Ensure task complexity aligns with {size_info['complexity']} complexity level
        - Consider parallel work possible with {size_info['team_size']}

        3. For each subtask:
        - Estimate development hours required, considering the team size of {size_info['team_size']}
        - Consider technical requirements and constraints
        - Add relevant notes about implementation approach
        - Factor in complexity appropriate for a {project_size} project

        Please structure your response as a valid JSON object with this exact schema:

        {{
            "tasks": [
                {{
                    "task": "Major task name",
                    "estimated_team_size": "Number of developers recommended",
                    "subtasks": [
                        {{
                            "subtask": "Specific subtask description",
                            "development_hours": 8,
                            "complexity_level": "low|medium|high",
                            "comments_notes": "Technical notes, constraints, and implementation details"
                        }}
                    ]
                }}
            ],
            "project_summary": {{
                "total_hours": "Sum of all development hours",
                "recommended_team_size": "{size_info['team_size']}",
                "estimated_duration": "Total calendar time needed",
                "complexity_breakdown": {{
                    "low_complexity_tasks": "Count of low complexity tasks",
                    "medium_complexity_tasks": "Count of medium complexity tasks",
                    "high_complexity_tasks": "Count of high complexity tasks"
                }}
            }}
        }}

        Important guidelines:
        - Scale estimates appropriately for a {project_size} project
        - Be realistic and conservative with time estimates
        - Consider setup time, testing, and potential challenges
        - Include notes about dependencies and technical requirements
        - Ensure estimates align with the overall project timeline of {timeline}
        - Keep the total estimated hours within the project budget of {budget}
        - Consider parallel development possibilities with {size_info['team_size']}
        - Maintain appropriate task granularity for a {project_size} project
        - Format all output as valid JSON that can be parsed programmatically

        Do not include any explanatory text outside the JSON structure."""

    # Call the API with improved parameters
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4096,  # Increased for more detailed responses
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        
        # Parse the response
        response_content = response.content[0].text  # Updated to match Claude 3.5 response structure
        estimates_data = json.loads(response_content)
        
        # Validate the response structure
        if "tasks" not in estimates_data:
            raise ValueError("Response missing 'tasks' key in JSON structure")

        # Save estimates to database
        for task in estimates_data["tasks"]:
            for subtask in task["subtasks"]:
                cost_estimate = CostEstimate(
                    project_id=project_id,
                    task=task['task'],
                    subtask=subtask['subtask'],
                    development_hours=subtask['development_hours'],
                    comments=subtask['comments_notes']
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