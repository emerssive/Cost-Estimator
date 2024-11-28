# 💰 Cost Estimator Tool

## 🎯 Overview

An AI-powered cost estimation tool using Claude 3.5 Sonnet LLM to analyze project requirements and generate detailed task breakdowns with resource allocations. Designed for sales teams to quickly generate accurate project estimates.

## ⭐ Features

* 🤖 **Project Analysis**: Generates tasks and subtasks from requirements documents
* 👥 **Resource Planning**: Allocates developers and effort percentages
* 📊 **Project Sizes**:
  * 🟢 Small (0-40 hours)
  * 🟡 Medium (120-300 hours)
  * 🟠 Large (300-600 hours)
  * 🔴 Enterprise (600+ hours)

## 🔧 Prerequisites

* 🐍 Python 3.7+
* 🗄️ PostgreSQL
* 🔑 Anthropic API key

## ⚡ Setup Instructions

### 🔙 Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python app.py
```

### 🖥️ Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm i

# Start development server
npm run dev
```

## ⚙️ Environment Configuration

Create a `.env` file with:
```plaintext
CLAUDE_API_KEY=your_anthropic_api_key
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
```


## 📝 Project Parameters

### 📥 Required Input
1. 📋 **Project Name**
2. 📏 **Project Size** (Small/Medium/Large/Enterprise)
3. ⏰ **Timeline** in weeks
4. 🛠️ **Tech Stack**: Tools, frameworks, and languages
5. 📄 **Requirements Document** (Upload)

### 📤 Output Generated
* ✅ Task breakdown with time estimates
* 👥 Resource allocation (Frontend/Backend developers)
* ⏱️ Development time estimates and comments
* 📊 Resource allocation percentages


## 🆘 Support

* 🐛 Create an issue in the GitHub repository
