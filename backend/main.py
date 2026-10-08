"""
MedFlow-AI Backend Application Entry Point.
Registers modular routers including medicine_request and nearby_hospitals.
"""

import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Ensure project root is in Python module path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Import routes
from backend.routes.medicine_request import router as medicine_request_router
from backend.routes.nearby_hospitals import router as nearby_hospitals_router

# Try to import existing server app if available to share full state and endpoints
try:
    from server import app as main_app
    app = main_app
except Exception:
    app = FastAPI(
        title="MedFlow-AI API",
        description="Multi-Agent Medical Supply Chain Backend with Interactive Map Requisition",
        version="2.1.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register new routes on the application
app.include_router(medicine_request_router)
app.include_router(nearby_hospitals_router)

if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    print("[*] Starting MedFlow-AI Server on http://127.0.0.1:8000")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
