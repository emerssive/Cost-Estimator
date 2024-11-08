-- Projects table schema
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    project_name VARCHAR(255),
    project_size VARCHAR(20) CHECK (project_size IN ('Small', 'Medium', 'Large')),
    budget DECIMAL(10, 2),
    timeline INT, -- in weeks
    additional_info TEXT, -- Optional additional details
    document_Content TEXT, -- Path to uploaded document (or URL if using cloud storage)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cost Estimates table schema
CREATE TABLE cost_estimates (
    estimate_id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(project_id), -- Foreign key to projects table
    task VARCHAR(255),
    subtask VARCHAR(255),
    development_hours INT,
    comments TEXT, -- Any notes or comments
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);