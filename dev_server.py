"""Local development server for the static UI and /api/frame endpoint."""

import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from api.frame import handler as ApiHandler


ROOT = Path(__file__).resolve().parent


def load_local_environment() -> None:
    env_file = ROOT / ".env.local"
    if not env_file.exists():
        return
    for raw_line in env_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


class DevelopmentHandler(ApiHandler, SimpleHTTPRequestHandler):
    def do_GET(self) -> None:
        if self.path.rstrip("/") == "/api/frame":
            self._json(405, {"error": "POST 요청만 지원합니다."})
            return
        super().do_GET()

    def log_message(self, format: str, *args) -> None:
        if self.path.startswith("/api/"):
            print(f"API {self.command} {self.path} → {args[1]}")


if __name__ == "__main__":
    load_local_environment()
    port = int(os.environ.get("PORT", "4173"))
    request_handler = partial(DevelopmentHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", port), request_handler)
    print(f"Bound Mission: http://127.0.0.1:{port}")
    has_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    print("AI Frame:", "ready" if has_key else "GEMINI_API_KEY is missing")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()
