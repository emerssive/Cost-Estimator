from config import db
from datetime import datetime

class Project(db.Model):
    __tablename__ = 'projects'
    project_id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.String(255), nullable=False)
    project_size = db.Column(db.String(20), nullable=False)
    budget = db.Column(db.Numeric(10, 2), nullable=False)
    timeline = db.Column(db.Integer, nullable=False)
    industry = db.Column(db.Text)
    additional_info = db.Column(db.Text)
    document_content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())


# CostEstimate Model
class CostEstimate(db.Model):
    __tablename__ = 'cost_estimates'

    estimate_id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.project_id'), nullable=False) 
    task = db.Column(db.String(255), nullable=False)
    subtask = db.Column(db.String(255), nullable=True)
    development_hours = db.Column(db.Integer, nullable=False)
    comments = db.Column(db.Text, nullable=True) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<CostEstimate {self.estimate_id} - Project ID {self.project_id}>'