# Reporte F2 — issue #19, avances parciales

**Estado de la fase:** `ACTIVE`; esta tanda aislada queda completa, pero F2 no está cerrada.
**Base sincronizada:** `origin/master` en `c0119cb70995974f6c5f5e71c19af8bba5f94011`, integrado por el merge `28e1046` (primer padre `56a41a1`).
**Commits de la tanda:** `4b6b564` (`feat(i18n): issue 19 F2 spanish default and dictionary`), `c9d5442` (`fix(i18n): keep issue 19 locale fallback in Spanish`) y `a63336c` (`feat(i18n): issue 19 F2 localize reference panel`).
**Fecha:** 2026-09-26.

## Trabajo de esta tanda

- Se agregó `coup-client/src/i18n/translations.json` con 181 claves paralelas `es`/`en`, incluidas las cadenas cliente F1 de rutas todavía reservadas para que puedan adoptarlas en tandas posteriores. Los emisores de `g-addLog` no se incluyen: F3 permanece bloqueada.
- Se agregó `coup-client/src/i18n/index.js`. La función `t(key, params)` usa siempre `es`, interpola marcadores con nombre y devuelve la clave si falta una entrada `es` (nunca recurre a `en`); el diccionario queda exportado para una futura integración, sin selector, detección ni persistencia de idioma.
- Se localizaron las cadenas permitidas en `Home.js`, `RulesModal.js`, `CheatSheetModal.js` y el título de `EventLog.js`. Se conservaron las negritas, los colores y las etiquetas de roles/acciones de las reglas. El crédito de portada conserva el enlace al nombre propio y toma su prefijo del diccionario.
- Se fijó `lang="es"`, y se tradujeron título, metadatos sociales/búsqueda y texto `<noscript>` en `coup-client/public/index.html`; también se localizaron `short_name` y `name` de la PWA.
- Se tradujeron los nodos de texto visibles de `coup-client/src/assets/CheatSheet.svg`. El efecto del Golpe/Asesinato se compactó a «Elige quién pierde 1 influencia» para ajustarse a la columna del recurso.
- Tras cerrarse #18 y fusionarse su PR #20 (`64a507d`), `ReferencePanel.js` se conectó a `t()` para etiquetas del grupo, botones, modales, `alt` y controles accesibles. Los textos predeterminados españoles no cambian; se agregaron equivalentes `en` para sus nueve claves. El `Coup.js` recibido por el merge monta ReferencePanel desde master; #19 no modificó ese archivo.

## Validación y límites

- JSON válido; `es` y `en` tienen 190 claves idénticas y todos sus marcadores dinámicos coinciden. Las nueve claves `referencePanel.*` y el parámetro `{referenceName}` también tienen paridad.
- El helper selecciona explícitamente `es`; su fallback no consulta el mapa inglés.
- `git diff --check`: sin errores.
- `npm run build` completó con exit 0 después de integrar ReferencePanel. CRA informó imports sin uso preexistentes en `src/App.js`; Browserslist avisó que `caniuse-lite` está desactualizado; el minificador CSS informó que `postcss-calc` no pudo parsear expresiones con `dvh` en `ReferencePanel.css` líneas 100 y 106. Son warnings, el build produjo los artefactos de producción. La advertencia anterior de `ReactModal` en `Coup.js` ya no aparece tras integrar su cambio upstream.
- No se añadieron ni ejecutaron tests. No se hizo recorrido manual de una partida; esta evidencia cubre solo la tanda aislada, no el criterio de cierre F2.
- La sincronización incorporó `origin/master` `c0119cb` mediante `28e1046`; solo se integraron commits publicados, no los cambios locales sin commit del worktree #14. El merge contiene la integración upstream en `Coup.js`; #19 no editó esa ruta y la reserva de #14 sigue activa.
- Tras el commit `a63336c`, se actualizó y releyó la issue #19 por API (`2026-09-27T03:08:01Z`): permanece `OPEN`, asignada a `pronficilio`; su cuerpo refleja `sync_base`, las 190 claves, el build y F2 `ACTIVE`/F3 `BLOCKED`, sin afirmaciones obsoletas sobre sincronización o conteo.
- Permanecen pendientes las conexiones del diccionario en componentes de lobby/decisión/tablero reservados a #14, la carga de ilustraciones españolas que monta `PlayerBoard.js` y los mensajes ingleses de `g-addLog`. F3 sigue bloqueada por #14; las brechas de accesibilidad registradas en F1 no se rediseñaron.
- La tanda no satisface todavía la aceptación global de español en lobby, decisiones, tablero y registro; no debe tratarse como cobertura final ni como cierre de F2.
