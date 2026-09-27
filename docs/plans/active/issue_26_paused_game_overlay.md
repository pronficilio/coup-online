# Handoff para Agente Alquimista — issue #26

- **Issue:** https://github.com/pronficilio/coup-online/issues/26
- **Plan exacto:** `docs/plans/paused-game-overlay/plan_paused_game_overlay.md`
- **Bitácora exacta:** `docs/plans/log/issue-26.jsonl`
- **Estado:** `ACTIVE`; F1 `CLOSED`; F2 `ACTIVE`.
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Verifier requerido ahora:** no para F1; sí en F3 antes de revisión final.
- **Pregunta de falsificación:** ¿una pausa de timeout recibe `canResume: false`, el cliente muestra un CTA rechazable o quedan controles activos bajo el overlay?
- **Fase cerrada:** F1 — el timeout normal se anuncia recuperable; reanuda solo el líder y solo si todos los asientos humanos siguen conectados. No hubo discrepancia del servidor.
- **Fase actual:** F2 — capa de pausa, CTA autorizado, estados de espera/error accesibles y nuevas cadenas bilingües.
- **Documentos fuente:** issue #26; plan exacto arriba; `docs/plans/codex-ai-players/f0_contract.md`; código integrado en `origin/master` `5de95ee`; issue #19 y PR #22 (integrada).

## Subtareas listas para F1

1. Desde `origin/master` actualizado, enumerar cada llamada a `pause()` en `server/game/coup.js` y anotar si conserva una decisión recuperable.
2. Seguir `g-gamePaused` y `g-resume` hasta el cliente; registrar el permiso del líder, el requisito de conectividad y la presentación actual inline.
3. Confirmar si el caso de falta de respuesta de una decisión humana usa la ruta de timeout recuperable. Si no, parar y solicitar reorquestación antes de diseñar el CTA.
4. Entregar `docs/plans/paused-game-overlay/report_issue_26_F1.md` y actualizar plan/bitácora con evidencia. No modificar código de producto ni editar archivos de #19.

**Criterio de cierre F1:** matriz completa de causa, `canResume`, actor autorizado y copy/estado que necesita la interfaz; veredicto `advance_f2` o bloqueo/reorquestación ante discrepancia. Commit requerido: `docs(ui): issue 26 F1 CLOSED advance_f2`.

## Bloqueo F2 y límites

- #19 continúa abierta por recorrido manual y Verifier FINAL, pero PR #22 integró `Coup.js` y `translations.json` en `master`. Su worktree está limpio. Confirma el estado del tracker y coordina con el Orquestador si #19 reabre cambios concurrentes antes de editar esas rutas.
- No permitir que cualquier participante reanude. Mantener el contrato de #14: solo el líder, con `canResume` verdadero y todos los asientos humanos conectados.
- La pausa no recuperable no recibe CTA. No convertir silencio en pase/acción automática, no ajustar reglas del motor, no desplegar.
- Una corrección al servidor, si F1 la hace necesaria, requiere reorquestación del Orquestador y reevaluación de riesgo/verificación.

## Topología y reclamo obligatorio

- **Branch único:** `issue/26-paused-game-overlay`.
- **Worktree único:** `.worktrees/issue-26-paused-game-overlay`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **PR esperado:** una PR desde el branch de #26 a `master`, después de F1–F3.
- **Aislamiento confirmado:** issue OPEN y asignada a `pronficilio` tras relectura; sin PR, branch o worktree previos. `origin/master` actualizado a `5de95ee`; branch `issue/26-paused-game-overlay` y worktree `.worktrees/issue-26-paused-game-overlay` creados desde ese commit. El handoff está en `active/`; plan, handoff y bitácora se copiaron selectivamente. El checkout raíz no se modificó.
- **Reporte F1:** `docs/plans/paused-game-overlay/report_issue_26_F1.md`.
- **Commit F2:** `feat(game-ui): issue 26 fullscreen pause overlay`.
- **Commit F3:** `docs(game-ui): issue 26 F3 READY_FOR_REVIEW`.
- **Validación:** build de cliente, recorrido manual escritorio/móvil/teclado y Verifier independiente FINAL; no agregar ni ejecutar tests automatizados.
- **Qué actualizar:** issue, plan, handoff (moverlo a `active/` al reclamar), bitácora, reportes y evidencia. Dejar la unidad `WAITING_ORCHESTRATOR`; no integrar ni cerrar.
