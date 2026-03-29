# Arquitectura del Sistema: LifeOS

## Visión General
LifeOS se construye sobre una arquitectura **Serverless Full-Stack** apoyada en **Next.js (App Router)**. El objetivo principal es mantener un monolito elegante, tipado y cohesionado, evitando la fragmentación entre frontend y backend. Toda la lógica de negocio, acceso a datos y renderizado se aloja dentro del mismo proyecto usando **TypeScript** para asegurar consistencia a largo plazo.

## Principios de Arquitectura
1. **Single Source of Truth**: Todos los componentes interactúan con una única capa de abstracción de datos para Notas, Tareas, Proyectos y Áreas, evitando estados desincronizados.
2. **Thin Client, Smart Server**: Se aprovecharán activamente los React Server Components (RSC) de Next.js para mover la carga computacional, lectura a base de datos y validaciones al servidor. El cliente se debe mantener lo más esbelto posible.
3. **Mutaciones Transparentes**: Privilegiar el uso de Server Actions para mutaciones directas integradas nativamente con los eventos de la UI, dejando el uso de API Routes (Route Handlers) exclusivamente para integraciones con terceros, extensiones web o webhooks.

## Estructura de Directorios Deseada

```text
/
├── app/                  # Next.js App Router (Páginas, layouts centralizados)
├── components/           # Componentes de React
│   ├── ui/               # Componentes atómicos de interfaz (Botones, Inputs, Cards)
│   ├── modules/          # Componentes complejos (Kanban, Calendario, Editor Rich Text)
│   └── layouts/          # Elementos transversales (Sidebars, Menús Globales)
├── lib/                  # Configuración base, clientes (DB, Auth) e integraciones
├── server/               # Lógica estructurada del backend
│   ├── actions/          # Controladores de Next.js Server Actions (Mutaciones)
│   ├── queries/          # Acceso optimizado a DB para lectura (RSC)
│   └── services/         # Validaciones pesadas o lógica compleja de negocio
├── db/                   # Schemas, migraciones y configuración del ORM
├── types/                # Interfaces globales, tipos derivados de base de datos
├── constants/            # Variables estáticas, temas, rutas del sistema
└── doc/                  # Documentación técnica e historial de arquitectura
```

## Patrones de Renderizado
- **React Server Components (RSC)**: Por defecto para tableros de lectura, resúmenes de proyectos y feed de eventos. Garantiza una First Contentful Paint ultra-rápida, envíos mínimos de JavaScript al navegador y nulas llamadas de red del lado del cliente en el montaje inicial.
- **Client Components**: Elevados solo en "hojas" del árbol de renderizado para interacciones complejas. Específicamente el editor de texto tipo Notion, la manipulación de drag-and-drop en tableros organizativos y pre-visualizadores de contenido multimedia.
