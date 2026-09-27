# Reporte F2 — issue #19, tanda aislada

**Estado de la fase:** `ACTIVE`; esta tanda aislada queda completa, pero F2 no está cerrada.
**Base / commit de reorquestación:** `a0900ab` (`docs(i18n): issue 19 replan F2 isolated surfaces`).
**Commits de la tanda:** `4b6b564` (`feat(i18n): issue 19 F2 spanish default and dictionary`) y `c9d5442` (`fix(i18n): keep issue 19 locale fallback in Spanish`).
**Fecha:** 2026-09-26.

## Trabajo de esta tanda

- Se agregó `coup-client/src/i18n/translations.json` con 181 claves paralelas `es`/`en`, incluidas las cadenas cliente F1 de rutas todavía reservadas para que puedan adoptarlas en tandas posteriores. Los emisores de `g-addLog` no se incluyen: F3 permanece bloqueada.
- Se agregó `coup-client/src/i18n/index.js`. La función `t(key, params)` usa siempre `es`, interpola marcadores con nombre y devuelve la clave si falta una entrada `es` (nunca recurre a `en`); el diccionario queda exportado para una futura integración, sin selector, detección ni persistencia de idioma.
- Se localizaron las cadenas permitidas en `Home.js`, `RulesModal.js`, `CheatSheetModal.js` y el título de `EventLog.js`. Se conservaron las negritas, los colores y las etiquetas de roles/acciones de las reglas. El crédito de portada conserva el enlace al nombre propio y toma su prefijo del diccionario.
- Se fijó `lang="es"`, y se tradujeron título, metadatos sociales/búsqueda y texto `<noscript>` en `coup-client/public/index.html`; también se localizaron `short_name` y `name` de la PWA.
- Se tradujeron los nodos de texto visibles de `coup-client/src/assets/CheatSheet.svg`. El efecto del Golpe/Asesinato se compactó a «Elige quién pierde 1 influencia» para ajustarse a la columna del recurso.

## Validación y límites

- JSON válido; `es` y `en` tienen 181 claves idénticas y todos sus marcadores dinámicos coinciden.
- El helper selecciona explícitamente `es`; su fallback no consulta el mapa inglés.
- `git diff --check`: sin errores.
- `npm ci` completó con `coup-client/package-lock.json`; después, `npm run build` compiló producción correctamente. CRA reportó avisos ESLint preexistentes en `src/App.js` (imports sin uso) y `src/components/game/Coup.js` (`ReactModal` sin uso); ambas rutas están fuera de esta tanda y no se editaron.
- No se añadieron ni ejecutaron tests. No se hizo recorrido manual de una partida; esta evidencia cubre solo la tanda aislada, no el criterio de cierre F2.
- Permanecen fuera de esta tanda y sin modificar las rutas aún reservadas por #14: componentes de creación/unión y decisiones, `Coup.js`, `PlayerBoard.js` y servidor. El panel `ReferencePanel.js`/`.css` tampoco se tocó porque se liberó durante esta revisión. Siguen pendientes las conexiones del diccionario en rutas reservadas, la carga de ilustraciones españolas de personaje y los mensajes ingleses de `g-addLog`. F3 sigue bloqueada por #14; las brechas de accesibilidad registradas en F1 no se rediseñaron.
- Durante la revisión de esta tanda, el Orquestador informó que PR #20 de #18 se fusionó como `64a507d`, liberando `ReferencePanel.js`/`.css`; la issue #18 se cerró el 2026-09-27T02:37:50Z. No se sincronizó `origin/master` ni se tocaron esos archivos. La siguiente tanda sincronizará antes de editarlos; `Coup.js` permanece reservado por #14.
- La tanda no satisface todavía la aceptación global de español en lobby, decisiones, tablero y registro; no debe tratarse como cobertura final ni como cierre de F2.
