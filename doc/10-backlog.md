# Product Backlog: LifeOS

Basado en la lectura de `db/schema.sql`, es una excelente noticia confirmar que **la estructura de datos soporta el 100% de los casos de uso**. Todas las tablas puente (ej: `note_tags`, `note_relations`, `project_resources`) y los enums (`relation_kind`, `preview_status`) ya existen.

El desafío es puramente de desarrollo Frontend y de mutaciones en el servidor (Server Actions). Aquí tienes el Backlog estructurado en Épicas y priorizado en orden lógico de construcción (de las bases hacia la "magia" del sistema).

---

## ÉPICA 1: Fundamentos y Semántica Básica
*Objetivo: Construir los cimientos para que las entidades existan de forma independiente antes de intentar conectarlas.*

* **Historia 1.1:** Completar sistema de Autenticación y Perfil. UI para ver y editar `profiles` (Módulo 1).
* **Historia 1.2:** CRUD de **Áreas**. Crear interfaz de administración en `/areas` para que todo lo demás tenga un contenedor superior (Módulo 4).
* **Historia 1.3:** CRUD de **Proyectos** avanzado. Formularios y UI para gestionar un proyecto de extremo a extremo con sus fechas y estados (Módulo 5).
* **Historia 1.4:** CRUD de **Tareas** y Vistas. Interfaz para cambiar prioridades, mover de `inbox` a `todo/in_progress` con selectores de energía y estimación de tiempo (Módulo 6).
* **Historia 1.5:** Editor de **Notas** (Second Brain V0). Interfaz de texto rico optimizada para escritura profunda (Módulo 7).
* **Historia 1.6:** CRUD de **Recursos**. Interfaz base para subir links, definir tipos (book, video, article) y gestionar la tabla `resources` (Módulo 8).

---

## ÉPICA 2: Taxonomía Transversal (El tejido del sistema)
*Objetivo: Activar el motor de búsqueda y la estructuración por contextos para no perderse a medida que la base crezca.*

* **Historia 2.1:** Gestor de **Etiquetas (Tags)**. Crear la tabla maestra en UI (`/tags`) para administrar nombre, colores y descripciones (Módulo 9).
* **Historia 2.2:** Integración polimórfica de Tags. Componente UI selector de etiquetas e inserción lógica en las tablas puente: `note_tags`, `resource_tags`, `task_tags`, `project_tags`.
* **Historia 2.3:** Integración obligatoria de `area_id`. Componente para re-asignar Tareas, Notas y Recursos a distintas Áreas.

---

## ÉPICA 3: Fricción Cero e Inbox
*Objetivo: Dominar el flujo de entrada al sistema que asegura la captura rápida de información.*

* **Historia 3.1:** El "Capture Modal" universal (CMD+K o Global Button). Formularios ultrarrápidos para escupir ideas a `tasks`, `notes` o `resources` por defecto en su respectivo estado Inbox (Módulo 3).
* **Historia 3.2:** Interfaz de **Procesamiento de Inbox**. Una vista secuencial que te presente un item capturado y te pregunte: "¿Qué es esto? -> Acción, Recurso, o Trash".
* **Historia 3.3:** Acción de Transformación. Lógica del backend capaz de convertir un "Inbox Task" a un "Note" si el usuario se dio cuenta que no era accionable, sin perder timestamp de captura original. 

---

## ÉPICA 4: Conexiones Neuronales (El verdadero Second Brain)
*Objetivo: Romper los silos. Hacer que la información de una tabla viva y respire dentro de otra tabla, utilizando las geniales Junction Tables ya existentes.*

* **Historia 4.1:** Anclaje a Proyectos. Mostrar en la vista individual de `/projects/[id]` una pestaña para Tareas, Notas y Recursos adjuntos (usando `project_resources` y `project_id` foreign keys).
* **Historia 4.2:** El Grafo de Conocimiento (Note Relations). Poder relacionar una Nota B con una Nota A definiendo el tipo (`inspired_by`, `supports`), escribiendo sobre `note_relations` (Módulo 13).
* **Historia 4.3:** Referencias Cruzadas. Botón en la UI para adjuntar un Recurso a una Tarea (`task_resources`), o un Recurso a una Nota (`note_resources`).
* **Historia 4.4:** Block de "References" transversal. Componente visual que se pueda colocar en cualquier vista y renderice los "Backlinks" (Qué otras entidades apuntan hacia aquí).

---

## ÉPICA 5: Seguimiento y Ceremonias de Cierre
*Objetivo: Implementar el check in, las decisiones estratégicas y las auto-auditorías de vida.*

* **Historia 5.1:** El **Diario / Check-in** robusto. Formulario modal de cierre de día almacenando en `daily_logs` (Módulo 10).
* **Historia 5.2:** El **Decision Journal**. CRUD de decisiones, incluyendo el soporte de las tablas puente `decision_notes` y `decision_resources` (Módulo 12).
* **Historia 5.3:** Módulo de **Revisión Semanal** (`weekly_reviews`). Interfaz agregadora que jale datos de `daily_logs` y `tasks` atrasadas, para ayudar al usuario a escribir su síntesis semanal y fijar su `next_focus` (Módulo 11).

---

## ÉPICA 6: Capa Premium y Superpoderes de UI
*Objetivo: Perfeccionamiento de la UX mediante vistas dinámicas, cronologías visuales, filtros completos y manejo de archivos en Storage.*

* **Historia 6.1:** Búsqueda Omnibus Inteligente. Una gran barra de búsqueda (Módulo 14) combinando búsqueda Full-Text cruzando Tablas.
* **Historia 6.2:** Upload Engine y Multimedia. Conectar un Storage Provider nativo para gestionar la subida y guardado de archivos físicos de `resources` (Módulo 16).
* **Historia 6.3:** Tareas recurrentes. Motor de UI cron para configurar y desplegar nuevas tareas según su `recurrence_rule`. 
* **Historia 6.4:** El "Mega Dashboard". Retocar el Dashboard (Módulo 2) para integrar finalmente los datos reales de áreas, notas relacionadas y la actividad general mediante un "Activity global feed".
* **Historia 6.5:** El Archivo Maestro (`is_archived`). Gestión coherente visual de elementos soft-deleted (Módulo 15).
