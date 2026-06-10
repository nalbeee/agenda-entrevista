🚀 Plan de Trabajo y Requisitos: Frontend

Este documento detalla todas las tareas, pantallas y requisitos arquitectónicos que el equipo de Frontend debe desarrollar para la Agenda de Entrevistas, cumpliendo al 100% con los criterios de evaluación de la cátedra.


🛠️ Tecnologías y Arquitectura Obligatoria

El proyecto debe construirse respetando las siguientes directivas técnicas:
El frontend debe implementarse obligatoriamente utilizando React y Vite.
Se debe crear un Contexto, Hook o mecanismo equivalente para conservar globalmente el usuario autenticado, su token y su rol.
Las rutas de la aplicación deben estar protegidas, impidiendo el acceso visual y navegable si no hay un usuario autenticado o si el rol es insuficiente. 
La capa de servicios HTTP debe utilizar Axios de manera centralizada.  Los servicios de Axios deben estar separados por recurso, quedando estrictamente prohibido mezclar llamadas HTTP sueltas dentro de los componentes visuales. 
La configuración de Axios debe incluir una instancia con baseURL y enviar el token en acciones protegidas mediante el header Authorization: Bearer <token>. 
Se deben diseñar componentes modulares separados para: tabla/listado, filtros, formulario, detalle, acciones por rol y el resumen administrativo. 
Se puede utilizar React Hook Form o formularios controlados con useState, pero es obligatorio que las validaciones se reflejen en la pantalla. 

📱 Pantallas a Desarrollar

El sistema debe contar como mínimo con las siguientes vistas navegables:
1. Autenticación: Pantalla funcional de Login y Registro de usuarios.
2. Listado Principal: Tabla o grilla de entrevistas que incluya filtros combinables por fecha, estado, entrevistador y postulante.
3. Paginación y Ordenamiento: El listado de entrevistas debe soportar búsqueda paginada y ordenamiento enviando parámetros al backend.
4. Detalle de Entrevista: Una pantalla accesible mediante una ruta dinámica (ejemplo: /entrevistas/:id) que lea el parámetro con useParams.
5. Auditoría: Dentro de la pantalla de detalle de una entrevista específica, se debe visualizar su historial de cambios.
6. Alta y Edición: Pantalla transaccional (o modal) para crear, editar o reprogramar entrevistas.
7. Confirmación de Operaciones: El formulario transaccional debe permitir seleccionar postulante, entrevistador, fecha, horario y modalidad, confirmando la operación contra la API.
8. Panel Resumen (Dashboard): Una vista de administración para RRHH que muestre entrevistas del día, entrevistas por entrevistador, postulantes en proceso y entrevistas canceladas.
9. Página No Encontrada: React Router debe implementar una ruta comodín * para atajar URLs inválidas.


⚙️ Reglas de Interfaz y Experiencia de Usuario (UX)

<<<<<<< HEAD
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
=======
La interfaz debe manejar y mostrar de forma clara los diferentes estados de las operaciones principales: estados de carga, vacío, error y éxito. 
Las validaciones de negocio deben repetirse en el frontend para mejorar la experiencia del usuario, aunque el backend siga siendo la fuente de verdad. 
Los errores devueltos por la API (como problemas de validación, permisos o recursos inexistentes) deben mostrarse de forma comprensible y visible cerca de la acción que falló. 
Las acciones de cancelar, realizar o reprogramar una entrevista deben estar visibles u ocultas dependiendo del rol del usuario autenticado. 
No se debe permitir la modificación de una entrevista en estado "realizada", exceptuando el campo de observaciones.
>>>>>>> 3dfebe270bfe25091a80aaf66c95a66d32bce958
