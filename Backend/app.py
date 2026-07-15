"""
app.py — Entry point for the Flask application.
Run with:  python app.py
"""
import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', '5000'))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    print(f"\n  [*] FinVest AI Backend running on http://localhost:{port}")
    print(f"  [*] API base URL: http://localhost:{port}/api\n")
    app.run(host='0.0.0.0', port=port, debug=debug, threaded=True)
