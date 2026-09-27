# Reporte F4 — cobertura final y revisión independiente

**Estado final de fase:** `CLOSED`. Verifier FINAL `PASS` sobre el merge integrado de PR #33, `45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe`; AC1–AC7 `PASS`. El usuario, tras completar el checklist, respondió exactamente «he probado y todo luce en orden, sugiero comenzar con el cierre del issue 19». El Verifier acepta este informe para AC7. No se infieren navegador, dispositivo ni anchos exactos, que no fueron indicados.
**Estado de unidad:** F1–F4 `CLOSED`; `WAITING_ORCHESTRATOR`. PR #33 está `MERGED`; la PR documental [#38](https://github.com/pronficilio/coup-online/pull/38) está abierta para revisión. Issue #19 permanece `OPEN` hasta integrarla y que Orquestación cierre la unidad.
**Árbol integrado:** `translations.json` contiene 292 claves `es` y 292 `en`; el Verifier confirmó paridad. La rama anterior al merge (`1b65425`) tenía 307/307; se preservan ambos conteos vinculados a sus árboles, sin inferir por qué difieren. El build del producto ya registrado terminó con exit 0. No se ejecutaron tests.
**Base sincronizada:** `origin/master@be93e97`, que incorpora PR #31/#29 y llega después del merge de PR #22 `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c` y PR #30/#21. El worktree canónico avanzó mediante fast-forward a `3313d42` y merge `318c119` desde `ca16e42`.
**Estado de fases en el checkpoint inicial de este reporte (histórico):** F1 `CLOSED`; F2/F3 `ACTIVE`; F4 `BLOCKED`. Ese estado fue reemplazado por el cierre final documentado arriba.

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

- Commit exacto servido en la revisión anterior (histórico): `0c913d859f079ce895b3ea351b751725ece8119c`, con el producto de `8d55413` y la sincronización de `master`. El producto corregido está en `c9d62676ffa33a177a0edced26dfc91e2529365c`; el HEAD documental durante el Verifier fue `cbfaee5fa527994e186a2b9116815da7bcd13d34`. El Verifier ya revisó ese producto y dejó AC7 `BLOCKED`; la inspección humana debe asociarse al SHA de producto `c9d6267`. Comprobar que la URL local actual sirve esa versión antes del recorrido.
- Cliente CRA: [http://127.0.0.1:3011/](http://127.0.0.1:3011/), bind local confirmado; `GET /` devuelve HTTP 200.
- Backend de desarrollo del mismo worktree: `http://127.0.0.1:8002`, bind local confirmado; `/exists/human-review` responde `{"exists":false}` antes de crear la sala.
- La comprobación anterior registró cliente y backend ligados a loopback. Antes del recorrido, confirmar que los servicios siguen disponibles y corresponden al producto `c9d6267`; no se asume que procesos de la revisión anterior continúen activos.

## Verifier FINAL previo a la respuesta humana general (2026-09-27)

Checkpoint de producto: `c9d62676ffa33a177a0edced26dfc91e2529365c`. En la revisión el HEAD de la rama era `cbfaee5fa527994e186a2b9116815da7bcd13d34`, un commit posterior solo documental/bitácora. El Verifier no ejecutó tests/build ni observó la aplicación en navegador.

| Criterio | Resultado | Evidencia / pendiente |
|---|---|---|
| AC1 — inventario | `PASS` | Las cinco familias en uso y variantes normal/activa están inventariadas; `claim` no se usa. |
| AC2 — interfaz en español | `PASS estático` | Etiquetas usan el diccionario; el render requiere confirmación humana. |
| AC3 — diccionario | `PASS` | 307 claves por idioma con marcadores paralelos; no cambió en esta corrección. |
| AC4 — recursos visibles | `PASS estático` | En ambas imágenes de 512×171, `CHALLENGE` ocupa x≈201–399; la máscara 38–80% cubre x=194.56–409.6, con margen ~6.4/10.6 px y sin alcanzar espada/marco según la inspección del arte. |
| AC5 — español predeterminado | `PASS` | `DEFAULT_LANGUAGE` permanece `es`; no se añadió selector. |
| AC6 — protocolo/acciones | `PASS estático` | El cambio de producto desde la revisión previa es CSS; evento, payload y handlers no cambiaron. |
| AC7 — recorrido | `BLOCKED` | Falta observación humana en estado normal/activo, escritorio/ancho estrecho y conservación de acciones. |

Resultado de ese checkpoint global `BLOCKED`. La respuesta humana y su evaluación actual quedan registradas a continuación.

## Respuesta humana general y evaluación provisional (histórico, 2026-09-27)

El usuario respondió exactamente: «se ve bien». El Verifier acepta esa respuesta como aprobación visual general para AC2 (interfaz en español) y AC4 (recursos visibles). No se infieren navegador, dispositivo, ancho, qué botón/estado se vio ni pasos de selección.

Estado evaluado por el Verifier: AC1/AC3/AC5/AC6 `PASS`; AC2/AC4 `PASS` por aprobación visual general; AC7 `BLOCKED`. La respuesta no confirma si las selecciones conservaron su acción ni qué se vio en escritorio y ancho estrecho respecto a inglés restante, recorte o contacto con icono/marco. Por ello el resultado global permanece `BLOCKED`; no hay PASS ni cierre de F4.

Pasos solicitados:

1. Abrir la URL del cliente en dos pestañas/ventanas. En A, crear sala; en B, unirse con nombre y código, marcar `Listo` e iniciar la partida.
2. Elegir `Ayuda extranjera` y revisar en B `Bloquear Ayuda extranjera`; comprobar el rótulo normal y con hover o foco de teclado.
3. Elegir `Robar` y revisar `Bloquear robo` en la respuesta del otro jugador, también normal y con hover/foco.
4. Reunir al menos tres monedas y elegir `Asesinar`; revisar `Bloquear asesinato` en la respuesta normal y con hover/foco.
5. Elegir una acción reclamable como `Impuesto`; en la respuesta revisar `Desafiar` y `Pasar`, cada uno normal y con hover/foco. Confirmar que no queden trazos de `CHALLENGE` en los dos extremos y que `Desafiar` no se recorte.
6. Repetir la inspección en un ancho de escritorio y en un ancho estrecho cercano a móvil. Confirmar si alguna etiqueta deja ver inglés, se recorta, se superpone al icono/marco o si una selección no conserva su acción. Revisar el nuevo límite x=38–80% de `Desafiar` y el tamaño/recorte de `Bloquear Ayuda extranjera` en móvil; confirmar que los otros labels mantienen su ajuste.

Para desbloquear AC7, falta confirmar: (1) si las selecciones conservaron sus acciones, y (2) qué se observó en escritorio y ancho estrecho sobre texto inglés visible, recorte y contacto con icono/marco. No hace falta agregar navegador, dispositivo o anchos numéricos si el usuario no desea reportarlos. El Verifier acepta «se ve bien» para AC2/AC4, pero la fase F4 permanece `BLOCKED` hasta recibir los datos faltantes y reevaluar AC7.

## Resultado provisional anterior (histórico; superado por el PASS final)

El Verifier independiente encontró cinco familias de botones visibles con palabras inglesas incrustadas y después detectó fuga en `CHALLENGE` bajo la máscara 40–77%. La corrección CSS x=38–80% quedó en `c9d6267`; build exit 0 con avisos existentes y diff-check limpio. Con la respuesta «se ve bien», el Verifier acepta AC2/AC4; AC1/AC3/AC5/AC6 `PASS`; AC7 `BLOCKED` hasta confirmar acciones y detalles de escritorio/ancho estrecho. `claim.webp` y `claim-active.webp` contienen `CLAIM`, pero no están importadas ni referenciadas por la aplicación y no se usan en esta UI.

En ese checkpoint la fase F4 estaba `BLOCKED`, issue #19 `OPEN`, unidad `WAITING_USER`, y PR #33 `DRAFT`. El siguiente evento de aceptación se registra en la sección final añadida abajo.

El usuario autorizó la integración parcial; PR #22 se fusionó en `master` con `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. Ese merge no acepta el resultado, no marca F4 cerrada, no equivale al veredicto FINAL y no cierra #19. La issue sigue `OPEN`.

En ese checkpoint la API confirmó #19 `OPEN`, PR #22 `MERGED` y PR #33 `DRAFT`. El bloqueo de AC7 fue superado por el checklist posterior del usuario y el PASS FINAL sobre el merge integrado de PR #33.

## Veredicto final tras merge e informe del usuario (2026-09-27)

PR #33 se integró en `master` mediante `45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe`. El Verifier FINAL confirmó `PASS` para AC1–AC7 en el árbol integrado. Tras completar el checklist, el usuario informó: «he probado y todo luce en orden, sugiero comenzar con el cierre del issue 19». El Verifier acepta este informe como evidencia de AC7; no se atribuyen datos de navegador, dispositivo, secuencia de pasos ni anchos exactos.

El árbol integrado presenta 292/292 claves `es`/`en` con paridad confirmada. La rama previa al merge (`1b65425`) registraba 307/307; no se infiere la causa de la diferencia. El build registrado previamente dio exit 0; no se ejecutaron tests.

**Cierre:** F4 `CLOSED`; junto con ella F1–F3 `CLOSED`. Unidad `WAITING_ORCHESTRATOR`. La PR documental #38 debe integrarse antes de que Orquestación cierre la issue; #19 se mantiene `OPEN` hasta entonces.
