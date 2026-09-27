# Handoff para Agente Alquimista — issue #32

- **Issue:** https://github.com/pronficilio/coup-online/issues/32
- **Estado:** WAITING_ORCHESTRATOR; F1 CLOSED (PASS).
- **Plan exacto:** docs/plans/client-image-sizes/plan_client_image_sizes.md
- **Bitácora exacta:** docs/plans/log/issue-32.jsonl
- **Modo / riesgo / verificación:** LIGHT / LOW / NONE.
- **Verifier requerido:** no; el usuario pidió una sola persona para el recorte.
- **Pregunta de falsificación:** ¿alguno de los WebP queda por encima de su límite objetivo, pierde alfa o detalle, o el total de bytes no disminuye?
- **Fase ejecutada:** F1, redimensionamiento de los 19 WebP importados; PASS.
- **Por qué sigue:** inventario de resolución y dibujo terminado por el Orquestador; no hacen falta más fases de auditoría.
- **Documentos fuente:** plan citado, issue #32 y los CSS/JS citados en la tabla del plan.
- **Subtareas listas:** una subtarea secuencial para modificar los 19 WebP; no delegar a más agentes.
- **Criterios de aceptación:** AC1–AC5 del plan, sin ampliar el alcance.
- **Evidencia registrada:** tabla por archivo con dimensiones, bytes y alfa antes/después en el plan; total 516,192 bytes (−67.8%). Formato, dimensiones y alfa comprobados en los 19; inspección visual de carta, mazo, moneda y botones.
- **Riesgos/bloqueos:** no editar JSX/CSS ni otros recursos. Si el checkout actualizado no contiene las rutas, devolver el bloqueo al Orquestador.
- **Commit:** COMMIT_REQUIRED; perf(assets): issue 32 resize oversized coup-client images.
- **Branch destino:** issue/32-client-image-sizes.
- **Worktree destino:** .worktrees/issue-32-client-image-sizes.
- **Merge target:** master.
- **Bitácora:** docs/plans/log/issue-32.jsonl.
- **PR esperada:** una única PR de issue/32-client-image-sizes a master.

## Secuencia obligatoria de reclamo y aislamiento

1. Reclamar issue #32 en pronficilio/coup-online, asignar a pronficilio, releer título/cuerpo/estado y confirmar el reclamo.
2. Actualizar referencias remotas y crear branch/worktree desde el origin/master actual. No basarse en el HEAD de /mnt/e/dev/coup, que contiene dos commits locales además de origin/master.
3. Copiar únicamente el plan, este handoff y la bitácora de issue #32 al worktree. Mover el handoff de inbox/ a active/, registrar claim y worktree_confirmed en la bitácora y cerrar el commit de control antes de modificar imágenes.
4. F1 redimensionó solo los 19 assets indicados. Se conservaron rutas, WebP, proporción con redondeo de píxel, alfa y composición; no se optimizaron claim* ni assets sin uso.
5. F1 quedó documentada y lista para una única PR hacia master. No se fusiona ni se cierra la issue; eso corresponde al Orquestador.

## Validaciones

Comprobar dimensiones, formato, alfa y bytes de los 19 WebP. No ejecutar tests ni build, y no hacer una revisión funcional del juego.

## Qué actualizar

Actualizar plan, handoff activo y bitácora con el veredicto de F1 y la comparación antes/después. Dejar la unidad WAITING_ORCHESTRATOR al abrir la PR.
