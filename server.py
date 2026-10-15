#!/usr/bin/env python3
"""
Gestor de Finanzas Personales - Servidor Local
Ejecución en Ubuntu sin dependencias externas (usa solo la librería estándar de Python 3).
"""

import http.server
import socketserver
import json
import os
import sys
import webbrowser
import socket
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
DATA_DIR = BASE_DIR / "data"
DATA_FILE = DATA_DIR / "finanzas.json"

DEFAULT_DATA = {
    "moneda": "€",
    "meta_ahorro_porcentaje": 20,
    "ingresos": [],
    "gastos": []
}

def load_data():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        save_data(DEFAULT_DATA)
        return DEFAULT_DATA
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error al leer datos ({e}), utilizando datos por defecto.")
        return DEFAULT_DATA

def save_data(data):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp_file = DATA_FILE.with_suffix(".tmp")
    with open(tmp_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    tmp_file.replace(DATA_FILE)

class FinancialAppHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/data":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()
            data = load_data()
            self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))
        elif parsed.path == "/api/export":
            data = load_data()
            content = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Disposition", 'attachment; filename="mis_finanzas.json"')
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        else:
            # Default static files
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/data":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                new_data = json.loads(body)
                save_data(new_data)
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "ok", "message": "Datos guardados exitosamente"}).encode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode("utf-8"))
        elif parsed.path == "/api/reset":
            save_data(DEFAULT_DATA)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "data": DEFAULT_DATA}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

import signal

def find_available_port(host="127.0.0.1", start_port=5050):
    for port in range(start_port, start_port + 100):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind((host, port))
                return port
            except OSError:
                continue
    return start_port

def run(host=None, port=None, auto_open=True):
    # Detección de entorno
    if host is None:
        host = os.environ.get("HOST", "0.0.0.0" if os.environ.get("CONTAINER") or os.path.exists("/.dockerenv") else "127.0.0.1")
    
    if port is None:
        env_port = os.environ.get("PORT")
        if env_port and env_port.isdigit():
            port = int(env_port)
        else:
            port = find_available_port(host, 5050)

    handler = FinancialAppHandler
    socketserver.TCPServer.allow_reuse_address = True
    
    # Pre-cargar o verificar datos
    load_data()
    
    display_host = "localhost" if host in ("0.0.0.0", "127.0.0.1") else host
    url = f"http://{display_host}:{port}"
    print("=" * 60)
    print("  CAPITAL — GESTOR DE FLUJO Y TESORERÍA PERSONAL")
    print("=" * 60)
    print(f" Servidor iniciado en:  {url} (bind: {host}:{port})")
    print(f" Archivo de datos:     {DATA_FILE}")
    print(" Presiona Ctrl + C para detener el servicio.")
    print("=" * 60)

    if auto_open and (os.environ.get("DISPLAY") or os.environ.get("WAYLAND_DISPLAY")):
        try:
            webbrowser.open(url)
        except Exception:
            pass

    httpd = socketserver.TCPServer((host, port), handler)

    def handle_shutdown(signum, frame):
        print("\nRecibida señal de detención. Cerrando servidor limpiamente...")
        httpd.server_close()
        sys.exit(0)

    signal.signal(signal.SIGTERM, handle_shutdown)
    signal.signal(signal.SIGINT, handle_shutdown)

    try:
        httpd.serve_forever()
    except (KeyboardInterrupt, SystemExit):
        pass
    finally:
        httpd.server_close()

if __name__ == "__main__":
    auto = "--no-browser" not in sys.argv
    cli_host = None
    cli_port = None

    if "--host" in sys.argv:
        idx = sys.argv.index("--host")
        if idx + 1 < len(sys.argv):
            cli_host = sys.argv[idx + 1]

    if "--port" in sys.argv:
        idx = sys.argv.index("--port")
        if idx + 1 < len(sys.argv) and sys.argv[idx + 1].isdigit():
            cli_port = int(sys.argv[idx + 1])

    run(host=cli_host, port=cli_port, auto_open=auto)
