# Reporte F1 — ampliar una influencia propia

- **Issue:** [#61](https://github.com/pronficilio/coup-online/issues/61)
- **Branch / worktree:** `issue/61-own-card-zoom` / `.worktrees/issue-61-own-card-zoom`
- **Veredicto F1:** `PASS` — build y aprobación visual del propietario
- **Fecha:** 2026-09-29

## Resultado de implementación

Las influencias propias activas se renderizan como botones accesibles. El modal usa `react-modal` en un portal a `document.body`, mide el rectángulo visible de origen y centra la carta con su proporción de asset de 840:1220. La apertura dura 220 ms, el regreso al origen 170 ms y los cierres por cambio de partida o pérdida del origen se desvanecen en 120 ms. `prefers-reduced-motion` quita traslación y escala.

El control de cierre, Escape y el fondo llaman al mismo cierre inverso; ReactModal mantiene el foco dentro. Al cerrar, el foco vuelve al botón de origen o al contenedor del tablero si el botón salió del DOM. Un `sessionId` y guardas de ciclo de vida descartan cierres obsoletos en secuencias rápidas. Durante una interrupción, el overlay deja pasar clics para que el rail de decisión quede disponible.

`Coup.js` deshabilita y cierra la ampliación ante pausa, espera de pausa, cualquier decisión o fin de partida. `PlayerBoard` valida que el botón de origen siga conectado y conserve la identidad propia activa; el modal también observa la eliminación del nodo durante la apertura. Solo el camino de influencias propias crea botones y datos de personaje. Las cartas rivales ocultas conservan la representación existente de reverso y no se pasan al componente modal. No se modificaron reglas, servidor ni protocolo.

Se añadieron etiquetas de ampliación, cierre y nombre de carta a los diccionarios español e inglés. El selector de idioma no existe en la implementación actual de i18n, que usa español como idioma predeterminado; esta fase no añadió un selector.

## Ajuste solicitado en revisión visual

El propietario reportó que el modal se veía demasiado grande, que su altura parecía crecer de golpe y que no siempre se alcanzaba a ver la carta completa. Solicitó limitar primero la altura visible y derivar el ancho conservando la proporción, con un tope adicional para pantallas estrechas.

- Los assets de personaje fueron inspeccionados: todos miden `840 × 1220`.
- El destino del modal limita la altura a `80dvh` como máximo y conserva un margen mínimo según el viewport; el ancho se calcula desde esa altura y la proporción `840:1220`, limitado solo por el ancho disponible.
- La transformación FLIP de apertura y retorno usa las mismas dimensiones destino del modal. Se mantienen los tiempos rápidos de `220 ms` al abrir y `170 ms` al volver al tablero.
- `cd coup-client && npm run build`: **exit 0** después del ajuste. Solo aparecen las advertencias ya registradas de imports sin uso en `App.js`, parseo de `dvh` en `ReferencePanel.css` y `caniuse-lite` desactualizado.
- El preview está disponible en `http://localhost:4061`; se confirmó HTTP 200 en la página y el bundle de desarrollo. El nuevo visto bueno visual del propietario sigue pendiente.

En la revisión siguiente, el propietario confirmó que la imagen aún se recortaba. La inspección del contenido de `react-modal` mostró que sus estilos inline de posición, insets, padding y overflow podían dejar una caja más grande que la imagen. Se corrigió el sizing para que:

- `style.content` sobrescriba explícitamente esos valores, quite los insets y padding, y use `fit-content` para ancho y alto.
- La altura de `<img>` sea la dimensión objetivo calculada desde el viewport (`80dvh` como tope, con margen seguro); su ancho queda en `auto` y respeta el ratio intrínseco, limitado además por el ancho disponible y `390px`.
- La transformación FLIP de apertura y cierre use el mismo ancho derivado y la altura exacta aplicada a la imagen.

La compilación posterior a esta corrección también terminó con **exit 0** y las mismas advertencias preexistentes. El Orquestador reinició por completo el servidor CRA desde el worktree dedicado con `PORT=4061` y `REACT_APP_BACKEND_URL=http://localhost:18000`; CRA reportó `webpack compiled successfully`. Después del reinicio, `http://localhost:4061/` y `/static/js/bundle.js` respondieron HTTP 200, y `/exists/probe` del backend respondió HTTP 200. Se confirmó que el bundle servido incluye `width: auto` y el límite `80dvh`. Sigue pendiente el nuevo visto bueno visual del propietario.

En la siguiente revisión, el propietario notó que la carta ocupaba cerca de la mitad de la pantalla en alto. La causa fue el tope fijo de ancho `390px`: con el ratio `840:1220`, ese ancho limitaba la altura a unos `567px` incluso en pantallas más altas. Se quitó el máximo fijo; ahora la altura del asset manda y el ancho solo se reduce cuando la ventana es estrecha. El build terminó con **exit 0**, se reinició CRA y el preview volvió a compilar correctamente en `4061`.

## Validación alcanzable

- `cd coup-client && npm run build`: **exit 0**, compilación de producción lista.
- El build mantiene advertencias existentes: `App.js` importa `logo` y `Link` sin usarlos; `ReferencePanel.css` genera dos avisos de parseo de `dvh` en `postcss-calc`; `caniuse-lite` está desactualizado. No quedaron warnings nuevos en `PlayerBoard.js` tras corregir el fallback estable de `players`.
- `git diff --check`: **PASS**.
- `translations.json`: JSON válido; las tres claves nuevas existen en `es` y `en`.
- Revisión estática de privacidad, integración de pausa/decisión, rectángulos/tiempos, foco y movimiento reducido: **PASS por inspección de código**, sin afirmar comportamiento dinámico.
- No se agregaron ni ejecutaron pruebas automatizadas.

## Aprobación visual del propietario

Después de revisar el preview corregido, el propietario respondió «se ve muy bien, queda!» y pidió merge a `master`. Esta confirmación aprueba el resultado visual solicitado: mostrar la carta entera, en vertical y a un tamaño legible. No se recibieron datos de viewport/dispositivo ni un registro separado de teclado, toque, movimiento reducido o coordinación dinámica con decisión/pausa; esos casos no se presentan como walkthrough observado. El código conserva sus cierres, foco y preferencias según la revisión estática, y el build de cliente pasó sobre la base actual.

La aprobación visual del propietario desbloquea la integración solicitada. La rama se sincronizó con `origin/master@e63c427`; durante la sincronización se resolvió la única divergencia en el índice `README_plans.md` preservando las entradas de ambas ramas.

## Respuesta a la falsificación

La inspección del código confirma que solo una influencia propia activa expone el control y que se solicita el cierre cuando llega una decisión, pausa o invalidación del origen. La revisión del propietario confirmó que la carta completa ya es visible y legible; no se atribuye observación dinámica a las secuencias de foco, teclado/touch o pausa/decisión que no quedaron registradas.

## Integración

La PR [#68](https://github.com/pronficilio/coup-online/pull/68) quedó integrada en `master` el 2026-09-29 mediante `cf9342b95b24ec5f6f390571b2fb2d62973d99be`. GitHub cerró la issue #61. El handoff final está en `docs/plans/completed/issue_61_own_card_zoom.md`.
