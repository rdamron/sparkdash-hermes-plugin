"""SparkDash plugin backend: per-install sparkDash URL, stored plugin-locally.

Routes mount at /api/plugins/sparkdash-rail/ behind the dashboard's normal
auth gate. State lives in <hermes home>/plugin-data/sparkdash-rail/config.json
(the documented per-plugin store — survives plugin updates and removal).
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict

try:
    from fastapi import APIRouter, HTTPException
except ModuleNotFoundError:  # pragma: no cover - test fallback when FastAPI is unavailable
    class HTTPException(Exception):
        def __init__(self, status_code: int, detail: str):
            super().__init__(detail)
            self.status_code = status_code
            self.detail = detail

    class APIRouter:  # minimal decorator-compatible fallback for unit tests
        def get(self, _path: str):
            def decorator(fn):
                return fn
            return decorator

        def post(self, _path: str):
            def decorator(fn):
                return fn
            return decorator

PLUGIN_ID = "sparkdash-rail"
DEFAULT_URL = "http://172.24.3.48:5555"

router = APIRouter()


def _config_path() -> Path:
    try:
        from plugins.plugin_storage import plugin_data_dir

        return plugin_data_dir(PLUGIN_ID) / "config.json"
    except Exception:
        hermes_home = Path(os.environ.get("HERMES_HOME") or (Path.home() / ".hermes"))
        return hermes_home / "plugin-data" / PLUGIN_ID / "config.json"


def _load() -> Dict[str, Any]:
    try:
        return json.loads(_config_path().read_text(encoding="utf-8"))
    except Exception:
        return {}


def _save(state: Dict[str, Any]) -> None:
    path = _config_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")


def normalize_url(raw: str) -> str:
    """Trim; empty resets to default; schemeless hosts get http://."""
    value = (raw or "").strip().rstrip("/")
    if not value:
        return ""
    if "://" not in value:
        value = "http://" + value
    return value


@router.get("/config")
async def get_config():
    state = _load()
    return {"url": state.get("url", ""), "default_url": DEFAULT_URL}


@router.post("/config")
async def set_config(body: Dict[str, Any]):
    raw = body.get("url") if isinstance(body, dict) else None
    url = normalize_url(raw if isinstance(raw, str) else "")
    _save({"url": url})
    return {"ok": True, "url": url, "effective": url or DEFAULT_URL}
