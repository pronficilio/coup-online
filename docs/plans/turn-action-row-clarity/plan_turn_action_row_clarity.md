# Plan: hacer claras las acciones del turno — issue #24

**Estado:** `ACTIVE`; F1 `CLOSED / PASS`; F2 `ACTIVE`; último recheck F3 `BLOCKED` hasta observar una acción con destino legal resolver exactamente una vez. El primer F3 `FAIL` por doble montaje se corrigió.
**Issue:** https://github.com/pronficilio/coup-online/issues/24
**Handoff activo:** `docs/plans/active/issue_24_turn_action_row_clarity.md`
**Bitácora:** `docs/plans/log/issue-24.jsonl`
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
**Rama / worktree / integración única:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity` / una PR a `master` de `pronficilio/coup-online`.
**Siguiente dueño:** Alquimista rebasea sobre `origin/master@951147234b6f8f640718ed945de5907140a724a9`, preservando los cambios de tablero #28 y el action rail #24. Después de diff-check/build y publicación, un Verifier independiente completa F3 con el único recorrido dinámico pendiente. Se conserva el waiver aceptado de AC9.

## Solicitud y definición de éxito

La persona usuaria quiere que las acciones disponibles durante su turno indiquen claramente dónde hacer clic, con un resalte cálido y opaco en toda la fila. La lista muestra únicamente acciones permitidas por las opciones del servidor; las filas, estilos y ayudas de disabled permanecen en el código para posible reactivación pero no se muestran ahora. Las referencias visuales son `references/a_normal.png`, `references/a_hover.png` y `references/a_dis.png`, copiadas sin cambios desde `fotos/` como contexto histórico.

Éxito significa que cada acción permitida aparece una vez en su propia fila con estados visuales reconocibles; las acciones ausentes de las opciones legales no se renderizan ni ocupan espacio; y elegir o cancelar un destino no envía una decisión antes de tiempo. Al elegir, se envía una sola opción con el `choiceId` entregado por el servidor.

## Hechos, fuentes y dependencias

- El issue #6 está `CLOSED` y la PR #11 integrada. Su panel muestra hoy siete acciones y calcula deshabilitación por saldo insuficiente para Coup/Assassinate y por Coup obligatorio con 10+ monedas.
- El issue #21 sigue abierto, pero su contrato se limita a controles gráficos de respuesta (`Block`, `Challenge`, `Pass`) y excluye explícitamente las acciones principales.
- El issue #14 se cerró tras integrar la PR #23. `Coup.js` ahora monta un renderer genérico para `decision.options`; el viejo `ActionDecision.js` conserva markup y estilos, pero ya no se importa desde `Coup.js`.
- Al preparar F2, #19 seguía abierto tras integrar parcialmente su PR #22 en `5de95ee`; luego se cerró al integrar la PR documental #38 en `64c1b29`. La localización publicada ya incluye las etiquetas y descripciones de las siete acciones y las claves `es`/`en` necesarias. No hay otra PR de producto abierta que reserve el renderer de #24.
- El servidor genera los `choiceId` permitidos para cada decisión. En `actionChoices`, Coup con 10+ monedas es la única opción; por debajo se agrega Coup a partir de 7 monedas y Assassinate a partir de 3. Las opciones con objetivo combinan acción y asiento (por ejemplo `coup:<seat>`). El cliente debe enviar esos IDs exactos; el servidor conserva la autoridad de elegibilidad.
- `g-decision` expone solo opciones legales. `Coup.js` presenta solo acciones con opciones recibidas y localiza la etiqueta desde `choiceId`; el saldo público sirve para verificar los límites en el recorrido manual.
- Las referencias visuales estaban en `fotos/`, fuera del historial versionado. Las tres copias de `references/` preservan la evidencia para el Ejecutor.
- Reglas visibles ya comprobadas en el cliente: Assassinate requiere 3 monedas; Coup requiere 7; con 10 o más monedas solo Coup está permitido. Declarar una influencia no requiere tenerla.
- Base inicial de la reanudación F2: `origin/master@45a3eaa2e6d16aac2ca954bf7c7e60198f0fcdbe`. Sincronización posterior: merge de `origin/master@64c1b295fe9586ea05c4e7dc2a713faec948ec24`, que integra el cierre documental de #19 vía PR #38. El target avanzó después a `origin/master@951147234b6f8f640718ed945de5907140a724a9` con PR #39/#28, con cambios funcionales en tablero y superficies compartidas; rebase #24 pendiente. Target: `master`.

La revisión F1 confirmó que el renderer y los textos requeridos ya están publicados. En ese momento #19 permanecía abierto por validación manual/Verifier; después se cerró al integrar la PR documental #38 en `origin/master@64c1b29`. No reserva archivos de producto que bloqueen #24.

## Criterios de aceptación

1. Nombre, descripción, distintivos, precio y espacio interior de una acción disponible pertenecen a un solo control de fila; clic, teclado y toque producen la misma acción una vez.
2. El estado normal conserva el pergamino y el layout. Hover y foco resaltan toda la fila con fondo ámbar semitransparente, contorno cálido redondeado y transición breve, sin desplazar filas. El divisor independiente se conserva entre acciones permitidas consecutivas, incluso si se omiten acciones intermedias.
3. Solo se renderiza una acción si `decision.options` contiene al menos una opción de esa acción. Las acciones sin opciones no ocupan espacio ni reciben controles, IDs u objetivos; el código de disabled/hints queda preservado sin mostrarse.
4. Se comprueba que las filas permitidas siguen las opciones del servidor en los límites 2/3, 6/7 y 9/10 monedas. Las otras acciones no ganan restricciones nuevas ni el cliente fabrica opciones.
5. Se preservan las declaraciones que pueden ser farol, el flujo de objetivos y cancelación, el cobro del servidor y el protocolo Socket.IO. Coup, Assassinate y Steal abren sus destinos legales; Cancelar regresa al menú sin emitir una decisión; elegir un destino envía una vez su `choiceId` original. Las acciones sin destino envían su opción legal al seleccionarse.
6. Los textos visibles usan el mecanismo de idioma integrado. Las filas permitidas tienen nombre accesible; foco visible, Enter/Espacio y Escape funcionan. Las ayudas disabled/hint ocultas y sus traducciones permanecen para posible reactivación.
7. En escritorio y móvil aparecen las filas permitidas en estado normal y hover/foco, sin filas ni huecos para acciones omitidas. No se muestran hints disabled; se conserva su markup/helper y estilos para reactivarlos luego. El panel no tapa la selección de objetivos ni las respuestas.
8. El rail usa `position: absolute` en un portal a `document.body`. Al empezar la decisión, mide el `.CheatSheet` real con `getBoundingClientRect()` y convierte a coordenadas de documento con scroll; durante scroll conserva esas coordenadas para que resumen y acciones se desplacen juntos con alineación y separación constante. En resize vuelve a medir el ancla equivalente.
9. Cada decisión action inicia expandida. En dispositivos con hover y puntero fino, tras la primera entrada del mouse, salir del panel inicia 500 ms; reentrar cancela el timer. Al vencer, pasa a la mitad del ancho normal; los títulos de fila bajan a 70% del font-size normal y vuelven al 100% al expandir. Precios y controles siguen disponibles. Touch/no-hover no compacta. Timers se limpian al reentrar, cambiar/finalizar la decisión y desmontar. **Excepción aceptada por la usuaria para F2:** los detalles se desmontan sin animación visible de colapso; la usuaria revisó el preview y acepta expresamente esa limitación. Se registra como waiver de la transición visual de desmontaje, no como criterio verificado.
10. Se respeta `prefers-reduced-motion`. El build y el recorrido manual quedan documentados. El Verifier independiente intenta refutar la relación absolute al scroll, el ciclo de compactación, que solo aparezcan opciones legales y que target/cancel/emisión sigan el contrato. No se agregan tests automatizados.

## Alcance y fuera de alcance

**Incluye:** la rama `decision.type === 'action'` del renderer genérico de `Coup.js`, rail document-absolute en portal, ciclo de compactación por mouse, estilos de esa vista, metadatos localizados existentes y evidencia visual/funcional de escritorio y móvil. El contenido disabled/hint permanece en el código, pero por el feedback vigente no se monta.

**Excluye:** reglas o validación server-side, agregar opciones prohibidas al payload, cambios al shape/nombre de eventos Socket.IO, cambios al motor de cobro, rediseño del tablero, controles de respuesta de #21, dependencias nuevas de animación y tests automatizados.

## Fases

### F1 — Verificar el renderer y las dependencias (`CLOSED / PASS`)

**Pregunta:** ¿qué componente integrado posee las filas y la disponibilidad de acciones, y están libres sus textos y estilos para esta unidad?

**Entrada:** #14/PR #23, #19/PR #22, código ya integrado en `origin/master` y contratos actuales.

**Salida:** reporte `docs/plans/turn-action-row-clarity/report_issue_24_F1.md` que confirma `Coup.js` como dueño del renderer genérico, `decision.options` como opciones legales, `choiceId` de acción/destino, saldo disponible y claves bilingües existentes. `ActionDecision.js` no está montado.

**Veredicto:** `CLOSED / PASS`. #14 se cerró tras integrar PR #23; #19 integró parcialmente PR #22 en `origin/master@5de95ee`. El renderer genérico y la localización de acciones ya están en la base. La inspección de `Coup.js`, `server/game/coup.js` y el diccionario confirma que F2 puede trabajar sin modificar reglas o payloads.
**Falsificación intentada:** buscar el import/montaje de `ActionDecision` y rastrear origen de opciones, saldo y etiquetas. El componente viejo no se monta; `Coup.js` dibuja `decision.options`, el servidor genera `choiceId` legales y el cliente localiza esas etiquetas.
**Artefactos:** reporte F1, actualización de este plan, issue y handoff.
**Commit:** `COMMIT_REQUIRED`; `docs(action-rows): issue 24 F1 generic renderer confirmed`.
**Validación:** releer issues/PRs, inspeccionar código integrado y `git diff --check`.

### F2 — Implementar y documentar la fila interactiva (`ACTIVE`, reabierta por F3 FAIL)

**Pregunta:** ¿el renderer comunica dónde activar las acciones legales y mantiene la lista sincronizada con las opciones del servidor?

**Entrada:** F1 `CLOSED / PASS`; branch rebaseado inicialmente sobre `origin/master@45a3eaa` y sincronizado luego mediante merge de `origin/master@64c1b29`; PR #23/#22 releídas.

**Subtareas:** bifurcar solo `decision.type === 'action'`; agrupar opciones por prefijo de `choiceId`; renderizar una fila solo cuando `decision.options` contiene una o más opciones de esa acción; montar CheatSheet + panel en portal a `document.body` y posicionar el rail como `absolute` usando medición del ancla real (`rect + scroll`); conservar coordenadas documentales durante scroll y volver a medir en resize; conservar separadores hermanos entre filas permitidas consecutivas, saltando las omitidas; al elegir Coup, Assassinate o Steal, mostrar destinos legales y Cancelar; al elegir destino, enviar una vez la opción original; las filas/helpers/estilos disabled quedan preservados pero no montados; no emitir al enfocar, abrir destinos o cancelar; aplicar estado visual y descripciones accesibles a las filas permitidas; compactar tras mouseleave de 500 ms solo después de una primera entrada, cancelando el timer al reentrar, desmontando detalles de verdad y restaurándolos al reentrar; excluir touch/no-hover y limpiar timers en todos los cambios de ciclo de vida.

**Áreas previstas:** `coup-client/src/components/game/Coup.js`, estilos del renderer y `coup-client/src/i18n/translations.json` solo si hacen falta claves espejo nuevas. No revivir `ActionDecision.js` ni editar servidor/protocolo.

**Cierre previo:** la usuaria aprobó el preview vigente en `http://localhost:3006` y aceptó expresamente que los detalles se desmontan sin animación/transición visible. Ese waiver de AC9 permanece vigente, pero F2 se reabrió tras el hallazgo de montaje duplicado del Verifier.
**Corrección requerida:** montar el renderer action solo en el portal `ActionDecisionRail`; quitar la llamada duplicada dentro de `DecisionsSection` y dejar allí el botón Codex de emergencia y el renderer de decisiones no-action. No alterar IDs, handlers, protocolo ni otro layout.
**Avanzar a F3:** después del fix, build y `git diff --check`, un Verifier independiente distinto revisa el HEAD corregido e intenta refutar AC1–AC10, considerando únicamente el waiver explícito de AC9.
**Pivotar:** si portal/layout no mantiene la relación document-absolute del rail o altera decisiones ajenas a `action`, regresar al Orquestador con reproducción.
**Repetir:** una corrección localizada por criterio con fallo reproducible.
**Bloquear/cancelar:** vuelve a reservarse un archivo compartido o aparece una necesidad de cambiar reglas/protocolo.
**Commit:** `COMMIT_REQUIRED`; checkpoint previo `feat(action-rows): issue 24 F2 BLOCKED manual review`; el siguiente registra las correcciones visuales y la reanudación ACTIVE.
**Implementación y revisión estática previa:** adaptación de `Coup.js`, estilos y claves `es`/`en` revisadas; el primer `npm run build` terminó con exit 0 y warnings en `App.js`, `ReferencePanel.css` y `caniuse-lite`. No se ejecutaron tests automatizados. El reporte del checkpoint anterior está en `docs/plans/turn-action-row-clarity/report_issue_24_F2.md`.
**Reanudación visual 1:** 2026-09-27, la usuaria inspeccionó `http://localhost:3006` con backend `:18000` y reportó que los divisores parecen extremos curvos del borde hover y que el panel action debe superponerse al tablero a la derecha, bajo la altura de “Resumen de reglas”. Esa solución fue cargada y queda como historial del checkpoint.
**Revisión visual 2:** la usuaria corrigió la ubicación: tabla de acciones a la izquierda, alineada con “Resumen de reglas” y debajo; ambas con distancia vertical fija al hacer scroll y sobre PlayerBoard. El panel fue agrupado en rail fijo. No basta con mover el panel separado.
**Revisión visual 3 (feedback vigente):** la usuaria observó que tanto resumen como acciones se desplazan al hacer scroll; deben permanecer anclados al viewport, juntos, en el mismo punto y con alineación/separación constante. Además, la lista solo muestra acciones con al menos una opción legal en `decision.options`; acciones no permitidas no aparecen ni ocupan espacio. Se conservan su markup/helpers de disabled/hint y estilos, pero no se renderizan.
**Investigación del containing block:** el recorrido fuente JoinGame/CreateGame → Coup y los CSS revisados no muestran `transform`, `filter`, `perspective`, `contain` ni `will-change` en los ancestros de `ActionDecisionRail`; `.GameContainer` solo usa `position: relative` e `isolation: isolate`. El rail se portará a `document.body` mediante portal para fijarlo fuera del GameContainer y de cualquier ancestro de scroll/containing block. El resto de decisiones conserva su renderer.
**Trabajo activo tras cuarta revisión visual:** conservar divider independiente del hover; montar resumen+acciones solo durante `action` en rail portado al body con `position: absolute`; medir el `.CheatSheet` real con `getBoundingClientRect()` y usar coordenadas documentales para mantener ambos alineados y a distancia constante mientras se desplazan juntos con la página. Renderizar filas solo si hay opciones legales, preservando código disabled no montado. Iniciar cada decisión expandida y permitir compactación 500 ms después de mouseleave solo tras mouseenter, con reentrada cancelando/restaurando; touch/no-hover permanece expandido. Mantener overlay, responsive, IDs/protocolo y flujo de targets/cancelación.
**Validación del checkpoint anterior:** `git diff --check` pasa; `npm run build` exit 0 con warnings en archivos no modificados. HMR no detectó aquellas ediciones en `/mnt/e`; el Orquestador reinició CRA desde este worktree, confirmó compilación y HTTP 200 en `localhost:3006`. No se ejecutaron tests.
**Validación del checkpoint anterior:** diff/build pasaron y el Orquestador confirmó el bundle anterior activo en `localhost:3006`; nueva revisión visual reveló que el rail se desplazaba y pidió omitir acciones sin opciones.
**Validación del nuevo diff y preview:** `createPortal` hacia `document.body`, filtro de filas sin opciones y separador que salta filas omitidas revisados; `git diff --check` pasa y la repetición de `npm run build` tras el ajuste del divisor terminó exit 0 con warnings conocidos en `App.js`, `ReferencePanel.css` (`dvh`) y caniuse-lite. No se ejecutaron tests automatizados. El checkpoint completo de código está publicado en `4be6ace7c5d345ca0068c21cc77120cfa3cc6694`; el docs-only HEAD `f573e1ca1e0274b78e119480c4d0f9fa768deeee` quedó cargado. Orquestador confirmó `Compiled successfully`, `/static/js/bundle.js` HTTP 200 (2,393,674 bytes) y backend `:18000` activo. Preview listo.
**Cuarta revisión visual (feedback vigente):** la usuaria solicita explícitamente `position: absolute` (no fixed), coordenadas de documento y relación constante bajo/alineada con Resumen de reglas al hacer scroll. Añade un ciclo mouse: inicio de cada decisión expandido; tras mouseenter, mouseleave espera 500 ms y se compacta al 50% del ancho normal, desmontando descripciones/prompt/metadatos pero dejando títulos, precios y controles. Reentrada restaura detalles/ancho; touch/no-hover nunca compacta. La solución mantiene el portal a `document.body`, mide el ancla por `getBoundingClientRect() + scroll`, conserva coords durante scroll y re-mide en resize. Timers se limpian ante reentrada, nueva/cerrada/pausada/finalizada decisión y unmount. Build y diff-check pasan; no tests ni recorrido visual ejecutados. El Orquestador debe recargar CRA desde el checkpoint antes de la inspección. Issue abierta y sin PR.

**Quinta revisión visual (feedback vigente):** en modo compacto, solo los títulos de fila de acción se reducen 30% (70% de su font-size normal) con transición breve; al rehidratar y expandir regresan a 100%. El encabezado general del panel no cambia.

**Cierre previo F2:** la usuaria aprobó el preview actual; su aceptación cubre el resultado visual del panel y reconoce el hallazgo de que los detalles se desmontan sin transición visible. Este punto queda exceptuado de AC9 por aceptación expresa, no reportado como comportamiento verificado. El cierre se revocó tras el fallo F3 descrito abajo.

### F3 — Verificación independiente y entrega (`BLOCKED`; recheck de base pendiente)

**Pregunta:** ¿puede refutarse que solo se muestran acciones legales, que summary/rail preservan su relación document-absolute al scroll, o que el ciclo mouse compacta/restaura sin cambiar el contrato de decisión?

**Último resultado:** `FAIL` en `6d63199910c5a0e3b24ed60c847eef1bb231f6f7`. El reporte `docs/plans/turn-action-row-clarity/report_issue_24_F3.md` encontró dos montajes de `renderActionDecision()` para una decisión action, IDs/refs duplicados y foco de targets/cancelación potencialmente desviado.
**Siguiente entrada:** el fix F2 quitó la llamada duplicada. Un Verifier observó un único panel, Cancelar funcional y overlays correctos; F3 sigue `BLOCKED` porque no se observó elegir un destino legal y confirmar exactamente una resolución. La rama debe rebasearse desde `origin/master@64c1b29` a `origin/master@9511472`, preservando #28 + #24; después de build/diff-check, un Verifier independiente recibe el brief actualizado. Ni el FAIL inicial ni la aprobación visual equivalen a PASS.

**Salida:** informe FINAL independiente, capturas de estados normal/hover y rail absolute, evidencia de omisión de acciones no legales y estados expandidos/compactos, entrega del branch/PR canónico al Orquestador.

**Prueba adversarial:** comparar cada fila con `decision.options`; intentar confirmar que las acciones omitidas no aparecen, no ocupan huecos ni crean IDs/handlers. Hacer scroll repetido y confirmar que resumen y panel se desplazan juntos con coords documentales, alineación y gap constantes. Probar mouseenter/leave 500 ms, reentrada antes/después, ancho 50%, detalles desmontados/remontados (la ausencia de animación de desmontaje es waiver explícito), touch/no-hover, reduced motion, targets, cancelación, envío único, límites monetarios, idiomas y cambio/fin de decisión.

**Avanzar:** criterios AC1–AC10 pasan, excepto la transición visual de desmontaje de detalles que la usuaria aceptó expresamente como waiver de AC9; Verifier de recheck `PASS`; dejar unidad en `WAITING_ORCHESTRATOR` para revisión de una única PR.
**Pivotar:** devolver a F2 solo el criterio refutado con reproducción.
**Repetir:** una verificación focalizada tras una corrección y commit nuevos.
**Bloquear/cancelar:** dependencia reabierta, build no reproducible o queda un fallo de criterio.
**Commit:** `COMMIT_REQUIRED`; `docs(action-rows): issue 24 F3 CLOSED ready_for_review`.
**Validación:** revisión independiente `FINAL`, build y recorrido manual documentados. El Ejecutor no integra ni cierra la unidad.

## Trazabilidad y topología

Issue #24 es la fuente de estado. Esta bitácora es append-only. Toda la unidad usa `issue/24-turn-action-row-clarity` y `.worktrees/issue-24-turn-action-row-clarity`; target `master` del fork; una sola PR tras terminar F1–F3. El branch conserva rebase previo a `45a3eaa` y merge documental `64c1b29`; `origin/master@9511472` añade cambios de #28 y el rebase actual está pendiente. F2 está activa; el último F3 está bloqueado por la resolución dinámica del target, waiver AC9 sigue vigente. Issue abierta, sin PR; repetir F3 luego del rebase.

## Decisiones

- 2026-09-27: issue separado de #6 porque #6/PR #11 están cerrados; #21 trata respuestas y excluye acciones principales.
- 2026-09-27: por instrucción explícita del usuario, rebasear #24; PR #23 está integrada y PR #22 publicó el renderer y las cadenas necesarias para F2. #19 continúa abierta solo por sus verificaciones manuales/Verifier.
- 2026-09-27: adaptar F2 al renderer genérico y agrupar `choiceId` por acción/destino. La interfaz no amplía las opciones legales del servidor.
- 2026-09-27: clasificar `FULL / MEDIUM / FINAL` por la adaptación investigada al renderer nuevo, el selector de destino y la revisión independiente de elegibilidad.
- 2026-09-27: el Alquimista reclamó la issue en el fork y confirmó branch/worktree limpios; F2 comienza sobre `Coup.js`.
- 2026-09-27: la implementación F2 y el build pasan, pero F2 queda `BLOCKED` porque no hay navegador funcional para completar el recorrido manual obligatorio. El Orquestador coordina el entorno; F3 sigue pendiente.
- 2026-09-27: la usuaria inspeccionó el cliente en `localhost:3006` y aportó feedback visual sobre separadores y colocación del panel action. F2 vuelve a `ACTIVE` para corregir ambos puntos; no se alteran criterios ni contrato.
- 2026-09-27: la usuaria aprobó el preview de F2 y aceptó expresamente que el desmontaje de detalles en compacto no presenta animación/transición visible. Waiver limitado a esa parte de AC9; no se afirma que esa transición visual haya pasado.
- 2026-09-27: el primer F3 independiente devolvió `FAIL` en `6d63199`: `renderActionDecision()` se montaba a la vez en el portal y dentro de `.DecisionsSection`, duplicando filas/IDs/refs y pudiendo desviar el foco de targets/cancelación. Reabrir F2; quitar únicamente el montaje duplicado y repetir F3 con otro Verifier.
