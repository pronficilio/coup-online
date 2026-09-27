# Reporte F4 — cobertura final y revisión independiente

**Estado de fase:** `BLOCKED` mientras se espera la inspección visual humana de la corrección y el nuevo veredicto independiente. La segunda revisión FINAL devolvió `FAIL` en AC2/AC4/AC7 por píxeles de `CHALLENGE` fuera de la máscara; el recubrimiento se amplió solo en esa clase. Este documento no emite PASS general ni aceptación.
**Base sincronizada:** `origin/master@be93e97`, que incorpora PR #31/#29 y llega después del merge de PR #22 `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c` y PR #30/#21. El worktree canónico avanzó mediante fast-forward a `3313d42` y merge `318c119` desde `ca16e42`.
**Estado de fases:** F1 `CLOSED`; F2/F3 `ACTIVE`; F4 `BLOCKED` hasta inspección visual y nuevo veredicto. Issue #19 permanece `OPEN`; PR #22 está `MERGED` y PR de continuación #33 está `DRAFT`.

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

El usuario posteriormente elogió los botones en español y aprobó continuar. No especificó navegador, dispositivo, ancho de pantalla, inspección individual de `Desafiar`, fugas inglesas, hover/foco ni comportamiento de selección; su aprobación no sustituye esta inspección focalizada.

## Revisión FINAL independiente de la corrección (2026-09-27)

El Verifier revisó en solo lectura el commit `0c913d859f079ce895b3ea351b751725ece8119c`; no ejecutó tests ni build. Veredicto general: `BLOCKED` hasta revisar la UI en navegador.

| Criterio | Resultado | Evidencia / pendiente |
|---|---|---|
| AC1 — inventario | `PASS` | Addendum registra las cinco familias usadas, sus dos variantes, claves y traducciones; `claim` se excluye como recurso no usado. |
| AC2 — interfaz en español | `BLOCKED` | El código conecta las cinco opciones al diccionario; falta confirmar visualmente texto, recorte y bleed. |
| AC3 — diccionario | `PASS` | 307 claves `es` y 307 `en`, sin ausencias ni diferencias de marcadores nombrados. |
| AC4 — recursos visibles | `BLOCKED` | Diez WebP conservan lettering inglés bajo overlays; falta validar el render en ambos estados y anchos. |
| AC5 — español predeterminado | `PASS` | `DEFAULT_LANGUAGE='es'`; no se halló selector, persistencia ni detección de idioma. |
| AC6 — protocolo/acciones | `PASS` estático | `submitChoice`, `g-submitDecision`, envelope y `g-addLog` string permanecen intactos. |
| AC7 — recorrido | `BLOCKED` | El recorrido previo del usuario antecede a la corrección; hace falta el recorrido focalizado descrito abajo. |

El Verifier inspeccionó los diez WebP normales/activos y las cajas CSS; parecen cubrir el lettering, pero `white-space:nowrap` y `overflow:hidden` pueden recortar la etiqueta larga en un viewport estrecho. No se declara que el render esté aceptado sin ojos humanos.

## Segunda revisión FINAL y corrección de `Desafiar` (2026-09-27)

El Verifier revisó el commit `3c9a3af7ec80d32d88a74521be1d4d8c2ad15edc` y devolvió `FAIL` en AC2/AC4/AC7. En `c.webp` y `c-active.webp` (512×171), el texto fuente `CHALLENGE` ocupa aproximadamente x=201–399 (39.3–77.9%). La máscara entonces cubría x=40–77% (204.8–394.24 px), dejando parte de la `C` a la izquierda y de la `E` a la derecha. AC1/AC3/AC5/AC6 pasaron.

Se amplió únicamente `.ResponseImageButton__art--challenge` a x=38–80%. En 512 px, la caja queda en x=194.56–409.6 px: ~6.4 px antes del lettering y ~10.6 px después. La inspección estática del arte normal/activo muestra que el inicio de la caja queda en el espacio entre espada y texto y no llega al marco. A 216 px, las mismas proporciones dejan ~2.7/4.5 px alrededor del lettering. El ajuste no cambia fuente, tamaño ni variables CSS de `pass`, `blockAssassination`, `blockForeignAid` o `blockSteal`; el estilo más pequeño de Ayuda extranjera sigue igual. `npm run build` terminó con exit 0; conservó avisos existentes de imports sin uso en `App.js`, `caniuse-lite` desactualizado y `postcss-calc` incapaz de calcular unidades `dvh` en `ReferencePanel.css`. `git diff --check` pasó y el JSONL parsea. Sin navegador local no se certifica el render: hace falta la inspección focalizada y otra revisión independiente del commit corregido.

## Revisión humana solicitada sobre la corrección

- Commit exacto servido en la revisión anterior (histórico): `0c913d859f079ce895b3ea351b751725ece8119c`, con el producto de `8d55413` y la sincronización de `master`. Nuevo checkpoint publicado: `c9d62676ffa33a177a0edced26dfc91e2529365c`; se releen #19 `OPEN` y PR #33 `OPEN`/`DRAFT`, ambas con cuerpos actualizados. La inspección humana focalizada y la revisión independiente deben apuntar a este SHA; no reutilizar sesiones/resultados previos como evidencia del overlay 38–80%.
- Cliente CRA: [http://127.0.0.1:3011/](http://127.0.0.1:3011/), bind local confirmado; `GET /` devuelve HTTP 200.
- Backend de desarrollo del mismo worktree: `http://127.0.0.1:8002`, bind local confirmado; `/exists/human-review` responde `{"exists":false}` antes de crear la sala.
- El Verifier mantiene ambos procesos en ejecución mientras espera la respuesta. Al terminar la revisión, avisar en la conversación y el Verifier los detendrá.

Pasos solicitados:

1. Abrir la URL del cliente en dos pestañas/ventanas. En A, crear sala; en B, unirse con nombre y código, marcar `Listo` e iniciar la partida.
2. Elegir `Ayuda extranjera` y revisar en B `Bloquear Ayuda extranjera`; comprobar el rótulo normal y con hover o foco de teclado.
3. Elegir `Robar` y revisar `Bloquear robo` en la respuesta del otro jugador, también normal y con hover/foco.
4. Reunir al menos tres monedas y elegir `Asesinar`; revisar `Bloquear asesinato` en la respuesta normal y con hover/foco.
5. Elegir una acción reclamable como `Impuesto`; en la respuesta revisar `Desafiar` y `Pasar`, cada uno normal y con hover/foco. Confirmar que no queden trazos de `CHALLENGE` en los dos extremos y que `Desafiar` no se recorte.
6. Repetir la inspección en un ancho de escritorio y en un ancho estrecho cercano a móvil. Confirmar si alguna etiqueta deja ver inglés, se recorta, se superpone al icono/marco o si una selección no conserva su acción. Revisar el nuevo límite x=38–80% de `Desafiar` y el tamaño/recorte de `Bloquear Ayuda extranjera` en móvil; confirmar que los otros labels mantienen su ajuste.

Informar navegador/dispositivo, anchos aproximados y resultado concreto de cada rótulo. Esta inspección nueva es necesaria: el recorrido general reportado antes de la corrección no valida estos botones. El Verifier confirmó cliente HTTP 200 y backend de desarrollo en loopback. El checkpoint FINAL queda `BLOCKED` hasta recibir esta respuesta y volver a revisar el commit actualizado; la fase F4 permanece `BLOCKED`.

## Resultado y siguiente acción

El Verifier independiente informó que cinco familias de botones visibles aún mostraban palabras inglesas: `ba` (BLOCK ASSASSINATION), `bfa` (BLOCK FOREIGN AID), `bs` (BLOCK STEAL), `c` (CHALLENGE) y `pass` (PASS), incluidas variantes normales y activas. En el primer checkpoint recibió AC1/AC2/AC4/AC7 `FAIL`; AC3/AC5/AC6 `PASS`. Después la segunda revisión de `3c9a3af` falló AC2/AC4/AC7 por leakage en `CHALLENGE`. La máscara corregida está en este commit; build/diff-check y una inspección humana siguen pendientes. `claim.webp` y `claim-active.webp` contienen `CLAIM`, pero no están importadas ni referenciadas por la aplicación y no se usan en esta UI.

La fase F4 está `BLOCKED` a la espera de la inspección focalizada; la issue #19 `OPEN`; la unidad queda `WAITING_ORCHESTRATOR` para coordinar el recorrido y revisión del commit nuevo. La PR de continuación #33 está `DRAFT`. El Verifier mantiene la URL y servicios del mismo worktree/commit activos hasta recibir la observación; después repite el veredicto FINAL. El Alquimista no reclama ni emite PASS por sí mismo.

El usuario autorizó la integración parcial; PR #22 se fusionó en `master` con `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. Ese merge no acepta el resultado, no marca F4 cerrada, no equivale al veredicto FINAL y no cierra #19. La issue sigue `OPEN`.

La API confirmó que issue #19 sigue `OPEN`/asignada a `pronficilio`, PR #22 está `MERGED` y PR #33 permanece `DRAFT`. El último veredicto sobre `3c9a3af` fue `FAIL` en AC2/AC4/AC7 y AC1/AC3/AC5/AC6 `PASS`; la corrección 38–80% necesita inspección en el render y nuevo veredicto.
