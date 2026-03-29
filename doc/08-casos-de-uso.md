# Casos de Uso (LifeOS)

Voy a organizarlo por módulos para que luego puedas convertir esto en backlog, épicas, user stories o incluso directamente en rutas y componentes.

---

# Visión general del sistema

El sistema es un **LifeOS personal** orientado a centralizar la gestión de vida, trabajo, conocimiento y recursos en una sola plataforma. El usuario puede capturar información, organizarla, conectarla, convertirla en acción, revisarla con el tiempo y apoyarse en recursos multimedia o externos para pensar y trabajar mejor.

El sistema gira alrededor de un único actor principal:

**Actor principal:** Usuario autenticado

# 1. Casos de uso de autenticación y perfil

## 1.1 Registrarse
El usuario crea una cuenta en el sistema usando email y contraseña o el método de autenticación habilitado.
**Objetivo:** acceder a un espacio privado y persistente.
**Resultado esperado:** se crea el usuario en auth y su perfil base en `profiles`.

## 1.2 Iniciar sesión
El usuario accede a su cuenta para usar su sistema personal.
**Objetivo:** entrar a su espacio de trabajo.
**Resultado esperado:** obtiene sesión válida y acceso a datos privados.

## 1.3 Cerrar sesión
El usuario finaliza su sesión.
**Objetivo:** proteger su cuenta o cambiar de sesión.
**Resultado esperado:** la sesión se invalida.

## 1.4 Consultar su perfil
El usuario visualiza su información personal básica.
**Objetivo:** verificar sus datos de cuenta.
**Resultado esperado:** ve nombre, email, avatar, zona horaria, etc.

## 1.5 Editar su perfil
El usuario modifica datos como nombre, avatar, bio, zona horaria o idioma.
**Objetivo:** personalizar el sistema.
**Resultado esperado:** el perfil queda actualizado.

---

# 2. Casos de uso del dashboard y contexto general

## 2.1 Ver el dashboard principal
El usuario entra al dashboard y obtiene una vista resumida de su sistema.
**Objetivo:** orientarse rápidamente.
**Puede incluir:** proyectos activos, tareas pendientes, recursos recientes, notas recientes, elementos del inbox, revisión pendiente.

## 2.2 Ver actividad reciente
El usuario consulta las últimas entidades modificadas o creadas.
**Objetivo:** retomar contexto sin rebuscar.
**Resultado esperado:** ve cambios recientes en notas, tareas, proyectos y recursos.

## 2.3 Ver resumen de estado personal
El usuario obtiene una síntesis de su situación actual.
**Objetivo:** comprender qué requiere atención.
**Resultado esperado:** ve señales como backlog, revisiones pendientes, próximos vencimientos y proyectos activos.

---

# 3. Casos de uso del inbox universal

## 3.1 Capturar una idea rápida
El usuario registra una idea sin clasificarla todavía.
**Objetivo:** no perder pensamientos o pendientes.
**Resultado esperado:** se crea un item inicial que luego podrá convertirse en tarea, nota, recurso, proyecto o decisión.

## 3.2 Guardar un pendiente rápido
El usuario añade algo que debe hacer más tarde.
**Objetivo:** descargar la mente.
**Resultado esperado:** el pendiente entra en el sistema sin necesidad de estructurarlo de inmediato.

## 3.3 Guardar una referencia rápida
El usuario añade un link, título, nombre de libro, vídeo o PDF para revisar luego.
**Objetivo:** capturar material de interés.
**Resultado esperado:** queda registrado como entrada pendiente de clasificar.

## 3.4 Procesar el inbox
El usuario revisa entradas del inbox y decide qué son.
**Objetivo:** transformar captura bruta en información útil.
**Posibles resultados:** convertir en tarea, nota, recurso, proyecto, decisión o archivar/eliminar.

## 3.5 Archivar una entrada del inbox
El usuario decide que una captura ya no necesita acción ni procesamiento.
**Objetivo:** limpiar el sistema.
**Resultado esperado:** el item se archiva o descarta.

---

# 4. Casos de uso de áreas

## 4.1 Crear un área
El usuario crea un área de vida o responsabilidad, como trabajo, salud, aprendizaje o finanzas.
**Objetivo:** estructurar su sistema por dominios importantes.
**Resultado esperado:** existe una nueva área disponible para relacionar proyectos, tareas, notas y recursos.

## 4.2 Editar un área
El usuario modifica nombre, descripción, color, icono o tipo del área.

## 4.3 Archivar un área
El usuario deja de usar temporalmente o permanentemente un área.

## 4.4 Consultar una vista de área
El usuario entra a un área y ve todo lo relacionado con ella.
**Objetivo:** concentrarse en un dominio concreto.
**Puede ver:** proyectos, tareas, notas, recursos, decisiones.

---

# 5. Casos de uso de proyectos

## 5.1 Crear un proyecto
El usuario define un proyecto con título, descripción, prioridad, fechas y área asociada.
**Objetivo:** agrupar trabajo orientado a un resultado concreto.

## 5.2 Editar un proyecto
El usuario actualiza datos del proyecto.

## 5.3 Cambiar estado de un proyecto
El usuario marca un proyecto como activo, pausado, completado, archivado o cancelado.

## 5.4 Consultar detalle de proyecto
El usuario entra a un proyecto y ve su contexto completo.
**Debe poder ver:** descripción, tareas, notas, recursos, decisiones, estado y fechas.

## 5.5 Asociar un proyecto a un área
El usuario vincula el proyecto a una dimensión de su vida.

## 5.6 Relacionar recursos con un proyecto
El usuario conecta libros, artículos, PDFs, links o vídeos al proyecto.

## 5.7 Relacionar notas con un proyecto
El usuario asocia notas que forman parte del trabajo o pensamiento del proyecto.

## 5.8 Etiquetar un proyecto
El usuario asigna tags para clasificación adicional.

## 5.9 Archivar un proyecto
El usuario oculta proyectos terminados o fuera de foco.

## 5.10 Consultar listado de proyectos
El usuario explora proyectos filtrando por estado, prioridad, área o etiqueta.

---

# 6. Casos de uso de tareas

## 6.1 Crear una tarea
El usuario añade una acción concreta.

## 6.2 Crear una subtarea
El usuario descompone una tarea compleja.

## 6.3 Editar una tarea
El usuario ajusta título, descripción, estado, prioridad, fecha límite, tiempo estimado, etc.

## 6.4 Cambiar estado de una tarea
El usuario mueve una tarea entre inbox, todo, in progress, waiting, done, cancelled o archived.

## 6.5 Priorizar una tarea
El usuario define urgencia o importancia relativa.

## 6.6 Programar una tarea
El usuario asigna una fecha o momento previsto de ejecución.

## 6.7 Asignar tarea a proyecto
El usuario vincula la tarea con el proyecto relevante.

## 6.8 Asignar tarea a área
El usuario la relaciona con un dominio vital o profesional.

## 6.9 Marcar una tarea como completada
El usuario registra su finalización.

## 6.10 Registrar tiempo estimado o real
El usuario añade duración prevista o invertida.

## 6.11 Etiquetar una tarea
El usuario organiza tareas con tags.

## 6.12 Relacionar recursos con una tarea
El usuario adjunta material necesario para completarla.

## 6.13 Consultar tareas por contexto
El usuario filtra tareas por estado, prioridad, fecha, energía requerida, proyecto, área o etiqueta.

## 6.14 Gestionar tareas recurrentes
El usuario crea tareas periódicas.

## 6.15 Ver una vista de ejecución diaria
El usuario consulta las tareas relevantes para el día o la semana.

---

# 7. Casos de uso de notas y conocimiento

## 7.1 Crear una nota
El usuario escribe libremente, resume, o captura ideas.

## 7.2 Editar una nota
El usuario modifica contenido, resumen, tipo o título.

## 7.3 Consultar una nota
El usuario lee una nota individual con todo su contexto.

## 7.4 Etiquetar una nota
El usuario organiza su conocimiento por temas.

## 7.5 Relacionar una nota con un proyecto
El usuario asocia la nota a trabajo concreto.

## 7.6 Relacionar una nota con un área
El usuario la vincula a un dominio vital.

## 7.7 Vincular una nota con un recurso fuente
El usuario indica que la nota proviene de un libro, paper, artículo o vídeo.

## 7.8 Conectar una nota con otra nota
El usuario crea relaciones intelectuales entre ideas (ej. related_to, inspired_by).

## 7.9 Marcar una nota como favorita
El usuario destaca notas importantes.

## 7.10 Archivar una nota
El usuario retira notas viejas o menos relevantes del flujo principal.

## 7.11 Consultar notas recientes
El usuario revisa conocimiento producido recientemente.

## 7.12 Buscar notas
El usuario busca por texto, tipo, etiqueta, proyecto o recurso fuente.

---

# 8. Casos de uso de recursos y biblioteca multimedia

*(Crear recursos externos, internos, editar, consultar, visualizar previews, descargar, relacionar con proyectos, notas, tareas, decisiones, y navegar biblioteca).*

---

# 9. Casos de uso de etiquetas

*(Crear tag, editar, eliminar, asignar a proyecto/tarea/nota/recurso, y navegar la taxonomía).*

---

# 10. Casos de uso del diario diario y seguimiento personal

*(Crear registro, anotar mood/energía/enfoca, anotar wins/bloqueos, consultar historial y detectar patrones).*

---

# 11. Casos de uso de revisión semanal

*(Crear revisión semanal, resumir, registrar victorias/bloqueos/lecciones, definir siguiente foco, consultar pasadas y ver relación general con el sistema).*

---

# 12. Casos de uso del decision journal

*(Crear decisión, contexto, opciones, opción elegida, razonamiento, resultado esperado, fecha de review, relacionar a componentes, y revisar historial).*

---

# 13. Casos de uso de relaciones entre entidades

*(Nota<->Recurso, Nota<->Nota, Recurso<->Proyecto, Recurso<->Tarea, etc. Consultar relaciones transitivas de una entidad y navegar contextualmente).*

---

# 14. Casos de uso de búsqueda y filtrado

*(Búsqueda global cruzada, filtros específicos, y multi-variable).*

---

# 15. Casos de uso de archivo y limpieza

*(Archivar, consultar archivo, restaurar, eliminar definitivamente).*

---

# 16. Casos de uso de multimedia y previews

*(Subir imagen/PDF/archivo, generar previews ricas, consultar preview y gestión de fallos).*

---

# 17. Casos de uso de organización temporal

*(Vistas dinámicas del tiempo: tareas del día/semana, proyectos en el tiempo, notificaciones de reviews cercanas).*

---

# 18. Casos de uso de administración personal del sistema

*(Configurar preferencias, personalizar taxonomía/áreas/convenciones, mantener consistencia estructural).*
