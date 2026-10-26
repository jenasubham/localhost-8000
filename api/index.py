# Vercel runs files in api/ as serverless functions. This one just exposes the
# FastAPI app from backend/, and vercel.json sends every /api/* request here.
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.main import app  # noqa: E402, F401
