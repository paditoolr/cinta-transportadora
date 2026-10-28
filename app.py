"""Servidor Flask de la calculadora de cintas transportadoras.

Sirve index.html en la raíz y, con las mismas rutas relativas que usa la página,
estilos.css, calculadora.js y datos.json (las imágenes van incrustadas en datos.json).
No hace falta mover
nada a las carpetas static/ ni templates/ de Flask.

Uso:  pip install flask   ·   python app.py   ·   abrir http://localhost:5000
"""
import os

from flask import Flask, abort, send_from_directory

BASE = os.path.dirname(os.path.abspath(__file__))
PUBLICOS = {"estilos.css", "calculadora.js", "datos.json"}

# static_folder=None: se desactiva /static; las rutas se definen aquí abajo
app = Flask(__name__, static_folder=None)


@app.route("/")
def index():
    return send_from_directory(BASE, "index.html")


@app.route("/<path:ruta>")
def archivo(ruta):
    # Solo se publican los archivos del proyecto (no app.py ni LEEME.md)
    if ruta in PUBLICOS:
        return send_from_directory(BASE, ruta)
    abort(404)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
