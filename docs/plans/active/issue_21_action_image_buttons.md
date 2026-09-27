# Handoff para Agente Alquimista — issue #21

- **Issue:** https://github.com/pronficilio/coup-online/issues/21
- **Plan exacto:** `docs/plans/action-image-buttons/plan_action_image_buttons.md`
- **Bitácora exacta:** `docs/plans/log/issue-21.jsonl`
- **Estado:** `ACTIVE`; F1 `ACTIVE`; F2 `BLOCKED` por #14 y #19.
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Verifier requerido ahora:** no; requerido en F3 antes de revisión de integración.
- **Falsificación:** ¿hay un par con escala, alfa o borde incorrectos; una acción que se puede disparar por jugador no elegible; un payload/handler cambiado; un control sin acceso por teclado; un layout shift o transición que retrasa el envío?
- **Fase sugerida:** F1 — reducir las diez fuentes al 50 %, convertir a WebP e importarlas en el cliente.
- **Documentos fuente:** issue #21; plan exacto arriba; `docs/plans/turn-actions-panel/plan_turn_actions_panel.md`; `docs/plans/game-language/plan_game_language.md`; componentes en `coup-client/src/components/game/`.

## Subtareas listas

1. Reclamar issue #21 en `pronficilio/coup-online`, volver a leer título/cuerpo/estado y confirmar que no haya reclamo o PR incompatible.
2. Crear/confirmar branch y worktree canónicos, registrar `claim` y `worktree_confirmed`, mover inbox a active y hacer el commit de control antes de cambios de producto.
3. Leer los diez PNG de `/mnt/e/dev/coup/fotos/` como fuentes de solo lectura. Crear copias al 50 % conservando proporción, eliminar el matte claro exterior solo en los derivados si se conserva el contorno y el glow; exportar WebP al árbol del cliente. No sobrescribir ni versionar los PNG de `fotos/`.
4. Comparar dimensiones, alfa y apariencia normal/activa de cada pareja; registrar herramienta, parámetros y tamaños en el reporte F1; hacer el commit de cierre F1.
5. No empezar F2 hasta confirmar que #14 y #19 liberaron/integraron `Coup.js` y los componentes de respuesta, o recibir coordinación registrada del Orquestador. No resolver conflictos por inferencia.
6. Tras la liberación, sustituir solamente Challenge, Block Foreign Aid, Block Steal, Block Assassination y Pass; preservar handlers, elegibilidad, destinos y payloads. Mantener Ambassador/Captain como elecciones de reclamo.
7. Añadir transición ligera entre estados normal/activo con nombre accesible, foco, teclado y `prefers-reduced-motion`; compilar y recorrer manualmente.
8. Dejar la unidad `WAITING_ORCHESTRATOR`; no integrar ni cerrar. Preparar material para Verifier independiente FINAL.

## Criterios, alcance y evidencia

Cumplir AC1–AC7 del plan. Build del cliente, inspección de los diez WebP y recorrido manual registrados en los reportes; no añadir ni ejecutar tests automatizados. Fuera de alcance: acciones principales, reglas, servidor, Socket.IO, nueva dependencia de animación.

**Riesgo/bloqueos:** archivos origen ignorados; su formato actual es RGB sin alfa. Tratamiento del fondo claro es un supuesto reversible. F2 bloqueada por #14/#19. Si la extracción perjudica brillos/bordes o se requiere cambio de lógica, detenerse y pedir al Orquestador una decisión.

## Commits por fase

- F1 `COMMIT_REQUIRED`: `feat(action-images): issue 21 F1 import optimized webp controls`
- F2 `COMMIT_REQUIRED`: `feat(action-images): issue 21 F2 image response controls and transition`
- F3 `COMMIT_REQUIRED`: `docs(action-images): issue 21 F3 CLOSED ready_for_review`

## Topología y reclamo

- **Branch:** `issue/21-action-image-buttons`
- **Worktree:** `.worktrees/issue-21-action-image-buttons`
- **Merge target:** `master` de `pronficilio/coup-online`
- **PR esperada:** una desde la rama del issue a `master`.
- **Bitácora:** `docs/plans/log/issue-21.jsonl` (append-only).
- **Secuencia:** primero registrar claim en el issue del fork y releer; luego crear/confirmar una sola branch/worktree desde `origin/master` actualizada; dentro del worktree mover este inbox a `active/`, registrar claim/worktree/phase_start en JSONL y commitear control.
- **Validaciones:** dimensiones/formato/alfa/comparación visual para F1; `npm run build` desde `coup-client` y recorrido manual para F2/F3; no tests.
- **Delegación:** dividir subtareas visuales atómicas según la política local, sin escribir en superficies compartidas hasta resolver los bloqueos.
- **Verifier:** invocar independiente en F3 para intentar refutar AC1–AC6.

## Confirmación de reclamo y aislamiento

Issue #21 releída después del reclamo: OPEN, sin assignee previo; el comentario de claim es https://github.com/pronficilio/coup-online/issues/21#issuecomment-5852695330. No existe PR abierta para la branch canónica. Worktree `/mnt/e/dev/coup/.worktrees/issue-21-action-image-buttons`, branch `issue/21-action-image-buttons`, base `origin/master` en `c0119cb70995974f6c5f5e71c19af8bba5f94011`; los documentos propios de #21 quedaron en `active/`.
