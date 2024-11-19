def resourceAllocation(project_size: str):
    resources = []
    engagement = ""

    if project_size.lower() == 'small':
        engagement = "Partial"
        resources = [
            {
                "role": "Frontend Developer",
                "units": 1,
                "allocation_percentage": 100,
                "engagement_type": engagement
            },
            {
                "role": "Fullstack Developer",
                "units": 1,
                "allocation_percentage": 100,
                "engagement_type": engagement
            }
        ]
        option_2 = {
            "role": "Backend Developer",
            "units": 1,
            "allocation_percentage": 100,
            "engagement_type": engagement
        }
        resources.append(option_2)

    elif project_size.lower() == 'medium':
        engagement = "Full"
        resources = [
            {
                "role": "Project Manager",
                "units": 1,
                "allocation_percentage": 15,
                "engagement_type": engagement
            },
            {
                "role": "Fullstack Developer",
                "units": 1,
                "allocation_percentage": 100,
                "engagement_type": engagement
            },
            {
                "role": "Frontend Developer",
                "units": 1,
                "allocation_percentage": 100,
                "engagement_type": engagement
            },
            {
                "role": "QA Engineer",
                "units": 1,
                "allocation_percentage": 20,
                "engagement_type": engagement
            }
        ]

    elif project_size.lower() == 'large':
        engagement = "Full"
        resources = [
            {
                "role": "Project Manager",
                "units": 1,
                "allocation_percentage": 30,
                "engagement_type": engagement
            },
            {
                "role": "Senior Fullstack Developer",
                "units": 1,
                "allocation_percentage": 30,
                "engagement_type": engagement
            },
            {
                "role": "Fullstack Developer",
                "units": 3,
                "allocation_percentage": 100,
                "engagement_type": engagement
            },
            {
                "role": "QA Engineer",
                "units": 1,
                "allocation_percentage": 100,
                "engagement_type": engagement
            }
        ]

    else:
        return {"error": "Invalid project size. Expected 'small', 'medium', or 'large'."}

    return resources