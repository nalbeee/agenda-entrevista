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

La interfaz debe manejar y mostrar de forma clara los diferentes estados de las operaciones principales: estados de carga, vacío, error y éxito. 
Las validaciones de negocio deben repetirse en el frontend para mejorar la experiencia del usuario, aunque el backend siga siendo la fuente de verdad. 
Los errores devueltos por la API (como problemas de validación, permisos o recursos inexistentes) deben mostrarse de forma comprensible y visible cerca de la acción que falló. 
Las acciones de cancelar, realizar o reprogramar una entrevista deben estar visibles u ocultas dependiendo del rol del usuario autenticado. 
No se debe permitir la modificación de una entrevista en estado "realizada", exceptuando el campo de observaciones.
