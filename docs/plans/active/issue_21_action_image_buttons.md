# Handoff para Agente Alquimista — issue #21

- **Issue:** https://github.com/pronficilio/coup-online/issues/21
- **Plan exacto:** `docs/plans/action-image-buttons/plan_action_image_buttons.md`
- **Bitácora exacta:** `docs/plans/log/issue-21.jsonl`
- **Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED`; F2 `CLOSED`; F3 `BLOCKED`.
- **Reporte F1:** `docs/plans/action-image-buttons/report_issue_21_F1.md`.
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Reporte F3:** `docs/plans/action-image-buttons/report_issue_21_F3.md` (`BLOCKED`).
- **Verifier requerido ahora:** revisión independiente completada; falta walkthrough en navegador para desbloquear F3.
- **Falsificación:** ¿hay un par con escala, formato o contenido incorrectos; una acción que se puede disparar por jugador no elegible; un payload/handler cambiado; un control sin acceso por teclado; un layout shift o transición que retrasa el envío?
- **Estado de fase:** F1 y F2 cerradas. F2 adaptó los cinco botones al renderer genérico en la base sincronizada tras #14 PR #23 (`2d82fa1`, merge canónico #21 `b93a67c`) y añadió Claim como contexto no interactivo. F3 confirmó el build, contrato estático e inventario WebP, pero permanece bloqueada porque no hay navegador para completar el recorrido visual/teclado en escritorio y móvil.
- **Documentos fuente:** issue #21; plan exacto arriba; `docs/plans/turn-actions-panel/plan_turn_actions_panel.md`; `docs/plans/game-language/plan_game_language.md`; componentes en `coup-client/src/components/game/`.

## Subtareas listas

1. Reclamar issue #21 en `pronficilio/coup-online`, volver a leer título/cuerpo/estado y confirmar que no haya reclamo o PR incompatible.
2. Crear/confirmar branch y worktree canónicos, registrar `claim` y `worktree_confirmed`, mover inbox a active y hacer el commit de control antes de cambios de producto.
3. F1 completada: diez WebP bajo `coup-client/src/assets/action-buttons/`; fuentes PNG RGB en `/mnt/e/dev/coup/fotos/` se mantuvieron de solo lectura e intactas.
4. F1 verificada visualmente y por formato/dimensiones/modo; reporte `docs/plans/action-image-buttons/report_issue_21_F1.md`; commit `feat(action-images): issue 21 F1 import optimized webp controls`.
5. #14 PR #23 se integró a `master`; #21 se sincronizó en `b93a67c`. F2 activa sobre `Coup.js` genérico; conservar `decision.options` y `g-submitDecision({decisionId,stateVersion,choiceId})`.
6. Mapear Challenge (`challenge`), Pass (`pass`), Block Foreign Aid (`block:duke`), Block Steal (`block:captain`/`block:ambassador`) y Block Assassination (`block:contessa`) a sus imágenes. Mantener el texto de Captain/Ambassador y otros tipos de opción.
7. Añadir Claim al 50 % como imagen contextual no interactiva solo en descripciones de `challenge`/`block_challenge`; no crear opción Claim.
8. Añadir transición breve entre estados normal/activo con nombre accesible, foco, teclado y `prefers-reduced-motion`; compilar y recorrer manualmente.
9. Dejar la unidad `WAITING_ORCHESTRATOR`; no integrar ni cerrar. Preparar material para Verifier independiente FINAL.

## Criterios, alcance y evidencia

Cumplir AC1–AC7 del plan. Build del cliente, inspección de los diez WebP y recorrido manual registrados en los reportes; no añadir ni ejecutar tests automatizados. Fuera de alcance: acciones principales, reglas, servidor, Socket.IO, nueva dependencia de animación.

**Riesgo/bloqueos:** archivos fuente ignorados en RGB; preservar el canvas y el fondo. No hay navegador ejecutable desde esta sesión WSL: Chrome del host (`/mnt/c/Program Files/Google/Chrome/Application/chrome.exe`) falla antes de iniciar con `UtilBindVsockAnyPort:307`; no se instalaron navegadores. Se requiere walkthrough de las cinco respuestas y contexto Claim en escritorio/móvil, teclado/foco y reduced motion para cambiar F3 de `BLOCKED`. Las copias actuales ignoradas de `c.png`/`c-active.png` tienen 1024×342 RGB y mtime posterior a F1; no sustituyen las fuentes históricas de 1400×468 documentadas por F1.

## Commits por fase

- F1 `94b1447bb0b5fb1613e3f7cf226993077a2f0da7`: `feat(action-images): issue 21 F1 import optimized webp controls`
- F2 `4d288199d14ccfeeeaec5a35dd4230b893ee0b4f`: `feat(action-images): issue 21 F2 image response controls and transition`
- F3: commit local de documentación con reporte `BLOCKED`; el recorrido manual sigue pendiente antes de revisión de integración.

## Topología y reclamo

- **Branch:** `issue/21-action-image-buttons`
- **Worktree:** `.worktrees/issue-21-action-image-buttons`
- **Merge target:** `master` de `pronficilio/coup-online`
- **PR esperada:** una desde la rama del issue a `master`.
- **Bitácora:** `docs/plans/log/issue-21.jsonl` (append-only).
- **Secuencia:** primero registrar claim en el issue del fork y releer; luego crear/confirmar una sola branch/worktree desde `origin/master` actualizada; dentro del worktree mover este inbox a `active/`, registrar claim/worktree/phase_start en JSONL y commitear control.
- **Validaciones:** F1 conserva su reporte de diez imágenes; Claim y F2 están documentados en `report_issue_21_F2.md`; `npm run build` pasó; recorrido visual pendiente por falta de navegador; no tests.
- **Delegación:** Alquimista cerró F2 en el worktree canónico actualizado tras #14 PR #23; Verifier independiente completó F3 como `BLOCKED`.
- **Verifier:** revisión F3 independiente registrada en `report_issue_21_F3.md`; está `BLOCKED` por falta de navegador para el walkthrough de AC6.

## Confirmación de reclamo y aislamiento

Issue #21 releída antes de reanudar F2: OPEN, sin assignee, con reclamo F1 y comentario que registraba el bloqueo anterior; el comentario de claim es https://github.com/pronficilio/coup-online/issues/21#issuecomment-5852695330. PR #23 de #14 está `MERGED` en `2d82fa1e0d67ba9e48d7885f9c3ae171360425bd`. Worktree canónico `/mnt/e/dev/coup/.worktrees/issue-21-action-image-buttons`, branch `issue/21-action-image-buttons`, base sincronizada vía merge `b93a67c`; F2 reactivada y el cuerpo/comentario de #21 actualizado.

## F1 entregada

F1 produjo diez derivados WebP al 50 %, preservando los canvas RGB. Después se añadió Claim; F2 generó sus dos variantes al 50 % con el mismo encoder, pero usa solo `claim.webp` como contexto visual no interactivo. Ver `docs/plans/action-image-buttons/report_issue_21_F1.md` y `report_issue_21_F2.md`.
