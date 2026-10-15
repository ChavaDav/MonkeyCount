# CAPITAL &mdash; Gestor de Tesorería y Flujo Financiero Personal

<div align="center">

![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Linux](https://img.shields.io/badge/Ubuntu%20%2F%20Linux-Native-FCC624?style=for-the-badge&logo=linux&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)
![Created with AI](https://img.shields.io/badge/Created%20with-AI-7C3AED?style=for-the-badge)

<p align="center">
  <b>Sistema local de análisis contable, proyección de liquidez y estructuración financiera personal.</b><br>
  <i>Proyecto desarrollado y estructurado con Inteligencia Artificial (IA).</i><br>
  Sin dependencias pesadas, sin telemetría, 100% offline y listo para desplegar con Docker Compose o de forma nativa en Ubuntu.
</p>

</div>

---

## 📌 Visión General

**CAPITAL** es una aplicación diseñada para estructurar con rigor el movimiento de dinero de una persona. A diferencia de las herramientas tradicionales que solo registran tickets puntuales, CAPITAL se enfoca en la **arquitectura recurrente de los flujos de caja anuales y mensuales**:

- **¿Cuánto dinero entra realmente al año y cuál es su promedio mensual?** (considerando cobros irregulares como 14 pagas con extras de verano y navidad, bonus únicos, dividendos, etc.).
- **¿A cuánto ascienden tus compromisos reales anualizados?** (incluyendo pagos mensuales continuos y gastos fijos que vencen 1 o 2 veces al año como seguros, IBI o impuestos).
- **¿Cuánto capital neto libre te queda cada mes y al finalizar el año?**
- **¿Cómo se reparte cada euro entre necesidades esenciales, estilo de vida y capacidad de ahorro?**

---

## ⚡ Características Principales

### 1. Gestión de Entradas Recurrentes (Ingresos)
- Registro de fuentes de ingresos con periodicidad anualizada configurable:
  - **14 pagas/año:** Nómina estándar con pagas extras de verano y navidad.
  - **12 pagas/año:** Nómina ordinaria mensual.
  - **1 cobro anual:** Liquidación de bonus por objetivos, dividendos anuales.
  - **Semestral (2/año), Trimestral (4/año), Quincenal (26/año), Semanal (52/año)** o frecuencia personalizada.
- Consolidación automática: Total anual acumulado y promedio mensual equivalente.

### 2. Gestión de Compromisos y Cargas (Gastos)
- Clasificación presupuestaria estricta (**Regla 50/30/20**):
  - **Gasto Estructural:** Obligaciones fijas e indispensables (vivienda, supermercado, luz, agua, conectividad).
  - **Gasto Discrecional:** Partidas de ocio, estilo de vida o partidas optimizables.
- Frecuencia de pago adaptada a la realidad contable (seguros de vencimiento anual, cuotas trimestrales, abonos mensuales).
- Cálculo de la **reserva mensual necesaria** para no sufrir tensiones de tesorería cuando lleguen los cargos anuales.

### 3. Matriz de Distribución y Salud Financiera
- **Balance Neto Anualizado y Mensual:** Indicador directo de superávit o déficit.
- **Ratio de Capitalización:** Porcentaje de tus ingresos que logras retener de forma efectiva.
- **Auditoría de Asignación en Tiempo Real:** Barra segmentada de destino de capital.
- **Previsión de Tesorería Acumulada:** Proyecciones de ahorro acumulado a 3 meses, 6 meses, 12 meses y 36 meses.
- **Simulador de Sensibilidad:** Permite modelar el impacto de optimizar un % de los gastos discrecionales.

### 4. Privacidad Total y Diseño Grado Fintech
- **100% Local y Privado:** Tus datos residen exclusivamente en tu máquina en el archivo `data/finanzas.json`.
- **Cero dependencias externas:** Funciona con la librería estándar de Python sin requerir `npm install` ni paquetes pesados de terceros.
- **Exportación e Importación:** Genera o restaura copias de seguridad en formato JSON con un solo clic.
- **Selector de Divisa Global:** EUR (€), USD ($), GBP (£), MXN ($), COP ($), ARS ($), CLP ($), PEN (S/).

---

## 🐳 Despliegue con Docker Compose (Recomendado)

La aplicación incluye soporte completo para contenedores mediante una imagen ligera basada en `python:3.12-alpine` y un servicio orquestado en `docker-compose.yml`.

### Requisitos
- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Pasos de ejecución:

1. **Clonar o entrar en el directorio del proyecto:**
   ```bash
   cd gestor-finanzas
   ```

2. **Iniciar el contenedor en segundo plano:**
   ```bash
   docker compose up -d
   ```

3. **Abrir en el navegador:**
   Visita en tu navegador:
   ```text
   http://localhost:5050
   ```

4. **Verificar el estado del servicio y logs:**
   ```bash
   docker compose ps
   docker compose logs -f
   ```

5. **Detener el servicio:**
   ```bash
   docker compose down
   ```

> [!NOTE]
> Los datos se guardan de forma persistente en la carpeta local `./data` de tu máquina anfitriona mediante el volumen configurado en el `docker-compose.yml`.

---

## 🐧 Ejecución Nativa en Ubuntu / Linux

Si prefieres ejecutarlo sin Docker directamente en tu sistema Ubuntu:

### Inicio rápido:
```bash
cd gestor-finanzas
./iniciar.sh
```
*El script arrancará el servidor en `http://localhost:5050` y abrirá tu navegador predeterminado automáticamente.*

O ejecutándolo directamente con Python 3:
```bash
python3 server.py
```

### Crear Acceso Directo en el Menú de Ubuntu (Dash):
Para poder abrir la aplicación desde el buscador de aplicaciones de Ubuntu como cualquier programa nativo:
```bash
./instalar_acceso_directo.sh
```
Aparecerá en tu menú con el nombre **"Gestor de Finanzas"**.

---

## 📂 Estructura del Repositorio

```text
gestor-finanzas/
├── docker-compose.yml           # Definición del servicio y volúmenes persistentes
├── Dockerfile                   # Imagen Alpine segura con usuario no-root
├── .dockerignore                # Archivos omitidos en la compilación de la imagen
├── .gitignore                   # Exclusiones de Git
├── server.py                    # Servidor HTTP ligero y API REST (Python stdlib)
├── iniciar.sh                   # Script de inicio directo para Ubuntu/Linux
├── instalar_acceso_directo.sh   # Instalador de acceso directo para Ubuntu Desktop
├── README.md                    # Documentación del proyecto
├── data/
│   └── finanzas.json            # Base de datos local (persistencia automática)
└── static/
    ├── index.html               # Interfaz SPA profesional
    ├── style.css                # Sistema de diseño fintech institucional
    └── app.js                   # Motor de cálculo y gestión de estado
```

---

## ⚙️ Variables de Entorno y Configuración

Puedes personalizar la ejecución mediante variables de entorno o parámetros CLI:

| Variable | Por Defecto | Descripción |
| :--- | :--- | :--- |
| `HOST` | `0.0.0.0` (Docker) / `127.0.0.1` (Local) | Dirección IP de enlace de red del servidor. |
| `PORT` | `5050` | Puerto TCP de escucha. |
| `CONTAINER` | `true` (en contenedor) | Bandera que activa el modo contenedor seguro. |

### Ejemplo con puerto personalizado:
```bash
PORT=8080 docker compose up -d
```
O de forma nativa:
```bash
python3 server.py --host 0.0.0.0 --port 8080 --no-browser
```

---

## 🔒 Copias de Seguridad y Migración

Todos tus registros se almacenan en texto plano estructurado en:
```text
data/finanzas.json
```

- **Exportar:** Pulsa el botón **Exportar** en la barra superior para descargar un archivo `.json` con todos tus ingresos y gastos.
- **Importar:** Pulsa el botón **Importar** para cargar una copia previa en cualquier momento o equipo.
- **Migración simple:** Puedes copiar la carpeta `data/` a cualquier otra máquina o servidor y levantar la app con Docker Compose sin perder ningún registro.

---

## 🤖 Desarrollo y Autoría

Este proyecto ha sido **creado y desarrollado íntegramente con Inteligencia Artificial (IA)**, con el objetivo de proporcionar una herramienta de tesorería y gestión de finanzas personales limpia, eficiente, sin dependencias externas y con estándares de código profesional para despliegue en contenedores.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más información.
