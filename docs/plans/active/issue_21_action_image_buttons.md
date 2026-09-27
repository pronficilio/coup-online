# Handoff para Agente Alquimista — issue #21

- **Issue:** https://github.com/pronficilio/coup-online/issues/21
- **Plan exacto:** `docs/plans/action-image-buttons/plan_action_image_buttons.md`
- **Bitácora exacta:** `docs/plans/log/issue-21.jsonl`
- **Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED`; F2 `BLOCKED` por incompatibilidad con el renderer genérico de #14.
- **Reporte F1:** `docs/plans/action-image-buttons/report_issue_21_F1.md`.
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Verifier requerido ahora:** no; requerido en F3 antes de revisión de integración.
- **Falsificación:** ¿hay un par con escala, formato o contenido incorrectos; una acción que se puede disparar por jugador no elegible; un payload/handler cambiado; un control sin acceso por teclado; un layout shift o transición que retrasa el envío?
- **Estado de fase:** F1 cerrada. F2 fue analizada tras instrucción explícita del usuario para iniciarla, pero no se modificó producto al comprobar que #14 elimina los componentes heredados y sustituye el protocolo de respuesta. El usuario debe decidir si se espera el merge de #14, si acepta una implementación temporal sobre el legado, o si amplía el alcance para portar/adaptar el renderer genérico en #21.
- **Documentos fuente:** issue #21; plan exacto arriba; `docs/plans/turn-actions-panel/plan_turn_actions_panel.md`; `docs/plans/game-language/plan_game_language.md`; componentes en `coup-client/src/components/game/`.

## Subtareas listas

1. Reclamar issue #21 en `pronficilio/coup-online`, volver a leer título/cuerpo/estado y confirmar que no haya reclamo o PR incompatible.
2. Crear/confirmar branch y worktree canónicos, registrar `claim` y `worktree_confirmed`, mover inbox a active y hacer el commit de control antes de cambios de producto.
3. F1 completada: diez WebP bajo `coup-client/src/assets/action-buttons/`; fuentes PNG RGB en `/mnt/e/dev/coup/fotos/` se mantuvieron de solo lectura e intactas.
4. F1 verificada visualmente y por formato/dimensiones/modo; reporte `docs/plans/action-image-buttons/report_issue_21_F1.md`; commit `feat(action-images): issue 21 F1 import optimized webp controls`.
5. F2 bloqueada por la decisión sobre arquitectura; el Alquimista confirmó que la rama activa de #14 elimina las rutas heredadas de F2 y cambia el protocolo. No iniciar edición de producto hasta que el usuario elija el renderer objetivo.
6. Tras la liberación, sustituir solamente Challenge, Block Foreign Aid, Block Steal, Block Assassination y Pass; preservar handlers, elegibilidad, destinos y payloads. Mantener Ambassador/Captain como elecciones de reclamo.
7. Añadir transición ligera entre estados normal/activo con nombre accesible, foco, teclado y `prefers-reduced-motion`; compilar y recorrer manualmente.
8. Dejar la unidad `WAITING_ORCHESTRATOR`; no integrar ni cerrar. Preparar material para Verifier independiente FINAL.

## Criterios, alcance y evidencia

Cumplir AC1–AC7 del plan. Build del cliente, inspección de los diez WebP y recorrido manual registrados en los reportes; no añadir ni ejecutar tests automatizados. Fuera de alcance: acciones principales, reglas, servidor, Socket.IO, nueva dependencia de animación.

**Riesgo/bloqueos:** archivos origen ignorados en RGB; preservar el canvas y el fondo. F2 espera decisión del usuario: el renderer heredado de #21 no existe en el cambio activo de #14.

## Commits por fase

- F1 `94b1447bb0b5fb1613e3f7cf226993077a2f0da7`: `feat(action-images): issue 21 F1 import optimized webp controls`
- F2 `COMMIT_REQUIRED`: `feat(action-images): issue 21 F2 image response controls and transition`
- F3 `COMMIT_REQUIRED`: `docs(action-images): issue 21 F3 CLOSED ready_for_review`

## Topología y reclamo

- **Branch:** `issue/21-action-image-buttons`
- **Worktree:** `.worktrees/issue-21-action-image-buttons`
- **Merge target:** `master` de `pronficilio/coup-online`
- **PR esperada:** una desde la rama del issue a `master`.
- **Bitácora:** `docs/plans/log/issue-21.jsonl` (append-only).
- **Secuencia:** primero registrar claim en el issue del fork y releer; luego crear/confirmar una sola branch/worktree desde `origin/master` actualizada; dentro del worktree mover este inbox a `active/`, registrar claim/worktree/phase_start en JSONL y commitear control.
- **Validaciones:** dimensiones/formato/modo/comparación visual documentadas para F1; `npm run build` desde `coup-client` y recorrido manual para F2/F3; no tests.
- **Delegación:** Alquimista invocado e inspección completada; no se editaron componentes ni worktrees de #14/#19. Reinvocar para F2 cuando se defina el renderer objetivo.
- **Verifier:** invocar independiente en F3 para intentar refutar AC1–AC6.

## Confirmación de reclamo y aislamiento

Issue #21 releída después del reclamo: OPEN, sin assignee previo; el comentario de claim es https://github.com/pronficilio/coup-online/issues/21#issuecomment-5852695330. No existe PR abierta para la branch canónica. Worktree `/mnt/e/dev/coup/.worktrees/issue-21-action-image-buttons`, branch `issue/21-action-image-buttons`, base `origin/master` en `c0119cb70995974f6c5f5e71c19af8bba5f94011`; los documentos propios de #21 quedaron en `active/`.

## F1 entregada

F1 produjo diez derivados WebP al 50 %, preservando los canvas RGB. El reporte registra dimensiones, bytes, alfa, encoder y revisión visual. F2 está bloqueada por incompatibilidad arquitectónica: #14 elimina los componentes heredados de respuesta y migra a `decision.options`/`choiceId`. Ver `docs/plans/action-image-buttons/report_issue_21_F2.md`.
