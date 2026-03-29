# LifeOS

LifeOS es un sistema personal para capturar, organizar, ejecutar y revisar trabajo, conocimiento y recursos en un solo lugar. La app está construida con Next.js App Router, React 19 y Supabase sobre PostgreSQL.

## Estado actual
El producto ya cubre una base usable:

- autenticación con email y contraseña
- dashboard con foco, hoy/semana e indicadores operativos
- inbox y captura rápida
- tareas y proyectos
- áreas
- notas y recursos
- decision journal
- review con lecturas de actividad reciente

Además, `db/schema.sql` ya modela una segunda fase del producto con:

- journals
- finanzas personales
- negocios y contactos
- engagements de trabajo
- facturas e interacciones

Esa extensión todavía está principalmente en la base de datos y en la documentación de producto; su experiencia de UI se prioriza en [`doc/10-backlog.md`](./doc/10-backlog.md).

La documentación de producto y prioridades vive en [`doc/`](./doc).

## Documentos clave
- [`doc/08-casos-de-uso.md`](./doc/08-casos-de-uso.md): visión funcional y casos de uso reales del sistema
- [`doc/09-analisis-faltantes.md`](./doc/09-analisis-faltantes.md): estado actual, gaps y diferencias entre schema e implementación
- [`doc/10-backlog.md`](./doc/10-backlog.md): backlog priorizado con foco en lo urgente
- [`db/schema.sql`](./db/schema.sql): esquema de datos completo en Supabase/Postgres

## Stack real del repo
- Next.js `16.2.1`
- React `19.2.4`
- TypeScript
- Supabase SSR + Supabase Auth
- PostgreSQL con RLS
- Tailwind CSS `v4`

## Desarrollo local
Instala dependencias y levanta el entorno:

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:3000`.

## Notas de arquitectura
- La autenticación y la protección de rutas pasan por [`src/proxy.ts`](./src/proxy.ts), siguiendo la convención `proxy` de Next.js 16.
- Las lecturas del sistema viven en [`src/server/queries/lifeos.ts`](./src/server/queries/lifeos.ts).
- Las mutaciones principales viven en [`src/server/actions/lifeos.ts`](./src/server/actions/lifeos.ts).
- La captura global usa [`src/lib/actions/capture.ts`](./src/lib/actions/capture.ts).
