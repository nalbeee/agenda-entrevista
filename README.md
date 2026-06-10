# 🚀 Documentación para el Equipo de Frontend

El backend de la **Agenda de Entrevistas** ya cuenta con su estructura base de base de datos (SQLite) y las rutas principales operativas. 

**URL Base de la API:** `http://localhost:3000/api`

> ⚠️ **Nota importante sobre Seguridad:** El endpoint de Login ya funciona y genera Tokens JWT. Sin embargo, para agilizar el desarrollo inicial del frontend, **los candados (middlewares) que exigen el token en las rutas CRUD están temporalmente desactivados**. Pueden hacer peticiones directas sin enviar el header de `Authorization` por ahora.

A continuación, se detallan las tareas y pantallas que ya pueden comenzar a desarrollar consumiendo datos reales del backend:

---

## 📋 Tareas y Pantallas Listas para Desarrollar

### 1. Pantalla de Inicio de Sesión (Login)
* **Acción:** Crear el formulario de login (Email y Contraseña).
* **Endpoint:** `POST /api/auth/login`
* **Body requerido:** `{ "email": "admin@agenda.com", "password": "123456" }` *(Pueden usar este usuario de prueba)*.
* **Lógica a implementar:** * Capturar el token JWT que devuelve el servidor y guardarlo (ej. en `sessionStorage` o `localStorage`).
  * Redirigir al usuario al panel principal (Dashboard) si el login es exitoso (Estado `200`).
  * Mostrar un mensaje de error visual si el servidor responde con error `401` (Credenciales inválidas).

### 2. Módulo de Gestión de Postulantes
* **A. Pantalla de Listado (Grilla/Tabla):**
  * **Endpoint:** `GET /api/postulantes`
  * **Acción:** Mostrar la tabla de candidatos. El backend ya los devuelve ordenados alfabéticamente por apellido.
* **B. Formulario de Alta de Postulante:**
  * **Endpoint:** `POST /api/postulantes`
  * **Body esperado:** `{ "nombres": "...", "apellidos": "...", "email": "...", "telefono": "..." }`
  * **Lógica crítica:** El backend validará que no haya emails duplicados. Si intentan registrar un email existente, el servidor devolverá un error `400`. El frontend debe capturar ese error y mostrar una alerta al usuario.

### 3. Panel Central de Entrevistas (Dashboard)
* **A. Vista Principal (Tabla o Calendario):**
  * **Endpoint:** `GET /api/entrevistas`
  * **Acción:** Listar todas las entrevistas programadas. 
  * **Dato útil:** El JSON devuelto ya trae embebidos los datos exactos del `postulante` (nombres, apellidos, email) y del `entrevistador` asignado. No necesitan hacer peticiones extra para cruzar los datos.
* **B. Formulario para Agendar Nueva Entrevista:**
  * **Endpoint:** `POST /api/entrevistas`
  * **Body esperado:** `{ "fechaHora": "2026-06-25T10:00:00Z", "modalidad": "virtual", "notas": "...", "entrevistadorId": 2, "postulanteId": 1 }`
  * **Lógica crítica:** Validar superposición. Si el entrevistador ya tiene una cita en ese mismo horario exacto, el backend devolverá un error `400`.
* **C. Modal para Reprogramar / Cambiar Estado:**
  * **Endpoint:** `PUT /api/entrevistas/:id` (reemplazar `:id` por el número de la entrevista).
  * **Body esperado:** `{ "estado": "reprogramada", "fechaHora": "...", "detalleHistorial": "Motivo del cambio" }`
  * **Lógica crítica:** El campo `detalleHistorial` es **obligatorio** en el body para que el backend pueda generar la auditoría de forma automática.

---

## 🛠️ Respuestas de Error del Backend
Todas las validaciones fallidas devuelven un código de estado **400 (Bad Request)** y tienen la siguiente estructura estandarizada para que el frontend pueda leerlas fácilmente:

```json
{
  "error": "Mensaje principal del error",
  "detalles": [ 
      // Array con los campos específicos que fallaron (si aplica)
  ]
<<<<<<< Updated upstream
}

***

# 🛠️ Plan de Trabajo y Pendientes del Backend

Este documento detalla el backlog técnico de tareas pendientes en el **Backend** para dar por finalizado el desarrollo del servidor de la **Agenda de Entrevistas** y cumplir con el 100% de los requisitos del Trabajo Práctico (DDS).

---

## 📌 Estado Actual del Servidor
* **Base de datos (SQLite):** Modelos (`Usuario`, `Postulante`, `Entrevista`, `HistorialEntrevista`) con relaciones configuradas.
* **Semillas (Seeders):** Script automatizado para la inserción de datos de prueba iniciales.
* **Autenticación:** Login operativo (`POST /api/auth/login`) con encriptación `bcryptjs` y generación de tokens JWT.
* **Core de Entrevistas:** Rutas para listar, crear (con validación de superposición horaria) y modificar entrevistas (con generación automática de auditoría/historial mediante transacciones).
* **Core de Postulantes:** Rutas para listar y registrar candidatos controlando emails duplicados.

---

## 📋 Backlog de Tareas Pendientes (Backend)

### Tarea 4: Configuración e Implementación de Pruebas Automatizadas (Testing)
Requisito obligatorio de la cátedra para evaluar la estabilidad de la aplicación mediante la simulación de peticiones HTTP en un entorno controlado.
* **Instalación:** Configurar e instalar las librerías de desarrollo `jest` y `supertest`.
* **Configuración del Entorno:** Crear un script en `package.json` (`"test": "jest --watchAll --runInBand"`) y configurar las variables de entorno de prueba para evitar sobreescribir la base de datos de desarrollo.
* **Casos de Prueba Mínimos a Desarrollar (`__tests__/`):**
  1. **Test de Login:** Verificar que un `POST` con credenciales válidas devuelva código `200` y un string en la propiedad `token`. Verificar que credenciales erróneas devuelvan `401`.
  2. **Test de Validaciones CRUD:** Validar que al intentar registrar un postulante sin el campo obligatorio `email`, el servidor responda con `400 Bad Request` y describa el error.
  3. **Test de Regla de Negocio (Superposición):** Validar que si se intenta dar de alta una entrevista en el mismo horario y con el mismo entrevistador que una ya existente, el servidor responda correctamente bloqueando la operación con un código `400`.

### Tarea 5: Middleware Global para el Manejo de Errores
Prevenir caídas masivas del servidor ante fallos imprevistos de código o pérdida de conexión con la base de datos.
* **Acción:** Crear e implementar un middleware de error centralizado al final del archivo `backend/index.js` (después de definir todas las rutas):
  ```javascript
  app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Ocurrió un error interno e inesperado en el servidor.' });
  });

Tarea: Implementar un middleware de manejo de errores al final del index.js para capturar cualquier fallo inesperado y evitar que el servidor se caiga (crash) ante un imprevisto.
=======
}
>>>>>>> Stashed changes
