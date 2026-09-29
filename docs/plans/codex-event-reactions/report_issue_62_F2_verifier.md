# Informe del Verifier F2 — reacciones opcionales de Codex (#62)

- **Veredicto:** `PASS` para AC1–AC8, revisión estática independiente.
- **Commit de código revisado:** `e84abc3` (incluye el fix P3 de `5c7edb9` y la sincronización con `origin/master@9ef5856`).
- **Branch / worktree:** `issue/62-codex-event-reactions` / `.worktrees/issue-62-codex-event-reactions`.
- **Estado de la unidad:** `WAITING_ORCHESTRATOR` para decisión de integración.

## Hallazgo P3 y corrección verificada

La primera revisión estática pasó AC1–AC8, pero devolvió F1 por un borde en `validatePublicEventData()`: una propiedad requerida propia con valor `undefined` satisfacía `exactKeys()` y luego desaparecía al serializar JSON; lo mismo ocurría con una propiedad opcional explícita con ese valor. El fix conserva `exactKeys()`, exige valores definidos en los campos requeridos y rechaza propiedades opcionales propias con valor `undefined`. Las opcionales ausentes siguen siendo válidas. El Verifier confirmó que esta comprobación ocurre antes de proyectar o serializar el evento.

## Criterios revisados

| Criterio | Resultado estático |
| --- | --- |
| AC1 — decisión y reacción en el flujo Codex existente | `PASS`: la reacción permanece junto a la elección en la misma solicitud/respuesta; la elección conserva su validación independiente. |
| AC2 y AC6 — contexto público y privacidad | `PASS`: la oportunidad usa la proyección allowlisted del evento y conteos agregados que excluyen el asiento Codex; no expone qué asiento reaccionó ni datos privados. |
| AC3 — reacción inválida u obsoleta | `PASS`: el candidato cosmético se valida aparte de `choiceId`; las guardas de decisión y versión siguen en el servidor. |
| AC4 — autoridad del actor y aplicación | `PASS`: la selección se atribuye al asiento Codex del objeto de jugador server-side, no a datos de actor entregados por el modelo. |
| AC5 — difusión y concurrencia | `PASS`: la revisión siguió las oportunidades capturadas y las guardas de decisión/versión de respuestas concurrentes; la aplicación vuelve a validar evento y catálogo antes de mutar y conserva los canales públicos existentes. No se encontró atribución cruzada. |
| AC7 — ruta humana #40 | `PASS`: el toggle humano de `reactToEvent()` permanece intacto; la selección Codex declarativa usa su propia ruta server-side. |
| AC8 — falsificación del contrato | `PASS`: la revisión no encontró una ruta para aplicar una reacción a un evento/emoji no ofrecido, otro asiento o para cambiar la elección legal. |

## Alcance de la verificación

La revisión fue estática y read-only. El Verifier no cambió archivos y no ejecutó pruebas automatizadas, el runner ni el modelo. Por tanto, este PASS no afirma verificación dinámica ni comportamiento observado en una partida. El worktree estaba limpio y `origin/master` era ancestro de la branch al revisar `e84abc3`.
