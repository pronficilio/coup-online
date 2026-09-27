# Handoff para Agente Alquimista — issue #29

- **Tracker:** https://github.com/pronficilio/coup-online/issues/29
- **Plan exacto:** `docs/plans/website-credit/plan_website_credit.md`
- **Bitácora exacta:** `docs/plans/log/issue-29.jsonl`
- **Estado:** `COMPLETED`; F1 `CLOSED`.
- **Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
- **Verifier requerido ahora:** no.
- **Pregunta de falsificación:** ¿puede revisarse el README o la portada y encontrar que falta `coup.ejele.net`, que se perdió el crédito de Ethan Chen como autor original, o que las etiquetas en español/inglés contradicen el cambio?
- **Documentos fuente:** issue #29; plan indicado arriba; `README.md`; `coup-client/src/components/Home.js`; `coup-client/src/i18n/translations.json`; `docs/plans/game-language/translation_inventory.md`.
- **Subtareas listas:**
  1. Añadir al README el enlace `https://coup.ejele.net` como sitio donde probar el juego, conservando el enlace existente a `https://www.chickenkoup.com/`.
  2. Actualizar el crédito visible de la portada para indicar que Pronficilio modificó el proyecto y Ethan Chen es su autor original; preservar ambos enlaces de autoría y traducir etiquetas en `es` y `en`.
  3. Actualizar únicamente la fila correspondiente en el inventario de cadenas de la issue #19 para que describa el crédito vigente.
- **Criterios de aceptación:** ver sección F1 del plan y cuerpo del issue #29.
- **Evidencia requerida:** diff de los archivos autorizados y resultado de `git diff --check`.
- **Riesgos/bloqueos:** la issue #19 sigue abierta; su inventario de portada deberá quedar alineado con el nuevo crédito. No editar otras fases ni criterios de #19.
- **Política de commits:** `COMMIT_REQUIRED`; commit de cierre `docs(home): issue 29 F1 CLOSED ready_for_review`.
- **Branch destino del issue:** `issue/29-readme-site-credit`.
- **Worktree destino del issue:** `.worktrees/issue-29-readme-site-credit`.
- **Merge target:** `master`.
- **Bitácora del issue:** `docs/plans/log/issue-29.jsonl`.
- **PR canónica:** [#31](https://github.com/pronficilio/coup-online/pull/31), integrada a `master` con merge commit `3a128ce4b24cc495c87907a297ec7078a28c7d92`; no hubo otra integración.
- **Entrega en tracker:** [comentario de cierre F1](https://github.com/pronficilio/coup-online/issues/29#issuecomment-5859575038); el Orquestador confirmó el merge y cerró la issue.
- **Secuencia obligatoria de reclamo/aislamiento:** reclamar y registrar visiblemente en el issue del fork; releer y confirmar estado/contenido; crear o confirmar la rama desde `origin/master`; crear/entrar al único worktree; mover este handoff a `active/`, registrar `claim` y `worktree_confirmed` en la bitácora y commitear los documentos de control en la rama antes del trabajo técnico.
- **Reclamo confirmado:** al reclamar, issue asignada a `pronficilio` y abierta; worktree observado en `/mnt/e/dev/coup/.worktrees/issue-29-readme-site-credit`, branch `issue/29-readme-site-credit`, base `origin/master` `1ff478c308478af3be61131daa1bd88652bdc77f`. La issue se cerró tras integrar la PR #31.
- **Sincronización antes de publicar:** `origin/master@3313d426ebe5cf3d0612e692e1fe44137468362f` integrada mediante merge `5dcc69f`, sin conflictos; el checkout raíz y su commit local ajeno `3155d7d` no se incorporaron.
- **Validaciones esperadas:** revisar manualmente las cadenas de crédito `es`/`en`, el enlace nuevo y la conservación del enlace existente; ejecutar `git diff --check`. No añadir ni ejecutar pruebas automatizadas.
- **Contrato de evidencia:** veredicto F1 con commit y validaciones observadas; no se requiere manifiesto separado.
- **Veredicto F1:** `CLOSED`; diff revisado, ambos destinos y créditos ES/EN confirmados; `git diff --check` pasó. No se ejecutaron pruebas automatizadas. Cierre por commit `docs(home): issue 29 F1 CLOSED ready_for_review`.
- **Revisión del Orquestador:** diff contra `master` conforme; `coup.ejele.net` y chickenkoup.com presentes, crédito de Pronficilio y Ethan Chen conservado, textos ES/EN e inventario alineados. PR #31 mergeable, sin checks pendientes.
- **Cierre:** PR #31 integrada; issue #29 cerrada después de confirmar el merge. No quedan acciones pendientes.

El checkout raíz compartido tiene cambios locales previos en `docs/plans/`; no modificar ni descartar esos cambios. Limitar cualquier copia local de este handoff al worktree canónico de #29.
