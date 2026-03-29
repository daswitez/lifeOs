-- ==============================================================================
-- LifeOS Core Schema (Supabase PostgreSQL)
-- ==============================================================================
-- Extensión requerida para generar UUIDs si no está habilitada por defecto
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. ÁREAS (PARA - Areas)
-- ==============================================================================
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 2. PROYECTOS (PARA - Projects)
-- ==============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED')),
  start_date TIMESTAMP WITH TIME ZONE,
  target_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. MOTOR DE EJECUCIÓN (Tareas / Next Actions)
-- ==============================================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'INBOX' CHECK (status IN ('INBOX', 'NEXT_ACTION', 'WAITING', 'DONE', 'ARCHIVED')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  energy_level TEXT DEFAULT 'MEDIUM' CHECK (energy_level IN ('LOW', 'MEDIUM', 'HIGH')),
  friction_level TEXT DEFAULT 'LOW' CHECK (friction_level IN ('LOW', 'MEDIUM', 'HIGH')),
  due_date TIMESTAMP WITH TIME ZONE,
  context_tags TEXT[], -- Ej: ['computer', 'office', 'phone']
  if_then_plan TEXT, -- Plan contingente (Implementation Intention)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 4. MOTOR DE CONOCIMIENTO (Zettelkasten / Notas)
-- ==============================================================================
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT, -- Markdown o Tiptap JSON format
  type TEXT DEFAULT 'ATOMIC' CHECK (type IN ('ATOMIC', 'LITERATURE', 'FLEETING', 'HUB')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Red de enlaces direccionales puros (Backlinking entre notas)
CREATE TABLE note_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  target_note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  UNIQUE(source_note_id, target_note_id)
);

-- Red polimórfica (Notas atadas a cualquier entidad: Proyectos, Tareas, Áreas)
CREATE TABLE entity_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('PROJECT', 'AREA', 'TASK', 'RESOURCE', 'DECISION')),
  entity_id UUID NOT NULL,
  UNIQUE(note_id, entity_type, entity_id)
);

-- ==============================================================================
-- 5. MOTOR MULTIMEDIA Y RECURSOS (PARA - Resources)
-- ==============================================================================
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  storage_mode TEXT NOT NULL CHECK (storage_mode IN ('INTERNAL', 'EXTERNAL')),
  url TEXT, -- Link externo (Google Drive, YouTube, Artículos)
  file_path TEXT, -- Ruta a archivo en Supabase Storage (pdfs pequeños, imágenes)
  type TEXT CHECK (type IN ('ARTICLE', 'VIDEO', 'PDF', 'BOOK', 'COURSE', 'OTHER')),
  status TEXT DEFAULT 'UNREAD' CHECK (status IN ('UNREAD', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 6. DECISION JOURNAL (Memoria Estratégica)
-- ==============================================================================
CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  decision_made TEXT NOT NULL, -- "Qué decidí"
  reasoning TEXT, -- "Por qué"
  discarded_options TEXT, -- Opciones descartadas
  signals_observed TEXT, -- Señales de contexto
  expected_outcome TEXT, -- Resultado esperado
  review_date TIMESTAMP WITH TIME ZONE, -- Cuándo evaluar
  outcome_evaluation TEXT, -- Feedback (llenado después del review date)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 7. SEGURIDAD Y PERMISOS (ROW LEVEL SECURITY)
-- ==============================================================================
-- Se activa la seguridad de filas en TODAS las tablas de negocio
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Políticas universales (Ejemplo): El usuario SOLO ve / edita / borra sus propios datos
-- Crea una función para aplicar esto masivamente si es necesario.
CREATE POLICY "Users can only select their own areas" ON areas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own areas" ON areas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own areas" ON areas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own areas" ON areas FOR DELETE USING (auth.uid() = user_id);
-- (Se replicarían políticas idénticas para cada tabla)
