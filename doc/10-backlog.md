# Backlog Priorizado: LifeOS Extended

## Criterio de priorización
La base operativa original ya está bastante mejor cerrada que antes. La nueva prioridad nace del schema extendido y sigue esta lógica:

1. Abrir vertical slices nuevos que entreguen valor inmediato.
2. Empezar por lo que alimenta mejor el dashboard y el uso cotidiano.
3. Postergar lo que requiere demasiada burocracia para un software a medida de una sola persona.
4. Implementar relaciones comerciales y financieras solo cuando haya una base simple y confiable.

---

## P0: Lo primero que hay que volver real

## Épica 1. Journal como capa narrativa del sistema
**Por qué ahora:** es el módulo nuevo con más valor personal inmediato y menos fricción de adopción.

### Historia 1.1
Como usuario, quiero crear journals y marcar uno por defecto, para separar tipos de escritura sin mezclar todo.

### Historia 1.2
Como usuario, quiero crear y editar entradas con `entry_type`, fecha, mood, energía y privacidad, para que el journal sea una herramienta real de memoria personal.

### Historia 1.3
Como usuario, quiero ver un timeline de entradas por journal, para recorrer mi narrativa de forma cronológica.

### Historia 1.4
Como usuario, quiero vincular una entrada con un proyecto, un área, un `daily_log` o un recurso, para que lo narrativo dialogue con lo operativo.

### Entregables sugeridos
- `/journals` con listado y alta
- `/journals/[id]` o timeline principal
- editor de `journal_entries`
- integración mínima con `daily_logs`, `areas`, `projects` y `resources`

## Épica 2. Finanzas core: cuentas, categorías y transacciones
**Por qué ahora:** es la capa mínima para que el bloque financiero exista de verdad y luego pueda alimentar el dashboard.

### Historia 2.1
Como usuario, quiero crear y editar cuentas financieras, para representar de forma explícita dónde está mi dinero.

### Historia 2.2
Como usuario, quiero crear categorías y subcategorías financieras, para clasificar ingresos, gastos y transferencias.

### Historia 2.3
Como usuario, quiero registrar ingresos, egresos y transferencias, para construir un ledger básico confiable.

### Historia 2.4
Como usuario, quiero consultar saldo por cuenta y balance total, para tener una vista simple pero útil de mis fondos.

### Entregables sugeridos
- `/finance/accounts`
- `/finance/categories`
- `/finance/transactions`
- resumen de balance total y net flow

## Épica 3. Contactos y negocios mínimos
**Por qué ahora:** antes de abrir pipeline o facturación, conviene tener la ficha de con quién trabajas.

### Historia 3.1
Como usuario, quiero crear negocios y contactos, para tener un registro relacional claro de clientes y cuentas.

### Historia 3.2
Como usuario, quiero vincular contactos con negocios, para navegar personas y empresas sin perder contexto.

### Historia 3.3
Como usuario, quiero buscar contactos y negocios, para recuperar contexto rápido antes de escribir o cobrar.

### Entregables sugeridos
- `/businesses`
- `/contacts`
- relación contacto <-> negocio
- búsqueda simple

## Épica 4. Dashboard extendido con señales nuevas
**Por qué ahora:** si los módulos nuevos no aparecen resumidos en la home, se sentirán accesorios.

### Historia 4.1
Como usuario, quiero ver ingresos, egresos y net flow del mes en el dashboard, para entender rápido mi situación financiera.

### Historia 4.2
Como usuario, quiero ver entradas recientes del journal en la home, para que la narrativa forme parte del cockpit.

### Historia 4.3
Como usuario, quiero ver follow-ups pendientes y trabajos activos cuando existan, para usar el dashboard como cabina principal.

### Entregables sugeridos
- bloques financieros en `/`
- bloque de journal reciente
- espacio reservado para follow-ups y pipeline

---

## P1: Muy importante después del núcleo nuevo

## Épica 5. Engagements de trabajo e ingresos
**Por qué sigue después:** necesita negocios, contactos y algo de finanzas ya vivos para rendir de verdad.

### Historia 5.1
Como usuario, quiero crear engagements con tipo, estado y payment model, para manejar mi pipeline de trabajo real.

### Historia 5.2
Como usuario, quiero vincular un engagement con negocio, contacto, proyecto y área, para conectar la capa comercial con la operativa.

### Historia 5.3
Como usuario, quiero ver pipeline, trabajos activos y trabajos perdidos, para entender el estado de mis oportunidades.

### Historia 5.4
Como usuario, quiero registrar valor estimado y valor cerrado, para medir mejor lo que se mueve en el pipeline.

## Épica 6. Interacciones y seguimiento
**Por qué sigue después:** es lo que vuelve útil el CRM personal sin volverlo pesado.

### Historia 6.1
Como usuario, quiero registrar una interacción ligada a un contacto o negocio, para dejar memoria relacional.

### Historia 6.2
Como usuario, quiero definir un `next_follow_up_at`, para saber a quién debo volver a escribir.

### Historia 6.3
Como usuario, quiero ver follow-ups pendientes y últimas interacciones, para retomar conversaciones con contexto.

## Épica 7. Facturación y cuentas por cobrar
**Por qué sigue después:** necesita ledger básico y relaciones comerciales ya funcionales.

### Historia 7.1
Como usuario, quiero crear una factura con líneas y estados, para estructurar cobros de manera seria.

### Historia 7.2
Como usuario, quiero registrar pagos parciales y completos, para ver cuánto falta cobrar.

### Historia 7.3
Como usuario, quiero vincular una factura con transacciones reales, para unir facturación y dinero recibido.

### Historia 7.4
Como usuario, quiero ver facturas vencidas y balance pendiente, para manejar cuentas por cobrar.

---

## P2: Analítica, automatización y refinamiento

## Épica 8. Analítica financiera y comercial
### Historia 8.1
Como usuario, quiero ver ingresos por cliente y engagement, para detectar qué trabajo paga mejor.

### Historia 8.2
Como usuario, quiero ver gastos por categoría y balance neto por mes, para entender mejor mi flujo.

### Historia 8.3
Como usuario, quiero ver dinero cobrado vs pendiente, para medir salud de caja.

## Épica 9. Journal analítico y patrones
### Historia 9.1
Como usuario, quiero ver entradas por tipo y rango temporal, para explorar mi narrativa de manera intencional.

### Historia 9.2
Como usuario, quiero relacionar mood, journal y trabajo, para detectar patrones personales útiles.

## Épica 10. Automatizaciones financieras
### Historia 10.1
Como usuario, quiero reglas recurrentes financieras operativas, para no capturar siempre las mismas transacciones.

### Historia 10.2
Como usuario, quiero próximas recurrencias visibles, para anticipar entradas y salidas.

### Historia 10.3
Como usuario, quiero snapshots y reconciliación más robusta, para aumentar confianza en balances.

---

## Infraestructura transversal que conviene hacer mientras tanto

## Épica 11. Base técnica compartida para la extensión
### Historia 11.1
Como usuario, quiero navegación lateral para los módulos nuevos, para que no se sientan escondidos.

### Historia 11.2
Como usuario, quiero selects relacionales reutilizables, para conectar negocios, contactos, proyectos, resources y áreas sin fricción.

### Historia 11.3
Como usuario, quiero filtros por fecha, estado y relación en los módulos nuevos, para que la información siga escalando bien.

### Historia 11.4
Como usuario, quiero que el dashboard enlace directo a los detalles relevantes, para que la home sea navegable y no solo informativa.

---

## Próximo corte recomendado
Si el siguiente sprint tuviera que enfocarse en un único corte, este debería ser:

1. Journal usable.
2. Finanzas core mínimas.
3. Negocios y contactos base.
4. Dashboard con señales de journal y finanzas.

Ese corte no intenta “terminar” toda la extensión, pero sí la convierte en producto vivo.
