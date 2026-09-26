# Handoff para Agente Alquimista — issue #6

**Issue:** https://github.com/pronficilio/coup-online/issues/6  
**Plan exacto:** `docs/plans/turn-actions-panel/plan_turn_actions_panel.md`  
**Bitácora exacta:** `docs/plans/log/issue-6.jsonl`  
**Estado:** `ACTIVE`; F1 `CLOSED`, el diseño visual de F2 fue aprobado y su captura ya está en el PR. Falta el recorrido funcional del cliente; no reintentar Computer Use. Se puede usar Edge headless/CDP, que ya produjo una captura real. Consultar `docs/plans/turn-actions-panel/report_issue_6_F2.md`.
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

## F2 — diseño aprobado; QA funcional pendiente

El issue #5 fue confirmado cerrado y mergeado a `master` en `64593af5cff7ff80863c3fc175067eb49fc4b5ad`; la rama #6 ya incluye su sincronización. El panel está montado en el shell integrado y el diseño corregido fue aprobado por el usuario. La confirmación aplaza el cobro de Coup/Assassinate. Computer Use falló en dos intentos y no debe reintentarse; Edge headless/CDP ya permitió capturar la partida real. Completa el recorrido funcional con esa vía alternativa: inicio/fin de turno, cancelar/confirmar objetivo y decisiones de respuesta. F3 permanece pendiente hasta que F2 cierre.

## Límites y pregunta de falsificación

Cumple los criterios del plan. Preserva desafíos, bloqueos, revelación e influencia. No cambies lógica del servidor/socket ni añadas tests automatizados o bibliotecas de animación. La revisión final preguntará: ¿algún estado muestra acciones al jugador incorrecto, permite cobrar al cancelar, duplica una acción, tapa respuestas o hace saltar/atascar el tablero?
