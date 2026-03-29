# Stack Tecnológico

La elección de tecnologías para LifeOS se justifica por la necesidad de centralizar, hacer escalar el sistema eficientemente (manteniendo una sola base de código), lograr un desempeño de primer nivel y ofrecer una experiencia de usuario sobresaliente y reactiva.

## 1. El Pilar Base (Framework de Aplicación)
- **Next.js (App Router, versión actual 14/15+)**: Será el entorno Full-Stack. Permite aprovechar React Server Components para servir la estructura de la aplicación a altísima velocidad sin interponer clientes pesados de JavaScript. Las Server Actions reemplazarán los voluminosos estados de cliente y manejadores tradicionales de API REST.
- **TypeScript**: Estricto de principio a fin. Compartitición de tipos y esquemas entre la lógica de base de datos y la vista, eliminando errores de tiempo de ejecución y asegurando predictibilidad estructural.

## 2. La Capa de Negocio (Base de Datos y ORM)
- **ORM (Object-Relational Mapping)**:
  - *Drizzle ORM* u alternativamente *Prisma*. Prisma es excelente por velocidad de prototipado y soporte de migraciones fácil; Drizzle proporciona una ligera capa muy cercana y purista con SQL que en los ecosistemas Serverless o en Edge despliega eficiencias superiores.
- **Base de Datos**:
  - *PostgreSQL* (Vercel Postgres, Supabase o Neon DB). La estructura relacional de GTD, los sistemas de metadatos profundos interconectados con Notes y el versionamiento exigen la fiabilidad ACID potente de Postgres.

## 3. Identidad, Acceso y Seguridad
- **NextAuth.js (Auth.js)**: Al ser un "Personal LifeOS", los mecanismos de autorización y autenticación son directos pero vitales para resguardar vida operativa y estratégica personal. Protocolos mediante Oauth (GitHub/Google) para evitar fricciones o simples JWTs auto-contenidos, pero cerrados a un único usuario administrador o usuarios de invitación exclusiva limitados.

## 4. Diseño, Estilizado y Componentes
- **Tailwind CSS**: Proveedor principal de diseño mediante utilidades. Genera un paquete compacto que se reduce en tiempo de compilación para enviar lo estrictamente necesario.
- **Componentes Base o Diseño Acelerado**:
  - *shadcn/ui* o *Radix Primitives* combinados: Entregar accesibilidad robusta (teclado, focus, lectores), portabilidad perfecta sin encapsulamiento limitante que afecte la adaptación estética "minimalista" requerida por este LifeOS de nivel premium.
- **Framer Motion**: Para las micro-interacciones inmersivas (expandir modales, tachar tareas fluidamente, mostrar vistas zen, arrastrar en tableros Kanban).
- **Gestión de Fechas y Tiempo**: *date-fns* o nativo *Intl API*, fundamentales dada la cantidad de metadatos relativos al reloj en GTD (Revisiones Semanales, Vencimientos de Tareas).

## 5. Ecosistema de Almacenamiento Media
- **Rich Text & Referencias**:
  - Probablemente integración de *Tiptap* o *Slate.js*, permitiendo atajos de teclado (`/` para comandos extendidos), markdown as-you-type e hiper-referencias estilo Notion para los resúmenes y conocimiento.
- **Alojamiento (Uploads)**:
  - *AWS S3 / Cloudflare R2 / Vercel Blob* administrado por server actions para servir anexos de documentos e imágenes en recursos de proyectos u actas de decisiones.
