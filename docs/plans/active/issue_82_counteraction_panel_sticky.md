# Handoff — issue #82

**Issue:** [#82 — ajustar el título y la posición del panel de contraacciones](https://github.com/pronficilio/coup-online/issues/82), `OPEN`.
**Plan:** `docs/plans/counteraction-panel-sticky/plan_counteraction_panel_sticky.md`.
**Estado:** unidad `WAITING_ORCHESTRATOR`; F1 `CLOSED`.
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
**Verifier requerido ahora:** no.
**Branch/worktree/merge target:** `issue/82-counteraction-panel-sticky` / `.worktrees/issue-82-counteraction-panel-sticky` / `master`.
**PR:** [#83](https://github.com/pronficilio/coup-online/pull/83), `OPEN` y `MERGEABLE`.
**Tracker:** [comentario de cierre F1 y entrega al Orquestador](https://github.com/pronficilio/coup-online/issues/82#issuecomment-5982604168).
**Bitácora:** `docs/plans/log/issue-82.jsonl`.
**Siguiente dueño:** Orquestador.

## F1 cerrada — PR #83 abierta para revisión del Orquestador

El claim se publicó y releyó en [la issue #82](https://github.com/pronficilio/coup-online/issues/82#issuecomment-5982324120); la issue sigue `OPEN`, sin reclamo incompatible ni PR candidata. La branch `issue/82-counteraction-panel-sticky` y el worktree `.worktrees/issue-82-counteraction-panel-sticky` se crearon desde `origin/master` en `02bcf3e` y se verificaron limpios.

El plan, el handoff y la bitácora están dentro del worktree, y el commit de control `7e0b10c` precede al cambio de producto.

**Resultado:** `challenge`, `block` y `block_challenge` usan el título «Contraacciones» / «Counteractions» y nombres accesibles específicos para expandir/contraer. Las otras decisiones mantienen el título genérico. El rail usa posición fija en escritorio; el `top` se limita a 15 px cuando el ancla queda por encima del viewport. En los rangos 721–1023 y 1024–1100 px, el ancho queda limitado para dejar al menos 15 px frente al `.EventLogPanel` fijo, que usa `right: 15px` y ancho de hasta 340 px. La rama móvil conserva el cálculo de coordenadas previo y sus reglas CSS, incluido el caso de EventLog expandido. No cambian opciones, callbacks ni reglas.

**Validaciones:** `git diff --check` terminó con código 0. `npm run build` en `coup-client` terminó con código 0 (`Compiled with warnings`): `logo`/`Link` sin uso en `src/App.js`, `postcss-calc` no interpreta `dvh` en `ReferencePanel.css:216,222`, y `caniuse-lite` está desactualizado. No se añadieron ni ejecutaron pruebas automatizadas.

**Revisión visual:** no disponible en este entorno, que no tiene binario de navegador ni herramienta de preview local; no se declara PASS visual. La revisión estática confirmó el clamp desktop y las separaciones geométricas anteriores. El código/reglas específicos de móvil no cambiaron, pero no se comprobó visualmente en navegador.

**Commit de cierre F1:** [`986ccb2c226de1a058a971efa64489dc4db99db7`](https://github.com/pronficilio/coup-online/commit/986ccb2c226de1a058a971efa64489dc4db99db7), `fix(counteraction-panel): issue 82 F1 CLOSED ready_review`.

**Pregunta de falsificación:** al desplazarse en escritorio con una decisión activa, ¿el rail sale del viewport o se solapa con el registro de eventos? ¿El layout móvil difiere del estado previo?

## Secuencia de integración

La PR canónica única es [#83](https://github.com/pronficilio/coup-online/pull/83) hacia `master`. La issue #82 permanece `OPEN`; no se fusionó ni cerró.
