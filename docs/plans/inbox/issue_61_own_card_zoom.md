# Handoff para Agente Alquimista — issue #61

- **Issue:** https://github.com/pronficilio/coup-online/issues/61 (`OPEN`, sin asignar; estado operativo `WAITING_EXECUTOR`).
- **Plan exacto:** `docs/plans/own-card-zoom/plan_own_card_zoom.md`.
- **Bitácora exacta:** `docs/plans/log/issue-61.jsonl` (append-only).
- **Modo / riesgo / verificación:** `LIGHT` / `MEDIUM` / `NONE`.
- **Verifier requerido ahora:** no; la política predeterminada del proyecto es `NONE` para este cambio visual.
- **Pregunta de falsificación:** ¿abrir/cerrar rápidamente, perder la influencia de origen, recibir decisión o pausa, navegar con teclado o reducir el viewport deja un modal atascado, pierde el foco, expone una identidad rival o bloquea una acción?
- **Fase sugerida:** F1 `READY` — ampliar una influencia propia con transición medida, cierre seguro y revisión visual.
- **Por qué sigue:** la petición del propietario es concreta y la inspección de `PlayerBoard.js`, los assets existentes, `react-modal` y la captura `fotos/pantalla.png` permite delimitar una mejora local.
- **Documentos fuente:** issue #61; `docs/plans/own-card-zoom/plan_own_card_zoom.md`; reglas locales `../../docs/agentes/ORQUESTADOR.md` y `../../docs/agentes/ALQUIMISTA.md` (ignoradas por Git; leer desde el checkout raíz); `docs/plans/PROJECT_ORCHESTRATION.yaml`; `PlayerBoard.js`, `PlayerBoardStyles.css`, `ReferencePanel.js` y `ReferencePanel.css`; captura local `../../fotos/pantalla.png` en checkout raíz (ignorada por Git).
- **Subtareas listas:** hacer activables únicamente las influencias propias activas; crear modal/portal con cierre, foco y traducciones; animar desde/hacia rectángulo medido; cerrar ante pausa/decisión/invalidez; revisar movimiento reducido, escritorio, móvil, build y reporte.
- **Criterios de aceptación:** ver plan y cuerpo de issue #61; preservar privacidad de influencias ocultas; transiciones iniciales 210–220/160–180 ms; mantener proporción/viewport; soportar mouse, teclado y toque; foco modal con retorno; cierre seguro y ES/EN.
- **Evidencia requerida:** resultado de `cd coup-client && npm run build`; reporte F1 con tamaños de pantalla/casos revisados, tiempos observados, manejo de foco, pausa/decisión, movimiento reducido y cierre rápido. No agregar tests automatizados.
- **Riesgos/bloqueos:** modal puede solaparse con rail de decisiones o pausa; invalidación de origen durante actualizaciones; no pasar datos de cartas rivales al control ni al modal. Si requiere tocar reglas/servidor, detener y devolver al Orquestador.
- **Política de commits:** `COMMIT_REQUIRED` para F1; commit de cierre con código, reporte y evento `phase_verdict`.
- **Commit de cierre por fase:** `feat(card-zoom): issue 61 F1 CLOSED`.
- **Branch destino del issue:** `issue/61-own-card-zoom`.
- **Worktree destino del issue:** `.worktrees/issue-61-own-card-zoom`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **Bitácora del issue:** `docs/plans/log/issue-61.jsonl`.
- **PR/MR esperado:** una única PR para issue #61 hacia `master`.
- **Delegación:** desglosar subtareas técnicas atómicas según la política/capacidad de agentes disponible en la sesión; no asumir ni inventar agentes.

## Reclamo y aislamiento

Antes de trabajo técnico, reclama #61 en el fork, vuelve a leer la issue y confirma que no haya un reclamo incompatible. Luego confirma que este branch y worktree son los canónicos y están limpios. El Orquestador ya preparó este aislamiento desde `origin/master` para alojar el plan; no crees otra rama, worktree o PR. Actualiza la base desde `origin/master` si avanzó desde `b39f649`, conservando el único branch de la unidad. Lee las reglas locales ignoradas por Git desde `../../docs/agentes/`. Usa `../../fotos/pantalla.png` como referencia local sin añadirla al PR. No uses el checkout raíz para editar código ni `upstream`.

## Validación y cierre

F1 debe responder si la carta puede ampliarse con continuidad y volver al tablero sin afectar privacidad, foco o decisiones. Ejecuta el build y la revisión visual definidos en el plan; registra evidencia y la respuesta a falsificación. Cierra con un commit que incluya implementación, reporte y `phase_verdict`. No marques `PASS` si la coordinación con decisión/pausa o el acceso por teclado/táctil no está resuelta. El Ejecutor no integra ni cierra la issue; espera revisión del Orquestador.

**Siguiente dueño:** Agente Alquimista después de reclamar la issue.
