from config import create_app
from routes.project_routes import project_routes
from flask_cors import CORS

app = create_app()
CORS(app)


# Register the blueprint for project routes
app.register_blueprint(project_routes)

if __name__ == '__main__':
    app.run(debug=True)
