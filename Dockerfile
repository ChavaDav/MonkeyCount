# ==============================================================================
# CAPITAL — Dockerfile de grado ligero y seguro (Python Alpine)
# ==============================================================================

FROM python:3.12-alpine

# Metadatos del contenedor
LABEL maintainer="CAPITAL Finance" \
      description="Gestor de tesorería personal, flujos recurrentes y balance financiero"

# Directorio de trabajo
WORKDIR /app

# Variables de entorno por defecto
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HOST=0.0.0.0 \
    PORT=5050 \
    CONTAINER=true

# Crear usuario sin privilegios para ejecución segura
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar archivos del proyecto
COPY server.py ./
COPY static/ ./static/
COPY data/ ./data/

# Asegurar permisos del directorio de datos para el usuario sin privilegios
RUN chown -R appuser:appgroup /app && \
    chmod -R 755 /app && \
    chmod -R 775 /app/data

# Cambiar al usuario sin privilegios
USER appuser

# Exponer el puerto del servidor
EXPOSE 5050

# Volumen persistente para almacenar la base de datos finanzas.json
VOLUME ["/app/data"]

# Healthcheck nativo sin requerir curl
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:5050/api/data', timeout=3)" || exit 1

# Comando de inicio
CMD ["python3", "server.py", "--no-browser", "--host", "0.0.0.0", "--port", "5050"]

