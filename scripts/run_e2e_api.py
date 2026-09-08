"""Serve the real API with a disposable database for Playwright."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile

with tempfile.TemporaryDirectory(prefix='stockmaster-e2e-') as directory:
    environment = {**os.environ, 'DATABASE_URL': f'sqlite:///{directory}/test.sqlite', 'STRICT_DB': '0'}
    subprocess.run(
        [sys.executable, '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'],
        cwd=Path(__file__).resolve().parents[1], env=environment, check=True,
    )
