#!/bin/bash
# Script para iniciar el Gestor de Finanzas Personales en Ubuntu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

echo "=================================================="
echo "    Iniciando Gestor de Finanzas Personales       "
echo "=================================================="

# Comprobar python3
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 no está instalado en el sistema."
    exit 1
fi

python3 server.py

