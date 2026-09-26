# Handoff para Agente Alquimista — issue #6

**Issue:** https://github.com/pronficilio/coup-online/issues/6  
**Plan exacto:** `docs/plans/turn-actions-panel/plan_turn_actions_panel.md`  
**Bitácora exacta:** `docs/plans/log/issue-6.jsonl`  
**Estado:** `ACTIVE`; F1 `CLOSED`, F2 `CLOSED / PASS` tras recorrido funcional Edge headless/CDP; F3 `ACTIVE`. No reintentar Computer Use. PR #11 permanece draft. Consultar `docs/plans/turn-actions-panel/report_issue_6_F2.md`.
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`  
**Verifier requerido ahora:** no; invocarlo al final antes de integrar.  
**Branch destino de toda la issue:** `issue/6-turn-actions-panel`  
**Worktree destino de toda la issue:** `.worktrees/issue-6-turn-actions-panel`  
**Merge target:** `master` de `pronficilio/coup-online`.  
**PR esperado:** uno desde `issue/6-turn-actions-panel` a `master`, asociado a #6.

## Reclamo y aislamiento

Issue #6 fue releído en `pronficilio/coup-online`, asignado a `pronficilio` y confirmado abierto, sin reclamo incompatible ni PR candidato. Se creó `issue/6-turn-actions-panel` desde `origin/master` en `.worktrees/issue-6-turn-actions-panel`; el aislamiento y árbol limpio se confirmaron físicamente. Los documentos se copiaron selectivamente y los eventos `claim` y `worktree_confirmed` están en la bitácora. El commit de control precede los cambios de producto. No trabajes desde `master` ni abras ramas por fase.

## F1 — CLOSED: presentación desacoplada del shell

Empieza F1 ahora, sin esperar el merge de #5. Modifica únicamente `coup-client/src/components/game/ActionDecision.js` y los estilos/archivos de presentación de acciones. Mantén el montaje, callbacks y flujo/socket actuales; no edites `Coup.js`, tablero, servidor ni protocolo. Presenta las siete acciones con coste/beneficio, gratuidad, personaje declarado, bloqueos, fondos insuficientes y Coup obligatorio. Las declaraciones pueden ser faroles y no dependen de las cartas reales del jugador.

**Evidencia:** `docs/plans/turn-actions-panel/report_issue_6_F1.md`, captura `docs/plans/turn-actions-panel/issue_6_f1_visual.png` del montaje actual y tabla de reglas contrastada.
**Cierre:** `CLOSED`; presentación, build, captura visual y evento `phase_verdict` registrados en commits de la misma rama.

**Resultado final:** `PASS`. La captura a 1440 × 1500 muestra completas las siete acciones y sus descripciones, coste/beneficio, gratuidad, personaje declarado, bloqueos y avisos de saldo. F1 conserva el montaje centrado actual, dentro de su alcance. El build ya registrado pasó. #5 quedó integrado a `master` en `64593af5cff7ff80863c3fc175067eb49fc4b5ad`; F2 está implementada, pero no se declara cerrada sin el recorrido manual requerido.

## F2 — CLOSED / PASS: diseño y recorrido funcional

El issue #5 fue confirmado cerrado y mergeado a `master` en `64593af5cff7ff80863c3fc175067eb49fc4b5ad`; la rama #6 ya incluye su sincronización. El diseño corregido fue aprobado. El recorrido de la sala `WA5EGX` verificó propiedad/inicio-fin de turno, cancelación de Assassinate y Coup sin eventos ni cobro, confirmaciones únicas de ambas acciones, controles Challenge/Block/Pass y panel oculto al game over. Los contadores y observaciones están en `docs/plans/turn-actions-panel/report_issue_6_F2.md`. F2 está cerrada; F3 está activa.

## Límites y pregunta de falsificación

Cumple los criterios del plan. Preserva desafíos, bloqueos, revelación e influencia. No cambies lógica del servidor/socket ni añadas tests automatizados o bibliotecas de animación. La revisión final preguntará: ¿algún estado muestra acciones al jugador incorrecto, permite cobrar al cancelar, duplica una acción, tapa respuestas o hace saltar/atascar el tablero?

## F3 — ACTIVE: revisión visual y de accesibilidad

Inspecciona el panel en escritorio y móvil, cambios de turno repetidos, `prefers-reduced-motion`, foco/teclado y estados con 2–6 jugadores, jugador eliminado y fase de respuesta. Conserva PR #11 como draft. Registra capturas y observaciones; no añadas ni ejecutes tests automatizados. Deja pendientes para el checkpoint final/verificador cualquier escenario que no puedas observar en esta ronda.

La revisión parcial está en `docs/plans/turn-actions-panel/report_issue_6_F3.md`. Dos y seis participantes, scroll móvil, modo reducido, teclado y cierre/apertura por turno están observados; 3–5 participantes, eliminación local, respuesta móvil y final de scroll de escritorio quedan pendientes. No marcar F3 `PASS` hasta cubrir esos casos y revisión independiente.
