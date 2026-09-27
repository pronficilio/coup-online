# Handoff para Agente Alquimista — issue #21

- **Issue:** https://github.com/pronficilio/coup-online/issues/21
- **Plan exacto:** `docs/plans/action-image-buttons/plan_action_image_buttons.md`
- **Bitácora exacta:** `docs/plans/log/issue-21.jsonl`
- **Estado:** `WAITING_ORCHESTRATOR`; F1/F2/F3/F4 `CLOSED` (`PASS`); [PR #30](https://github.com/pronficilio/coup-online/pull/30) abierta y lista para merge.
- **Reporte F1:** `docs/plans/action-image-buttons/report_issue_21_F1.md`.
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Reporte F3 inicial (histórico):** `docs/plans/action-image-buttons/report_issue_21_F3.md` (`BLOCKED`).
- **Recheck F3:** `docs/plans/action-image-buttons/report_issue_21_F3_recheck.md` (`PASS`, walkthrough ejecutado por el usuario).
- **Reporte F4:** `docs/plans/action-image-buttons/report_issue_21_F4.md` (`CLOSED`).
- **Estado de revisión:** PR #30 a `master`, `MERGEABLE/CLEAN`; no hay checks reportados. Build de cliente PASS con advertencias preexistentes. Siguiente dueño: Orquestador para merge.
- **Falsificación:** ¿hay un par con escala, formato o contenido incorrectos; una acción que se puede disparar por jugador no elegible; un payload/handler cambiado; un control sin acceso por teclado; un layout shift o transición que retrasa el envío?
- **Estado de fase:** F1, F2, F3 y F4 cerradas. F2 adaptó los cinco botones al renderer genérico en la base sincronizada tras #14 PR #23 (`2d82fa1`, merge canónico #21 `b93a67c`) y añadió el par Claim al inventario. F4 regeneró los doce WebP con alfa y quitó Claim decorativo del renderer. El usuario confirmó en la app los fondos transparentes, Tax solo Pass/Challenge, Challenge activo actualizado, los cinco controles en escritorio, Tab/foco visible, ventana estrecha sin recortes/solapamientos y reduced motion sin transición.
- **Documentos fuente:** issue #21; plan exacto arriba; `docs/plans/turn-actions-panel/plan_turn_actions_panel.md`; `docs/plans/game-language/plan_game_language.md`; componentes en `coup-client/src/components/game/`.

## Subtareas listas

1. Reclamar issue #21 en `pronficilio/coup-online`, volver a leer título/cuerpo/estado y confirmar que no haya reclamo o PR incompatible.
2. Crear/confirmar branch y worktree canónicos, registrar `claim` y `worktree_confirmed`, mover inbox a active y hacer el commit de control antes de cambios de producto.
3. F1 completada: diez WebP bajo `coup-client/src/assets/action-buttons/`; fuentes PNG RGB en `/mnt/e/dev/coup/fotos/` se mantuvieron de solo lectura e intactas.
4. F1 verificada visualmente y por formato/dimensiones/modo; reporte `docs/plans/action-image-buttons/report_issue_21_F1.md`; commit `feat(action-images): issue 21 F1 import optimized webp controls`.
5. #14 PR #23 se integró a `master`; #21 se sincronizó en `b93a67c`. F2 activa sobre `Coup.js` genérico; conservar `decision.options` y `g-submitDecision({decisionId,stateVersion,choiceId})`.
6. Mapear Challenge (`challenge`), Pass (`pass`), Block Foreign Aid (`block:duke`), Block Steal (`block:captain`/`block:ambassador`) y Block Assassination (`block:contessa`) a sus imágenes. Mantener el texto de Captain/Ambassador y otros tipos de opción.
7. F2 añadió el par Claim al inventario sin crear opción Claim; F4 quitó la imagen contextual. Las descripciones textuales permanecen.
8. Añadir transición breve entre estados normal/activo con nombre accesible, foco, teclado y `prefers-reduced-motion`; compilar y recorrer manualmente.
9. Dejar la unidad `WAITING_ORCHESTRATOR`; no integrar ni cerrar. Preparar material para Verifier independiente FINAL.

## Criterios, alcance y evidencia

Cumplir AC1–AC7 del plan. Build del cliente, inspección de los diez WebP y recorrido manual registrados en los reportes; no añadir ni ejecutar tests automatizados. Fuera de alcance: acciones principales, reglas, servidor, Socket.IO, nueva dependencia de animación.

**Riesgo/bloqueos:** fuentes ignoradas RGB sin modificaciones; F4 elimina solo el fondo exterior y mantiene bordes/halos según preview. El verifier no pudo iniciar Chrome desde WSL, pero el usuario ejecutó el walkthrough en `localhost:3001` y confirmó los criterios visuales/interactivos; ver el recheck F3. Las copias actuales ignoradas de `c.png`/`c-active.png` miden 1024×342 RGB y F4 las usó para salidas de 512×171; no sustituyen las fuentes históricas de 1400×468 documentadas por F1.

## Commits por fase

- F1 `94b1447bb0b5fb1613e3f7cf226993077a2f0da7`: `feat(action-images): issue 21 F1 import optimized webp controls`
- F2 `4d288199d14ccfeeeaec5a35dd4230b893ee0b4f`: `feat(action-images): issue 21 F2 image response controls and transition`
- F3: commit local de primera pasada `BLOCKED`; recheck documental posterior `PASS` basado en recorrido ejecutado y reportado por el usuario.
- F4: cierre canónico en esta fase; corrección de alfa, retirada de Claim decorativo, build y revisión de previews.

## Topología y reclamo

- **Branch:** `issue/21-action-image-buttons`
- **Worktree:** `.worktrees/issue-21-action-image-buttons`
- **Merge target:** `master` de `pronficilio/coup-online`
- **PR:** [#30](https://github.com/pronficilio/coup-online/pull/30), abierta contra `master`; GitHub reporta `MERGEABLE/CLEAN` y no hay checks configurados.
- **Bitácora:** `docs/plans/log/issue-21.jsonl` (append-only).
- **Secuencia:** primero registrar claim en el issue del fork y releer; luego crear/confirmar una sola branch/worktree desde `origin/master` actualizada; dentro del worktree mover este inbox a `active/`, registrar claim/worktree/phase_start en JSONL y commitear control.
- **Validaciones:** F1 conserva su reporte histórico de diez imágenes; el par Claim se añadió después; F2 está documentada en `report_issue_21_F2.md`; F4 registra inventario RGBA actual y resultado de build; el recorrido visual del usuario se registra en F3 recheck; no tests.
- **Delegación:** Alquimista cerró F2 en el worktree canónico actualizado tras #14 PR #23; Verifier dejó la primera pasada F3 `BLOCKED`; Alquimista cerró F4 correctiva. El usuario completó las comprobaciones restantes y el recheck F3 actualiza el dictamen a `PASS`.
- **Verifier:** primera revisión histórica en `report_issue_21_F3.md`; recheck efectivo `PASS` en `report_issue_21_F3_recheck.md`, con procedencia explícita del walkthrough del usuario.

## Sincronización y PR

Rama sincronizada con `origin/master` (`1ff478c`) mediante merge local; el conflicto de `Coup.js` se resolvió conservando la localización reciente y el renderer de imágenes. El build del cliente pasó con advertencias existentes. Rama publicada y PR #30 creada; GitHub indica `MERGEABLE/CLEAN` y no informa checks.

## Confirmación de reclamo y aislamiento

Issue #21 releída antes de reanudar F2: OPEN, sin assignee, con reclamo F1 y comentario que registraba el bloqueo anterior; el comentario de claim es https://github.com/pronficilio/coup-online/issues/21#issuecomment-5852695330. PR #23 de #14 está `MERGED` en `2d82fa1e0d67ba9e48d7885f9c3ae171360425bd`. Worktree canónico `/mnt/e/dev/coup/.worktrees/issue-21-action-image-buttons`, branch `issue/21-action-image-buttons`, base sincronizada vía merge `b93a67c`; F2 reactivada y el cuerpo/comentario de #21 actualizado.

## F1 entregada

F1 produjo diez derivados WebP al 50 %, preservando los canvas RGB. Después se añadió Claim; F2 generó sus dos variantes como recursos contextuales no interactivos. F4 regeneró las doce salidas con alfa y retiró Claim visual del renderer. Ver `docs/plans/action-image-buttons/report_issue_21_F1.md`, `report_issue_21_F2.md` y `report_issue_21_F4.md`.

## Corrección visual F4

F4 generó las seis parejas desde las fuentes RGB actuales a WebP RGBA al 50 %, sin modificar PNG. `c`/`c-active` actuales miden 1024×342 y sus salidas, 512×171 (F1 conserva el dato histórico de 1400×468). Las previews revisadas conservan arte, bordes y halos sin matte rectangular. El Claim gráfico no se muestra; la descripción de la decisión mantiene ese contexto. F3 quedó `PASS` tras el walkthrough visual ejecutado y reportado por el usuario en `report_issue_21_F3_recheck.md`.
