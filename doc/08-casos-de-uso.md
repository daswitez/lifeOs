# Casos de Uso Extendidos de LifeOS

## Propósito
LifeOS ya no es solo un sistema para capturar, organizar, ejecutar y revisar. Con la extensión nueva del esquema también empieza a cubrir cuatro verbos adicionales:

- narrar
- cobrar
- relacionar
- medir

El resultado es un producto personal que combina cockpit operativo, segundo cerebro, journal y pequeño backoffice comercial/financiero bajo un mismo techo.

## Lectura del sistema
El actor principal sigue siendo uno:

- usuario autenticado

La diferencia es que ahora el sistema se divide en dos grandes alas:

1. Núcleo LifeOS ya operativo: dashboard, inbox, tareas, proyectos, notas, recursos, decisiones, review.
2. Ala extendida modelada en base de datos: journals, finanzas personales, contactos, negocios, engagements, facturas e interacciones.

La intención no es tratar estos bloques como apps separadas, sino como capas conectadas.

---

## 1. Journal

### 1.1 Crear y mantener journals
El usuario crea journals separados como `Personal`, `Worklog`, `Gratitude`, `Learning` o `Travel`, los edita, los archiva y define uno por defecto para captura rápida.

**Objetivo:** evitar que toda la escritura personal caiga en una sola corriente indiferenciada.

### 1.2 Escribir una entrada de journal
El usuario crea una entrada dentro de un journal con fecha, contenido y tipo de entrada.

**Tipos previstos:** `daily`, `reflection`, `gratitude`, `learning`, `worklog`, `health`, `travel`, `freeform`.

**Objetivo:** registrar pensamiento, experiencia, aprendizaje o contexto narrativo con una forma más rica que un `daily_log`.

### 1.3 Contextualizar una entrada
El usuario puede enriquecer la entrada con:

- área
- proyecto
- `daily_log`
- mood
- energía
- clima
- ubicación
- privacidad

**Objetivo:** que el journal no sea solo texto, sino texto con contexto relacional.

### 1.4 Conectar journal con el resto del sistema
El usuario vincula recursos y etiquetas a una entrada, y relaciona la escritura con proyectos o con el registro diario estructurado.

**Objetivo:** unir narración y ejecución.

### 1.5 Explorar el journal
El usuario consulta una entrada individual, recorre el timeline cronológico, filtra por tipo o rango de fechas y busca por texto o contexto.

**Objetivo:** recuperar memoria personal y detectar patrones.

### 1.6 Revisar patrones personales
El usuario observa tendencias entre tono narrativo, mood, energía, áreas de vida y momentos del trabajo.

**Objetivo:** usar el journal como instrumento de aprendizaje personal, no solo como archivo.

---

## 2. Finanzas Personales

### 2.1 Crear y mantener cuentas financieras
El usuario crea cuentas como `cash`, `checking`, `savings`, `credit_card`, `investment`, `crypto`, `ewallet`, `receivable` o `payable`.

Puede registrar saldo inicial, ajustar saldo manual actual y archivar cuentas sin perder historial.

**Objetivo:** representar de forma realista dónde vive el dinero.

### 2.2 Crear taxonomía financiera
El usuario crea categorías y subcategorías para ingresos, gastos y transferencias.

**Objetivo:** clasificar el flujo económico sin perder granularidad.

### 2.3 Registrar transacciones
El usuario registra:

- ingresos
- egresos
- transferencias

Además puede editar, cambiar estado (`pending`, `posted`, `reconciled`, `void`) y asociar cada transacción con categoría, negocio, contacto, engagement o proyecto.

**Objetivo:** que cada movimiento económico tenga trazabilidad operativa.

### 2.4 Mantener balances y reconciliación
El usuario guarda snapshots de balance por cuenta y consulta la evolución histórica.

**Objetivo:** comparar sistema vs realidad y sostener confianza en el ledger.

### 2.5 Gestionar recurrencias financieras
El usuario define reglas recurrentes para salario, alquiler, subscriptions o retainers y revisa las próximas ocurrencias.

**Objetivo:** anticipar flujo futuro y reducir captura repetitiva.

### 2.6 Analizar finanzas
El usuario consulta:

- ingresos del mes
- egresos del mes
- flujo neto
- gastos por categoría
- ingresos por fuente
- balances por cuenta
- patrimonio líquido aproximado
- separación por moneda
- cuentas por cobrar y por pagar

**Objetivo:** pasar de registrar dinero a entenderlo.

---

## 3. Trabajo, Engagements y Fuentes de Ingreso

### 3.1 Crear un engagement
El usuario registra una oportunidad o trabajo como `freelance`, `consulting`, `retainer`, `contract`, `business`, `full_time` o `part_time`.

**Objetivo:** representar trabajo que genera o puede generar ingresos, distinto de un proyecto interno.

### 3.2 Definir modelo económico del engagement
El usuario establece si el trabajo se paga por:

- hourly
- fixed
- retainer
- salary
- commission
- mixed

Y registra tarifa horaria, fee fijo, fee recurrente, valor estimado y valor cerrado.

**Objetivo:** conectar pipeline comercial con realidad económica.

### 3.3 Mover un engagement por pipeline
El usuario cambia el estado entre `lead`, `prospecting`, `proposal_sent`, `negotiation`, `active`, `paused`, `completed`, `cancelled` o `lost`.

**Objetivo:** convertir LifeOS también en radar de trabajo e ingresos.

### 3.4 Relacionar engagement con el resto del sistema
El usuario vincula el engagement con:

- negocio
- contacto principal
- proyecto
- área

**Objetivo:** que la capa comercial no viva aislada de la capa operativa.

### 3.5 Analizar trabajo e ingresos
El usuario consulta pipeline, trabajos activos, trabajos perdidos, trabajos por cliente e ingresos por engagement.

**Objetivo:** entender qué tipos de trabajo convierten, pagan y sostienen mejor la operación.

---

## 4. Facturas e Ingresos Cobrables

### 4.1 Crear y editar facturas
El usuario genera una factura asociada a un negocio, contacto o engagement, con número de factura, fechas, importes y notas.

### 4.2 Añadir líneas de factura
El usuario define conceptos específicos con cantidad, precio unitario y subtotal por línea.

**Objetivo:** que la factura sea una entidad operativa y no solo un monto agregado.

### 4.3 Mantener estado de cobro
La factura puede pasar por `draft`, `sent`, `partially_paid`, `paid`, `overdue` o `void`.

El usuario registra cuánto se pagó, cuánto falta y qué transacción cubrió ese pago.

**Objetivo:** unir facturación y dinero real.

### 4.4 Consultar cuentas por cobrar
El usuario revisa facturas vencidas, facturas por cliente, facturas por engagement y balance pendiente consolidado.

**Objetivo:** tener una vista clara de dinero que debería entrar pero todavía no entró.

---

## 5. Contactos y Negocios

### 5.1 Mantener una ficha de contacto
El usuario registra una persona con nombre, cargo, emails, teléfonos, WhatsApp, LinkedIn, web, ciudad, notas y estado de favorito/archivo.

**Objetivo:** conservar contexto relacional antes de volver a escribirle a alguien.

### 5.2 Mantener una ficha de negocio
El usuario registra una empresa con industria, web, ciudad, moneda, estado, notas e historial relacionado.

**Objetivo:** tratar clientes y negocios como entidades persistentes, no solo como texto libre en una nota o factura.

### 5.3 Relacionar contactos y negocios
El usuario vincula contactos a negocios y consulta todas las personas asociadas a una empresa.

**Objetivo:** poder navegar una cuenta comercial desde personas y desde organización.

### 5.4 Buscar y revisar relaciones pendientes
El usuario busca contactos o negocios por nombre, empresa, email, ciudad o estado y detecta follow-ups pendientes.

**Objetivo:** no perder relaciones relevantes por falta de memoria contextual.

---

## 6. Interacciones y Seguimiento

### 6.1 Registrar una interacción
El usuario documenta email, llamada, reunión, mensaje, propuesta, follow-up o networking.

**Objetivo:** dejar memoria relacional de lo que pasó y de qué toca hacer después.

### 6.2 Asociar interacción a contacto y negocio
Cada interacción puede conectarse con un contacto, un negocio o ambos.

**Objetivo:** reconstruir conversaciones y evolución de una relación sin depender del inbox de correo o del chat.

### 6.3 Programar el próximo follow-up
El usuario define `next_follow_up_at` y consulta qué contactos o negocios requieren seguimiento.

**Objetivo:** sostener un CRM personal ligero, útil y sin burocracia.

### 6.4 Revisar timeline relacional
El usuario ve las últimas interacciones por contacto o negocio antes de retomar una conversación.

**Objetivo:** recuperar contexto en segundos.

---

## 7. Casos de Uso Conectados entre Módulos

### 7.1 Journal <-> LifeOS Core
El usuario relaciona entradas de journal con proyectos, áreas, recursos y `daily_logs`.

**Objetivo:** que lo narrativo dialogue con lo operativo.

### 7.2 Finanzas <-> Trabajo
El usuario relaciona transacciones con negocios, contactos, engagements y proyectos.

**Objetivo:** poder responder preguntas como “qué trabajo generó este ingreso” o “qué cliente explica este gasto”.

### 7.3 Engagements <-> Proyectos
El usuario convierte trabajo comercial en ejecución interna al enlazar un engagement con un proyecto existente o nuevo.

### 7.4 Invoices <-> Transactions
El usuario relaciona una factura con una o varias transacciones reales para saber qué pago cubrió qué monto.

### 7.5 CRM <-> Pipeline
El usuario vincula contacto, negocio, engagement e interacciones para ver una cuenta completa de punta a punta.

### 7.6 Finanzas <-> Dashboard
El usuario ve en el dashboard ingresos, egresos, cobranzas pendientes, trabajos activos y señales narrativas del journal.

**Objetivo:** que la home no sea solo un tablero de tareas, sino un cockpit de vida y operación.

---

## 8. Casos de Uso Analíticos

### 8.1 Analítica financiera
El usuario revisa ingresos mensuales, egresos mensuales, balance neto, distribución de fondos, evolución de balances y gastos por categoría.

### 8.2 Analítica comercial
El usuario revisa pipeline, trabajos activos, ingresos por cliente, ingresos por engagement, dinero cobrado vs pendiente y trabajos perdidos.

### 8.3 Analítica relacional
El usuario detecta contactos con follow-up pendiente y ve últimas interacciones por cuenta.

### 8.4 Analítica narrativa
El usuario revisa timeline del journal y patrones entre mood, energía, escritura y trabajo.

### 8.5 Analítica cruzada
El usuario conecta dinero, trabajo y narrativa para observar relaciones como:

- qué trabajos generan más valor
- qué contextos drenan energía
- qué periodos fueron mejores económica y personalmente

---

## Conclusión
Con esta extensión LifeOS deja de ser solo un sistema para pensar y ejecutar, y empieza a comportarse como una infraestructura personal más completa:

- piensa con notas y decisiones
- ejecuta con tareas y proyectos
- narra con journals
- cobra con engagements e invoices
- registra con ledger financiero
- mantiene relaciones con contactos, negocios e interacciones
- mide todo desde el dashboard
