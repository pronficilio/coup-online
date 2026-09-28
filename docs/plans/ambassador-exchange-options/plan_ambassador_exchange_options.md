# Plan — opciones visuales para el intercambio del Embajador (#47)

**Estado:** `ACTIVE`; F1 `ACTIVE`; issue `OPEN` asignada a `pronficilio`.
**Issue canónico:** https://github.com/pronficilio/coup-online/issues/47
**Handoff:** `docs/plans/active/issue_47_ambassador_exchange_options.md`
**Bitácora:** `docs/plans/log/issue-47.jsonl` (append-only).
**Modo / riesgo / verificación:** `LIGHT` / `MEDIUM` / `FINAL` independiente.
**Branch / worktree:** `issue/47-ambassador-exchange-options` / `.worktrees/issue-47-ambassador-exchange-options`.
**Base / destino:** `origin/master` vigente al reclamar / `master` de `pronficilio/coup-online`.
**Integración:** una PR asociada únicamente a #47; aún no existe.

## Solicitud y definición de éxito

Al ejecutar Exchange (Embajador), algunas combinaciones visualmente equivalentes aparecen repetidas. Optimizar las opciones considerando roles repetidos y orden irrelevante, y mostrar cada pareja elegible como elección dentro del panel/tablero de acciones, con las cartas ilustradas y la etiqueta localizada debajo.

Éxito significa que cada pareja de roles que represente un resultado distinto aparece una sola vez; opciones como `duke + captain` y `captain + duke`, o copias físicas de roles repetidos que produzcan la misma pareja, colapsan en una única elección. El jugador ve las imágenes de las cartas y su texto en el idioma actual y puede seleccionar una opción, mientras el servidor conserva autoridad sobre la opción permitida y resuelve el intercambio correctamente.

## Hechos confirmados

- `server/game/coup.js::openExchange` enumera subconjuntos por índices de la mano y las dos cartas robadas; cada opción tiene un `choiceId` secuencial, una etiqueta inglesa y datos de resolución privados.
- `activateDecision` publica al asiento elegible solo `{choiceId, label}`. El cliente actualmente localiza la etiqueta parseando el texto inglés y muestra opciones exchange como botones de texto en `.DecisionsSection`.
- `Coup.js` ya tiene un `DecisionActionPanel` dentro de `ActionDecisionRail`; las imágenes de influencias están actualmente en `PlayerBoard.js` y las cinco traducciones de rol existen en `translations.json`.
- #43 separa resaltado de turno/votación y toca `Coup.js`/`PlayerBoard.js`; #44 estudia ubicación/layout de opciones de decisión; #45 conserva el resaltado de la respuesta elegida y también toca el renderer compartido. Revisar sus estados, ramas y diffs antes de cambiar `Coup.js`; coordinar integración/base y mantener una sola edición concurrente del renderer.

## Alcance y límites

Incluye deduplicar por combinación no ordenada de roles conservados, publicar los datos de presentación estrictamente necesarios al jugador elegible, renderizar opciones Exchange como parejas de cartas dentro del panel de acciones, texto accesible/localizado debajo, y conservar estado enviado/deshabilitado y submission envelope actual.

No cambiar reglas, cantidad de cartas, distribución privada, timeout, protocolo de envío (`decisionId`, `stateVersion`, `choiceId`), ids de opciones permitidas, resolución de cartas devueltas ni UX de otros tipos de decisión. No revelar las opciones a otros asientos/Codex por una proyección pública más amplia.

## F1 — Deduplicar resultados y renderizar parejas Exchange (`READY`)

**Pregunta única:** ¿puede una clave canónica de roles conservados eliminar duplicados sin fusionar resultados distintos, y puede el panel existente alojar esas elecciones ilustradas sin exponer datos privados ni cambiar el envío?

- Enumerar combinaciones como ahora, derivar para cada una los roles conservados y deduplicar mediante una firma estable que trate el orden como irrelevante y preserve multiplicidad (`duke + duke` distinto de `duke + captain`). Conservar índices de una combinación representante para la resolución actual.
- Dar a cada resultado único un `choiceId` estable y único dentro de la decisión. Entregar al cliente solo la pareja de roles de cada opción al jugador autorizado, sin serializar `value`, `keptIndices` ni mano completa.
- Presentar el tipo `exchange` dentro del `ActionDecisionPanel` del `ActionDecisionRail`, como opciones seleccionables con una imagen por carta y una etiqueta localizada bajo la pareja. Reusar assets/localización de roles existentes cuando sea razonable; mantener etiquetas accesibles y feedback de envío/deshabilitado.
- Retirar las opciones exchange duplicadas de `.DecisionsSection` para evitar dos renderers y confirmar que se siguen limpiando en cambio de fase, espera, pausa, error y respuesta enviada.
- Releer y coordinar #43/#44/#45 antes de editar los archivos compartidos; integrar sobre base fresca y trabajar en un branch/worktree canónicos.
- **Salida:** cambio acotado, reporte `docs/plans/ambassador-exchange-options/report_issue_47_F1.md` con matriz de pools (roles distintos, repetidos, orden espejo, una influencia y dos influencias) y evidencia de privacidad/protocolo.
- **Avanzar:** cada firma semántica aparece una vez, ninguna firma distinta desaparece, la imagen/texto identifica cada pareja y el server sigue aceptando solo su `choiceId`.
- **Pivotar:** si el cliente no puede ubicar el panel como se pide sin competir con #44, documentar la alternativa de integración más cercana en el mismo panel antes de implementarla.
- **Repetir:** una iteración acotada por defecto visual o de accesibilidad reproducible.
- **Bloquear:** conflicto no resuelto con #44/#45, duplicación de la emisión privada o fallo de opción/resolución.
- **Commit:** `COMMIT_REQUIRED`; `feat(exchange): issue 47 F1 unique visual keep choices`.
- **Validación:** inspección estática del algoritmo y proyección Socket.IO; build cliente/servidor si el entorno lo permite; walkthrough manual de parejas repetidas y distintas en móvil/escritorio; `git diff --check`. No agregar ni ejecutar pruebas automatizadas.

## F2 — Verificación independiente final (`PENDING`)

**Pregunta única:** ¿existe un pool válido donde se omita una pareja distinta, se conserve una duplicada, se filtren roles a otro jugador o la opción visual no corresponda a la que el servidor resuelve?

- Verifier independiente revisa el commit final, compara la firma canónica, opciones proyectadas al asiento elegible y `keptIndices` representante, e intenta falsificar esos cuatro criterios.
- **Salida:** `docs/plans/ambassador-exchange-options/report_issue_47_F2_verifier.md` y verdict `PASS`/`FAIL`/`BLOCKED`.
- **Avanzar:** `PASS` documentado y unidad `WAITING_ORCHESTRATOR` para revisión de PR.
- **Pivotar:** corregir el caso exacto señalado, conservar evidencia y solicitar re-verificación focalizada.
- **Repetir:** una verificación sobre el commit corregido.
- **Bloquear:** riesgo de filtración o selección que no pueda resolverse sin cambiar protocolo/reglas; reorquestar antes de ampliar alcance.
- **Commit:** `COMMIT_REQUIRED`; `docs(exchange): issue 47 F2 CLOSED verifier pass`.
- **Validación:** revisión independiente del diff y evidencia; no ejecutar tests automatizados.

## Topología y próximo dueño

Una unidad #47 → `issue/47-ambassador-exchange-options` → `.worktrees/issue-47-ambassador-exchange-options` → una PR a `master` de `pronficilio/coup-online`. Antes de reclamar, leer issue y comprobar branch/worktree/PR candidato; registrar claim en el fork, releer y usar aislamiento desde `origin/master` actualizado. No usar `upstream`.

**Siguiente dueño:** Ejecutor, F1 implementación localizada tras auditar los solapamientos #43/#44/#45. Verifier independiente requerido en F2. El Orquestador revisa la integración y evidencia final.

**Falsificación:** ¿hay un pool alcanzable de cartas donde la interfaz ofrece dos opciones con la misma pareja de roles, omite una pareja distinta, muestra una carta diferente a la incluida en el `choiceId`, o envía opciones/datos privados a un asiento no elegible?
