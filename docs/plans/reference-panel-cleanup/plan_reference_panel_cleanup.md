# Plan: limpiar y aclarar los accesos de referencia

**Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED`.
**Issue:** https://github.com/pronficilio/coup-online/issues/63
**Solicitud:** añadir tooltips discretos a los accesos de `reference-panel__triggers`, eliminar el botón de `CheatSheet.svg` y el archivo, y titular «Resumen de reglas» al botón que abre `table-es.webp`.
**Plan anterior relacionado:** issue #53 está cerrada; esta unidad es un seguimiento independiente.

## Objetivo y alcance

Conservar el grupo de referencias y sus acciones vigentes, retirando el acceso y activo SVG que el propietario declaró obsoletos. El botón que abre `table-es.webp` sigue abriendo esa imagen, con `title`/nombre accesible «Resumen de reglas» en español y el equivalente «Rules summary» en inglés. Los controles restantes presentan un tooltip sutil al usar mouse o teclado.

El cambio se limita a `ReferencePanel`, los estilos del tooltip, traducciones necesarias y código que quede sin uso al retirar el disparador SVG. No se cambian las imágenes de Carta/Tabla, reglas, lógica de partida ni otros modales.

## Perfil operativo

- Repositorio: `pronficilio/coup-online`; rama objetivo: `master`.
- Ejecutor: Agente Alquimista; Verifier: ninguno.
- Modo/riesgo/verificación: `LIGHT` / `LOW` / `NONE`.
- Branch/worktree canónicos: `issue/63-reference-panel-tooltip` / `.worktrees/issue-63-reference-panel-tooltip`.
- Aislamiento: worktree desde la base canónica `origin/master`; una integración hacia `master`.

## F1 — retirar el resumen SVG y añadir tooltips (`CLOSED`)

**Pregunta única:** ¿el panel puede retirar el acceso SVG y presentar tooltips discretos sin cambiar los destinos ni el uso de los otros accesos?

- **Tareas:** añadir tooltips breves a los controles que permanecen, visibles en hover y foco; tomar como referencia visual el tono, borde, radio y sombra sutil del Registro de eventos; cambiar el título y las etiquetas de `referencePanel.table.label` a «Resumen de reglas» / «Rules summary»; eliminar completamente `CheatSheet.svg` y el disparador que lo abría, quitando o adaptando todos sus consumidores para que no queden referencias al archivo.
- **Criterios de aceptación:**
  1. Cada botón restante del grupo tiene tooltip visible en hover/foco y conserva nombre accesible localizado.
  2. El botón que abre `table-es.webp` conserva ese destino y presenta «Resumen de reglas» en español.
  3. Desaparecen el botón que abría `CheatSheet.svg`, el archivo `coup-client/src/assets/CheatSheet.svg` y todas las referencias/imports/consumidores de ese archivo.
  4. Los demás accesos mantienen sus destinos y comportamiento.
  5. No se añaden ni ejecutan pruebas automatizadas.
- **Salida/evidencia:** cambios de código y registro conciso del diff en el handoff de la unidad.
- **Avanzar/cerrar:** criterios cubiertos y referencias al activo eliminado limpiadas.
- **Pivote:** si el tooltip duplica el popup nativo de `title`, ajustar su activación para conservar el título requerido sin mostrar dos globos.
- **Bloqueo:** uso adicional del SVG fuera del componente de referencias que requiera decisión de alcance.
- **Commit:** `COMMIT_REQUIRED`; `fix(reference-panel): issue 63 F1 CLOSED`.
- **Validación:** revisión estática del diff y de referencias al activo eliminado; no ejecutar tests ni build.

## Falsificación y seguimiento

Pregunta de falsificación: ¿queda algún botón sin tooltip en navegación por teclado, se dispara más de un tooltip, o sobrevive alguna importación/referencia del SVG después de borrar el acceso?

La bitácora append-only es `docs/plans/log/issue-63.jsonl`. El handoff activo es `docs/plans/active/issue_63_reference_panel_cleanup.md`.
