"""
app.py — Entry point for the Flask application.
Run with:  python app.py
"""
from app import create_app

app = create_app()

if __name__ == '__main__':
    print("\n  [*] FinVest AI Backend running on http://localhost:5000")
    print("  [*] API base URL: http://localhost:5000/api\n")
    app.run(host='0.0.0.0', port=5000, debug=True)
