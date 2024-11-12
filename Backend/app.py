from config import create_app
from routes.project_routes import project_routes

app = create_app()

# Register the blueprint for project routes
app.register_blueprint(project_routes)

if __name__ == '__main__':
    app.run(debug=True)
