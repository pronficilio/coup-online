# Handoff Para Agente Ejecutor

**Issue/Ticket:** https://github.com/pronficilio/coup-online/issues/63 (`OPEN`).
**Plan:** `docs/plans/reference-panel-cleanup/plan_reference_panel_cleanup.md`.
**Estado del plan:** F1 `ACTIVE`; unidad `ACTIVE`.
**Modo / riesgo / política de verificación:** `LIGHT` / `LOW` / `NONE`.
**Verifier requerido ahora:** no.
**Pregunta de falsificación:** ¿queda algún botón sin tooltip en navegación por teclado, se dispara más de un tooltip, o sobrevive alguna importación/referencia de `CheatSheet.svg` después de quitar el acceso?

## Alcance de F1

En `coup-client/src/components/game/ReferencePanel.js` y sus estilos, agrega un tooltip discreto para cada botón que permanece en `reference-panel__triggers`, visible con hover y foco de teclado. Toma la presentación cálida, sencilla y con sombra ligera del Registro de eventos como referencia. El botón que abre `table-es.webp` debe seguir abriendo la misma imagen y cambiar su `title` y nombre accesible a «Resumen de reglas» (`Rules summary` en inglés).

Elimina por completo el botón que abre `CheatSheet.svg`, el archivo `coup-client/src/assets/CheatSheet.svg` y todos sus consumidores/referencias. La búsqueda estática actual solo encuentra el import del SVG en `CheatSheetModal.js` y el uso de `CheatSheetModal` en `ReferencePanel.js`; confirma el alcance en tu worktree. Retira el componente y limpia estilos/traducciones que queden exclusivamente asociados a él. Conserva accesos y destinos restantes.

**Aceptación:**

1. Tooltip para todos los botones que permanecen; hover y foco visible.
2. «Resumen de reglas» en español para el botón que abre `table-es.webp`; traducción natural en inglés.
3. Se quitan el disparador y SVG de CheatSheet, y no queda ninguna referencia/import de `CheatSheet.svg` en el código.
4. Los demás accesos mantienen su comportamiento.
5. No añadas ni ejecutes tests automatizados o build; limita la evidencia a revisión estática del diff y referencias.

**Archivos probables:** `ReferencePanel.js`, `ReferencePanel.css`, `coup-client/src/components/CheatSheetModal.js`, `coup-client/src/assets/CheatSheet.svg`, traducciones en `coup-client/src/i18n/translations.json` y estilos viejos del modal en `CoupStyles.css` si son exclusivos de esa ruta.

El Alquimista debe delegar la subtarea ordinaria de código a un Agente Menor según `docs/agentes/ALQUIMISTA.md`; conserva para sí el claim, el aislamiento, la coordinación de documentos, la revisión de evidencia y el veredicto de fase.

## Topología y protocolo

- Branch destino del issue: `issue/63-reference-panel-tooltip`.
- Worktree destino: `.worktrees/issue-63-reference-panel-tooltip`.
- Merge target: `master` del fork `pronficilio/coup-online` (`origin`).
- Bitácora exacta: `docs/plans/log/issue-63.jsonl`.
- PR esperada: una sola integración a `master`, con `Closes #63`.
- Antes de reclamar/crear aislamiento, consulta la issue #63 en `pronficilio/coup-online`, verifica que sigue abierta y que no hay claim incompatible; confirma branches/worktrees locales y remotos para #63. Reclama la unidad en el tracker y vuelve a leerla. Después crea/entra al único worktree desde `origin/master`, mueve este handoff a `docs/plans/active/issue_63_reference_panel_cleanup.md` y registra el claim/worktree en la bitácora. No trabajes en el checkout raíz ni en upstream.

## Cierre de fase

- Actualiza este handoff en `active/` con resultado estático conciso y estado de F1.
- Conserva el plan en sync con el resultado.
- Cierre de fase: `COMMIT_REQUIRED`, mensaje `fix(reference-panel): issue 63 F1 CLOSED`.
- No crees/verifiques una PR ni integres a `master` como parte de F1; entrega el resultado al Orquestador.
