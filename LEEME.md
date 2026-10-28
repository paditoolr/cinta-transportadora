# Calculadora de cintas transportadoras

Dimensionamiento de cintas transportadoras (capacidad, resistencias, potencia, tensiones de banda y selección de componentes) para la asignatura Transporte y Manutención Industrial.

## Estructura

| Archivo | Contenido |
| --- | --- |
| `index.html` | Estructura de la página (cabecera, pestañas, contenedores y ventana emergente) |
| `estilos.css` | Aspecto: colores, tarjetas, tablas, miniaturas y ventana emergente |
| `calculadora.js` | Fórmulas de cálculo, generación de la interfaz, ayudas visuales y valores automáticos |
| `datos.json` | Datos: tablas de k, CL, longitudes de rodillos, anchura mínima y velocidad máxima, secciones, biblioteca de materiales e imágenes (clave `imagenes`, en base64) |
| `app.py` | Servidor Flask opcional para ejecutarla en local |

## Cómo ejecutarla

`calculadora.js` lee `datos.json` con `fetch`, y el navegador no permite hacerlo si la página se abre con doble clic. Hay que servir la carpeta:

1. Abrir una terminal en esta carpeta.
2. Ejecutar `python3 -m http.server 8000`.
3. Abrir http://localhost:8000 en el navegador.

Alternativas: `pip install flask` y `python app.py` (http://localhost:5000); con Node, `npx serve .`; con VS Code, la extensión *Live Server*.

## Si usas tu propio Flask

Los datos y las imágenes (ambos dentro de `datos.json`) se buscan en la misma carpeta desde la que se carga `calculadora.js`. Si pones esos archivos en `static/`, deja **juntos** `calculadora.js`, `datos.json` y `estilos.css` y enlaza el CSS y el JS desde la plantilla con `url_for('static', filename='...')`.

## Cambiar un dato

Los valores de las tablas están en `datos.json`; no hace falta tocar el código. El archivo incluye un bloque `_comentarios` que explica qué es cada tabla y cómo está organizada.
