# Plan — resolver ventanas al quedar determinado el resultado (#77)

**Estado:** `ACTIVE`; F1 `CLOSED`; F2 `CLOSED` tras recheck AC8; F3 `READY` para repetición; unidad `ACTIVE`.
**Issue canónico:** https://github.com/pronficilio/coup-online/issues/77
**Solicitud:** reducir la espera en desafíos/bloqueos en partidas sin IA.
**Objetivo operativo:** cerrar una ventana tan pronto como las respuestas recibidas ya determinan la misma opción ganadora por prioridad de asiento que la implementación actual.
**Definición de éxito:** menos asientos posteriores al ganador de prioridad deben esperar y el ganador/transición es idéntico para toda combinación y orden de llegada.
**Plan:** `docs/plans/decision-window-performance/plan_decision_window_performance.md`.
**Handoff:** `docs/plans/inbox/issue_77_decision_window_performance.md`.
**Bitácora append-only:** `docs/plans/log/issue-77.jsonl`.
**Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL` independiente.
**Verifier requerido:** F3, por transición concurrente y regla de juego.
**Branch / worktree / destino:** `issue/77-decision-window-performance` / `.worktrees/issue-77-decision-window-performance` / `master`.
**Integración:** una PR para #77.
**Siguiente dueño:** Agente Alquimista después de reclamar #77.

## Hechos, incógnitas y contrato conservado

- `openWindow()` hace que `openDecision()` abra una elección a los asientos elegibles.
- `closeDecision()` solo resuelve una ventana cuando `responses.size === allowed.size`.
- El resolver obtiene el primer voto que no sea `pass` en `nextInPriorityOrder(anchor, eligibleSeats)`; la llegada temporal no determina el ganador.
- **Hipótesis:** una vez respondieron con `pass` todos los asientos anteriores al primer voto no `pass`, sus respuestas determinan el ganador y esperar asientos posteriores no puede cambiarlo.
- La pausa de timeout recuperable preserva el mapa `responses`; un cierre anticipado no debe descartar ninguna respuesta de mayor prioridad.
- Desconocido: beneficio temporal en partidas reales; medir ventanas en lugar de suponer un ahorro fijo.

La prioridad, el anchor, los asientos elegibles y el resultado actual son el contrato. No implementar "gana quien contesta primero".

## Alcance y límites

Incluye analizar el prefijo de respuestas suficiente, cerrar decision/envíos existentes una sola vez, y validar la equivalencia del ganador con el resolver de referencia que espera todas las respuestas. Se limita a `challenge`, `block`, `block_challenge` y las rutas de respuesta que las componen.

No incluye cambiar los 120 segundos predeterminados, pasar jugadores en automático, cambiar #26/#75, exponer datos privados ni modificar los controles del cliente si el mecanismo vigente de asientos pendientes ya cubre la comunicación necesaria.

## F1 — formalizar el punto de cierre anticipado (`CLOSED`)

**Pregunta única:** ¿qué conjunto mínimo de respuestas basta para conocer el mismo resultado que el resolver actual?

- **Entrada:** issue #77; `openWindow`, `openDecision`, `submitChoice`, `closeDecision`, `nextInPriorityOrder`, `pause`, `resume`; tests existentes del servidor.
- **Trabajo:** expresar el orden de prioridad como prefijo determinista; enumerar casos con primer voto no `pass`, pases previos, un asiento anterior sin responder, todos pasan y varios votos no `pass`; incluir bloqueos con un solo elegible y foreign aid con varios.
- **Salida:** `docs/plans/decision-window-performance/report_issue_77_F1.md` con regla formal, matriz y punto(s) seguro(s) de cierre.
- **Avanzar:** cada caso demuestra equivalencia con el resultado final del resolver actual y define qué evento inicia después.
- **Pivotar:** si ninguna ventana permite reducir espera bajo el contrato vigente, aportar un contraejemplo y detener implementación.
- **Repetir:** una revisión de la matriz contra todas las llamadas actuales a `openWindow()`.
- **Bloquear:** el cierre depende de cambiar regla de prioridad o timeout; escalar al usuario.
- **Commit:** `COMMIT_REQUIRED`; incluir plan, reporte y bitácora.
- **Validación:** inspección de estado/transiciones; no cambiar código en F1.
- **Evidencia/veredicto:** `docs/plans/decision-window-performance/report_issue_77_F1.md`; matriz cubre todas las llamadas vigentes y fija el prefijo por prioridad. Se registra una divergencia estática entre la prueba existente y la preservación/autorización de reanudación del código para corregir cobertura en F2.

## F2 — implementar y comparar el resultado (`CLOSED tras recheck F3`)

**Pregunta única:** ¿las decisiones se cierran antes sin modificar el ganador, duplicar resolución ni permitir respuestas tardías?

F2 se cerró en `7aea6e4` con la cobertura registrada abajo. F3 la devolvió únicamente para validar el caso de respuesta Codex pendiente después de cierre anticipado.

- **Entrada:** matriz de casos aprobada/cerrada en F1.
- **Trabajo:** implementar un criterio pequeño reutilizable que examine respuestas en prioridad; `closeDecision()` cancela timer, invalida decisionId/version y distribuye un único cierre; el resolver recibe solo el prefijo suficiente con el ganador correcto.
- **Validación exigida:** comparar la selección anticipada con la selección de referencia tras respuestas completas para todas las permutaciones relevantes, en las tres ventanas. Revisar timeout y resume entre respuestas, IDs/versiones viejas, avance de fase único y sockets humanos.
- **Salida:** cambio de servidor y `report_issue_77_F2.md` con tabla de comparación y cobertura.
- **Avanzar:** mismos resultados observables del cierre completo, y al menos un escenario válido no espera a los asientos posteriores al ganador; no hay callbacks duplicados ni una segunda respuesta aceptada.
- **Pivotar:** cualquier divergencia devuelve a una regla/matriz F1 acotada; no arreglarla cambiando la prioridad.
- **Repetir:** una ronda sobre un contraejemplo determinista.
- **Bloquear:** no puede invalidarse una respuesta tardía con los envelopes vigentes sin rediseñar protocolo; escalar.
- **Commit:** `COMMIT_REQUIRED`; `perf(game-decisions): issue 77 F2 CLOSED advance_f3`.
- **Validación:** agregar cobertura de regresión al servidor para las ventanas que cambian; ejecutar el subconjunto relevante y registrar resultados.
- **Evidencia/veredicto:** `docs/plans/decision-window-performance/report_issue_77_F2.md`; prefijo diferencial cubierto en 144 combinaciones/permutaciones. Las pruebas relevantes pasan; la corrida de `coup.test.js` conserva tres fallas ajenas documentadas en el reporte.
- **Recheck de AC8:** F3 devolvió la fase por falta de prueba Codex diferida; `docs/plans/decision-window-performance/report_issue_77_F2_recheck.md` agrega y valida la respuesta Codex con envelope viejo después del cierre humano anticipado. El caso pasa; quedan tres fallas ajenas no modificadas.

## F3 — falsificación independiente FINAL (`READY`; repetir después del retorno`)

**Pregunta única:** ¿algún orden de llegada, prioridad, timeout o respuesta tardía produce un ganador distinto, doble resolución o bloqueo?

- **Entrada:** commit F2, diff y matriz F1.
- **Salida:** `report_issue_77_F3_verifier.md`, `PASS` / `FAIL` / `BLOCKED`.
- **Veredicto independiente (2026-09-30):** `FAIL` en AC8. No existe regresión que cubra una respuesta Codex pendiente cuando una ventana cierra anticipadamente, aunque la guarda de ID/versión sí aparece en producción. Ver `docs/plans/decision-window-performance/report_issue_77_F3_verifier.md`.
- **Avanzar:** Verifier intenta refutar AC1–AC8 del issue; `PASS` habilita revisión de integración.
- **Pivotar:** corregir un contraejemplo reproduciéndolo con la permutación exacta.
- **Retorno actual:** F2 debe cubrir y ejecutar la secuencia Codex pendiente → cierre humano por prefijo → resultado Codex obsoleto. F3 requiere nueva revisión independiente después del commit de cobertura.
- **Recheck F2 listo:** `report_issue_77_F2_recheck.md` cubre la secuencia y pasa; repetir ahora F3 sobre el commit más reciente. El primer `FAIL` AC8 se conserva como historial en `report_issue_77_F3_verifier.md`.
- **Repetir:** una ronda de refutación después del fix.
- **Bloquear:** falta Verifier independiente o evidencia de equivalencia.
- **Commit:** `COMMIT_REQUIRED`; registrar el resultado F3, incluido FAIL, en el reporte, bitácora y plan/handoff. `PASS` permitiría `advance_review`; `FAIL` devuelve el caso indicado a F2.

## Riesgo y pregunta de falsificación

Riesgo `HIGH` por la transición de decisiones y sus timers. Falsificación: dejar pendiente el asiento de prioridad inmediatamente anterior al voto elegido y entregar después una respuesta `challenge`/`block`; ese asiento debe seguir ganando. Además, cerrar con un ganador debe cancelar el timer y hacer inocuas las respuestas subsiguientes.

## Topología única

Issue #77 → `issue/77-decision-window-performance` → `.worktrees/issue-77-decision-window-performance` → una PR hacia `master`. No trabajar en el checkout raíz ni crear branch por fase.
