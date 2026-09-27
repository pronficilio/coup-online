# Plan: hacer claras las acciones del turno — issue #24

**Estado:** `ACTIVE`; F1 `CLOSED / PASS`; F2 `ACTIVE`. F2 continúa tras la tercera revisión visual: portar el rail compartido al `document.body` para fijarlo realmente al viewport y mostrar solo acciones con opciones legales del servidor.
**Issue:** https://github.com/pronficilio/coup-online/issues/24
**Handoff activo:** `docs/plans/active/issue_24_turn_action_row_clarity.md`
**Bitácora:** `docs/plans/log/issue-24.jsonl`
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
**Rama / worktree / integración única:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity` / una PR a `master` de `pronficilio/coup-online`.
**Siguiente dueño:** tras el checkpoint, la usuaria inspecciona que rail y resumen no se mueven con el scroll, que solo aparecen acciones permitidas y que el panel inicia con menor altura. Alquimista continúa F2. F3 no está listo.

## Solicitud y definición de éxito

La persona usuaria quiere que las acciones disponibles durante su turno indiquen claramente dónde hacer clic, con un resalte cálido y opaco en toda la fila. La lista muestra únicamente acciones permitidas por las opciones del servidor; las filas, estilos y ayudas de disabled permanecen en el código para posible reactivación pero no se muestran ahora. Las referencias visuales son `references/a_normal.png`, `references/a_hover.png` y `references/a_dis.png`, copiadas sin cambios desde `fotos/` como contexto histórico.

Éxito significa que cada acción permitida aparece una vez en su propia fila con estados visuales reconocibles; las acciones ausentes de las opciones legales no se renderizan ni ocupan espacio; y elegir o cancelar un destino no envía una decisión antes de tiempo. Al elegir, se envía una sola opción con el `choiceId` entregado por el servidor.

## Hechos, fuentes y dependencias

- El issue #6 está `CLOSED` y la PR #11 integrada. Su panel muestra hoy siete acciones y calcula deshabilitación por saldo insuficiente para Coup/Assassinate y por Coup obligatorio con 10+ monedas.
- El issue #21 sigue abierto, pero su contrato se limita a controles gráficos de respuesta (`Block`, `Challenge`, `Pass`) y excluye explícitamente las acciones principales.
- El issue #14 se cerró tras integrar la PR #23. `Coup.js` ahora monta un renderer genérico para `decision.options`; el viejo `ActionDecision.js` conserva markup y estilos, pero ya no se importa desde `Coup.js`.
- El issue #19 sigue abierto tras integrar parcialmente su PR #22 en `5de95ee`. La localización publicada ya incluye las etiquetas y descripciones de las siete acciones y las claves `es`/`en` necesarias. Sus tareas restantes requieren recorrido manual y Verifier, sin otra PR de producto abierta que reserve el renderer de #24.
- El servidor genera los `choiceId` permitidos para cada decisión. En `actionChoices`, Coup con 10+ monedas es la única opción; por debajo se agrega Coup a partir de 7 monedas y Assassinate a partir de 3. Las opciones con objetivo combinan acción y asiento (por ejemplo `coup:<seat>`). El cliente debe enviar esos IDs exactos; el servidor conserva la autoridad de elegibilidad.
- `g-decision` expone solo opciones legales. `Coup.js` presenta solo acciones con opciones recibidas y localiza la etiqueta desde `choiceId`; el saldo público sirve para verificar los límites en el recorrido manual.
- Las referencias visuales estaban en `fotos/`, fuera del historial versionado. Las tres copias de `references/` preservan la evidencia para el Ejecutor.
- Reglas visibles ya comprobadas en el cliente: Assassinate requiere 3 monedas; Coup requiere 7; con 10 o más monedas solo Coup está permitido. Declarar una influencia no requiere tenerla.
- Base rebaseada desde el remoto: `origin/master`, commit `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. Target: `master`.

La revisión F1 confirmó que el renderer y los textos requeridos ya están publicados. #19 permanece abierto por validación manual y Verifier, pero no tiene cambios de producto pendientes que bloqueen #24. El feedback de esos recorridos puede incorporarse a la revisión final de #24.

## Criterios de aceptación

1. Nombre, descripción, distintivos, precio y espacio interior de una acción disponible pertenecen a un solo control de fila; clic, teclado y toque producen la misma acción una vez.
2. El estado normal conserva el pergamino y el layout. Hover y foco resaltan toda la fila con fondo ámbar semitransparente, contorno cálido redondeado y transición breve, sin desplazar filas. El divisor independiente se conserva entre acciones permitidas consecutivas, incluso si se omiten acciones intermedias.
3. Solo se renderiza una acción si `decision.options` contiene al menos una opción de esa acción. Las acciones sin opciones no ocupan espacio ni reciben controles, IDs u objetivos; el código de disabled/hints queda preservado sin mostrarse.
4. Se comprueba que las filas permitidas siguen las opciones del servidor en los límites 2/3, 6/7 y 9/10 monedas. Las otras acciones no ganan restricciones nuevas ni el cliente fabrica opciones.
5. Se preservan las declaraciones que pueden ser farol, el flujo de objetivos y cancelación, el cobro del servidor y el protocolo Socket.IO. Coup, Assassinate y Steal abren sus destinos legales; Cancelar regresa al menú sin emitir una decisión; elegir un destino envía una vez su `choiceId` original. Las acciones sin destino envían su opción legal al seleccionarse.
6. Los textos visibles usan el mecanismo de idioma integrado. Las filas permitidas tienen nombre accesible; foco visible, Enter/Espacio y Escape funcionan. Las ayudas disabled/hint ocultas y sus traducciones permanecen para posible reactivación.
7. En escritorio y móvil aparecen las filas permitidas en estado normal y hover/foco, sin filas ni huecos para acciones omitidas. No se muestran hints disabled; se conserva su markup/helper y estilos para reactivarlos luego. El panel no tapa la selección de objetivos ni las respuestas.
8. Se respeta `prefers-reduced-motion`. El build y un recorrido manual quedan documentados. El Verifier independiente intenta refutar que el rail permanezca fijo, que solo aparezcan opciones legales y que target/cancel/emisión sigan el contrato. No se agregan tests automatizados.

## Alcance y fuera de alcance

**Incluye:** la rama `decision.type === 'action'` del renderer genérico de `Coup.js`, rail viewport-fixed, estilos de esa vista, metadatos localizados existentes y evidencia visual/funcional de escritorio y móvil. El contenido disabled/hint permanece en el código, pero por el feedback vigente no se monta.

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

### F2 — Implementar y documentar la fila interactiva (`ACTIVE`)

**Pregunta:** ¿el renderer comunica dónde activar las acciones legales y mantiene la lista sincronizada con las opciones del servidor?

**Entrada:** F1 `CLOSED / PASS`; branch rebaseado sobre `origin/master@5de95ee`; PR #23/#22 releídas.

**Subtareas:** bifurcar solo `decision.type === 'action'`; agrupar opciones por prefijo de `choiceId`; renderizar una fila solo cuando `decision.options` contiene una o más opciones de esa acción; montar CheatSheet + panel en portal a `document.body` y fijar el rail al viewport; conservar separadores hermanos entre filas permitidas consecutivas, saltando las omitidas; al elegir Coup, Assassinate o Steal, mostrar destinos legales y Cancelar; al elegir destino, enviar una vez la opción original; las filas/helpers/estilos disabled quedan preservados pero no montados; no emitir al enfocar, abrir destinos o cancelar; aplicar estado visual y descripciones accesibles a las filas permitidas.

**Áreas previstas:** `coup-client/src/components/game/Coup.js`, estilos del renderer y `coup-client/src/i18n/translations.json` solo si hacen falta claves espejo nuevas. No revivir `ActionDecision.js` ni editar servidor/protocolo.

**Avanzar:** criterios AC1–AC8 se observan en los límites monetarios y en escritorio/móvil con teclado/tacto; solo aparecen acciones presentes en las opciones legales y se emiten sus `choiceId` originales; el rail permanece viewport-fixed; build y evidencia manual quedan registrados.
**Pivotar:** si portal/layout no mantiene el rail anclado al viewport o altera decisiones ajenas a `action`, regresar al Orquestador con reproducción.
**Repetir:** una corrección localizada por criterio con fallo reproducible.
**Bloquear/cancelar:** vuelve a reservarse un archivo compartido o aparece una necesidad de cambiar reglas/protocolo.
**Commit:** `COMMIT_REQUIRED`; checkpoint previo `feat(action-rows): issue 24 F2 BLOCKED manual review`; el siguiente registra las correcciones visuales y la reanudación ACTIVE.
**Implementación y revisión estática previa:** adaptación de `Coup.js`, estilos y claves `es`/`en` revisadas; el primer `npm run build` terminó con exit 0 y warnings en `App.js`, `ReferencePanel.css` y `caniuse-lite`. No se ejecutaron tests automatizados. El reporte del checkpoint anterior está en `docs/plans/turn-action-row-clarity/report_issue_24_F2.md`.
**Reanudación visual 1:** 2026-09-27, la usuaria inspeccionó `http://localhost:3006` con backend `:18000` y reportó que los divisores parecen extremos curvos del borde hover y que el panel action debe superponerse al tablero a la derecha, bajo la altura de “Resumen de reglas”. Esa solución fue cargada y queda como historial del checkpoint.
**Revisión visual 2:** la usuaria corrigió la ubicación: tabla de acciones a la izquierda, alineada con “Resumen de reglas” y debajo; ambas con distancia vertical fija al hacer scroll y sobre PlayerBoard. El panel fue agrupado en rail fijo. No basta con mover el panel separado.
**Revisión visual 3 (feedback vigente):** la usuaria observó que tanto resumen como acciones se desplazan al hacer scroll; deben permanecer anclados al viewport, juntos, en el mismo punto y con alineación/separación constante. Además, la lista solo muestra acciones con al menos una opción legal en `decision.options`; acciones no permitidas no aparecen ni ocupan espacio. Se conservan su markup/helpers de disabled/hint y estilos, pero no se renderizan.
**Investigación del containing block:** el recorrido fuente JoinGame/CreateGame → Coup y los CSS revisados no muestran `transform`, `filter`, `perspective`, `contain` ni `will-change` en los ancestros de `ActionDecisionRail`; `.GameContainer` solo usa `position: relative` e `isolation: isolate`. El rail se portará a `document.body` mediante portal para fijarlo fuera del GameContainer y de cualquier ancestro de scroll/containing block. El resto de decisiones conserva su renderer.
**Trabajo activo:** conservar divider independiente del hover; montar resumen+acciones solo durante `action` en rail portado al body y fijo al viewport; renderizar filas solo si hay opciones legales, preservando código disabled no montado. Mantener overlay, responsive, IDs/protocolo y flujo de targets/cancelación.
**Validación del checkpoint anterior:** `git diff --check` pasa; `npm run build` exit 0 con warnings en archivos no modificados. HMR no detectó aquellas ediciones en `/mnt/e`; el Orquestador reinició CRA desde este worktree, confirmó compilación y HTTP 200 en `localhost:3006`. No se ejecutaron tests.
**Validación del checkpoint anterior:** diff/build pasaron y el Orquestador confirmó el bundle anterior activo en `localhost:3006`; nueva revisión visual reveló que el rail se desplazaba y pidió omitir acciones sin opciones.
**Validación del nuevo diff y preview:** `createPortal` hacia `document.body`, filtro de filas sin opciones y separador que salta filas omitidas revisados; `git diff --check` pasa y la repetición de `npm run build` tras el ajuste del divisor terminó exit 0 con warnings conocidos en `App.js`, `ReferencePanel.css` (`dvh`) y caniuse-lite. No se ejecutaron tests automatizados. El checkpoint completo de código está publicado en `4be6ace7c5d345ca0068c21cc77120cfa3cc6694`; el docs-only HEAD `f573e1ca1e0274b78e119480c4d0f9fa768deeee` quedó cargado. Orquestador confirmó `Compiled successfully`, `/static/js/bundle.js` HTTP 200 (2,393,674 bytes) y backend `:18000` activo. Preview listo.
**Validación pendiente:** inspección visual de la usuaria: rail estable al scroll, filas permitidas únicamente, menor altura inicial, overlay, divider/hover, responsive y flujo de decisiones. No añadir tests. No se abre PR ni se cierra la issue.

### F3 — Verificación independiente y entrega (`PENDING`)

**Pregunta:** ¿puede refutarse que solo se muestran acciones legales y que todas las filas permanecen ancladas al viewport sin cambiar el contrato de decisión?

**Entrada:** F2 `CLOSED`, diff y evidencia vigentes.

**Salida:** informe FINAL independiente, capturas de estados normal/hover y rail fijo, evidencia de omisión de acciones no legales y entrega del branch/PR canónico al Orquestador.

**Prueba adversarial:** comparar cada fila con `decision.options`; intentar confirmar que las acciones omitidas no aparecen, no ocupan huecos ni crean IDs/handlers. Hacer scroll repetido y confirmar que resumen y panel conservan punto, separación y alineación. Probar targets, cancelación, envío único, límites de monedas, diferencias de idioma, reduced motion y cambio de decisión.

**Avanzar:** criterios pasan y Verifier `PASS`; dejar unidad en `WAITING_ORCHESTRATOR` para revisión de una única PR.
**Pivotar:** devolver a F2 solo el criterio refutado con reproducción.
**Repetir:** una verificación focalizada tras una corrección y commit nuevos.
**Bloquear/cancelar:** dependencia reabierta, build no reproducible o queda un fallo de criterio.
**Commit:** `COMMIT_REQUIRED`; `docs(action-rows): issue 24 F3 CLOSED ready_for_review`.
**Validación:** revisión independiente `FINAL`, build y recorrido manual documentados. El Ejecutor no integra ni cierra la unidad.

## Trazabilidad y topología

Issue #24 es la fuente de estado. Esta bitácora es append-only. Toda la unidad usa `issue/24-turn-action-row-clarity` y `.worktrees/issue-24-turn-action-row-clarity`; target `master` del fork; una sola PR al completar F1–F3. La rama se rebaseó sobre `origin/master@5de95ee` antes de F2 y contiene el plan, la evidencia F1, el checkpoint de reclamo y los cambios/documentos F2; el checkpoint `BLOCKED` anterior fue reabierto tras la revisión visual de la usuaria.

## Decisiones

- 2026-09-27: issue separado de #6 porque #6/PR #11 están cerrados; #21 trata respuestas y excluye acciones principales.
- 2026-09-27: por instrucción explícita del usuario, rebasear #24; PR #23 está integrada y PR #22 publicó el renderer y las cadenas necesarias para F2. #19 continúa abierta solo por sus verificaciones manuales/Verifier.
- 2026-09-27: adaptar F2 al renderer genérico y agrupar `choiceId` por acción/destino. La interfaz no amplía las opciones legales del servidor.
- 2026-09-27: clasificar `FULL / MEDIUM / FINAL` por la adaptación investigada al renderer nuevo, el selector de destino y la revisión independiente de elegibilidad.
- 2026-09-27: el Alquimista reclamó la issue en el fork y confirmó branch/worktree limpios; F2 comienza sobre `Coup.js`.
- 2026-09-27: la implementación F2 y el build pasan, pero F2 queda `BLOCKED` porque no hay navegador funcional para completar el recorrido manual obligatorio. El Orquestador coordina el entorno; F3 sigue pendiente.
- 2026-09-27: la usuaria inspeccionó el cliente en `localhost:3006` y aportó feedback visual sobre separadores y colocación del panel action. F2 vuelve a `ACTIVE` para corregir ambos puntos; no se alteran criterios ni contrato.
