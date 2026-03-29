# Directrices de Diseño, Experiencia Visual y UI/UX

LifeOS es un software de grado premium para uso hiper-personal. La interfaz de usuario no es una aplicación genérica SaaS para múltiples clientes heterogéneos; es un panel de instrumentos adaptativo e íntimo para un usuario altamente exigente.

## Filosofía de Diseño: "Orden y Ligereza"
El sistema sigue principios de diseño funcional acentuado con estética refinada que transmita un sentido de calma, foco sostenido y claridad mental general.

### 1. Minimalismo No Extremo (Minimalismo Funcional)
A diferencia de los paneles administrativos llenos de ruido visual:
- Todo se condensa y se "apaga" cuando no es vital.
- Alto contraste general pero líneas divisorias sutiles (`border-gray-800` o transiciones al canal alfa).
- Espacio de margen expansivo (Padding considerablemente alto en Cards e Items) que aísla cada tarea, permitiendo su fácil escaneo mental.

### 2. Tipografía Distintiva y Legibilidad
Se evita la típica fuente de sistema sin curar por opciones modernas de gran estilo, legibilidad corporativa u "Hacking Premium" vibes.
- **Para Headers, Dashboards y Contadores**: "Inter", "Outfit", o "Satoshi".
- **Para los Módulos de Documentación y Second Brain**: Fuentes tipográficas optimizadas para lectura prolongada (por ejemplo Serif modernas en el Viewpad o configurables).
- **Para Datos y Programación rápida / Tags**: Mono-espaicadas como "JetBrains Mono" o "Geist Mono".

### 3. Colores y Sistema de Tematización
El Dark Mode y Light Mode no son simplemente "invertir blancos y negros", sino re-calibrar la temperatura.
- **Dark Mode Aconsejable**: Una base profunda (ej. `Zinc-950` puro o negro #0A0A0A), prescindir de cuadros estridentes. Superficies con sutiles efectos de oscurecimiento concéntrico en los bordes de la pantalla.
- **Light Mode Aconsejable**: Un blanco marfil neutro, donde las "Cards" o agrupaciones se distingan solo mediante micro-sombras o delgadísimas delimitaciones color gris claro.
- **Acentos Funcionales**: Tonos des-saturados como alertas visuales en naranjas apagados, violetas profundos, evitando los rojos y verdes "blocky" primarios en favor de paletas sofisticadas y fluidas (HSL curado).

### 4. Animaciones "Micro-dinámicas"
Una interfaz que se siente viva anima al uso constante.
- Efectos Hover muy pulidos pero extremadamente veloces (~150ms-200ms) en la botonera y lista de prioridades de tareas.
- Micro-animación de transición al finalizar una tarea pendiente (el famoso subidón dopamínico de tachar, con transiciones elaborables a través de `Framer Motion`).
- Enfoque "Deslizar" y no "Saltar" en los paneles para los cambios de vistas del calendario.

### 5. Layout Maestro del Centro de Mando
- **Vista Dividida u Ocultable**: Una barra lateral colapsable omnipresente y adaptable que no reste impacto a las Notas o al Panel Principal de Prioridades.
- **Full View Editor**: Entrar al modo "Edición de un Proyecto" maximiza el bloque central suprimiendo otras métricas temporales de ejecución para maximizar el Deep Work de escritura, planificación, e inserción de media visual tipo tableros.
