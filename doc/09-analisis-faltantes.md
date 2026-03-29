# Estado Actual y Gaps del Sistema

## Propósito
Este documento compara tres capas:

1. lo que ya vive en la experiencia real
2. lo que el esquema soporta en `db/schema.sql`
3. lo que todavía falta para que la extensión nueva sea producto usable

La diferencia importante ahora es que LifeOS ya no está evaluando solo el núcleo de productividad. También hay una extensión grande de `journal + finance + work + contacts` ya modelada con RLS y relaciones.

---

## Lectura rápida

### Resuelto de punta a punta en la app
- autenticación, perfil básico y logout
- dashboard con foco, check-in diario, vista operativa de hoy/semana y señales semanales
- inbox con procesamiento real
- tareas con subtareas, recurrencia y time tracking básico
- proyectos con detalle
- notas con detalle, edición y relaciones nota <-> nota
- recursos con upload, preview, edición y vínculos
- decisiones con detalle y edición
- review semanal escribible
- búsqueda global

### Modelado en base de datos, pero sin experiencia real
- journals y entradas de journal
- negocios, contactos e interacciones
- engagements de trabajo e ingresos
- cuentas financieras, categorías, transacciones y snapshots
- reglas financieras recurrentes
- invoices, line items y links invoice <-> transaction
- tags aplicados a journal
- vínculos de journal con recursos

### Parcial o todavía poco profundo
- áreas: siguen sin tener ciclo de vida tan fuerte como el resto
- tags generales: existen en schema, pero no como experiencia transversal consistente
- archivado/restauración: no es uniforme entre todos los módulos
- analítica: el dashboard ya mejoró, pero todavía no hay capa financiera/comercial/narrativa real

---

## Lo más importante que revela la extensión

## 1. La base de datos ya dio un salto de producto
El schema nuevo no agrega solo tablas. Agrega cuatro dominios completos:

- escritura narrativa
- relaciones y CRM personal
- trabajo comercial y contractual
- dinero, cobro y trazabilidad financiera

Eso cambia el alcance de LifeOS. Ya no es solo productividad personal. Empieza a parecerse a una infraestructura operativa individual.

## 2. El riesgo principal ya no es técnico, sino de aterrizaje
El schema quedó bastante bien cubierto en relaciones, enums, estados y RLS. El cuello de botella ahora no es “cómo modelarlo”, sino “cómo convertirlo en experiencia simple”.

## 3. No conviene intentar abrir los cuatro dominios completos a la vez
Si se implementa todo al mismo tiempo, el producto se puede volver pesado y disperso. La prioridad correcta es abrir vertical slices que demuestren valor rápido:

- journal útil
- ledger financiero mínimo
- ficha de negocios/contactos
- dashboard con señales nuevas

## 4. La extensión tiene una dependencia fuerte del dashboard
Muchos casos de uso nuevos solo cobran sentido si luego aparecen resumidos y navegables en la home:

- qué toca hoy y esta semana
- cuánto entró y salió
- qué dinero sigue pendiente
- a quién hay que hacer follow-up
- qué se escribió y qué patrones aparecen

## 5. El sistema ganó un nuevo tipo de conexión
Antes la magia estaba sobre todo en `task <-> note <-> resource <-> decision`.
Ahora aparece una segunda red:

- `business <-> contact <-> interaction <-> engagement <-> invoice <-> transaction`

Y una tercera:

- `journal_entry <-> daily_log <-> area <-> project <-> mood/energy`

La implementación debería respetar esas redes y no tratarlas como CRUDs aislados.

---

## Gaps estructurales priorizados

## Gap 1. Journal usable y conectado
Problema:
El schema ya soporta journals y entradas ricas, pero la app hoy sigue usando solo `notes` y `daily_logs`.

Impacto:
La capa narrativa todavía no existe como experiencia. Se pierde memoria larga y contexto cualitativo.

Qué falta:
- listado y detalle de journals
- editor de entradas
- timeline cronológico
- relación con `daily_logs`, áreas, proyectos y recursos
- búsqueda por fecha, tipo y texto

## Gap 2. Ledger financiero mínimo
Problema:
La base ya soporta cuentas, categorías, transacciones y snapshots, pero no existe ninguna ruta ni flujo para operarlo.

Impacto:
Toda la promesa financiera vive solo en el schema.

Qué falta:
- cuentas financieras
- categorías
- registro de ingresos, egresos y transferencias
- balances por cuenta
- resumen mensual y net flow básico

## Gap 3. Capa relacional comercial
Problema:
`businesses`, `contacts` y `contact_interactions` están bien modelados, pero no existen como vistas ni flujos.

Impacto:
El sistema todavía no recuerda relaciones, follow-ups ni contexto comercial.

Qué falta:
- ficha de negocio
- ficha de contacto
- timeline de interacciones
- follow-up pendiente
- búsqueda de cuentas y personas

## Gap 4. Engagements y dinero conectado al trabajo
Problema:
`work_engagements` permite conectar pipeline, cliente, proyecto y valor económico, pero la experiencia todavía no existe.

Impacto:
No se puede ver qué trabajo genera ingresos ni cómo se relaciona con ejecución real.

Qué falta:
- pipeline de engagements
- estados y payment model
- vínculo con proyecto, negocio y contacto
- vista de trabajos activos y perdidos

## Gap 5. Facturación y cuentas por cobrar
Problema:
El schema ya separa invoice, líneas y aplicación de pagos, pero la app no traduce eso todavía.

Impacto:
No existe una capa real de cobro, balance pendiente ni overdue invoices.

Qué falta:
- CRUD de invoices
- line items
- estados de factura
- vinculación con transacciones
- vista consolidada de cuentas por cobrar

## Gap 6. Dashboard analítico cruzado
Problema:
La home ya mejoró mucho, pero aún no refleja la extensión nueva.

Impacto:
Si journal, finanzas y CRM no se ven resumidos arriba, van a sentirse como módulos secundarios en lugar de partes vivas del sistema.

Qué falta:
- ingresos/egresos del mes
- balance neto
- facturas vencidas
- follow-ups pendientes
- trabajos activos con valor esperado
- timeline reciente del journal

---

## Conclusión
La extensión nueva es potente y está bien modelada. Pero hoy sigue siendo, sobre todo, capacidad latente en base de datos.

La siguiente fase no debería intentar “completar todo el ERP personal”, sino abrir estas cuatro verticales en este orden:

1. Journal
2. Finanzas core
3. Negocios + contactos
4. Dashboard analítico con esas señales

Después de eso sí tiene sentido abrir pipeline de engagements, invoices y analítica más rica.
