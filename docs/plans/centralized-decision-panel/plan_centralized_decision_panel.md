# Plan — centralizar las decisiones en el panel de acciones (#56)

**Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED (PASS)`; F2 `CLOSED (PASS: build + aprobación visual del propietario)`; F3 `WAIVED_BY_OWNER` (sin veredicto independiente); issue `OPEN` hasta fusionar la PR.
**Issue canónico:** https://github.com/pronficilio/coup-online/issues/56
**Handoff:** `docs/plans/inbox/issue_56_centralized_decision_panel.md`
**Bitácora:** `docs/plans/log/issue-56.jsonl` (append-only).
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL` independiente.
**Branch / worktree:** `issue/56-centralized-decision-panel` / `.worktrees/issue-56-centralized-decision-panel`.
**Base / destino:** rebase sobre `origin/master@a421c0e` / `master` de `pronficilio/coup-online`.
**Integración:** una PR asociada a #56.

## Solicitud y definición de éxito

Reunir todas las decisiones que el jugador debe tomar en el panel existente de acciones del turno. Retirar los botones que aparecen debajo de las dos cartas de influencia del jugador local, tanto los controles gráficos con imágenes normal/activa como los botones planos. El panel cambia de título a **«Acciones y contraacciones»**, término basado en el manual, y explica brevemente qué se decide y qué respuestas pueden seguir según las reglas.

Éxito significa que toda decisión elegible tiene una sola presentación operable en ese panel, ninguna opción accionable aparece debajo de las cartas, se preservan autoridad y protocolo del servidor, y la interfaz no afirma que una acción puede bloquearse cuando el manual no lo permite.

## Estado y hechos confirmados

- #45 se integró mediante PR #51 y #47 mediante PR #52. Al reclamar, confirmar que sus commits están en `origin/master` y conservar el estado de respuesta enviada y el selector visual de intercambio ya integrados.
- #43 se integró mediante PR #57 en la base `b8df17f`; sus cambios de `Coup.js`/`PlayerBoard.js` ya están incluidos.
- #53 se integró mediante PR #55 en la base `b8df17f`; revisar su implementación al migrar el rail/panel.
- El manual separa **Actions**, **Counteractions** y **Challenges**. El encabezado «Acciones y contraacciones» usa el vocabulario del manual; los textos auxiliares deben distinguir desafío, bloqueo y pasar y variar según la decisión.
- La lista de decisiones debe derivarse del contrato recibido del servidor, no suponerse por los componentes actuales. Inspeccionar todas las decisiones y opciones visibles actualmente, incluidas action, challenge, block, block challenge, prove/lose influence y exchange cuando aparezcan.

## Alcance y límites

Incluye inventario de tipos de decisión, renderer y recursos complementarios; centralización de opciones en el panel; eliminación de controles bajo las cartas; retiro de los botones con imágenes de estado normal/activo y de sus recursos gráficos solo después de confirmar que ya no tengan referencias; localización de encabezado e instrucciones; accesibilidad y recorrido visual/funcional.

No incluye cambios a reglas, elegibilidad, generación de opciones, `choiceId`, payloads Socket.IO, resolución del servidor, imágenes de personajes, ni rediseño de asientos/tablero.

## Copy propuesto

- Título: **Acciones y contraacciones** / **Actions and counteractions**.
- Ayuda general: «Elige una acción o respuesta. Al declararla, los demás podrán desafiarla o contraactuar cuando las reglas lo permitan.»
- La ayuda debe ajustarse al tipo: tras una acción, mencionar desafío del reclamo y contraacción cuando aplique; tras declarar un bloqueo, indicar que los demás pueden desafiar el reclamo; para perder influencia/intercambiar cartas, explicar la elección sin anunciar respuestas inexistentes. No usar un aviso genérico que sugiera que toda acción se puede bloquear.

F1 confirma el wording contra las traducciones existentes y el manual. Cualquier cambio de copy aquí es propuesta para implementación; si el recorrido demuestra que confunde, el Ejecutor ajusta dentro de la terminología reglamentaria y documenta la decisión.

## F1 — inventario de decisiones y recursos (`CLOSED (PASS)`)

**Pregunta única:** ¿qué decisiones llegan al cliente, dónde se renderizan hoy y qué controles/recursos gráficos pueden retirarse sin cambiar el contrato?

- Trazar cada tipo visible desde el servidor hasta el renderer del cliente; registrar elegibilidad, opciones/labels, callback/envelope y estados enviado, error, pausa, cierre o cambio de decisión.
- Localizar todos los botones con imagen normal/activa y los botones planos que responden a una decisión; enumerar referencias a cada recurso antes de recomendar su borrado.
- Comparar el flujo actual de `.DecisionsSection` y `ActionDecisionRail` y documentar cómo mover cada renderer al panel común sin duplicar opciones ni modificar `decision.options`.
- Revisar traducciones y validar la ayuda propuesta contra el manual para acciones sin bloqueo, acciones bloqueables, desafío y bloqueo.
- **Salida:** `docs/plans/centralized-decision-panel/report_issue_56_F1.md`, tabla de tipos/opciones/renderer, inventario de assets/referencias y wording recomendado; sin cambios de producto.
- **Avanzar:** cada renderer/opción tiene fuente y ubicación identificadas; los assets a retirar no tienen otros consumidores.
- **Pivotar:** un tipo de decisión requiere mantener una presentación especializada; integrarla dentro del panel común con su contenido/selección propia y justificar la excepción.
- **Repetir:** una búsqueda acotada de referencias para cualquier recurso cuya propiedad no sea clara.
- **Bloquear:** un control visual altera o depende de contrato de servidor no entendido; escalar antes de moverlo.
- **Commit:** `COMMIT_REQUIRED`; `docs(decisions): issue 56 F1 inventory and copy`.
- **Validación:** revisión estática, referencias cruzadas de assets y `git diff --check`; no tests automatizados.

## F2 — centralizar renderers y retirar botones gráficos (`CLOSED (PASS)`)

**Pregunta única:** ¿pueden todas las opciones elegibles representarse dentro del mismo panel sin duplicados ni cambios al contrato de decisiones?

- La base #56 ya incluye #43/#57 y #53/#55. Revisar esos diffs antes de editar archivos compartidos.
- Montar en el panel «Acciones y contraacciones» todos los controles del inventario F1, incluidos renderers hoy textuales bajo el tablero; conservar la presentación especializada del intercambio de #47 dentro del mismo panel.
- Retirar del flujo `.DecisionsSection` las opciones accionables y toda instancia redundante. El estado sin decisión puede conservar mensajes no accionables que no sean controles del jugador.
- Sustituir Challenge/Pass/Block gráficos con controles textuales consistentes con el panel. Preservar estado activo/enviado de #45 en la forma equivalente del nuevo renderer.
- Eliminar solamente assets complementarios que la búsqueda confirme sin referencias posteriores; mantener cualquier arte compartido o de personajes.
- Añadir/localizar el título y la ayuda contextual aprobada en F1. Seguir derivando acciones de `decision.options` y conservar teclado, foco, deshabilitado, error/reintento, pausa y cierre.
- **Salida:** implementación y `report_issue_56_F2.md` con matriz de controles antes/después, assets eliminados y evidencia de que no quedan botones debajo de las cartas.
- **Avanzar:** cada decisión local aparece una sola vez en el panel; ninguna opción ilegal se crea en el cliente; build y `git diff --check` pasan; walkthrough manual confirmado.
- **Pivotar:** si un tipo no cabe en el renderer común sin perder función/accesibilidad, mantenerlo como subpanel dentro del mismo panel, no debajo de las cartas.
- **Repetir:** un ciclo focalizado por regresión visual o de foco reproducible.
- **Bloquear:** conflicto de integración no resuelto, control necesario que carece de opción autorizada o pérdida del estado de selección/respuesta.
- **Commit:** `COMMIT_REQUIRED`; `feat(decisions): issue 56 centralize player choices`.
- **Validación:** build cliente y `git diff --check` pasan. El propietario revisó el preview en `localhost:4056` y aprobó visualmente la interfaz. No se afirma cobertura de todos los flujos de interacción. Sin tests automatizados.

## F3 — recorrido y falsificación independiente (`WAIVED_BY_OWNER`)

**Pregunta única:** ¿queda algún estado alcanzable con opciones ausentes/duplicadas/obsoletas, controles bajo las cartas, o copy que describe incorrectamente las reglas?

- Recorrer action, challenge/pass, cada bloqueo disponible, challenge de bloqueo, prove/lose influence y exchange cuando sean alcanzables; incluir cliente elegible/no elegible, respuesta enviada, rechazo/error, cambio/cierre, pausa y game over según aplique.
- Cubrir móvil y escritorio con teclado/foco; comprobar que ninguna decisión vuelve a aparecer bajo las dos cartas y que una decisión cerrada no deja botones accionables.
- Confirmar cada opción presentada contra `decision.options`; revisar traducciones y copy de escenarios bloqueables/no bloqueables.
- El propietario ordenó explícitamente integrar y cerrar la issue; por esa autorización se omite el Verifier independiente. No convertir esta dispensa en un veredicto `PASS`.
- **Salida:** `docs/plans/centralized-decision-panel/report_issue_56_F3.md`, waiver del propietario y límites de cobertura; sin veredicto independiente.
- **Avanzar:** no aplica; waiver explícito del propietario para integrar y cerrar la unidad.
- **Pivotar:** volver a F2 con estado y evidencia exactos.
- **Repetir:** re-verificar la corrección puntual.
- **Bloquear:** fallo adversarial, caso crítico inaccesible o discrepancia con reglas sin resolver.
- **Commit:** `COMMIT_REQUIRED`; registrar el waiver y el resultado de integración.
- **Validación:** build y aprobación visual del propietario; recorrido exhaustivo y Verifier FINAL independientes no ejecutados.

## Topología y próximo dueño

Una unidad #56 → `issue/56-centralized-decision-panel` → `.worktrees/issue-56-centralized-decision-panel` → una PR hacia `master` de `pronficilio/coup-online`. La rama se rebasa sobre `origin/master@a421c0e`, que incluye PR #58 además de #55 y #57. No usar `upstream`.

**Siguiente dueño:** Orquestador, abrir y fusionar una PR a `master` que cierre #56. El propietario aprobó el preview y autorizó el merge/cierre sin veredicto independiente F3.

**Falsificación:** ¿puede existir un tipo/estado alcanzable donde falte una opción autorizada, aparezca una no permitida, quede un botón bajo las cartas o el texto prometa un bloqueo/desafío que las reglas no permiten?
