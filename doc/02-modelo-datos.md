# Modelo de Datos (Second Brain + PARA + GTD)

El núcleo de LifeOS es la interconexión entre las diferentes esferas: tareas (GTD), conocimiento (Second Brain) y estructura relacional (PARA). El esquema de base de datos relacional encapsulará estas entidades buscando normalización donde favorezca el rendimiento y polimorfismo donde la flexibilidad dicte la necesidad.

## Entidades Principales de Jerarquía (PARA)

### 1. Áreas (Areas)
Esferas de responsabilidad a largo plazo, sin fecha de término, sobre las que se requiere mantener un estándar.
- **Ejemplos**: Salud, Finanzas Personales, Desarrollo Profesional, Hogar.
- **Relaciones**: Pueden contener múltiples Proyectos; pueden tener Tareas de rutina asociadas; engloban Notas y Recursos.

### 2. Proyectos (Projects)
Esfuerzos específicos con un inicio delimitado y un fin proyectado.
- **Ejemplos**: "Correr Maratón de Ciudad", "Declaración de Impuestos 2026", "Lanzamiento de App".
- **Relaciones**: Obligatoriamente conectados a un Área; agrupan la mayoría de las Tareas accionables de alta prioridad. Cuentan con Notas de proyecto ligadas.

### 3. Recursos (Resources)
Temas de interés, bibliotecas de contenido, hobbies coleccionables y listas de estudio continuo.
- **Ejemplos**: "Diseño de interfaces gráficas", "Recetas de Cocina Asiática", "Archivo de Vuelos".
- **Composición**: Estructurados a menudo con Notas puras, enlaces a sitios web y colecciones de Media.

### 4. Archivos (Archives)
Elementos latentes o finalizados. Preferiblemente no se gestionan en una entidad física separada, sino mediante propiedades o *soft-deletes* (e.g. `isArchived: boolean` o `status: 'ARCHIVED'`) a lo largo de Áreas, Proyectos y Recursos.

## Entidades Operativas (Ejecución y Captura)

### 5. Tareas (Tasks/Actions)
La unidad atómica de ejecución transaccional. Aplicación del principio de *Getting Things Done* (GTD).
- **Atributos Clave**:
  - `title`: Lo que hay que hacer.
  - `status`: Identificador de estado (INBOX, NEXT_ACTION, WAITING, DONE).
  - `dueDate`: Componente temporal (cuándo hay que hacerlo o revisarlo).
  - `priority`: Alta, Media, Baja.
- **Conectividad**: Apuntan a un Proyecto o quedan desconectadas temporalmente en el INBOX.

### 6. Notas y Documentos (Notes)
Centros de conocimiento puro, registro en diario (journaling) y soporte operativo.
- **Capacidades**: Texto Enriquecido/Markdown.
- **Enlaces (Backlinks)**: Capacidad de conectar la nota "A" con un Proyecto "B" o una Tarea "C" a través de un grafo interno.

### 7. Media y Referencias Exteriores (Media/Bookmarks)
Enlaces hacia el mundo externo (URLs capturadas masivamente), PDFs, o imágenes relevantes.
- Permite la captura ubicua de "Cosas para consumir luego" (Read-it-later / Watch-it-later).

## Esquema Conceptual Central

La clave de arquitectura reside en cómo se conectan. Una Nota puede pertenecer tanto a un "Recurso" directamente como a un "Proyecto". Un `Tag` global puede atravesar todo el LifeOS, uniendo temporalmente un apunte financiero aleatorio con un gran proyecto del Área "Finanzas".

```prisma
// Extracto conceptual tipo ORM Relacional

model Target { ... }  // Clase principal polimórfica para items

model Area { ... projects[], notes[], resources[] }

model Project {
  ... Area,
  status (ACTIVE, PAUSED, COMPLETED)
  tasks[],
  notes[]
}

model Task {
  ... projectId, areaId, dueDate, status, contextTags[]
}

model Note {
  ... content(JSON/Markdown), backlinks[], projectIds[]
}
```
