# FoodStore · Trabajo Práctico Integrador

**Programación IV · UTN · Marianela Valletto**

FoodStore reúne el trabajo desarrollado durante la materia en una aplicación de pedidos de comida. Conserva el catálogo inicial del proyecto de Programación III y retoma el diseño del Parcial 2 —Poppins, barra naranja y tarjetas claras—, adaptados al modelo del integrador: cada producto pertenece a una categoría y tiene precio, disponibilidad y stock. Incorpora registro e ingreso de clientes, carrito persistente, confirmación de pedidos y un panel de administración para gestionar el catálogo, los usuarios y los estados de las compras.

## Enlaces de entrega

- Repositorio público de GitHub: [MaruValletto/FoodStore-TPI](https://github.com/MaruValletto/FoodStore-TPI).
- Video demostrativo: [Presentación y demostración de FoodStore](https://www.youtube.com/watch?v=-p7PrQO0Eh8).

El video debe poder reproducirse sin iniciar sesión; su duración y contenido deben cumplir lo indicado por la consigna.

## Requisitos

- Python 3.11 a 3.13; verificado con Python 3.13.
- PostgreSQL 15 o superior; verificado con PostgreSQL 18.
- Node.js 22.12 o superior y pnpm 10.28.0.
- Dos terminales: una para la API y otra para la interfaz.

Se recomienda extraer el proyecto en una ruta corta, por ejemplo `C:\FoodStoreTPI`, para evitar el límite de longitud de rutas de Windows al instalar dependencias.

## Base de datos

En pgAdmin, conectarse al servidor y crear una base llamada `foodstore_tpi`: clic derecho en **Databases → Create → Database**, escribir el nombre y guardar. El usuario y la contraseña son los de la instalación local de PostgreSQL.

No se adjunta una base de datos personal. Las tablas se crean al iniciar la API o ejecutar el seed.

## Backend

Desde la carpeta del proyecto, en PowerShell:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Mantener `.env.example` con valores ficticios: es una plantilla pública que se incluye en GitHub y en el ZIP. Las claves reales se escriben únicamente en `.env`, que no se entrega.

Editar `backend/.env`: reemplazar `TU_CLAVE` por la contraseña local y asignar a `SECRET_KEY` una clave aleatoria de al menos 32 caracteres. Puede generarse con:

```powershell
.venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(48))"
```

Configuración principal:

```dotenv
DATABASE_URL=postgresql://postgres:TU_CLAVE@localhost:5432/foodstore_tpi
SECRET_KEY=REEMPLAZAR_POR_LA_CLAVE_GENERADA
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
```

Si la contraseña de PostgreSQL contiene caracteres reservados de una URL, deben codificarse en `DATABASE_URL`. Para desarrollo local también se admite `DATABASE_URL=sqlite:///./foodstore.db`; las verificaciones de concurrencia se realizaron con PostgreSQL.

Preparar el catálogo y ejecutar:

```powershell
.venv\Scripts\python.exe -m app.db.seed
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Con el entorno virtual activado, los comandos equivalentes son `python -m app.db.seed` y `uvicorn app.main:app`.

- Documentación interactiva: [http://localhost:8000/docs](http://localhost:8000/docs).
- API: `http://localhost:8000/api/v1`.
- Imágenes del catálogo: `http://localhost:8000/media/`.

El seed es idempotente: crea el administrador, seis categorías y veinte productos iniciales con stock de 30 unidades por producto, sin duplicarlos ni restablecer los cambios de una ejecución anterior. Las imágenes están incluidas en el proyecto.

**Cuenta inicial de demostración:** usuario `admin`, contraseña `Admin1234!`. Los clientes se crean mediante el formulario de registro. Esta cuenta se proporciona para evaluar el proyecto en un entorno local; no debe conservarse con esa contraseña en una publicación de producción.

## Frontend

En la segunda terminal, desde la carpeta del proyecto:

```powershell
cd frontend
Copy-Item .env.example .env
pnpm.cmd install
pnpm.cmd dev
```

El archivo `.env` debe contener:

```dotenv
VITE_API_URL=http://localhost:8000/api/v1
```

Abrir [http://localhost:5173](http://localhost:5173). Usar `localhost` tanto para la interfaz como para la API, porque la sesión utiliza una cookie asociada al host. La configuración de CORS permite ese origen y las solicitudes con credenciales.

Si pnpm no está instalado, con Node.js instalado ejecutar `npm.cmd install --global pnpm@10.28.0`. En otras plataformas pueden utilizarse `pnpm install`, `pnpm dev` y `pnpm build` sin el sufijo `.cmd`.

Compilación de producción:

```powershell
pnpm.cmd build
```

## Funcionalidades

### Tienda y clientes

- Catálogo público con imágenes, búsqueda, filtro por categoría y paginación del servidor.
- Registro e ingreso; el registro siempre crea un cliente, sin posibilidad de elegir el rol administrador.
- Carrito persistente con cantidades, subtotales y total estimado.
- Confirmación con dirección, forma de pago y notas. El servidor obtiene los precios vigentes y calcula el total definitivo.
- Mis pedidos con detalle y cancelación de pedidos propios pendientes.

### Administración

- Resumen con cantidades por estado, pedidos del día e ingresos de pedidos entregados.
- Altas, consultas, modificaciones y bajas lógicas de categorías y productos.
- Cambio específico de stock y disponibilidad de productos.
- Gestión de pedidos con filtro por estado y acciones permitidas.
- Activación y desactivación de usuarios; el administrador no puede desactivarse a sí mismo.

### Reglas de pedidos

```text
PENDIENTE → EN_PREPARACION → ENTREGADO
     │             │
     └── CANCELADO ┘
```

`ENTREGADO` y `CANCELADO` son estados terminales. Un cliente solo puede cancelar su propio pedido pendiente; un administrador también puede cancelar uno en preparación.

Crear un pedido verifica existencia, actividad, disponibilidad y stock de todos sus productos. El descuento y la creación de las líneas ocurren en una única transacción. Cada línea conserva una copia del nombre y del precio, aunque el catálogo cambie después. Al cancelar se devuelve el stock una sola vez. En PostgreSQL se bloquean las filas involucradas para evitar vender más unidades de las disponibles ante compras simultáneas.

## Organización y tecnologías

```text
backend/
  app/core/               Configuración, seguridad, dependencias y transacciones
  app/modules/auth/       Registro, ingreso, cierre y consulta de sesión
  app/modules/usuarios/   Usuarios y roles
  app/modules/categorias/
  app/modules/productos/
  app/modules/pedidos/
  app/db/                 Seed y catálogo inicial
  static/foodstore/        Fotografías de productos
  tests/                  Pruebas de aceptación
frontend/
  src/features/           Pantallas, formularios y servicios por funcionalidad
  src/shared/             API, tipos, componentes y diseño compartido
  src/store/              Sesión y carrito con Zustand
  src/routes/             Rutas y protección según rol
  tests/                  Pruebas de interfaz
```

El backend utiliza FastAPI, SQLModel y PostgreSQL con psycopg2. Los routers delegan en servicios, los servicios controlan la unidad de trabajo y los repositorios acceden a la base. La unidad de trabajo confirma o revierte y cierra la sesión. El modelo contiene Usuario, Categoria, Producto, Pedido y DetallePedido, con sus relaciones bidireccionales.

La autenticación utiliza bcrypt y JWT en una cookie `HttpOnly`, con vencimiento de 30 minutos. El token no se expone en la respuesta ni se guarda en el almacenamiento del navegador. Zustand persiste únicamente los datos públicos del usuario y el contenido del carrito; al iniciar se consulta la sesión en la API. Las restricciones de acceso también se verifican en el backend.

El frontend utiliza React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Zustand y TanStack Query, Form y Table. Query administra el estado del servidor e invalida la caché luego de las modificaciones; Form administra los formularios; Table aporta ordenamiento y paginación en las tablas. Las dependencias directas están fijadas y se incluye `pnpm-lock.yaml`.

## Verificación

Se comprobaron la compilación de producción, 59 solicitudes y respuestas de aceptación sobre PostgreSQL y diez pruebas de interfaz, incluidas dos contra la API y PostgreSQL reales. Se verificaron permisos, cookies de sesión, bajas lógicas, conservación de precios, reversión transaccional y competencia por la última unidad de stock.

El recorrido manual de cliente también fue comprobado: creación de pedido, descuento de stock y cancelación con restitución de unidades.

Para repetir las pruebas de aceptación en una base SQLite temporal, desde `backend`:

```powershell
.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.venv\Scripts\python.exe -m pytest tests -q
```

La prueba temporal no modifica la base configurada en `.env`. El soporte opcional para PostgreSQL en ese archivo de pruebas exige un esquema temporal identificado como `test_tpi_`; no debe apuntarse a una base con datos personales.

Desde `frontend`, `pnpm.cmd test` ejecuta ocho pruebas autónomas. Las dos pruebas de integración se omiten salvo que se configure expresamente una API de pruebas con `RUN_LIVE_API=1` y `VITE_API_URL`; crean registros y pedidos y deben usarse en una base descartable.

### Recorrido manual antes de presentar

1. Registrarse como cliente, ingresar, buscar un producto y filtrar por categoría.
2. Agregar al carrito, modificar la cantidad y recargar para comprobar la persistencia.
3. Confirmar una compra; comprobar el detalle en Mis pedidos y el descuento de stock.
4. Cancelar el pedido pendiente; comprobar que el stock vuelve al valor previo y no se permite otra cancelación.
5. Ingresar como administrador; crear, editar y dar de baja una categoría y un producto de prueba. Modificar stock y disponibilidad.
6. Crear otro pedido y avanzar desde Pendiente a En preparación y Entregado; comprobar el resumen.
7. Desactivar y reactivar al cliente; comprobar la restricción de acceso y los mensajes de la aplicación.

## Entrega

Un único ZIP debe contener `README.md`, `backend/` y `frontend/`. Se excluyen `.venv`, `node_modules`, archivos `.env` reales, bases de datos, cachés y compilaciones generadas. Se incluyen ambos `.env.example`, el seed, las imágenes y el archivo de versiones de pnpm. El video se comparte mediante enlace y no se incorpora al ZIP.

Antes de entregar, comprobar que tanto el video como el repositorio permiten acceso público.
