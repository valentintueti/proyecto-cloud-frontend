# Gestión de Transporte — Frontend (proyecto-cloud-frontend)

SPA en **React 18 + TypeScript + Vite** que consume los microservicios MS1–MS4
del proyecto de Cloud Computing. Esta carpeta es autosuficiente: es la raíz
que debe subirse a su propio repositorio de GitHub y conectarse a AWS
Amplify. No depende de archivos del backend ni de la carpeta padre.

> **Alcance de este avance**: prioriza el flujo de Pasajeros de MS1
> (GET/POST `/pasajeros`, con la lista actualizándose tras un alta
> confirmada por la API) y añade pantallas para las funciones ya existentes
> de MS1–MS4. **No implementa MS5** ni analítica inventada, porque ese
> microservicio todavía no existe como repositorio. Ver la sección
> [Limitaciones conocidas](#limitaciones-conocidas).

## Requisitos

- **Node.js >= 20.19** (probado con Node 24.16 / npm 11). Vite 6 exige Node
  18.x ≥ 18.20, 20.x ≥ 20.19 o 22.x+; usar 20.19+ evita advertencias.
- npm (viene con Node).

No se requiere backend corriendo para compilar ni para navegar la interfaz:
sin URLs configuradas, cada módulo se muestra deshabilitado con un mensaje
explicativo en vez de fallar o hacer peticiones a ciegas.

## Instalación y ejecución

Todos los comandos se ejecutan **desde `proyecto-cloud-frontend`**.

```bash
npm ci
```

```bash
cp .env.example .env
```

Editar `.env` y completar las URLs reales (ver [Variables de entorno](#variables-de-entorno-vite_ms_base_url)).

```bash
npm run dev
```

Abre `http://localhost:5173`. Compila y sirve para producción localmente:

```bash
npm run build
npm run preview
```

Verificación de tipos sin build (útil en CI):

```bash
npm run typecheck
```

## Variables de entorno (`VITE_MS*_BASE_URL`)

Copiadas de `.env.example`, una por microservicio:

| Variable | Microservicio | Puerto interno del contenedor |
|---|---|---|
| `VITE_MS1_BASE_URL` | MS1 (Java/Spring, Pasajeros y Tarjetas) | 8081 |
| `VITE_MS2_BASE_URL` | MS2 (FastAPI, Rutas/Paraderos/Servicios) | 8000 |
| `VITE_MS3_BASE_URL` | MS3 (Node/Express, Viajes/Conexiones) | 3000 |
| `VITE_MS4_BASE_URL` | MS4 (FastAPI, Historial) | 8000 |

Reglas importantes:

- Son variables **públicas**: Vite las incrusta en el bundle de JavaScript en
  tiempo de **build**, no de ejecución. Nunca deben llevar credenciales,
  claves de AWS ni cadenas de conexión a bases de datos.
- Si cambias una URL, hay que **volver a ejecutar `npm run build`** (y
  volver a publicar en Amplify) para que el cambio tenga efecto.
- El valor puede incluir el prefijo/stage de API Gateway (por ejemplo
  `https://abc123.execute-api.us-east-1.amazonaws.com/prod`). No agregar una
  barra final: el cliente HTTP (`src/lib/http.ts`) ya evita las barras
  dobles al concatenar rutas.
- MS2 y MS4 comparten el mismo puerto interno de contenedor (8000), así que
  en AWS necesitan dominios, paths o mapeos de API Gateway **distintos**,
  definidos por el equipo de despliegue.
- Si una variable queda vacía, el módulo correspondiente de la interfaz se
  ve pero queda deshabilitado con un aviso — nunca se dispara una petición
  accidental contra el propio origen del frontend.
- **Cuidado con `.env.local`**: Vite lo aplica también a `npm run build`,
  no solo a `npm run dev`. Si dejaste un `.env.local` apuntando al proxy
  de desarrollo (`/api/ms1`, etc.) y luego ejecutas `npm run build` en tu
  máquina, esas rutas relativas quedarán incrustadas en el `dist/`
  generado — inútiles fuera del servidor de desarrollo. Esto **no afecta**
  el build real de Amplify (que nunca ve tu `.env.local`, porque está en
  `.gitignore` y no se sube al repositorio), pero si quieres generar aquí
  mismo un `dist/` de verificación con las URLs reales, borra o renombra
  `.env.local` antes de compilar, o usa un `.env.production.local` con las
  URLs HTTPS reales (también ignorado por git).

## Estructura del proyecto

```
src/
  api/          clientes HTTP por microservicio (ms1.ts..ms4.ts)
  types/        tipos TypeScript de cada contrato (ms1.ts..ms4.ts)
  lib/          env.ts (config), http.ts (fetch + normalización de errores),
                errors.ts (ApiError), useAsync.ts (hook de datos)
  components/
    layout/     AppLayout, Sidebar, navConfig
    ui/         Button, Field, Modal, ConfirmDialog, Badge, PageHeader,
                AsyncBoundary, States (loading/empty/error/no-configurado),
                SearchableSelect
    PasajeroSelector.tsx  selector de pasajero reutilizado por Viajes,
                          Conexiones e Historial
  pages/
    pasajeros/  lista, alta, detalle+edición+baja (incluye tarjetas)
    tarjetas/   formularios de alta y edición de saldo (usados desde pasajeros/viajes)
    rutas/      lista + alta/edición/baja
    paraderos/  lista + alta (sin edición/baja, ver limitaciones) + valida-conexión
    servicios/  lista con filtro real por ruta/fecha + alta/edición/baja
    viajes/     selector de pasajero + lista + alta + finalizar
    conexiones/ selector de pasajero + lista + alta + búsqueda por viaje
    historial/  selector de pasajero + consulta agregada de MS4
  styles/global.css  tokens de diseño (azul oscuro / turquesa) y componentes
```

## Cobertura de endpoints por pantalla

| MS | Pantalla | Método | Ruta | Implementado | Probado contra API real |
|---|---|---|---|---|---|
| MS1 | Pasajeros | GET | `/pasajeros` | Sí | **Sí**, contra MS1 real en Docker (ver abajo) |
| MS1 | Pasajeros | POST | `/pasajeros` | Sí | **Sí**, 201 Created confirmado |
| MS1 | Pasajero (detalle) | GET | `/pasajeros/{id}` | Sí | Sí |
| MS1 | Pasajero (detalle) | PUT | `/pasajeros/{id}` | Sí | Pendiente |
| MS1 | Pasajero (detalle) | DELETE | `/pasajeros/{id}` | Sí | Sí (usada para limpiar datos de prueba) |
| MS1 | Tarjetas del pasajero | GET | `/pasajeros/{id}/tarjetas` | Sí | **Sí**, vacía y con datos reales |
| MS1 | Tarjetas del pasajero | POST | `/tarjetas` | Sí | **Sí**, 201 Created confirmado |
| MS1 | Tarjetas del pasajero | PUT | `/tarjetas/{id}` (saldo) | Sí | **Sí**, 200 OK confirmado |
| MS1 | Tarjetas del pasajero | DELETE | `/tarjetas/{id}` | Sí | **Sí**, 204 confirmado |
| MS2 | Rutas | GET/POST | `/rutas/` | Sí | **Sí**, 200/201 confirmados |
| MS2 | Rutas | PUT/DELETE | `/rutas/{id}` | Sí | **Sí**, 200/204 confirmados |
| MS2 | Paraderos | GET/POST | `/paraderos/` | Sí | **Sí**, 200/201 confirmados |
| MS2 | Paraderos | GET | `/paraderos/{id}/valida-conexion` | Sí | **Sí**, `true`/`false` confirmados |
| MS2 | Servicios | GET/POST | `/servicios/` (con filtro real `ruta_id`/`fecha`) | Sí | **Sí**, filtros y 201 confirmados |
| MS2 | Servicios | PUT/DELETE | `/servicios/{id}` | Sí | **Sí**, 200/204 confirmados |
| MS3 | Viajes | GET | `/viajes?pasajero_id=` | Sí | **Sí**, 200 confirmado (ver nota de bug: sin `pasajero_id` da 500) |
| MS3 | Viajes | POST | `/viajes` | Sí | **Sí**, 201/404 confirmados |
| MS3 | Viajes | PATCH | `/viajes/{id}/finalizar` | Sí | **Sí**, 200/400 confirmados |
| MS3 | Conexiones | POST | `/conexiones` | Sí | **Sí**, 201/400/404 confirmados |
| MS3 | Conexiones | GET | `/conexiones/pasajero/{id}`, `/conexiones/viaje/{id}` | Sí | **Sí**, 200 confirmados |
| MS4 | Historial | GET | `/historial/{pasajero_id}` | Sí | **Sí**, 200/500/422 confirmados |

"Pendiente" (donde aparece) significa: el código está implementado y
compila, pero esa operación puntual no se ejecutó todavía contra una
instancia real del microservicio.

## Verificaciones realizadas vs. pendientes

**Compila localmente**: sí. `npm run build` (tsc -b + vite build) termina
sin errores; `npm audit` reporta 0 vulnerabilidades con las versiones
fijadas en `package.json`/`package-lock.json`.

**Integración comprobada (UI, sin backend real)**: sí, con el servidor de
desarrollo (`npm run dev`) y navegador:
- Navegación de escritorio (sidebar) y móvil (menú hamburguesa + drawer).
- Los 8 módulos muestran el aviso "módulo no disponible" cuando falta la
  URL correspondiente, sin disparar peticiones al origen del frontend.
- Validación por campo en el formulario de Pasajeros (nombre, fecha
  anterior a hoy, sexo, distrito) antes de enviar al backend.
- Manejo de error de "URL no configurada" en el flujo de alta de pasajero,
  conservando los valores ingresados en el formulario.

**Integración contra MS1 real (GET/POST /pasajeros): SÍ, ejecutada y
confirmada** en esta sesión, una vez que Docker Desktop quedó disponible:

1. Se levantó PostgreSQL 16 en un contenedor (`postgres:16-alpine`), con
   `POSTGRES_DB=ms1_pasajeros`, publicado en el puerto **5433** del host
   (no 5432: ese puerto ya lo ocupaba un PostgreSQL nativo de Windows
   preexistente en esta máquina, ajeno al proyecto — se detectó con
   `netstat`/`tasklist` y **no se tocó**, solo se evitó el conflicto usando
   otro puerto).
2. Se construyó la imagen de MS1 **con su `Dockerfile` original, sin
   modificarlo** (`docker build` desde
   `proyecto-cloud-backend/proyecto-cloud-ms1`) y se corrió apuntando a ese
   Postgres vía `DB_HOST=host.docker.internal`, `DB_PORT=5433`.
3. MS1 arrancó limpio: Hibernate creó las tablas `pasajero` y `tarjeta`
   automáticamente (`ddl-auto=update`) y `GET /health` respondió
   `{"status":"ok"}`.
4. Se confirmó por `curl` directo a `http://localhost:8081`: `GET
   /pasajeros` → `200 []`, `POST /pasajeros` → `201` con el pasajero
   creado, `GET /pasajeros` → `200` con el registro. Ese registro de prueba
   se borró después (`DELETE /pasajeros/1`) para dejar la base limpia antes
   de probar desde la interfaz.
5. **Hallazgo real de CORS** (no solo inferido leyendo el código): al abrir
   el frontend en `http://localhost:5173` con `VITE_MS1_BASE_URL` apuntando
   directo a `http://localhost:8081`, el navegador bloqueó la petición con
   `Access to fetch ... has been blocked by CORS policy: No
   'Access-Control-Allow-Origin' header is present`. Esto confirma en vivo
   la limitación ya documentada: **MS1 no tiene CORS habilitado**. No se
   modificó el backend para "arreglarlo".
6. Para poder probar el flujo sin tocar el backend, se activó el **proxy de
   desarrollo de Vite** ya preparado en `vite.config.ts` (`/api/ms1` →
   `http://localhost:8081`, solo válido en `npm run dev`, no en el build de
   producción) y se apuntó `VITE_MS1_BASE_URL=/api/ms1` en un `.env.local`
   local (no versionado). Con eso, la petición pasa a ser del mismo origen
   para el navegador y el proxy de Vite la reenvía por detrás — sin tocar
   CORS del backend.
7. Con el proxy activo, desde la interfaz real (no `curl`):
   - `GET /pasajeros` (vía `/api/ms1/pasajeros`) → **200**, lista vacía →
     pantalla "Todavía no hay pasajeros".
   - Formulario "Nuevo pasajero" con nombre "Carlos Rojas", fecha
     1995-03-20, sexo MASCULINO, distrito "San Isidro" → `POST
     /api/ms1/pasajeros` → **201 Created**, respuesta
     `{"id":2,"nombre":"Carlos Rojas","fechaNacimiento":"1995-03-20","sexo":"MASCULINO","distrito":"San Isidro"}`.
   - Tras el alta, el modal se cerró solo y la tabla se refrescó **sola**
     con el nuevo pasajero, sin recargar la página.
   - Se entró al detalle (`/pasajeros/2`): `GET /pasajeros/{id}` cargó el
     formulario de edición pre-llenado y `GET /pasajeros/{id}/tarjetas`
     mostró correctamente "Este pasajero no tiene tarjetas" (lista vacía
     real, no simulada).

Esto deja el flujo priorizado del avance (GET/POST `/pasajeros` con la
lista actualizándose tras el alta) **demostrado de punta a punta contra
MS1 real**, no solo compilado.

**Integración contra MS1 real — módulo Tarjetas: SÍ, ejecutada y
confirmada** (sesión posterior, mismos contenedores `pg-ms1` /
`ms1-local-test` reutilizados, sin volver a tocar el backend). Antes de
probar se releyó `TarjetaController`/`TarjetaService`/`TarjetaRequest`/
`TarjetaUpdateRequest` para confirmar el contrato exacto (`POST /tarjetas`
con `{pasajeroId, tipo, saldo}`; `PUT /tarjetas/{id}` solo con `{saldo}`;
`fechaEmision`/`fechaVencimiento` calculadas por el backend — solo
ESTUDIANTE, ESCOLAR y ESPECIAL llevan vencimiento a un año). Usando al
pasajero "Carlos Rojas" (id 2) ya creado:

- **Validación por campo (cliente, antes de llamar a la API)**: se intentó
  crear una tarjeta con saldo `-50` → el formulario mostró "El saldo no
  puede ser negativo." sin llegar a llamar a MS1. Se repitió el mismo caso
  al editar el saldo de una tarjeta existente, con el mismo resultado.
- **Alta real**: tipo `ESTUDIANTE`, saldo `50` → `POST
  /api/ms1/tarjetas` → **201 Created**, respuesta
  `{"id":1,"pasajeroId":2,"fechaEmision":"2026-09-12","fechaVencimiento":"2027-09-12","tipo":"ESTUDIANTE","saldo":50}`
  — la fecha de vencimiento calculada por el backend (+1 año exacto) se
  reflejó correctamente en la tabla, sin que el frontend la calculara.
  Confirmado además por `curl` directo a MS1 (`GET
  /pasajeros/2/tarjetas` y `GET /tarjetas/1`, fuera del navegador): el
  registro es real y persistido, no un eco del formulario.
- **Actualización automática**: el modal se cerró solo y la fila apareció
  en la tabla sin recargar la página (mismo patrón que en Pasajeros).
- **Edición de saldo real**: `PUT /api/ms1/tarjetas/1` con `{"saldo":
  120.5}` → **200 OK**, la tabla mostró `120.50` de inmediato.
- **Baja real con confirmación**: el diálogo mostró "¿Eliminar la tarjeta
  #1 (ESTUDIANTE)? Esta acción no se puede deshacer."; al confirmar, `DELETE
  /api/ms1/tarjetas/1` → **204** (el panel Network de Chrome etiqueta las
  respuestas 204 como `net::ERR_ABORTED`, un artefacto conocido del
  inspector para respuestas sin cuerpo — no es un fallo real; se comprobó
  por `curl` que `GET /tarjetas/1` pasó a devolver `404 {"detail":"Tarjeta
  1 no encontrada"}` y que la lista del pasajero volvió a `[]`). La interfaz
  volvió sola al estado vacío "Este pasajero no tiene tarjetas".
- **Estado de error real (404) verificado**: se navegó a
  `/pasajeros/9999` (id inexistente) y tanto la sección de datos del
  pasajero como la de tarjetas mostraron, cada una por separado,
  "Pasajero 9999 no encontrado" (el mensaje real que devuelve MS1) con su
  botón "Reintentar", en vez de romper la página o mostrar una pantalla en
  blanco.

Al terminar, el pasajero "Carlos Rojas" quedó sin tarjetas (se borró la de
prueba) para que puedas repetir tú mismo el alta en vivo si quieres
capturarla de principio a fin.

Quedan pendientes contra API real: PUT/DELETE de pasajero (el PUT no se
probó todavía; el DELETE de pasajero tampoco, para no perder al pasajero
de prueba).

**Integración contra MS2 real (Rutas, Paraderos, Servicios): SÍ, ejecutada
y confirmada** (sesión posterior; MS1 se reactivó tal cual estaba, sin
recrearlo, y siguió funcionando en paralelo). Antes de tocar nada se releyó
`app/routers/*.py`, `app/services/*.py`, `app/repositories/*.py` y
`app/models/*.py` de MS2 completos.

**Infraestructura real de MS2** (nada de esto estaba documentado como
docker-compose porque **no existe ningún archivo docker-compose en el
repositorio**; solo hay un `Dockerfile` por microservicio):
- Base de datos: **MongoDB** (vía `motor`, driver async), no Postgres. MS2
  no trae su propio contenedor de Mongo — hay que levantar uno aparte.
- El `Dockerfile` de MS2 expone el puerto interno **8000** (el mismo que
  usará MS4 más adelante — no se pueden mapear ambos al mismo puerto del
  host a la vez).
- Variables requeridas por `app/config.py` (`pydantic-settings`, sin
  valores por defecto): `MONGO_URI` y `DB_NAME`. Si faltan, el proceso ni
  arranca.
- Para esta prueba se usó Mongo en el puerto **27017** del host (estaba
  libre, sin conflicto) y se mapeó el contenedor de MS2 al puerto **8001**
  del host (para no chocar con el 8000 que se reservará para MS4 más
  adelante). Ningún puerto de MS1 (8081, 5433) se tocó ni se reutilizó.
- Se construyó la imagen con el `Dockerfile` **original, sin modificarlo**,
  igual que con MS1.

**Endpoints reales confirmados por `curl` directo a MS2 (puerto 8001) y
luego repetidos desde la interfaz vía el proxy de Vite**:

| Recurso | Método | Ruta | HTTP real observado |
|---|---|---|---|
| Rutas | GET | `/rutas/` (con o sin `?tipo_servicio=`) | 200 |
| Rutas | GET | `/rutas/{id}` | 200 / 404 |
| Rutas | GET | `/rutas/batch?ids=...` | 200 (ids inexistentes se omiten en silencio, no dan 404) |
| Rutas | POST | `/rutas/` | 201 / **422** (Pydantic) |
| Rutas | PUT | `/rutas/{id}` | 200 |
| Rutas | DELETE | `/rutas/{id}` | 204 / 404 |
| Paraderos | GET | `/paraderos/`, `/paraderos/{id}`, `/paraderos/batch` | 200 |
| Paraderos | POST | `/paraderos/` | 201 |
| Paraderos | GET | `/paraderos/{id}/valida-conexion?ruta_id=` | 200 (`es_valida: true/false`, ambos casos probados) |
| Paraderos | — | **no existe** PUT ni DELETE | — (confirmado leyendo `app/routers/paraderos.py`: solo registra POST y 3 GET) |
| Servicios | GET | `/servicios/` (con `?ruta_id=` y/o `?fecha=`) | 200, filtros reales verificados |
| Servicios | POST | `/servicios/` | 201 / 404 (paradero inexistente) / 400 (ruta inexistente) |
| Servicios | PUT | `/servicios/{id}` | 200 (sin validar existencia de `ruta_id`/`paraderos`, ver bug abajo) |
| Servicios | DELETE | `/servicios/{id}` | 204 / 404 |

Las validaciones 422 de Pydantic se probaron por `curl` (enum inválido en
`tipo_servicio`, campo `nombre` faltante) y el frontend ya las traduce
usando el mismo parser de errores que MS1/MS4 (mensajes tipo
`tipo_servicio: Input should be 'metropolitano', ...`).

**Relación real entre Rutas, Paraderos y Servicios** (no es una tabla de
relación explícita; es un efecto secundario del código, confirmado
empíricamente):
1. Un **Paradero** nace siempre con `rutas: []` — un paradero no se vincula
   a ninguna ruta en el momento de crearlo.
2. Un **Servicio** sí valida que `ruta_id` exista (si no, `400 {"detail":
   "La ruta {id} no existe"}`), y al crearse (**solo** `POST`, nunca
   `PUT`), por cada `paradero_id` de su lista, el backend hace un
   `$addToSet` que **inserta un resumen de la ruta** (`ruta_id`, `nombre`,
   `tipo_servicio`) dentro del array `rutas` de ese paradero.
3. `GET /paraderos/{id}/valida-conexion?ruta_id=` no es más que: "¿existe
   una entrada con este `ruta_id` dentro del array `rutas` de este
   paradero?" — es decir, depende enteramente de qué servicios se hayan
   creado antes, no de una tabla de conexiones real.

Esto se verificó en vivo: al crear en la interfaz un servicio de "Ruta Sur"
con los paraderos "Paradero Sur" y "Paradero Central", ambos paraderos
pasaron de mostrar solo "Ruta Norte" a mostrar "Ruta Norte, Ruta Sur" en la
pantalla de Paraderos, sin tocar nada manualmente ahí.

**Bugs reales del backend de MS2 confirmados por prueba (no solo por
lectura de código), sin corregir ninguno**:

1. **`POST /servicios/` dejaba un registro huérfano cuando un
   `paradero_id` no existe.** Se probó con un `paradero_id` inventado: la
   API respondió `404 {"detail":"Paradero par_NOEXISTE no encontrado"}`
   (parece que la operación falló por completo), pero un `GET /servicios/`
   inmediatamente después mostró que **el servicio sí quedó guardado** en
   Mongo, con la referencia rota adentro. No hay transacción/rollback en
   `ServicioService.crear_servicio`: primero inserta el servicio y
   **después** valida que cada paradero exista.
2. **Editar una Ruta (`PUT /rutas/{id}`) no actualiza los paraderos que ya
   la tenían vinculada.** Se editó "Ruta Norte" → "Ruta Norte Editada"
   (`corredor_rojo`), y los paraderos que ya la tenían en su lista
   siguieron mostrando el nombre y tipo de servicio **viejos**
   ("Ruta Norte", `metropolitano`) hasta que se creó un nuevo servicio.
3. **Ese mismo problema puede generar entradas duplicadas para la misma
   ruta.** Como el paso 2 no limpia nada, y el `$addToSet` de Mongo compara
   el objeto completo (no solo el `ruta_id`), volver a crear un servicio
   con una ruta ya editada agrega un **segundo resumen** para el mismo
   `ruta_id` en vez de reemplazar el viejo. Esto pasó realmente en esta
   sesión de pruebas: "Paradero Central" terminó con **dos** entradas para
   `R_f40a43f9` (una vieja con "Ruta Norte"/`metropolitano`, otra nueva con
   "Ruta Norte Editada"/`corredor_rojo`) más la de "Ruta Sur" — así quedó
   la data de prueba a propósito, como evidencia, no se limpió.
4. **`PUT /servicios/{id}` no valida nada y no sincroniza la relación.** A
   diferencia de `POST`, el `PUT` no comprueba que `ruta_id` ni los
   `paradero_id` existan (se probó con un id de paradero inventado y
   respondió `200 OK`), y aunque se le agregue un paradero real y nuevo a
   un servicio existente, ese paradero **no** aparece luego vinculado a la
   ruta — el `$addToSet` hacia paraderos solo ocurre en la creación.
5. **Eliminar una Ruta o un Servicio no limpia nada río abajo** (confirmado
   leyendo `RutaService.eliminar_ruta` / `ServicioService.eliminar_servicio`:
   ambos son un `delete_one` simple). Borrar una ruta deja "huérfanos" los
   resúmenes ya copiados dentro de `paradero.rutas[]`, y borrar todos los
   servicios de una ruta+paradero no revierte ese vínculo — no hay conteo
   de referencias.

Ninguno de estos 5 puntos se corrigió: son comportamiento real del backend
tal como está, documentado para que el equipo decida si los atiende.

**Datos de prueba que quedaron cargados en MS2** (para que puedas repetir
las operaciones tú mismo desde `/rutas`, `/paraderos` y `/servicios`):

| Entidad | ID | Detalle |
|---|---|---|
| Ruta | `R_f40a43f9` | "Ruta Norte Editada", `corredor_rojo`, `VUELTA` (ya fue editada una vez) |
| Ruta | `R_455258ef` | "Ruta Sur", `corredor_azul`, `IDA` (sin editar — pruébalo tú) |
| Paradero | `par_36d09b16` | "Paradero Central" — vinculado a ambas rutas (con el duplicado del bug #3 visible en `rutas[]`) |
| Paradero | `par_1fec4021` | "Paradero Sur" — vinculado a ambas rutas |
| Paradero | `par_91f87027` | "Paradero Nuevo" — sin vincular (`rutas: []`), aunque aparece en un servicio (evidencia del bug #4) |
| Paradero | `par_122d441d` | "Paradero Oeste" — sin usar en ningún servicio todavía |
| Servicio | `srv_d72f0442` | Ruta Norte Editada, 2026-09-15, 07:00–21:00, 3 paraderos |
| Servicio | `srv_fab8f983` | Ruta Sur, 2026-09-20, 08:00–21:00, 2 paraderos |

**Integración contra MS3 real (Viajes, Conexiones): SÍ, ejecutada y
confirmada** — pero antes de llegar a probar nada, **MS3 no arrancaba en
absoluto** con el código del repositorio. Este fue el bloqueo más serio de
las tres verificaciones hasta ahora.

**Inspección previa completa de MS3** (Node/Express, Sequelize, MySQL vía
`mysql2`, puerto interno del Dockerfile **3000**):
- Variables requeridas por `src/config/env.js` (sin default, lanza error si
  falta alguna): `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
  Con default: `PORT` (3000), `MS1_BASE_URL`
  (`http://localhost:8081`), `MS2_BASE_URL` (`http://localhost:8000`).
- `src/server.js` hace `sequelize.authenticate()` + `sequelize.sync()`
  (crea las tablas `viaje` y `conexion` automáticamente) antes de escuchar.
- No hay `docker-compose`, igual que en MS1 y MS2: solo un `Dockerfile` por
  microservicio, hay que traer la base de datos aparte.

**Bug #1 — el `Dockerfile` original no compila.** `RUN npm install
--production` falla siempre con
`npm error notarget: No matching version found for nodemon@^18.0.0`.
Se confirmó que no es un problema de esta máquina ni de la imagen base:
`nodemon` **nunca publicó una versión 18** (la más alta real es `3.1.14`,
verificado contra el registro de npm), y el mismo error se reproduce con
un `npm install` normal fuera de Docker, sobre una copia aislada del
`package.json`. `--production`/`--omit=dev` no evita el fallo porque npm
resuelve el árbol completo (incluidas `devDependencies`) antes de decidir
qué instalar.

**Bug #2 — aunque se instalen las dependencias, el proceso crashea al
arrancar**, con el `viaje.model.js` original (sin `module.exports = Viaje;`,
detectado ya por lectura de código en una sesión anterior). Esta vez se
comprobó **en vivo**, corriendo el contenedor real:

```
Error: Conexion.belongsTo called with something that's not a subclass of Sequelize.Model
    at Object.<anonymous> (/app/src/models/conexion.model.js:33:10)
    at Object.<anonymous> (/app/src/models/index.js:3:18)
```

`models/index.js` hace `const Viaje = require('./viaje.model')`; como ese
archivo nunca exporta nada, `Viaje` llega como `{}` a `conexion.model.js`,
que intenta `Conexion.belongsTo(Viaje, ...)` — Sequelize rechaza `{}` como
modelo válido y el proceso muere ahí mismo, **antes** de intentar conectar
a MySQL. Con el código tal cual está en el repositorio, **MS3 no puede
levantarse en ningún entorno**, ni local ni en producción.

**Cómo se resolvió para poder probar, sin tocar el repositorio real**: se
confirmó con el usuario antes de actuar. Se copió el código de MS3 a una
carpeta temporal **fuera del repositorio** (el scratchpad de esta sesión)
y, solo ahí, se corrigieron las dos líneas mínimas necesarias para poder
arrancar (`nodemon` a una versión real, y agregar
`module.exports = Viaje;` al final de `viaje.model.js`). La imagen Docker
se construyó desde esa copia parcheada. **Se verificó explícitamente que
el archivo real del repositorio (`proyecto-cloud-backend/proyecto-cloud-ms3/src/models/viaje.model.js`)
sigue exactamente igual que antes** — cero líneas cambiadas ahí. Estos dos
bugs quedan documentados, no corregidos en el proyecto.

**Infraestructura usada**: MySQL 8 en un contenedor propio (sin conflicto
de puertos con MS1/MS2), base de datos y usuario creados vía variables del
propio contenedor oficial de `mysql`. MS3 se corrió apuntando a ese MySQL
y, para las llamadas salientes reales, a MS1 (`http://host.docker.internal:8081`)
y MS2 (`http://host.docker.internal:8001`) — los mismos contenedores que
ya estaban corriendo, sin recrearlos ni reiniciarlos.

**Endpoints reales confirmados por `curl` directo a MS3 (puerto 3000) y
repetidos desde la interfaz vía el proxy de Vite**:

| Recurso | Método | Ruta | HTTP real observado |
|---|---|---|---|
| Viajes | GET | `/viajes?pasajero_id=` | 200 (lista real, filtrada) |
| Viajes | GET | `/viajes` (sin `pasajero_id`) | **500**, ver bug #3 abajo |
| Viajes | GET | `/viajes/{id}`, `/viajes/batch?ids=` | 200 / 404 |
| Viajes | POST | `/viajes` | 201 / 404 (tarjeta o servicio inexistente en MS1/MS2) |
| Viajes | PATCH | `/viajes/{id}/finalizar` | 200 / 400 (ya finalizado) / 404 |
| Viajes | DELETE | — | **no existe** ningún DELETE de viajes |
| Conexiones | POST | `/conexiones` | 201 / 400 (paradero no coincide o ruta no conecta) / 404 (viaje inexistente) |
| Conexiones | GET | `/conexiones/viaje/{id}` | 200 |
| Conexiones | GET | `/conexiones/pasajero/{id}` | 200 (enriquecido con `viajeOrigen`/`viajeDestino`) |
| Conexiones | PUT/DELETE | — | **no existen** |

**Relación real con MS1 y MS2** (código en `src/services/clients/ms1.client.js`
y `ms2.client.js`, ambos vía `axios`):
- `POST /viajes` llama a **MS1** `GET /tarjetas/{tarjeta_id}` (si no
  existe → propaga `404 "Tarjeta {id} no encontrada en MS1"`) y a **MS2**
  `GET /servicios/{servicio_id}` (si no existe → `404 "Servicio {id} no
  encontrado en MS2"`). **No llama a MS1 para validar que `pasajero_id`
  exista** — ver bug #4.
- `POST /conexiones` primero verifica localmente que
  `viajeOrigen.paradero_final_id === paradero_id` recibido, y si coincide,
  llama a **MS2** `GET /servicios/{servicio_id}` del viaje destino para
  obtener su `ruta_id`, y luego a **MS2**
  `GET /paraderos/{paradero_id}/valida-conexion?ruta_id=` — si da `false`,
  responde `400`. Esto se probó de punta a punta, incluido el caso real
  donde falla porque el paradero (`par_91f87027`) no está vinculado a
  ninguna ruta en MS2 (consecuencia directa del bug #4 de MS2 documentado
  arriba: ese paradero se agregó a un servicio vía `PUT`, que no sincroniza
  el vínculo).
- Si cualquiera de esas llamadas a MS1/MS2 falla por red (no solo 404),
  `ExternalServiceError` responde **502** — no se forzó ese caso en esta
  sesión porque habría requerido apagar MS1 o MS2 a propósito.

**Bugs reales de MS3 confirmados por prueba (además de los 2 que impiden
arrancar), sin corregir ninguno**:

3. **`GET /viajes` sin `pasajero_id` responde `500` con un mensaje interno
   de Sequelize sin sanitizar**:
   `{"detail":"WHERE parameter \"pasajero_id\" has invalid \"undefined\" value"}`.
   No hay validación de que el query param sea obligatorio antes de
   pasarlo al `WHERE` de la consulta.
4. **`POST /viajes` no valida que `pasajero_id` exista en MS1.** Se probó
   con `pasajero_id: 99999` (no existe ningún pasajero con ese id) junto a
   una `tarjeta_id` y `servicio_id` válidas: el viaje se creó igual con
   `201`. Sí se valida `tarjeta_id` (contra MS1) y `servicio_id` (contra
   MS2), pero no `pasajero_id`.
5. **`PATCH /viajes/{id}/finalizar` no valida que `paradero_final_id`
   exista en MS2.** Se probó con `par_NOEXISTE`: respondió `200` y dejó el
   viaje "finalizado" en un paradero que no existe. Esto además rompe en
   cascada cualquier intento posterior de usar ese viaje como origen de
   una conexión real (el paradero jamás va a "coincidir" con nada válido
   en MS2).
6. **No hay forma de borrar un viaje o una conexión** una vez creados (no
   existe `DELETE` para ninguno de los dos). Los viajes de prueba con datos
   inválidos (como el de `pasajero_id: 99999`) quedan para siempre en la
   base de datos sin ninguna vía de la API para limpiarlos.

**Datos de prueba que quedaron cargados en MS3** (pasajero `2` = Carlos
Rojas, tarjeta `34` en MS1):

| Viaje | Servicio | Origen → Final | Estado | Nota |
|---|---|---|---|---|
| `1` | `srv_d72f0442` | `par_36d09b16` → `par_1fec4021` | finalizado | usado como origen de la conexión `1` |
| `3` | `srv_fab8f983` | `par_1fec4021` → `par_NOEXISTE` | finalizado | evidencia del bug #5 (paradero final inválido) |
| `4` | `srv_fab8f983` | `par_1fec4021` → sin finalizar | en_curso | usado como destino de la conexión `1`; pruébalo tú finalizándolo |
| `5` | `srv_d72f0442` | `par_122d441d` → `par_91f87027` | finalizado | creado desde la UI; sirve para reproducir el 400 al intentar conectarlo (paradero sin ruta vinculada) |
| `2` | `srv_d72f0442` | `par_36d09b16` → sin finalizar | en_curso | **huérfano a propósito**: `pasajero_id: 99999` (no existe) — evidencia del bug #4, no se puede borrar |

| Conexión | Origen → Destino | Paradero |
|---|---|---|
| `1` | viaje `1` → viaje `4` | `par_1fec4021` |

**Integración contra MS4 real (Historial): SÍ, ejecutada y confirmada.**
A diferencia de MS3, **MS4 arrancó sin ningún problema con el `Dockerfile`
y el código originales** — no hizo falta ningún parche, ni siquiera
temporal.

**Inspección previa de MS4** (FastAPI, **sin base de datos propia** — es
puro agregador vía HTTP con `httpx`, puerto interno del Dockerfile
**8000**, el mismo que MS2, por lo que no pueden compartir el mismo puerto
de host):
- Variables requeridas por `app/config.py` (sin default): `MS1_BASE_URL`,
  `MS2_BASE_URL`, `MS3_BASE_URL`.
- Únicos endpoints: `GET /health` (diagnóstico) y `GET /historial/{pasajero_id}`
  (la única operación de negocio, confirmado leyendo
  `app/routers/historial_router.py` — no hay ningún otro router registrado
  en `app/main.py`).
- `app/services/historial_service.py` hace, en este orden: `GET
  /pasajeros/{id}` a **MS1** y `GET /viajes?pasajero_id=` a **MS3** en
  paralelo (`asyncio.gather`); con los `servicio_id` únicos de esos viajes,
  `GET /servicios/batch` a **MS2**; con los `ruta_id` únicos de esos
  servicios, `GET /rutas/batch` a **MS2**; y arma la respuesta enriquecida
  cruzando todo en memoria.

**Se corrió en paralelo con MS1/MS2/MS3 ya activos**, apuntando a los
mismos contenedores (`host.docker.internal` a los puertos 8081/8001/3000),
sin recrear ni reiniciar ninguno de los tres — se verificó explícitamente
que sus datos y sus pantallas seguían intactos antes y después.

**Endpoints reales confirmados por `curl` directo a MS4 (puerto 8002) y
repetidos desde la interfaz vía el proxy de Vite**:

| Ruta | Caso | HTTP real observado |
|---|---|---|
| `GET /health` | diagnóstico | 200 |
| `GET /historial/{id}` | pasajero real con viajes | 200, con los datos de MS1+MS2+MS3 ya cruzados |
| `GET /historial/{id}` | `pasajero_id` no numérico (`/historial/abc`) | 422 (validación automática de FastAPI) |
| `GET /historial/{id}` | pasajero inexistente en MS1 | **500**, ver bug abajo |
| `GET /historial/{id}` | con MS3 apagado (dependencia caída) | **500**, idéntico al caso anterior |

**Relación con MS1/MS2/MS3**: MS4 no tiene lógica propia más allá de
combinar llamadas — depende de los 3 microservicios anteriores para
absolutamente todo. Esto se probó de punta a punta con datos reales de
Carlos Rojas: el historial mostró sus 4 viajes de MS3, cada uno enriquecido
con el nombre de ruta y tipo de servicio **actuales** obtenidos de MS2 (no
hay problema de datos obsoletos aquí, porque MS4 no cachea nada — consulta
MS2 en cada petición).

**Bug real de MS4 confirmado por prueba**: **no hay manejo de errores en
absoluto.** `app/main.py` no registra ningún exception handler, y ninguno
de los 3 clientes HTTP (`ms1_client.py`, `ms2_client.py`, `ms3_client.py`)
captura excepciones — todos usan `response.raise_for_status()` sin
`try/except`. Por eso, tanto "el pasajero no existe en MS1" (un 404 real
de MS1) como "MS3 está caído" (una excepción de conexión) terminan
exactamente igual: FastAPI captura la excepción no manejada y devuelve un
**500 Internal Server Error** con cuerpo `text/plain` ("Internal Server
Error", sin JSON), sin ninguna forma de distinguir un caso del otro desde
el cliente. Se comprobaron ambos casos por separado:

```
curl http://localhost:8002/historial/99999        → 500 "Internal Server Error"
docker stop ms3-local-test && curl .../historial/2 → 500 "Internal Server Error" (idéntico)
```

El frontend no intenta adivinar la causa real (sería inventar información
que el backend no da): como el cuerpo no es JSON, muestra el mensaje
genérico "El servicio respondió con un error (HTTP 500) sin cuerpo JSON
legible" con un botón "Reintentar" — se probó apagando MS3, viendo el
error en pantalla, y confirmando que "Reintentar" recupera el historial
completo en cuanto MS3 vuelve a estar arriba (sin recargar la página).

**Publicado en Amplify**: no ejecutado por mí — requiere que el equipo cree
el app de Amplify y las 4 variables de entorno reales.

### Cómo reproducir esta misma prueba local

```bash
docker run -d --name pg-ms1 -e POSTGRES_DB=ms1_pasajeros -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5433:5432 postgres:16-alpine
```

```bash
cd proyecto-cloud-backend/proyecto-cloud-ms1
docker build -t ms1-local-test .
docker run -d --name ms1-local-test -p 8081:8081 --add-host=host.docker.internal:host-gateway -e DB_HOST=host.docker.internal -e DB_PORT=5433 -e DB_NAME=ms1_pasajeros -e DB_USER=postgres -e DB_PASSWORD=postgres ms1-local-test
```

En `proyecto-cloud-frontend/.env.local` (no se sube al repo):

```
VITE_MS1_BASE_URL=/api/ms1
```

Y con el proxy de `/api/ms1` ya activo en `vite.config.ts` (target
`http://localhost:8081`):

```bash
npm run dev
```

Abrir `http://localhost:5173/pasajeros`.

**Nota de puertos**: si al levantar Postgres en `5432` el contenedor de MS1
falla con `FATAL: la autentificación password falló para el usuario
"postgres"`, revisa con `netstat -ano | grep 5432` si ya hay un PostgreSQL
nativo escuchando en ese puerto en tu máquina (pasó en esta sesión, ajeno a
este proyecto). La solución no es tocar ese servicio: usa otro puerto de
host para el contenedor (por ejemplo `5433:5432`, como en el ejemplo de
arriba) y ajusta `DB_PORT` de MS1 a ese mismo valor.

**MS2 (Rutas, Paraderos, Servicios) — Mongo + FastAPI, sin
docker-compose** (no existe ninguno en el repo; hay que levantar Mongo y
MS2 por separado). Se probó en paralelo con MS1, en otros puertos:

```bash
docker run -d --name mongo-ms2 -p 27017:27017 mongo:7
```

```bash
cd proyecto-cloud-backend/proyecto-cloud-ms2
docker build -t ms2-local-test .
docker run -d --name ms2-local-test -p 8001:8000 --add-host=host.docker.internal:host-gateway -e MONGO_URI="mongodb://host.docker.internal:27017" -e DB_NAME="ms2_servicios" ms2-local-test
```

En `proyecto-cloud-frontend/.env.local`, agregar:

```
VITE_MS2_BASE_URL=/api/ms2
```

Y en `vite.config.ts`, agregar junto al proxy de `/api/ms1` (ya está hecho
en este repo):

```ts
'/api/ms2': {
  target: 'http://localhost:8001',
  changeOrigin: true,
  rewrite: (p) => p.replace(/^\/api\/ms2/, ''),
},
```

Reiniciar `npm run dev` y abrir `http://localhost:5173/rutas`,
`/paraderos` o `/servicios`.

**Nota de puertos (MS2)**: el `Dockerfile` de MS2 expone el puerto interno
**8000**, el mismo que usará MS4 más adelante — no mapees ambos contenedores
a `8000:8000` del host a la vez (aquí se usó `8001:8000` para MS2,
dejando `8000` libre para cuando se levante MS4). El puerto `27017` de
Mongo estaba libre en esta máquina; si no lo está en la tuya, cambia el
mapeo de host y ajusta `MONGO_URI` en consecuencia.

**MS3 (Viajes, Conexiones) — MySQL + Node/Express, y requiere un parche
temporal fuera del repositorio para poder arrancar** (ver la sección de
verificación de MS3 arriba para el detalle completo de los 2 bugs
bloqueantes). Pasos para reproducir exactamente lo que se hizo:

```bash
docker run -d --name mysql-ms3 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=ms3_viajes -e MYSQL_USER=ms3user -e MYSQL_PASSWORD=ms3pass -p 3306:3306 mysql:8
```

```bash
# Copiar MS3 a una carpeta FUERA del repo (no se modifica el original)
cp -r proyecto-cloud-backend/proyecto-cloud-ms3 /ruta/temporal/ms3-build-copy
cd /ruta/temporal/ms3-build-copy
```

En esa copia, y **solo** en esa copia, aplicar los 2 cambios mínimos:
1. En `package.json`, cambiar `"nodemon": "^18.0.0"` por
   `"nodemon": "^3.1.14"` (la versión real más alta que existe).
2. Al final de `src/models/viaje.model.js`, agregar una línea:
   `module.exports = Viaje;`

```bash
docker build -t ms3-local-test .
docker run -d --name ms3-local-test -p 3000:3000 --add-host=host.docker.internal:host-gateway -e DB_HOST=host.docker.internal -e DB_PORT=3306 -e DB_NAME=ms3_viajes -e DB_USER=root -e DB_PASSWORD=root -e MS1_BASE_URL=http://host.docker.internal:8081 -e MS2_BASE_URL=http://host.docker.internal:8001 ms3-local-test
```

En `proyecto-cloud-frontend/.env.local`, agregar:

```
VITE_MS3_BASE_URL=/api/ms3
```

Y en `vite.config.ts`, agregar junto a los proxies de `/api/ms1` y
`/api/ms2` (ya está hecho en este repo):

```ts
'/api/ms3': {
  target: 'http://localhost:3000',
  changeOrigin: true,
  rewrite: (p) => p.replace(/^\/api\/ms3/, ''),
},
```

Reiniciar `npm run dev` y abrir `http://localhost:5173/viajes` o
`/conexiones`.

**Nota de puertos (MS3)**: el `Dockerfile` de MS3 expone el puerto interno
**3000** (se mapeó igual, `3000:3000`, sin conflicto en esta máquina) y
MySQL usó su puerto estándar **3306** (también libre). Verifica con
`netstat` antes si tu máquina ya tiene algo en esos puertos.

**MS4 (Historial) — sin base de datos propia, y arrancó sin ningún parche**
(a diferencia de MS3). Solo necesita las 3 URLs de los otros
microservicios:

```bash
cd proyecto-cloud-backend/proyecto-cloud-ms4
docker build -t ms4-local-test .
docker run -d --name ms4-local-test -p 8002:8000 --add-host=host.docker.internal:host-gateway -e MS1_BASE_URL=http://host.docker.internal:8081 -e MS2_BASE_URL=http://host.docker.internal:8001 -e MS3_BASE_URL=http://host.docker.internal:3000 ms4-local-test
```

En `proyecto-cloud-frontend/.env.local`, agregar:

```
VITE_MS4_BASE_URL=/api/ms4
```

Y en `vite.config.ts`, agregar junto a los otros tres proxies (ya está
hecho en este repo):

```ts
'/api/ms4': {
  target: 'http://localhost:8002',
  changeOrigin: true,
  rewrite: (p) => p.replace(/^\/api\/ms4/, ''),
},
```

Reiniciar `npm run dev` y abrir `http://localhost:5173/historial`.

**Nota de puertos (MS4)**: el `Dockerfile` de MS4 expone el puerto interno
**8000** — el mismo que MS2 — por eso se mapeó al puerto de host **8002**
(no `8000`, para evitar cualquier confusión, y para distinguirlo
claramente de MS2 en `8001`).

**Limpieza cuando termines de probar** (no afecta al proyecto, son
contenedores desechables):

```bash
docker rm -f ms1-local-test pg-ms1 ms2-local-test mongo-ms2 ms3-local-test mysql-ms3 ms4-local-test
```

## Limitaciones conocidas (no atendidas aquí; corresponden al backend)

- **MS5 no existe todavía** como repositorio: esta interfaz no lo
  implementa ni simula analítica de Athena. La entrega final (5
  microservicios, 2+ métodos c/u, Amplify + repo público) **no** queda
  cumplida con este avance.
- **MS4 solo expone una operación de negocio** (`GET /historial/{id}`,
  además de `/health`, que es solo diagnóstico) — confirmado ahora también
  en vivo, con MS4 corriendo: no hay ningún otro router registrado en
  `app/main.py`. La segunda operación funcional de MS4 está pendiente del
  equipo; esta interfaz no la simula ni presenta dos llamadas al mismo
  endpoint como si fueran dos operaciones distintas.
- **MS4 no distingue "no encontrado" de "dependencia caída": todo es un
  500 sin JSON.** Ninguno de los 3 clientes HTTP de MS4
  (`ms1_client.py`/`ms2_client.py`/`ms3_client.py`) captura excepciones —
  todos usan `response.raise_for_status()` sin `try/except`, y
  `app/main.py` no registra ningún exception handler. Se probó
  consultando un pasajero inexistente (404 real en MS1) y, por separado,
  apagando MS3 a propósito: **ambos casos devolvieron exactamente el mismo
  `500 Internal Server Error` en texto plano**, sin forma de distinguirlos
  desde el cliente. El frontend no inventa esa distinción — muestra el
  error genérico con un botón "Reintentar", que se probó y funciona en
  cuanto la dependencia vuelve a estar disponible.
- **MS3 no arranca con el código del repositorio — confirmado en vivo, no
  solo por lectura.** Dos bugs bloqueantes distintos:
  1. El `Dockerfile` falla al construirse:
     `npm error notarget: No matching version found for nodemon@^18.0.0`
     (esa versión de `nodemon` nunca existió; la real más alta es
     `3.1.14`).
  2. Aunque se instalen las dependencias, el proceso crashea al arrancar
     porque `src/models/viaje.model.js` nunca hace
     `module.exports = Viaje;`. `src/models/index.js` hace
     `const Viaje = require('./viaje.model')`, por lo que `Viaje` llega
     como `{}` a `conexion.model.js`, que intenta
     `Conexion.belongsTo(Viaje, ...)` y Sequelize lo rechaza:
     `Error: Conexion.belongsTo called with something that's not a
     subclass of Sequelize.Model`.

  **No se modificó ningún archivo del repositorio real** — se verificó
  explícitamente. Para poder probar el resto de MS3 desde la interfaz
  (con autorización previa del usuario), se corrigieron esas 2 líneas
  **solo en una copia temporal fuera del repo**, usada exclusivamente para
  construir la imagen de prueba. Ver la sección de verificación de MS3
  para el detalle completo y los pasos exactos de esa copia.
- **MS3 tiene además otros 4 gaps de validación confirmados por prueba**
  (ya con MS3 arrancando): `GET /viajes` sin `pasajero_id` da `500` con un
  mensaje interno de Sequelize sin sanitizar; `POST /viajes` no valida que
  `pasajero_id` exista en MS1 (solo valida `tarjeta_id` y `servicio_id`);
  `PATCH /viajes/{id}/finalizar` no valida que `paradero_final_id` exista
  en MS2; y no existe ningún `DELETE` para viajes ni conexiones, por lo que
  un registro con datos inválidos queda para siempre. Ver la sección de
  verificación de MS3 para el detalle y cómo se reprodujo cada uno.
- **Paraderos (MS2) no tiene edición ni eliminación** en los endpoints
  actuales: la pantalla solo ofrece alta y consulta, incluida la
  validación de conexión con una ruta. Confirmado tanto leyendo
  `app/routers/paraderos.py` como probando: no existe ninguna ruta
  `PUT`/`DELETE` para paraderos en MS2.
- **MS2 no tiene una tabla de "conexiones" real entre rutas y paraderos.**
  El vínculo es un efecto secundario de `POST /servicios/`: al crear un
  servicio, el backend copia un resumen de la ruta dentro de
  `paradero.rutas[]`. Ver la sección de verificación de MS2 más abajo para
  el detalle completo, incluidos 5 bugs de consistencia confirmados por
  prueba (datos huérfanos, resúmenes desactualizados, entradas duplicadas,
  `PUT` sin validar nada, y ningún borrado en cascada).
- **Sin CORS configurado en ningún backend.** Se revisó `main.py`/`app.js`
  de los 4 microservicios: ninguno registra `CORSMiddleware` ni `cors()`.
  Contra **MS1** esto se confirmó además en vivo: el navegador bloqueó
  `GET http://localhost:8081/pasajeros` desde `http://localhost:5173` con
  `blocked by CORS policy: No 'Access-Control-Allow-Origin' header is
  present`. Contra **MS2**, **MS3** y **MS4** no se repitió esa prueba
  directa (se fue directo al proxy de Vite, que la evita), pero el código
  es igual de claro: `app/main.py` de MS2 y de MS4 no importan
  `CORSMiddleware`, y `src/app.js` de MS3 no usa el middleware `cors` de
  Express en ninguna parte. En
  producción, quien administre API Gateway/el backend debe habilitar CORS
  para el origen de Amplify y los métodos usados (incluyendo preflight
  `OPTIONS` para `PUT`/`PATCH`/`DELETE`). Este frontend no puede ni debe
  resolver esto por su cuenta.
- **URLs de los 4 microservicios pendientes** de que el equipo las
  proporcione (ver `.env.example`).

## CORS y proxy de desarrollo

No se encontró configuración de CORS en ninguno de los 4 backends, y el
bloqueo se reprodujo realmente contra MS1 (ver sección de verificación
arriba). [`vite.config.ts`](vite.config.ts) tiene **activos** los cuatro
proxies: `/api/ms1 → http://localhost:8081`, `/api/ms2 →
http://localhost:8001`, `/api/ms3 → http://localhost:3000` y `/api/ms4 →
http://localhost:8002`, que son los que se usaron para probar
Pasajeros/Tarjetas, Rutas/Paraderos/Servicios, Viajes/Conexiones e
Historial sin tocar ningún backend. Si el equipo no tiene esos
microservicios corriendo en esos puertos exactos, puede comentar el
bloque `server.proxy` correspondiente (o cambiar el `target`) y volver a
poner en `.env`/`.env.local` la URL real que corresponda. `server.proxy`
es una opción **exclusiva del servidor de desarrollo** (`npm run dev`); no
se incluye en `npm run build` ni en el build estático publicado en
Amplify. En producción, el navegador llama directamente a las URLs
públicas de API Gateway y CORS debe habilitarlo quien administre esa capa
para el origen real de Amplify.

## Despliegue

Esta sección es para quien haga el despliegue en AWS (no forma parte de
este trabajo de frontend). Resume qué necesita configurar y por qué.

1. Subir el contenido de esta carpeta (`proyecto-cloud-frontend`) como
   **raíz** de un repositorio de GitHub propio.
2. En Amplify Hosting, conectar ese repositorio. Amplify detecta
   [`amplify.yml`](amplify.yml) (build de solo frontend: `npm ci`,
   `npm run build`, artefactos en `dist`). Referencia oficial:
   <https://docs.aws.amazon.com/amplify/latest/userguide/yml-specification-syntax.html>
3. **Variables de entorno a configurar en Amplify** (App settings →
   Environment variables), las 4 que usa esta app, con las URLs públicas
   HTTPS reales de cada API Gateway:
   - `VITE_MS1_BASE_URL`
   - `VITE_MS2_BASE_URL`
   - `VITE_MS3_BASE_URL`
   - `VITE_MS4_BASE_URL`

   Cualquier cambio posterior exige un **Redeploy** (nuevo build), porque
   Vite las incrusta en tiempo de compilación, no de ejecución.
4. **La SPA necesita redirigir todas las rutas a `index.html`.** Esta app
   usa `react-router-dom` con `createBrowserRouter` (History API: rutas
   como `/pasajeros`, `/rutas`, etc., sin `#`), así que sin esa regla,
   refrescar la página en cualquier ruta que no sea `/` da 404. Amplify
   necesita la regla de reescritura 200 documentada en
   <https://docs.aws.amazon.com/amplify/latest/userguide/redirect-rewrite-examples.html>:
   origen `</^[^.]+$|\.(?!(css|gif|ico|jpg|jpeg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`,
   destino `/index.html`, tipo `200 (Rewrite)`. **Esta regla se configura en
   la consola de Amplify (Rewrites and redirects)**; un JSON guardado en el
   repositorio no se aplica automáticamente. Si el equipo prefiere no
   configurar esa regla, la alternativa es cambiar a `HashRouter` en
   `src/router.tsx` (URLs con `#`, sin necesidad de reglas de reescritura),
   documentando ese cambio de URLs para quien comparta enlaces.
5. **CORS: cada uno de los 4 backends (o su API Gateway) debe permitir el
   origen final del frontend.** Ninguno de los 4 microservicios tiene CORS
   configurado hoy (confirmado leyendo el código y, en el caso de MS1,
   reproduciendo el bloqueo real del navegador — ver secciones de
   verificación arriba). Quien despliegue en AWS debe habilitar, para el
   dominio real donde quede publicado el frontend (el subdominio que
   asigna Amplify, tipo `https://main.xxxxxxxxxx.amplifyapp.com`, o el
   dominio propio si se configura uno):
   - Encabezado `Access-Control-Allow-Origin` con ese origen exacto (no
     `*` si se necesitan cookies/credenciales, aunque esta app no las usa).
   - Los métodos realmente usados por cada módulo: `GET`, `POST`, y donde
     aplique `PUT`/`PATCH`/`DELETE`.
   - Respuesta correcta al preflight `OPTIONS` para esos métodos no
     "simples" (`PUT`, `PATCH`, `DELETE`, y `POST`/`GET` con
     `Content-Type: application/json`).

   Esto está **fuera del alcance de este frontend**: no se modificó
   ningún backend para intentar resolverlo desde aquí.

## Guía de evidencias para el avance

Hay dos niveles de evidencia distintos; conviene tomar ambos:

**A. Evidencia local (ya reproducible ahora mismo, con Docker)** — sirve
para demostrar que el flujo funciona contra un microservicio real, aunque
todavía no esté en Amplify:

1. Captura de la terminal con `docker ps` mostrando `pg-ms1` y
   `ms1-local-test` (o los nombres que uses) como `Up`.
2. `http://localhost:5173/pasajeros` en el navegador, con la lista vacía o
   con datos reales (no el aviso de "módulo no disponible").
3. Pestaña **Network** del navegador mostrando `GET .../pasajeros` → **200**
   con el arreglo de pasajeros real.
4. Formulario "Nuevo pasajero" enviado, con `POST .../pasajeros` → **201**
   en Network y el cuerpo de la respuesta con el pasajero creado.
5. La tabla de pasajeros ya actualizada (nueva fila) inmediatamente después
   del alta, sin recargar la página.
6. Entra al detalle del pasajero creado y captura el módulo **Tarjetas**:
   - Estado vacío real: "Este pasajero no tiene tarjetas".
   - Formulario "Nueva tarjeta" con saldo negativo → mensaje de validación
     "El saldo no puede ser negativo." (sin llamar a la API).
   - Alta válida (por ejemplo tipo ESTUDIANTE, saldo 50) → Network mostrando
     `POST .../tarjetas` → **201** con `fechaVencimiento` ya calculada por
     el backend, y la fila apareciendo sola en la tabla.
   - "Editar saldo" con un valor válido → Network mostrando
     `PUT .../tarjetas/{id}` → **200** y el saldo actualizado en la tabla.
   - "Eliminar" con el diálogo de confirmación, y la tabla volviendo al
     estado vacío tras aceptar.
7. Captura de `docker ps` mostrando también `mongo-ms2` y `ms2-local-test`
   como `Up`, junto a los de MS1.
8. `/rutas`: tabla con "Ruta Norte Editada" y "Ruta Sur" ya cargadas
   (datos reales de MS2, no simulados). Crea una tercera ruta tú mismo y
   captura el `POST .../rutas/` → **201** en Network.
9. `/paraderos`: la columna "Rutas asociadas" mostrando "Ruta Norte, Ruta
   Sur" para Paradero Central y Paradero Sur — evidencia de que el vínculo
   se generó solo al crear un servicio. Usa "Validar conexión" y captura
   ambos casos (verdadero y falso).
10. `/servicios`: los dos servicios de prueba ya cargados. Filtra por ruta
    o por fecha y captura cómo la tabla cambia con datos reales. Crea un
    servicio nuevo agregando paraderos en orden y captura el
    `POST .../servicios/` → **201**.
11. (Opcional, para mostrar los bugs reales de MS2 sin fabricar nada):
    edita "Ruta Norte Editada" cambiándole el nombre otra vez, y luego
    entra a `/paraderos` — el nombre mostrado en "Rutas asociadas" para
    Paradero Central/Sur seguirá siendo el viejo hasta que crees un nuevo
    servicio con esa ruta.
12. Captura de `docker ps` mostrando también `mysql-ms3` y `ms3-local-test`
    como `Up`.
13. `/viajes`: selecciona a "Carlos Rojas" y captura la tabla con los
    viajes reales (incluido el viaje `3`, finalizado en un paradero
    inexistente — evidencia visible del bug de validación de MS3). Crea un
    viaje nuevo con el formulario (que trae servicios reales de MS2 y la
    tarjeta real de MS1) y captura el `POST .../viajes` → **201**.
14. Usa "Finalizar" sobre un viaje `en_curso` y captura el
    `PATCH .../viajes/{id}/finalizar` → **200**, con el paradero final ya
    reflejado en la tabla.
15. `/conexiones`: con "Carlos Rojas" seleccionado, captura la conexión ya
    cargada (viaje 1 → viaje 4). Intenta crear una conexión usando el
    viaje `5` (finalizado en "Paradero Nuevo") como origen — captura el
    mensaje de error real `La ruta del servicio ... no pasa por el
    paradero ...` (`400`), que demuestra en la interfaz el efecto
    encadenado del bug de MS2.
16. Captura de `docker ps` mostrando también `ms4-local-test` como `Up`
    (MS4 no necesita base de datos propia).
17. `/historial`: selecciona a "Carlos Rojas" y captura la tabla
    enriquecida (nombre real de MS1, viajes reales de MS3, ruta y tipo de
    servicio reales de MS2, todo cruzado por MS4). Captura en Network el
    `GET .../historial/2` → **200**.
18. (Para documentar el bug real de MS4, sin fabricar nada): detén
    momentáneamente `ms3-local-test` (`docker stop ms3-local-test`) y
    vuelve a consultar el historial — captura el aviso "No se pudo
    completar la operación" con el `500` en Network. Vuelve a iniciar el
    contenedor (`docker start ms3-local-test`) y presiona "Reintentar" —
    captura cómo el historial se recupera solo, sin recargar la página.

**B. Evidencia del avance publicado (la que pide el enunciado)**:

1. URL pública de Amplify cargando la pantalla de Pasajeros.
2. Pestaña Network mostrando `GET /pasajeros` con respuesta 200 contra la
   URL real de API Gateway configurada en Amplify.
3. Envío del formulario "Nuevo pasajero", con `POST /pasajeros` devolviendo
   201 y el pasajero creado, también contra la URL de API Gateway.
4. La lista de pasajeros ya actualizada (nueva fila) tras el alta.
5. Enlace al repositorio de GitHub del frontend.

La evidencia (A) ya se generó y verificó en esta sesión (ver la sección
anterior). La evidencia (B) sigue **pendiente**: requiere que el equipo
despliegue MS1 en AWS, publique el frontend en Amplify con la URL real de
API Gateway y habilite CORS para el origen de Amplify. Hasta entonces, el
avance queda demostrado localmente pero no en el entorno publicado.

## Confirmación: backend no modificado

Todo el trabajo de código de esta sesión se limitó a
`proyecto-cloud-frontend/`. Los 4 microservicios en
`proyecto-cloud-backend/` se leyeron para extraer sus contratos (rutas,
DTOs, enums, manejo de errores) pero **no se editó, creó ni eliminó ningún
archivo dentro de esa carpeta**; el hallazgo sobre `viaje.model.js` en MS3
se documenta arriba tal como se encontró, sin tocarlo. La prueba de
integración local con Docker construyó la imagen de MS1 usando su
`Dockerfile` **tal cual está en el repositorio** (sin editarlo) y solo creó
recursos externos y desechables (contenedores y una base de datos Postgres
vacía en Docker) — nada de eso vive dentro de `proyecto-cloud-backend/`. Lo
mismo aplica para MS2: se construyó su `Dockerfile` sin cambiarle una
línea, y solo se agregó un contenedor de Mongo vacío como base de datos
externa. Los 5 bugs de consistencia encontrados en MS2 (servicio huérfano,
resúmenes desactualizados, duplicados, `PUT` sin validar, sin borrado en
cascada) se documentan tal como se comportó el backend real — ninguno se
corrigió.

**Excepción explícita y autorizada para MS3**: a diferencia de MS1 y MS2,
el repositorio real de MS3 **no se pudo construir ni ejecutar tal cual
está** (ver "Limitaciones conocidas" y la sección de verificación de MS3
para el detalle de los 2 bugs bloqueantes). Se preguntó al usuario antes
de tocar nada y, con su autorización explícita, se aplicaron 2 cambios
mínimos (versión de `nodemon`, y agregar `module.exports = Viaje;`)
**exclusivamente en una copia del código hecha en una carpeta temporal
fuera del repositorio** (`.../scratchpad/ms3-build-copy`, fuera de
`proyecto-cloud/`), solo para poder construir una imagen Docker de prueba.
Se verificó explícitamente, con `tail`, que
`proyecto-cloud-backend/proyecto-cloud-ms3/src/models/viaje.model.js` y su
`package.json` reales **no cambiaron ni una línea**. Los demás bugs de
MS3 encontrados después de que arrancara (validaciones faltantes, error
500 sin sanitizar, ausencia de `DELETE`) se documentan tal cual, sin
corregir ninguno.

**MS4 no necesitó ningún parche**: se construyó su `Dockerfile` original
sin cambiar una línea, arrancó a la primera y se probó apuntándolo (sin
tocarlos) a los mismos contenedores de MS1, MS2 y MS3 ya en ejecución. El
bug real encontrado en MS4 (todo error se convierte en un `500` genérico
sin distinguir causa) se documenta tal cual se comportó, sin corregirlo.

**Nota sobre `package.json`/`.gitignore` del frontend**: entre la sesión
anterior y esta, `react-router-dom` pasó de `6.30.6` a `7.18.3` y
`.gitignore` sumó `*.tsbuildinfo` — cambios hechos fuera de esta
conversación (no por mí en este hilo). Se verificó que `npm run build`
sigue compilando sin errores con la versión nueva, así que se dejaron
como están.
