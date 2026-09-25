# Reporte F1 — issue #6

**Veredicto:** BLOCKED por evidencia visual inaccesible. La presentación y el build están listos; la inspección de la captura requerida no pudo ejecutarse.
**Rama / worktree:** issue/6-turn-actions-panel / .worktrees/issue-6-turn-actions-panel
**Alcance:** ActionDecision.js y CoupStyles.css. El montaje, los callbacks, la selección de objetivo y Socket.IO se conservaron. No hubo cambios a Coup.js, servidor, tablero ni protocolo.

## Revisión semántica

| Acción | Beneficio / coste | Declaración | Bloqueo |
|---|---|---|---|
| Income | +1; gratis | Ninguna | Ninguno |
| Foreign Aid | +2; gratis | Ninguna | Duke |
| Coup | Paga 7 | Ninguna | Ninguno |
| Tax | +3; gratis | Duke | Ninguno |
| Steal | Hasta 2 | Captain | Captain o Ambassador |
| Exchange | Gratis | Ambassador | Ninguno |
| Assassinate | Paga 3 | Assassin | Contessa |

Las acciones con coste superior al saldo quedan deshabilitadas y muestran el saldo requerido. Con 10 o más monedas se conserva Coup como única acción habilitada. Las etiquetas describen personajes declarados y no dependen de las cartas en mano. La selección de objetivos mantiene el comportamiento y los callbacks previos; el cobro anticipado de Coup/Assassinate se conserva para F2, conforme al alcance de F1.

**Observación fuera de alcance:** server/utilities/constants.js enumera Ambassador dos veces como bloqueador de Steal, mientras el issue y el plan canónicos especifican Captain o Ambassador. La presentación sigue issue/plan; no se modificaron las reglas del servidor.

## Validaciones

- git diff --check: PASS.
- npm ci: completado en coup-client para habilitar compilación.
- npm run build: PASS. Después de ajustar la expresión booleana, no quedan advertencias ESLint en ActionDecision.js; permanecen avisos preexistentes en App.js y Coup.js y aviso de caniuse-lite desactualizado.
- Pruebas automatizadas: no ejecutadas ni añadidas, según el plan.
- Revisión de código: confirmados siete registros, metadatos de coste, beneficio, gratuidad, declaración y bloqueos; callbacks chooseAction, deductCoins, pickingTarget, pickTarget, doneAction y emisión g-actionDecision sin cambios de contrato.
- Revisión visual/captura: BLOCKED. cua.getState() devolvió helper_unknown_error: setup refresh had errors; tras reset, el segundo intento terminó con trusted Node process exited unexpectedly. Se detuvo la automatización según la recuperación indicada por computer-use. No se produjo ni se afirma una captura.

## Artefactos

- coup-client/src/components/game/ActionDecision.js
- coup-client/src/components/game/CoupStyles.css

**Siguiente acción:** Orquestador resuelve la evidencia visual faltante o devuelve F1 para repetirla. F2 permanece pendiente de integrar #5 a master.
