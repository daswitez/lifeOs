# Manifiesto de Diseño y Experiencia de Usuario (UX)

Este documento define la filosofía estética, de interacción y de arquitectura cognitiva que rige la interfaz gráfica de **LifeOS**. No se trata simplemente de un manual de estilo o una paleta de colores, sino de las reglas fundacionales para que el sistema opere como una extensión natural del pensamiento.

---

## 🏛 La Filosofía Central: Continuidad y Armonía Cognitiva
El sistema no es un conjunto de módulos pegados; es un ecosistema vivo. La navegación y el uso diario deben sentirse como caminar a través de habitaciones diferentes de una misma casa bien diseñada. 
- **Fricción Cero en la Captura**: El gesto inicial del sistema es *recibir*. El Inbox debe actuar como una superficie rápida y automática, no como un formulario. El usuario descarga su mente primero y organiza después.
- **Relacionalidad Suave**: No existen compartimentos estancos. Una nota sugiere tareas; un recurso en formato PDF revela el proyecto al que pertenece; una decisión revive las fuentes que la originaron. Todo salto entre vistas debe incluir migas de pan y pistas contextuales para no perder el hilo mental.
- **Organización No Punitiva**: Mover piezas desde el caos hacia el orden (de inbox a proyectos, recursos o áreas) debe ser un acto orgánico, asumiendo que el refinamiento progresivo es el estado natural del trabajo intelectual.

---

## ⚖️ El Equilibrio: Bibliotecas y Cockpits
Visualmente, el LifeOS oscila permanentemente entre dos lenguajes sin traicionar ninguno:
1. **El Entorno Editorial**: Pensado para la lectura, el procesamiento de notas largas y el estudio de recursos. Requiere protagonismo del texto, aire, serenidad intelectual y previsualizaciones útiles sin ser invasivas.
2. **El Panel Operativo (Cockpit)**: Pensado para la acción (planes "If-Then", next actions urgentes). Requiere precisión, métricas sintetizadas y escaneo rápido.

**El Dashboard Principal** no debe intentar mostrar un control total barroco, sino ofrecer un "mapa mental resumido del presente": qué tengo pendiente, qué construyo, qué aprendo y qué requiere revisión.

---

## 🎨 Principios Visuales y Estéticos

### 1. Minimalismo Intencional
El minimalismo de LifeOS no busca el vacío esterilizado, sino la **calma organizada**. 
- **Espaciado Cognitivo**: El aire (padding/margin) entre módulos no es adorno, es estructura mental. El uso generoso del espacio evita la sensación de bombardeo y permite que el pensamiento se pose.
- **Identidad Modular**: Bloques claramente delimitados por márgenes, contrastes sutiles o tipografía, sin necesidad de usar cajas rígidas estilo software industrial.

### 2. Paleta de Colores Contenida
- Se huye del "confeti productivo" (exceso de colores vibrantes para estados o botones).
- **Fondos**: Claro cálido sereno o un modo oscuro sobrio y profundo.
- **Acentos**: Elegantes (ej. azul grisáceo, verde discreto o grafito sofisticado). El color solo orienta la acción o el estado crítico, no decora por nerviosismo visual.

### 3. Tipografía
El puente entre la lectura y la operación:
- **Principal (UI/Acción)**: Una Sans Serif moderna, robusta y sumamente legible en tablas e interfaces (ej. *Inter, Geist, SF Pro*).
- **Secundaria (Editorial/Reading)**: (Opcional) Una Serif discreta para el cuerpo de notas largas, inyectando ese matiz de "biblioteca privada" cuando el usuario entra en modo de pensamiento profundo.

### 4. Coherencia Multimedia
Archivos grandes (enlaces externos de Drive, YouTube) y pequeños (portadas nativas en Supabase) comparten el **mismo tratamiento visual** (tarjeta, metadata, preview mesurada). La diferencia técnica de almacenamiento es invisible para el usuario; la UX respeta el lenguaje común independientemente del origen del recurso.

---

## 📱 Interacción y Entornos

### 1. Acciones Contextuales ("El Mayordomo Digital")
No abrumar al usuario con todos los botones a la vez. Las herramientas complejas (etiquetar, archivar, enlazar a un proyecto) se revelan solo ante el contexto necesario (ej. *hover* sutiles, menús de comandas tipo `CMD+K`).

### 2. La Revisión Semanal (Entorno Ceremonial)
El diseño de la vista de revisión abandona el formato de "dashboard de auditoría corporativa". A nivel UI, se convierte en un espacio desaturado, tranquilo, de estructura más vertical y menos densa. Visualmente, evoca **"una mesa limpia y bien iluminada"** para fomentar la pausa y la reinvención semanal.

### 3. Escritorio vs. Móvil
- **Escritorio**: Profundidad máxima. Despliegue relacional, sidebars interactivas, conexión multi-panel y edición a dos manos.
- **Móvil (Movimiento)**: Velocidad pura. Foco absoluto en la captura instantánea (Añadir nota/foto al inbox), verificación de contexto próximo y lectura de referencia rápida sin perder la coherencia tipográfica de la app de escritorio.

---

> *Este sistema existe para disminuir el ruido interior, no para añadir una capa de complejidad brillante. Cuando todas las partes encajan con naturalidad, la interfaz deja de ser una pantalla bonita y se transforma en una extensión viva de la mente.*
