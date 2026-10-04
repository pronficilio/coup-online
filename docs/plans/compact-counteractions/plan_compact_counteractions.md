# Plan — compactar el panel de contraacciones fuera del turno (#69)

**Estado:** `COMPLETED`; F1 `CLOSED_WAIVED_BY_OWNER`; issue `CLOSED` al integrar PR #71.
**Issue canónico:** https://github.com/pronficilio/coup-online/issues/69
**Cierre:** `docs/plans/completed/issue_69_compact_counteractions.md`.
**Bitácora:** `docs/plans/log/issue-69.jsonl` (append-only).
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
**Branch / worktree:** `issue/69-compact-counteractions` / `.worktrees/issue-69-compact-counteractions`.
**Base / destino:** `master` de `pronficilio/coup-online` (`origin`).
**Integración:** [PR #71](https://github.com/pronficilio/coup-online/pull/71), merge commit `a85f4c511c8888e7355b8596d5240eacc7025c23` en `master`.

## Solicitud y definición de éxito

Agregar `DecisionActionPanel--compact` cuando la decisión sea una contraacción fuera del turno propio: `challenge`, `block` o `block_challenge`. El objetivo es reducir el espacio que ocupa la caja al decidir si desafiar, bloquear o pasar. Las opciones y la lógica de decisiones permanecen iguales; el panel de acciones del turno propio conserva su comportamiento compacto por interacción.

Éxito significa que esas tres ventanas de respuesta se presentan compactas y sus opciones siguen visibles, legibles y operables en escritorio y móvil.

## Estado confirmado

- La issue #56 centralizó las decisiones en el rail y quedó integrada; este trabajo es un ajuste visual posterior.
- En `Coup.js`, `renderActionDecision` añade la clase compacta según `actionPanelCompact`.
- `RESPONSE_WINDOW_TYPES` identifica `challenge`, `block` y `block_challenge` como ventanas de respuesta fuera del turno propio.
- `renderChoiceDecision` también monta `prove_claim` y `lose_influence`; esos tipos pueden corresponder a quien inició la acción o al objetivo durante su resolución y quedan fuera del cambio.
- `CoupStyles.css` ya define el modificador compacto del rail, incluido un ancho de 50%; la revisión visual debe comprobar que las opciones sigan usables en pantallas estrechas.
- La issue #69 se cerró al integrar PR #71. El propietario autorizó el merge pese a que no hubo capturas visuales; ese criterio queda waived, no PASS.

## Alcance y límites

Incluye añadir el modificador compacto a `challenge`, `block` y `block_challenge` mediante la clasificación existente `RESPONSE_WINDOW_TYPES`, conservar las opciones recibidas, envío/error, copy, localización y accesibilidad, y revisar su legibilidad/operación en escritorio y móvil. Permite un ajuste CSS pequeño solo si la revisión demuestra que el modificador actual deja controles recortados o inutilizables.

No incluye compactar `prove_claim`/`lose_influence`, cambiar reglas, tipos u opciones del servidor, copy, traducciones, callbacks, el compactado interactivo del panel de turno propio, `ExchangeDecisionPanel`, ni el rail/tablero. No agregar ni ejecutar pruebas automatizadas.

## F1 — compactar contraacciones (`CLOSED_WAIVED_BY_OWNER`)

**Pregunta única:** ¿el modificador compacto reduce el tamaño de `challenge`, `block` y `block_challenge` y conserva todas sus opciones visibles y operables en escritorio y móvil?

- Añadir `DecisionActionPanel--compact` en `renderChoiceDecision` solo cuando `RESPONSE_WINDOW_TYPES.has(decision.type)` sea verdadero (`challenge`, `block`, `block_challenge`).
- Conservar intactos el renderer de acciones del turno propio, las decisiones intercambiadas por `ExchangeDecisionPanel`, los controles de envío y los datos de decisión.
- Confirmar que `prove_claim` y `lose_influence` siguen sin el nuevo modificador.
- Revisar el comportamiento visual en escritorio y móvil. Si el ancho existente de 50% recorta u oprime opciones, realizar solo el ajuste responsive mínimo para que sigan operables y explicar la evidencia.
- Ejecutar build del cliente y `git diff --check`; documentar el resultado y los límites de la revisión en `docs/plans/compact-counteractions/report_issue_69_F1.md`.

**Avanzar:** el renderer de respuesta recibe la clase compacta; las opciones permanecen legibles y operables en los viewports revisados; build y diff-check pasan.
**Pivotar:** si el ancho existente impide usar una opción, proponer y aplicar un ajuste responsive mínimo dentro del alcance, documentándolo.
**Repetir:** un ciclo visual acotado si se reproduce recorte o solapamiento.
**Bloquear:** una regresión de decisión/opciones o un problema de layout que requiera rediseñar el rail o cambiar el contrato.
**Artefactos:** `Coup.js`, potencialmente `CoupStyles.css` por la condición anterior, y el reporte F1.
**Commit:** `COMMIT_REQUIRED`; implementación/reporte: `da1552a feat(game-ui): issue 69 F1 BLOCKED`; waiver del propietario registrado por el Orquestador. La ausencia de evidencia visual no se convierte en `PASS`.
**Verificación:** `NONE`; el ejecutor registra la validación local y walkthrough visual, sin Verifier independiente.

## Siguiente dueño y topología

Unidad completada: issue #69 → branch `issue/69-compact-counteractions` → worktree `.worktrees/issue-69-compact-counteractions` → PR #71 integrada hacia `master` de `pronficilio/coup-online`.

**Pregunta de falsificación:** ¿alguna opción de respuesta queda recortada, solapada o difícil de activar después de compactar el panel, especialmente en móvil?

## Resultado de ejecución F1 — 2026-09-29

- Implementado `DecisionActionPanel--compact` solo para `challenge`, `block` y `block_challenge` mediante `RESPONSE_WINDOW_TYPES` en `renderChoiceDecision`.
- Build del cliente y `git diff --check` completados; ver [reporte F1](report_issue_69_F1.md).
- La revisión visual desktop/móvil no se pudo ejecutar: Chromium headless no produjo capturas dentro del sandbox ni en el intento escalado acotado. El propietario autorizó explícitamente el merge pese a esa ausencia; no se afirma legibilidad visual ni F1 `PASS`.
- No hubo ajuste CSS porque no se obtuvo evidencia visual de controles inutilizables. El propietario autorizó la integración; la revisión visual permanece sin verificar y no se registra como `PASS`.

## Integración y cierre — 2026-09-29

- PR [#71](https://github.com/pronficilio/coup-online/pull/71) se integró a `master` en `a85f4c511c8888e7355b8596d5240eacc7025c23`; GitHub cerró #69.
- F1 queda `CLOSED_WAIVED_BY_OWNER` por autorización explícita del propietario. Build exit 0 con warnings documentados; `git diff --check` pasó; no hubo pruebas automatizadas.
- Chromium no produjo capturas de escritorio/móvil. La integración no declara verificación visual ni F1 `PASS`.
- Ver [reporte F1](report_issue_69_F1.md), [cierre de unidad](../completed/issue_69_compact_counteractions.md) y bitácora.
