# Core del Sistema: El Motor de Productividad y Conocimiento

Este documento define el cerebro, la arquitectura lógica y la filosofía operativa de LifeOS. Basado en metodologías validadas y marcos teóricos, LifeOS no es una simple lista de tareas, sino un **sistema nervioso central** compuesto por 4 motores que se hablan entre sí como una ciudad bien trazada: **Acción, Conocimiento, Media y Revisión**.

---

## 🏗 La Columna Vertebral Tecnológica: Supabase & Postgres
Para soportar la interconexión de estos 4 motores, la base de datos es la pieza más crítica. La elección definitiva es **Supabase montado sobre PostgreSQL**. 
- **¿Por qué Postgres?** Un LifeOS personal serio requiere vistas cruzadas, filtros relacionales ricos y trazabilidad profunda (ej. "muéstrame todas las notas de este proyecto que derivaron de este PDF y me tomaron X energía"). Las bases de datos NoSQL fracasan al intentar generar esta red estructurada.
- **¿Por qué Supabase?** Al integrar Postgres con **Auth**, **Storage** nativo y **RLS** (Row Level Security), proporciona las primitivas perfectas para asegurar tus datos, manejar permisos estructurados y enlazar sin esfuerzo el motor multimedia con el motor relacional.

---

## ⚙️ Los 4 Motores de LifeOS

### 1. El Inbox Universal (Motor de Captura)
Inspirado por el eje central de *Getting Things Done (GTD)*: "Saca todo de la cabeza". 
Todo entra a un único embudo: ideas, tareas, links de Google Drive, PDFs, imágenes, vídeos, citas de libros, o notas rápidas de voz o texto.
- **La Filosofía**: Capturas primero, decides después. La fricción al capturar debe ser cero.
- **Transmutación**: El Inbox no es un destino. Cada ítem es procesado y "transmutado" en una entidad útil: una rutina, un proyecto, un recurso, una decisión, o una referencia.

### 2. Estructura y Áreas (PARA)
Para evitar el caos organizativo de carpetas infinitas, LifeOS adopta el sistema **PARA** (Projects, Areas, Resources, Archives) pero optimizado relacionalmente en Postgres.
- **Proyectos Activos**: Esfuerzos con fecha de inicio y fin.
- **Áreas de Responsabilidad**: Esferas a mantener a lo largo del tiempo (Ej. Carrera, Salud, Finanzas).
- **Recursos**: Repositorios de conocimiento.
- **Archivo**: El refrigerador de cosas inactivas.
Un modelo relacional permite que un PDF técnico esté vinculado tanto a tu proyecto actual, como a tu Área de Carrera y a una Nota Técnica al mismo tiempo.

### 3. Motor de Conocimiento Personal (PKM)
Almacenar no sirve de nada sin sintetizar. Inspirado en *How to Take Smart Notes (Zettelkasten)*, este módulo convierte el almacenamiento en pensamiento.
- **Notas Atómicas y Citas**: Entidades individuales de información destilada.
- **Backlinking**: Enlaces bidireccionales entre notas, fuentes y proyectos.
- Si hoy lees un PDF, el sistema te permite:
  1. Previsualizar el PDF o link.
  2. Sacar extractos.
  3. Relacionarlos a un principio.
  4. Añadir observaciones propias.
  5. Conectar todo con una rutina o decisión.

### 4. Motor de Ejecución Diaria y Decisiones
No basta con decir "qué hacer", sino "cómo ejecutarlo en la realidad".
- **Next Actions por Contexto**: Qué es la siguiente acción física visible.
- **Variables de Realidad**: Las tareas incluyen métricas de estado humano, no solo fechas:
  - Nivel de energía requerido.
  - Fricción prevista.
  - Prioridad real (impacto) vs Urgencia (tiempo).
- **Implementation Intentions (Planes "If-Then")**: La arquitectura contempla planes de contingencia para las tareas críticas (Ej. "Si el día se tuerce y pasa X, hago Y").
- **Decision Journal**: Un sub-motor vital para crear memoria estratégica. Un laboratorio personal donde se registra: *Qué decidí, por qué, qué descarté, señales observadas, resultado esperado, y fecha de revisión de la decisión.*

---

## 🔄 El "Cockpit" de Revisión Semanal
La joya del sistema. No es una *checklist* burocrática, sino un panel de control con interfaz premium diseñado para generar *claridad y no culpa*. Responde semanalmente a:
- ¿Qué se cerró y qué se atascó?
- ¿Qué recursos se consumieron y qué se aprendió?
- ¿Qué decisiones críticas tomé?
- ¿Qué proyectos pierden tracción?
- ¿Cómo va la implementación de hábitos y cuál fue el balance de energía general?

---

## 🗂 Estrategia Multimedia (El Híbrido)
El manejo de archivos requiere inteligencia técnica y económica (Ahorro + Rendimiento). Todo recurso tiene un campo fundamental `storage_mode`:

1. **Recursos Internos (Supabase Storage)**:
   - Imágenes pequeñas, portadas, thumbnails, capturas tácticas, PDFs ultra ligeros o adjuntos clave (facturas/recibos).
2. **Recursos Externos (Referencias a Drive/YouTube)**:
   - Todo lo pesado: Links de Drive, videos de YouTube/Vimeo, artículos, PDFs pesados, carpetas inmensas de Google Drive, cursos.

LifeOS indexa la referencia en la base de datos, manteniendo la búsqueda relacional sin inflar los costes de almacenamiento del servidor.

---

## 📚 Bibliografía y Respaldo Teórico (Science-Backed)

LifeOS no es ideología, está respaldado por literatura técnica y mejores prácticas establecidas:

**Base Operativa y Comportamental**
- **Getting Things Done (David Allen)**: El sistema fundamental de Inbox, aclaración y próximas acciones.
- **Atomic Habits (James Clear)**: Diseño conductual, automatización y anclaje de rutinas.
- **Feel-Good Productivity (Ali Abdaal)**: Entender la productividad desde el gozo y no el látigo; midiendo energía, fricción y contexto. Ali Abdaal suele destacar la interacción entre "enjoyment" y "output".
- **Self-Determination Theory (Deci & Ryan)**: La UI/UX debe transmitir Autonomía, Competencia y Relación, aumentando la sensación de control sobre la propia vida, en lugar de sentirse perseguido por notificaciones digitales.

**Conocimiento (Personal Knowledge Management - PKM)**
- **Building a Second Brain & PARA Method (Tiago Forte)**: Organización de archivos digitales por nivel de accionabilidad, no jerarquía temática pura.
- **How to Take Smart Notes (Sönke Ahrens)**: Método Zettelkasten para escribir sin fricción.
- *Jain (2011)*: El marco académico base para sistemas PKM como soportes productivos a largo plazo.

**Planificación y Evidencia Psicológica de la Ejecución**
- *Aeon et al. (2021) / Patzak et al. (2025)*: Meta-análisis demuestran que módulos de planificación y revisión son lo que estadísticamente funciona para subir el desempeño y reducir el burnout.
- *Uhlig et al. (2023)*: Respaldo empírico al valor transformacional del *Weekly Planning Behavior*.
- *Wieber et al. (2015)*: Estudio clave sobre *Implementation Intentions* ("If-Then plans") cerrando la brecha entre intención y conducta.
- *Kersten-van Dijk et al. (2017) / Kim et al. (2019)*: Literaturas sobre *Personal Informatics* y auto-conocimiento (self-insight). Justifica por qué medir energía y patrones es más eficaz que la gamificación absurda.
- *Beale (2025)*: El estudio advierte que simplemente "usar una app" no sube la productividad. LifeOS requiere inyectar diseño enfocado y personalización, no amontonar botones sin sentido.
