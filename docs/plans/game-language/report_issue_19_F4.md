# Reporte F4 — cobertura final y revisión independiente

**Estado:** `ACTIVE`; el Verifier independiente reportó `FAIL` en AC1/AC2/AC4/AC7 y `PASS` en AC3/AC5/AC6 por texto inglés incrustado en cinco familias de botones. La corrección está en curso y requiere revisión FINAL nueva. Este documento no emite PASS general ni aceptación.
**Base sincronizada:** `origin/master@be93e97`, que incorpora PR #31/#29 y llega después del merge de PR #22 `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c` y PR #30/#21. El worktree canónico avanzó mediante fast-forward a `3313d42` y merge `318c119` desde `ca16e42`.
**Estado de fases:** F1 `CLOSED`; F2/F3 `ACTIVE`; F4 `ACTIVE`, pendiente del Verifier FINAL. Issue #19 permanece `OPEN`; PR #22 está `MERGED`.

## Alcance requerido

F4 debe revisar la correspondencia inventario→diccionario/interfaz, confirmar claves y marcadores, el build y el alcance que llegó después de PR #22. El usuario informó que recorrió portada, lobby y una partida completa y que todo se ve en orden; esa es una declaración del usuario, no una observación del Alquimista. Después de la corrección de las etiquetas incrustadas se requiere Verifier FINAL independiente con `PASS`, `FAIL` o `BLOCKED`. No se cierra F4 sin cobertura, recorrido y veredicto independiente.

## Comprobación anterior del entorno

- Se comprobó `PATH` para `chromium`, `chromium-browser`, `google-chrome`, `google-chrome-stable`, `chrome` y `firefox`; ninguno resolvió a un ejecutable.
- `coup-client/package.json` contiene scripts `start`, `start-pc`, `build`, `test` y `eject`; no declara Playwright, Puppeteer ni WebDriver en dependencias.
- No se encontró navegador disponible por otra herramienta local de esta sesión. No se inició el juego ni se observó/renderizó ninguna pantalla, decisión o mensaje de registro.
- No se instalaron dependencias para simular el entorno. No se añadieron ni ejecutaron tests.

En esa comprobación el Alquimista no pudo hacer su propio recorrido ni producir evidencia visual. El usuario posteriormente informó que sí completó la revisión manual indicada a continuación. El informe del usuario no incluye evidencias visuales ni datos del navegador/dispositivo; el Verifier independiente debe evaluar si basta para los criterios.

## Recorrido informado por el usuario (2026-09-27)

El usuario informó que recorrió portada, lobby y una partida completa y que ve todo en orden. Ese es el único detalle reportado. No se añadieron navegador, dispositivo, pasos específicos, capturas ni hallazgos que el usuario no haya mencionado. Se registra como informe del usuario, no como observación propia o independiente.

## Resultado y siguiente acción

El Verifier independiente informó que cinco familias de botones visibles aún mostraban palabras inglesas: `ba` (BLOCK ASSASSINATION), `bfa` (BLOCK FOREIGN AID), `bs` (BLOCK STEAL), `c` (CHALLENGE) y `pass` (PASS), incluidas variantes normales y activas. Resultado recibido: AC1/AC2/AC4/AC7 `FAIL`; AC3/AC5/AC6 `PASS`. La tanda actual cubre los rótulos con etiquetas españolas conectadas al diccionario y el build terminó exit 0; falta una revisión visual/independiente posterior. `claim.webp` y `claim-active.webp` contienen `CLAIM`, pero no están importadas ni referenciadas por la aplicación y no se usan en esta UI.

F4 queda `ACTIVE` y la issue #19 `OPEN`. Entregar al siguiente Verifier `translation_inventory.md`, el plan y criterios AC1–AC7, reportes F2/F3, este reporte, el diff consolidado y el informe de recorrido del usuario sin añadir detalles no comunicados. El Verifier debe inspeccionar inglés visible/accesible, ausencia de selector/ruta a `en`, paridad de claves/marcadores y preservación de valores/protocolos; puede pedir pasos/evidencia adicionales si el informe breve no basta. El Alquimista no reclama ni emite PASS por sí mismo.

El usuario autorizó la integración parcial; PR #22 se fusionó en `master` con `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. Ese merge no acepta el resultado, no marca F4 cerrada, no equivale al veredicto FINAL y no cierra #19. La issue sigue `OPEN`.

La API confirmó después del merge que issue #19 sigue `OPEN`/asignada a `pronficilio`, y PR #22 está `MERGED`/cerrada en `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. F4 sigue `ACTIVE`; el último resultado independiente es `FAIL` en AC1/AC2/AC4/AC7 y no hay PASS general.
