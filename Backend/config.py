from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import signal
import sys
import anthropic
from dotenv import load_dotenv
import os

# Initialize the database
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    load_dotenv()
    # Configure the PostgreSQL URI
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DB_URL")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Configure the allowed file extensions
    app.config['ALLOWED_EXTENSIONS'] = {'txt', 'docx', 'pdf'}

    # Initialize the database with the app
    db.init_app(app)

    # Signal handler for SIGINT (Ctrl+C)
    def handle_exit_signal(signal, frame):
        print("Shutting down Server...")
        db.session.close_all()  # Explicitly close all database sessions
        sys.exit(0)

    # Register the SIGINT handler
    signal.signal(signal.SIGINT, handle_exit_signal)

    return app
