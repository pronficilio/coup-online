# Handoff Para Agente Ejecutor

**Issue/Ticket:** https://github.com/pronficilio/coup-online/issues/72 (OPEN)
**Plan:** `docs/plans/reference-panel-layout/plan_reference_panel_layout.md`
**Bitácora:** `docs/plans/log/issue-72.jsonl`
**Estado:** `WAITING_EXECUTOR`; F1 `READY`.
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL` independiente en F3.
**Verifier requerido ahora:** no; en F3 debe ser independiente del implementador.
**Pregunta de falsificación:** ¿alguna combinación de ancho/alto y jugadores deja espacio de flujo por los transforms, triggers estáticos bajo 1200 px, solapamiento con contenido o acceso perdido a un trigger?

## Fase sugerida

F1: atribuir el alto a cajas de flujo y posiciones pintadas, reutilizar el diagnóstico desktop de #44 y medir los breakpoints menores de 1200 px. Esta fase sigue porque el último nodo del DOM no determina su posición visual y el código usa posicionamiento distinto por breakpoint.

## Documentos fuente

- `docs/plans/reference-panel-layout/plan_reference_panel_layout.md` (plan canónico)
- `docs/plans/player-decisions-layout/report_issue_44_F1.md` (geometría desktop previa)
- `coup-client/src/components/game/PlayerBoardStyles.css`
- `coup-client/src/components/game/ReferencePanel.css`
- `coup-client/src/components/game/Coup.js`
- `docs/plans/log/issue-72.jsonl`

## Subtareas listas

1. Leer y reclamar la issue #72 en el fork; asignar al ejecutor o dejar comentario de claim con fase, branch, worktree y `master` como target. Volver a leer issue #72 y comprobar que sigue abierta y sin reclamo incompatible.
2. Confirmar después del claim la rama/worktree ya reservados por el Orquestador: `issue/72-reference-panel-layout` / `/mnt/e/dev/coup/.worktrees/issue-72-reference-panel-layout`. Base esperada `origin/master@ce53c286155c054bc4c50defeb5ec19cc04fd5fb`; deben estar limpios. Si la base remota cambió, actualizar antes del trabajo y registrar la nueva SHA. El branch/worktree se preparó durante intake, antes del claim, sin cambios de producto; registrar esta desviación de secuencia en bitácora.
3. Mover este handoff de `inbox/` a `active/` y registrar `claim`, `worktree_confirmed`, `phase_start` en el JSONL de #72. El primer trabajo de producto comienza solo después del claim.
4. Ejecutar F1 y documentar qué aporta cada caja responsive. Distinguir cálculos, métricas dinámicas y observaciones del propietario. Si el entorno carece de navegador, no inventar rectángulos: dejar el límite explícito y pedir revisión del propietario solo para el punto no observable.
5. Tras cierre F1, implementar F2 en el mismo branch/worktree; commitear con el mensaje acordado. Crear `report_issue_72_F2.md` con paths del diff y resultados de build/diff-check.
6. Entregar para revisión del Orquestador. El Verifier se invoca por separado en F3.

## Criterios de aceptación

Los criterios completos están en el plan y en la issue #72. En particular: máximo 16 px de espacio final tras el contenido pintado del tablero; referencias laterales alineadas a cartas cuando quepan; sin altura extra bajo 1200 px; controles operables y sin tapar Event Log, cartas, decisiones ni safe areas.

## Evidencia y validaciones esperadas

- F1: `docs/plans/reference-panel-layout/report_issue_72_F1.md` con geometría/causas por breakpoint.
- F2: `docs/plans/reference-panel-layout/report_issue_72_F2.md`; build del cliente, `git diff --check`, visual walkthrough en 2, 3, 5 y 6 jugadores en desktop y móvil o límites reproducibles documentados.
- F3: `docs/plans/reference-panel-layout/report_issue_72_F3_verifier.md` independiente.
- No agregar ni ejecutar pruebas automatizadas. No declarar aprobación visual si solo hay revisión estática.

## Topología y commits

- Una sola branch: `issue/72-reference-panel-layout`.
- Un solo worktree: `.worktrees/issue-72-reference-panel-layout`.
- Target: `master` del fork `pronficilio/coup-online`; una PR canónica para #72.
- Cada fase con cambios/evidencia persistente requiere commit. Mensajes previstos: `docs(plans): close issue 72 F1 layout diagnosis`; `fix(game-ui): reclaim space under board and dock reference controls`; `docs(plans): record issue 72 final verification`.
- No editar upstream ni crear una segunda integración para la fase.

## Riesgos y bloqueo

Riesgo medio: compensar el flujo con valores distintos al desplazamiento visual puede recortar el último asiento, especialmente con 5 jugadores; un rail lateral puede chocar con el Event Log a la derecha. Si una cobertura visual necesaria no puede observarse localmente, reportar `BLOCKED` para esa afirmación y dejar el cambio revisable, sin elevar una inferencia estática a PASS visual.

## Actualizaciones del ejecutor

Actualizar plan, issue y bitácora tras cada veredicto. F1 termina en `avanzar`, `pivotar`, `repetir con variante acotada`, `bloquear` o `cancelar`. Entregar al Orquestador al cerrar F2; no abrir PR, hacer merge ni cerrar issue por cuenta propia.
