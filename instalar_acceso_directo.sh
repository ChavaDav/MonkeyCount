#!/bin/bash
# Script para crear un acceso directo en el menú de aplicaciones de Ubuntu

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESKTOP_DIR="$HOME/.local/share/applications"
DESKTOP_FILE="$DESKTOP_DIR/gestor-finanzas.desktop"

mkdir -p "$DESKTOP_DIR"

cat <<EOF > "$DESKTOP_FILE"
[Desktop Entry]
Version=1.0
Type=Application
Name=Gestor de Finanzas
Comment=Control de ingresos, gastos y balance personal
Exec=bash -c "cd '$SCRIPT_DIR' && python3 server.py"
Icon=wallet
Terminal=false
Categories=Office;Finance;
StartupNotify=true
EOF

chmod +x "$DESKTOP_FILE"
echo "¡Acceso directo creado con éxito en $DESKTOP_FILE!"
echo "Ahora puedes buscar 'Gestor de Finanzas' en el menú de aplicaciones de Ubuntu."

