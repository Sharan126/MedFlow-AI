"""
MedFlow-AI Backend Application Entry Point.
Exports the unified FastAPI app from server.py.
"""

import sys
from pathlib import Path
import uvicorn

# Ensure project root is in Python module path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from server import app

if __name__ == "__main__":
    reconf = getattr(sys.stdout, "reconfigure", None)
    if callable(reconf):
        try:
            reconf(encoding="utf-8")
        except Exception:
            pass
    print("[*] Starting MedFlow-AI Server on http://127.0.0.1:8000")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
