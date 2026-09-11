import os
import sys
from app import create_app
from app.config import Config

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', Config.FLASK_PORT))
    debug = Config.FLASK_DEBUG
    print(f"Starting Thermal Watch AI Backend on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
