#!/usr/bin/env python3
"""Bootstrap venv (jinja2, pyyaml) and run the generators CLI from the repo root."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

GENERATORS_DIR = Path(__file__).resolve().parent
SPARK_DIR = GENERATORS_DIR.parent
REPO_ROOT = SPARK_DIR.parent
VENV_DIR = GENERATORS_DIR / ".venv"
MARKER = VENV_DIR / ".deps-ok"


def venv_python() -> Path:
    if sys.platform == "win32":
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"


def ensure_venv() -> Path:
    py = venv_python()
    if not py.is_file():
        subprocess.check_call([sys.executable, "-m", "venv", str(VENV_DIR)], cwd=REPO_ROOT)
        subprocess.check_call([str(py), "-m", "pip", "install", "--upgrade", "pip"], cwd=REPO_ROOT)
    if not MARKER.is_file():
        subprocess.check_call(
            [str(py), "-m", "pip", "install", "jinja2>=3.1", "pyyaml>=6.0"],
            cwd=REPO_ROOT,
        )
        MARKER.write_text("ok\n", encoding="utf-8")
    return py


def main() -> int:
    py = ensure_venv()
    env = os.environ.copy()
    env["PYTHONPATH"] = str(SPARK_DIR)
    return subprocess.call(
        [str(py), "-m", "generators", *sys.argv[1:]],
        cwd=REPO_ROOT,
        env=env,
    )


if __name__ == "__main__":
    raise SystemExit(main())
