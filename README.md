# Cost Estimator Tool

## Project Overview

The **Cost Estimator Tool** is a web-based application designed to help sales teams quickly generate project cost estimates. The tool asks critical project questions, allows users to upload requirement documents, and provides a cost estimate based on predefined rules. All input and output data are stored for future learning and improvement of the estimation logic.

## Key Features

- **Project Form**: Collects critical project details such as size, budget, timeline, and additional information.
- **Document Upload**: Allows users to upload project requirement documents in `.txt`, `.docx`, or `.pdf` formats. The tool extracts text from these documents to assist in generating estimates.
- **Cost Estimation**: Generates a detailed breakdown of tasks, subtasks, and development hours.
- **Data Storage**: Stores all input data and generated estimates for future machine learning or data analysis.

## Technologies Used

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Python (Flask or Django)
- **Database**: PostgreSQL

## Getting Started

### Prerequisites

- Node.js and npm installed
- Python 3.7+ and Flask/Django installed
- PostgreSQL database setup

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/cost-estimator-tool.git
   
2. Set up Frontend
   ```bash
   cd frotnend
   npm install
   
3. Backend Setup
   ```bash
   cd backend
   pip install -r requirements.txt
   
4. Start servers:   
   ```bash
   python app.py
   npm start
