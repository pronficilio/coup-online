# Handoff para Agente Alquimista — issue #6

**Issue:** https://github.com/pronficilio/coup-online/issues/6  
**Plan exacto:** `docs/plans/turn-actions-panel/plan_turn_actions_panel.md`  
**Bitácora exacta:** `docs/plans/log/issue-6.jsonl`  
**Estado:** `WAITING_ORCHESTRATOR`; F1 `BLOCKED` por falta de captura visual, F2 `PENDING` hasta integrar #5.
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`  
**Verifier requerido ahora:** no; invocarlo al final antes de integrar.  
**Branch destino de toda la issue:** `issue/6-turn-actions-panel`  
**Worktree destino de toda la issue:** `.worktrees/issue-6-turn-actions-panel`  
**Merge target:** `master` de `pronficilio/coup-online`.  
**PR esperado:** uno desde `issue/6-turn-actions-panel` a `master`, asociado a #6.

## Reclamo y aislamiento

Issue #6 fue releído en `pronficilio/coup-online`, asignado a `pronficilio` y confirmado abierto, sin reclamo incompatible ni PR candidato. Se creó `issue/6-turn-actions-panel` desde `origin/master` en `.worktrees/issue-6-turn-actions-panel`; el aislamiento y árbol limpio se confirmaron físicamente. Los documentos se copiaron selectivamente y los eventos `claim` y `worktree_confirmed` están en la bitácora. El commit de control precede los cambios de producto. No trabajes desde `master` ni abras ramas por fase.

## F1 — BLOCKED: presentación desacoplada del shell

Empieza F1 ahora, sin esperar el merge de #5. Modifica únicamente `coup-client/src/components/game/ActionDecision.js` y los estilos/archivos de presentación de acciones. Mantén el montaje, callbacks y flujo/socket actuales; no edites `Coup.js`, tablero, servidor ni protocolo. Presenta las siete acciones con coste/beneficio, gratuidad, personaje declarado, bloqueos, fondos insuficientes y Coup obligatorio. Las declaraciones pueden ser faroles y no dependen de las cartas reales del jugador.

**Evidencia:** `docs/plans/turn-actions-panel/report_issue_6_F1.md`, captura del montaje actual y tabla de reglas contrastada.  
**Cierre:** `COMMIT_REQUIRED`, junto con reporte y evento `phase_verdict`; mensaje: `feat(actions-panel): issue 6 F1 BLOCKED visual evidence`.

**Resultado actual:** la tabla semántica y el build están listos; la captura quedó bloqueada porque el helper computer-use falló en el intento inicial y en el único reintento permitido. Siguiente dueño: Orquestador, para resolver el acceso a captura o devolver F1 para repetir la inspección. Los criterios no cambian.

## F2 depende de #5

El issue #5 sigue abierto y aún no tiene PR integrado. No montes el panel en el shell final ni edites `Coup.js` para reorganizar el tablero hasta que #5 llegue a `master`. Después relee el resultado integrado y adapta F2 para conectar el panel al turno real y aplazar el cobro de Coup/Assassinate hasta confirmar el objetivo. F3 queda pendiente de F2.

## Límites y pregunta de falsificación

Cumple los criterios del plan. Preserva desafíos, bloqueos, revelación e influencia. No cambies lógica del servidor/socket ni añadas tests automatizados o bibliotecas de animación. La revisión final preguntará: ¿algún estado muestra acciones al jugador incorrecto, permite cobrar al cancelar, duplica una acción, tapa respuestas o hace saltar/atascar el tablero?
