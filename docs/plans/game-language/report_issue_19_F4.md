# Reporte F4 — cobertura final y revisión independiente

**Estado:** `ACTIVE`; el Verifier independiente reportó `FAIL` en AC1/AC2/AC4/AC7 y `PASS` en AC3/AC5/AC6 por texto inglés incrustado en cinco familias de botones. La corrección está en curso y requiere revisión FINAL nueva. Este documento no emite PASS general ni aceptación.
**Base sincronizada:** `origin/master@be93e97`, que incorpora PR #31/#29 y llega después del merge de PR #22 `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c` y PR #30/#21. El worktree canónico avanzó mediante fast-forward a `3313d42` y merge `318c119` desde `ca16e42`.
**Estado de fases:** F1 `CLOSED`; F2/F3 `ACTIVE`; F4 `ACTIVE`, pendiente del Verifier FINAL. Issue #19 permanece `OPEN`; PR #22 está `MERGED` y PR de continuación #33 está `DRAFT`.

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

## Revisión humana solicitada sobre la corrección

- Commit exacto servido: `0c913d859f079ce895b3ea351b751725ece8119c`, con el producto de `8d55413` y la sincronización actual de `master`.
- Cliente CRA: [http://127.0.0.1:3011/](http://127.0.0.1:3011/), bind local confirmado; `GET /` devuelve HTTP 200.
- Backend de desarrollo del mismo worktree: `http://127.0.0.1:8002`, bind local confirmado; `/exists/human-review` responde `{"exists":false}` antes de crear la sala.
- El Verifier mantiene ambos procesos en ejecución mientras espera la respuesta. Al terminar la revisión, avisar en la conversación y el Verifier los detendrá.

Pasos solicitados:

1. Abrir la URL del cliente en dos pestañas/ventanas. En A, crear sala; en B, unirse con nombre y código, marcar `Listo` e iniciar la partida.
2. Elegir `Ayuda extranjera` y revisar en B `Bloquear Ayuda extranjera`; comprobar el rótulo normal y con hover o foco de teclado.
3. Elegir `Robar` y revisar `Bloquear robo` en la respuesta del otro jugador, también normal y con hover/foco.
4. Reunir al menos tres monedas y elegir `Asesinar`; revisar `Bloquear asesinato` en la respuesta normal y con hover/foco.
5. Elegir una acción reclamable como `Impuesto`; en la respuesta revisar `Desafiar` y `Pasar`, cada uno normal y con hover/foco.
6. Repetir la inspección en un ancho de escritorio y en un ancho estrecho cercano a móvil. Confirmar si alguna etiqueta deja ver inglés, se recorta, se superpone al icono/marco o si una selección no conserva su acción.

Informar navegador/dispositivo, anchos aproximados y resultado concreto de cada rótulo. Esta inspección nueva es necesaria: el recorrido general reportado antes de la corrección no valida estos botones. El Verifier confirmó cliente HTTP 200 y backend de desarrollo en loopback. El checkpoint FINAL actual queda `BLOCKED` hasta recibir esta respuesta; la fase F4 permanece `ACTIVE`.

## Resultado y siguiente acción

El Verifier independiente informó que cinco familias de botones visibles aún mostraban palabras inglesas: `ba` (BLOCK ASSASSINATION), `bfa` (BLOCK FOREIGN AID), `bs` (BLOCK STEAL), `c` (CHALLENGE) y `pass` (PASS), incluidas variantes normales y activas. Resultado recibido: AC1/AC2/AC4/AC7 `FAIL`; AC3/AC5/AC6 `PASS`. La tanda actual cubre los rótulos con etiquetas españolas conectadas al diccionario y el build terminó exit 0; falta una revisión visual/independiente posterior. `claim.webp` y `claim-active.webp` contienen `CLAIM`, pero no están importadas ni referenciadas por la aplicación y no se usan en esta UI.

F4 queda `ACTIVE` y la issue #19 `OPEN`. La PR de continuación #33 está `DRAFT` mientras el Verifier prepara la revisión visual humana. Entregarle `translation_inventory.md`, el plan y criterios AC1–AC7, reportes F2/F3, este reporte, el diff consolidado y el informe del recorrido previo del usuario, indicando que antecede a la corrección. El Verifier debe inspeccionar inglés visible/accesible, ausencia de selector/ruta a `en`, paridad de claves/marcadores y preservación de valores/protocolos. El Alquimista no reclama ni emite PASS por sí mismo.

El usuario autorizó la integración parcial; PR #22 se fusionó en `master` con `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. Ese merge no acepta el resultado, no marca F4 cerrada, no equivale al veredicto FINAL y no cierra #19. La issue sigue `OPEN`.

La API confirmó después del merge que issue #19 sigue `OPEN`/asignada a `pronficilio`, y PR #22 está `MERGED`/cerrada en `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. F4 sigue `ACTIVE`; el último resultado independiente es `FAIL` en AC1/AC2/AC4/AC7 y no hay PASS general.
