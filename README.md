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
}

Tareas a completar equipo BACKEND:
1. Endpoint para Consultar el Historial (Auditoría)
El frontend va a necesitar una pantalla o un modal para ver el historial de cambios de una entrevista específica.

Tarea: Crear una ruta GET /api/entrevistas/:id/historial en entrevistas.routes.js.

Propósito: Hacer un HistorialEntrevista.findAll({ where: { entrevistaId: id } }) ordenado por fecha para que el usuario de RRHH pueda ver toda la "cronología" de esa entrevista.

2. Reactivar y Aplicar la Seguridad (JWT + Roles)
Como acordamos programar todo libre para agilizar las pruebas, falta "conectar" los candados que fabricamos.

Tarea: Quitar los comentarios e inyectar el middleware verificarToken en las rutas que correspondan:

POST /api/entrevistas y PUT /api/entrevistas/:id.

POST /api/postulantes.

Restricción de Rol (Opcional según tu enunciado): Si el TP pide que solo el Administrador pueda dar de alta usuarios o ver ciertos reportes, se debe aplicar también el middleware verificarRolAdmin.

3. Completar el ABMC de Postulantes (Modificación y Baja)
Por ahora los postulantes solo se pueden listar y crear. Para tener un ABMC completo falta:

PUT /api/postulantes/:id: Para poder editar los datos del candidato (teléfono, apellido, etc.).

DELETE /api/postulantes/:id: Generalmente se implementa como una baja lógica (cambiar su columna estado a 'inactivo') para no romper la integridad referencial de las entrevistas que ya tiene asociadas.

4. Pruebas Automatizadas (Testing con Jest y Supertest)
Esta es una de las exigencias más pesadas del parcial de la cátedra para verificar el correcto funcionamiento del software.

Tarea: Configurar el entorno de pruebas e instalar jest y supertest.

Escribir Tests: Se deben programar al menos 3 o 4 casos de prueba automatizados en una carpeta __tests__/. Por ejemplo:

Probar que el POST /api/auth/login devuelva un token si las credenciales son correctas.

Probar que falle la creación de una entrevista si falta un campo obligatorio (validando el código 400).

Probar que falle la creación de una entrevista si hay superposición de horarios.

5. Manejo Global de Errores y Limpieza de Consola
Para que el servidor sea verdaderamente robusto y pase las pruebas de corrección de los profesores.

Tarea: Implementar un middleware de manejo de errores al final del index.js para capturar cualquier fallo inesperado y evitar que el servidor se caiga (crash) ante un imprevisto.
