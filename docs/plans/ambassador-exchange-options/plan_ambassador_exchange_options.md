# Plan — opciones visuales para el intercambio del Embajador (#47)

**Estado:** `ACTIVE`; F1 `ACTIVE` tras rediseño solicitado por el usuario; issue `OPEN` asignada a `pronficilio`.
**Issue canónico:** https://github.com/pronficilio/coup-online/issues/47
**Handoff:** `docs/plans/active/issue_47_ambassador_exchange_options.md`
**Bitácora:** `docs/plans/log/issue-47.jsonl` (append-only).
**Modo / riesgo / verificación:** `LIGHT` / `MEDIUM` / `FINAL` independiente.
**Branch / worktree:** `issue/47-ambassador-exchange-options` / `.worktrees/issue-47-ambassador-exchange-options`.
**Base inicial / actual / destino:** `origin/master@f900c094` al reclamar; branch rebasada sobre `origin/master@db1d22c`; merge target `master` de `pronficilio/coup-online`.
**Integración:** una PR asociada únicamente a #47; aún no existe.

## Solicitud y definición de éxito

Al ejecutar Exchange (Embajador), algunas combinaciones visualmente equivalentes aparecen repetidas y una galería de parejas dibuja demasiadas cartas. Deduplicar los resultados válidos y reemplazar la galería por las cartas disponibles una sola vez, dejando que el jugador cambie iterativamente cuáles conserva.

Éxito significa que cada pareja de roles que represente un resultado distinto aparece una sola vez en las opciones autorizadas; la UI muestra cada carta física del pool una sola vez. Con dos influencias originales, las cuatro cartas aparecen juntas: las dos originales empiezan iluminadas en rojo neón y las dos robadas sin iluminar. Un clic en una carta no seleccionada la intercambia por una de las seleccionadas; las posiciones a sustituir alternan empezando por B, luego A y siguen alternando, de forma que cualquier pareja puede alcanzarse desde cualquier selección. Siempre hay exactamente dos cartas iluminadas. El rótulo inferior se actualiza con la pareja actual y, según la confirmación del usuario, también funciona como botón para enviar. Con una influencia original se conserva la regla vigente: mostrar las tres cartas disponibles y mantener una iluminada. El servidor mantiene autoridad sobre la combinación permitida y su resolución.

## Hechos confirmados

- `server/game/coup.js::openExchange` enumera subconjuntos por índices de la mano y las dos cartas robadas; cada opción tiene un `choiceId` secuencial, una etiqueta inglesa y datos de resolución privados.
- `activateDecision` publica al asiento elegible solo `{choiceId, label}`. El cliente actualmente localiza la etiqueta parseando el texto inglés y muestra opciones exchange como botones de texto en `.DecisionsSection`.
- `Coup.js` ya tiene un `DecisionActionPanel` dentro de `ActionDecisionRail`; las imágenes de influencias están actualmente en `PlayerBoard.js` y las cinco traducciones de rol existen en `translations.json`.
- #43 separa resaltado de turno/votación y toca `Coup.js`/`PlayerBoard.js`; #44 estudia ubicación/layout de opciones de decisión; #45 conserva el resaltado de la respuesta elegida y también toca el renderer compartido. Revisar sus estados, ramas y diffs antes de cambiar `Coup.js`; coordinar integración/base y mantener una sola edición concurrente del renderer.

## Alcance y límites

Incluye deduplicar por multiconjunto de roles, publicar al jugador elegible las cartas disponibles con identidad de slot y marca de mano original, renderizar esas cartas una sola vez en el panel de acciones, estado seleccionado con el resplandor rojo neón existente del turno, sustitución alternante de slots, rótulo localizado dinámico y confirmación. Preservar accesibilidad, estado enviado/deshabilitado y el envelope actual.

No cambiar reglas, cantidad de cartas, distribución privada, timeout, protocolo de envío (`decisionId`, `stateVersion`, `choiceId`), ids de opciones permitidas, resolución de cartas devueltas ni UX de otros tipos de decisión. No revelar las opciones a otros asientos/Codex por una proyección pública más amplia.

## F1 — Deduplicar resultados y seleccionar entre cartas del pool (`ACTIVE`)

**Pregunta única:** ¿puede el jugador formar cualquier combinación válida intercambiando iterativamente cartas iluminadas dentro del panel de acciones, con el server manteniendo autoridad y privacidad?

- Conservar la deduplicación server por firma canónica multiconjunto y su primera combinación física representante.
- Proyectar solo al asiento elegible una lista ordenada de slots del pool con rol e indicador original/draw; no enviar índices de resolución ni `choice.value`. Preservar esta metadata en pausas/reanudaciones si la decisión puede recuperarse.
- Mostrar cada carta física del pool una sola vez (4 si el jugador conserva dos influencias; 3 con una influencia), diferenciando original/draw por posición y nombre accesible, sin depender del rol para identificar copias iguales.
- Estado inicial: slots de la mano original iluminados; cartas robadas no iluminadas. Para dos originales, reemplazar el slot 1 (B) en el primer clic, slot 0 (A) en el segundo y alternar después. Un clic en seleccionada no cambia selección ni cursor. Para una original, reemplazar la única seleccionada en cada clic.
- Mantener exactamente `keepCount` cartas iluminadas. Calcular su multiconjunto de roles y asociarlo al `choiceId` permitido existente. No enviar hasta confirmar el rótulo inferior dinámico `Conservar X y Y`, que también será el botón de envío según aclaración del usuario.
- Usar el rojo neón y contorno blanco del estado de turno existente (`PlayerBoardStyles.css`) para resaltar cartas seleccionadas; preservar foco visible, teclado, estado enviado/pausa/error y eliminar el segundo renderer de `.DecisionsSection`.
- Sincronizar branch sobre `origin/master` vigente antes de tocar producto; coordinar #43/#44/#45 por las superficies compartidas.
- **Salida:** reporte `docs/plans/ambassador-exchange-options/report_issue_47_F1_v2.md` con matriz de estados/clics, una/dos influencias, roles repetidos, privacidad/protocolo, build y walkthrough visual.
- **Avanzar:** todo par legal es alcanzable, cada clic conserva exactamente `keepCount`, color/caption reflejan la selección y confirmar envía el `choiceId` correspondiente; walkthrough desktop/móvil PASS.
- **Pivotar:** si la rotación alternante impide llegar a una pareja o confunde el estado con roles repetidos, documentar una secuencia reproducible y proponer la variación mínima sin cambiar el diseño de cartas individuales.
- **Repetir:** una iteración acotada por defecto visual o de accesibilidad reproducible.
- **Bloquear:** conflicto no resuelto con #43/#44/#45, filtración de cartas, selección distinta de lo enviado o ausencia de navegador para el walkthrough final.
- **Commit:** `COMMIT_REQUIRED`; `feat(exchange): issue 47 F1 select from four visible cards`.
- **Validación:** inspección estática del algoritmo de slots y proyección Socket.IO; build cliente si está disponible; walkthrough manual desktop/móvil de inicialización, clics alternados, roles repetidos y confirmación; `git diff --check`. No agregar ni ejecutar pruebas automatizadas.

## F2 — Verificación independiente final (`PENDING`)

**Pregunta única:** ¿hay una secuencia de clics/estado donde sea inalcanzable una pareja legal, el número de cartas iluminadas sea incorrecto, se filtren roles privados o el botón inferior envíe una pareja distinta a la mostrada?

- Verifier independiente revisa el commit final e intenta falsificar reachability de las parejas, alternancia B/A, conteo de selección (dos cartas o una en el caso de una influencia), mapping caption→choiceId y proyección privada al asiento elegible.
- **Salida:** `docs/plans/ambassador-exchange-options/report_issue_47_F2_verifier.md` y verdict `PASS`/`FAIL`/`BLOCKED`.
- **Avanzar:** `PASS` documentado y unidad `WAITING_ORCHESTRATOR` para revisión de PR.
- **Pivotar:** corregir el caso exacto señalado, conservar evidencia y solicitar re-verificación focalizada.
- **Repetir:** una verificación sobre el commit corregido.
- **Bloquear:** riesgo de filtración, combinación legal inalcanzable o selección que no pueda resolverse sin cambiar protocolo/reglas; reorquestar antes de ampliar alcance.
- **Commit:** `COMMIT_REQUIRED`; `docs(exchange): issue 47 F2 CLOSED verifier pass`.
- **Validación:** revisión independiente del diff y evidencia; no ejecutar tests automatizados.

## Topología y próximo dueño

Una unidad #47 → `issue/47-ambassador-exchange-options` → `.worktrees/issue-47-ambassador-exchange-options` → una PR a `master` de `pronficilio/coup-online`. Antes de reclamar, leer issue y comprobar branch/worktree/PR candidato; registrar claim en el fork, releer y usar aislamiento desde `origin/master` actualizado. No usar `upstream`.

**Siguiente dueño:** Alquimista, reemplazar la galería de opciones F1 por la interacción de cartas descrita arriba. El navegador está disponible en `http://localhost:3103` con backend en `3104` para el walkthrough. Verifier independiente en F2 después del cierre F1.

**Falsificación:** ¿hay un pool alcanzable de cartas donde la interfaz ofrece dos opciones con la misma pareja de roles, omite una pareja distinta, muestra una carta diferente a la incluida en el `choiceId`, o envía opciones/datos privados a un asiento no elegible?
