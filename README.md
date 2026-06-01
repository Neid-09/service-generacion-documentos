# service-generacion-documentos

Microservicio **Node.js / Express** para la generación de documentos académicos del SGA (Sistema de Gestión Académica). Actualmente implementa la generación de boletines académicos en PDF usando **Puppeteer** (Chromium headless).

## Stack

| Tecnología | Uso |
|---|---|
| Node.js ≥ 20 | Runtime |
| Express 4 | Servidor HTTP |
| Puppeteer | HTML → PDF vía Chromium |
| Joi | Validación de payload |
| Winston | Logging estructurado |
| dotenv | Variables de entorno |

## Requisitos

- Node.js 20+
- npm 10+
- Chromium descargado automáticamente por Puppeteer en el primer `npm install`

## Instalación

```bash
# 1. Instalar dependencias (descarga Chromium ~170 MB la primera vez)
npm install

# 2. Crear archivo de configuración
cp .env.example .env
# Edita .env y ajusta API_KEY al mismo valor que en gestion-academica

# 3. Iniciar en desarrollo
npm run dev

# 4. Iniciar en producción
npm start
```

## Endpoints

### `GET /health`
Health check público (sin autenticación).

```json
{ "status": "ok", "service": "service-generacion-documentos", "timestamp": "..." }
```

---

### `POST /generar/boletin`
Genera el boletín académico de un estudiante en PDF.

**Headers requeridos:**
```
Content-Type: application/json
X-API-Key: <valor de API_KEY en .env>
```

**Body (JSON):** ver payload de ejemplo abajo.

**Respuesta:** `application/pdf` (binario)

**Nombre del archivo:** `boletin_{documento}_{periodo}_{anio}.pdf`

## Payload de Ejemplo

```json
{
  "institucion": {
    "nombre": "I.E. Agrícola Fray Isidoro de Montclar",
    "nit": "891.234.567-1",
    "codigoDane": "123456789001",
    "resolucion": "Resolución 001 de 2020",
    "logoUrl": "http://localhost:8080/assets/logo.png",
    "selloUrl": "http://localhost:8080/assets/sello.png",
    "firmaRectorUrl": "http://localhost:8080/assets/firma_rector.png",
    "banderaUrl": null,
    "direccion": "Vereda El Tablazo, Municipio"
  },
  "periodoReporte": {
    "nombre": "Primer Periodo",
    "fechaInicio": "2026-01-15",
    "fechaFin": "2026-03-30"
  },
  "anioLectivo": 2026,
  "periodos": [
    { "nombre": "Primer Periodo", "porcentaje": 50.0 },
    { "nombre": "Segundo Periodo", "porcentaje": 50.0 }
  ],
  "estudiante": {
    "documento": "1006789456",
    "nombreCompleto": "Juan Carlos Pérez López"
  },
  "grado": {
    "nombre": "Décimo A",
    "directorNombre": "Marta Rodríguez",
    "firmaDirectorUrl": "http://localhost:8080/assets/firma_director.png"
  },
  "asignaturas": [
    {
      "nombre": "Matemáticas",
      "docente": "Carlos Jiménez",
      "notasPorPeriodo": [
        { "nombrePeriodo": "Primer Periodo", "porcentaje": 50.0, "valor": 4.5, "aporte": 2.25 }
      ],
      "notaDefinitiva": 2.25
    },
    {
      "nombre": "Lenguaje",
      "docente": "Ana Ruiz",
      "notasPorPeriodo": [
        { "nombrePeriodo": "Primer Periodo", "porcentaje": 50.0, "valor": 3.8, "aporte": 1.90 }
      ],
      "notaDefinitiva": 1.90
    }
  ]
}
```

## Variables de Entorno

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto del servidor | `3100` |
| `API_KEY` | Clave compartida con gestion-academica | (requerida) |
| `NODE_ENV` | Entorno (`development`/`production`) | `development` |

## Integración con gestion-academica

En `application.yaml` del servicio Spring Boot, configura:

```yaml
app:
  generador-documentos:
    url: http://localhost:3100
    api-key: sga-docs-secret-key-2026
```

El endpoint en Spring Boot es:
```
GET /api/boletines/generar?matriculaId={id}&periodoId={id}
```

## Docker

```bash
# Construir imagen
docker build -t service-generacion-documentos .

# Ejecutar
docker run -p 3100:3100 \
  -e API_KEY=tu-api-key-secreta \
  service-generacion-documentos
```
