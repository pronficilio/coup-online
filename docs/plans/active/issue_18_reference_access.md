# Handoff para Agente Alquimista — issue #18

- **Issue:** https://github.com/pronficilio/coup-online/issues/18
- **Plan exacto:** `docs/plans/reference-access/plan_reference_access.md`
- **Bitácora exacta:** `docs/plans/log/issue-18.jsonl`
- **Estado:** `COMPLETED`; issue #18 cerrada después de integrar y verificar el PR #20. Claim registrado en comentario #5851364890; la implementación se aisló desde `origin/master` en `55be894a608822f1e22b09c5338e04b658d1477d`.
- **Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
- **Verifier requerido ahora:** no; revisión final del Orquestador.
- **Branch de toda la unidad:** `issue/18-reference-access`.
- **Worktree de toda la unidad:** `.worktrees/issue-18-reference-access`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **PR canónico:** [#20](https://github.com/pronficilio/coup-online/pull/20), integrado en `master` mediante merge commit `64a507dcefa3ffea2ecf60653755342930c49f09`.

## Solicitud y objetivo

Montar en la interfaz de una partida los dos accesos a las referencias ya integradas por el PR #12: `Tarjeta` y `Tabla`. Colócalos como controles compactos en la esquina inferior derecha, inspirados por `fotos/mini.png` (fuente local ignorada por Git; no versionarla). Cada control abre el modal correspondiente de `ReferencePanel.js`.

El PR #12 está fusionado y la issue #8 cerrada. El PR añadió los cuatro WebP y el componente aislado, pero `Coup.js` aún no importa ni monta `ReferencePanel`; #8 quedó cerrada sin que su acceso en partida estuviera completo. Esta continuación tiene su propia issue y su única integración.

## Reclamo y aislamiento obligatorio

Antes de crear el branch/worktree, relee #18 en `pronficilio/coup-online`, reclama la unidad en el tracker, vuelve a leerla y confirma que no existe otro reclamo incompatible. Después crea/confirma `issue/18-reference-access` y `.worktrees/issue-18-reference-access` desde `origin/master`. Registra `claim` y `worktree_confirmed`; mueve este handoff de `inbox/` a `active/` y añade un commit de control si cambió el plano. Toda la implementación ocurre en ese worktree, nunca en `master`.

Toda mutación `gh` debe especificar `--repo pronficilio/coup-online`; publica solo a `origin`. No escribas en `Cheneth/coup-online` ni en `upstream`.

## Fase F1 — Accesos a referencias en la partida (`CLOSED`)

**Pregunta:** ¿puede cada jugador abrir la tarjeta o la tabla desde los controles inferiores derechos sin interferir con el juego?

### Alcance permitido

- Montar `ReferencePanel` en la partida normal de `Coup.js` y ubicar sus dos accesos en un dock inferior derecho, con botones cuadrados e iconos acordes al ejemplo visual.
- Conservar los dos modales separados, el contenido español existente y la carga de la imagen correspondiente a la referencia abierta.
- Mantener acceso con teclado y tacto, foco visible, nombre accesible y área táctil de al menos 48 × 48 px; cerrar por control, `Escape` y fondo y devolver el foco.
- Adaptar la posición para escritorio y móvil de modo que los controles no cubran las decisiones de juego. Los accesos siguen visibles durante cualquier turno y para jugadores eliminados.
- Conservar Rules y el acceso actual a Cheat Sheet. No cambiar reglas, Socket.IO, servidor, flujo de decisiones ni añadir dependencias.
- Puedes ajustar `Coup.js`, `CoupStyles.css`, `ReferencePanel.js` y `ReferencePanel.css`; los PNG fuente de `fotos/` no se copian ni versionan.

### Criterios de aceptación

1. La esquina inferior derecha muestra dos accesos reconocibles y visualmente coherentes con el ejemplo; ambos permanecen utilizables en escritorio y móvil sin tapar decisiones.
2. `Tarjeta` y `Tabla` abren su modal independiente en español; cerrar cualquiera deja intactos el turno, la decisión pendiente y el foco previo.
3. Antes de abrir una referencia no se solicita su WebP; al abrirla se carga solo la imagen elegida.
4. Los controles funcionan con teclado y tacto, tienen nombre accesible, foco visible y área táctil de 48 × 48 px; `Escape`, fondo y botón cierran el modal.
5. La animación existente respeta `prefers-reduced-motion`; Rules y Cheat Sheet siguen disponibles.
6. El build del cliente pasa y una revisión manual en escritorio y viewport móvil documenta apertura/cierre de ambas referencias y ausencia de solapamiento.

### Evidencia, validación y cierre

- Resultado actual en `docs/plans/reference-access/report_issue_18_F1.md`: build y diff-check pasan; Chromium headless confirmó escritorio y viewport móvil, apertura/cierre de ambas referencias, retorno de foco, estado de decisión sin cambios, carga individual de imágenes, movimiento reducido y toque emulado.
- F1 está `CLOSED`. La única limitación es que el toque se simuló en Chromium, no en un dispositivo físico. No se añadieron ni ejecutaron tests automatizados.
- Intentar refutar el éxito: comprobar si un botón tapa una decisión en viewport estrecho, si el cierre altera una decisión/turno, si se descarga una imagen no solicitada o si el foco no vuelve al control de apertura.
- `COMMIT_REQUIRED`: registrar la evidencia final en el reporte, actualizar plan/bitácora y confirmar que el commit de fase de implementación existe. Para el cierre de fase usa `docs(reference-panel): issue 18 F1 CLOSED ready_review`.
- Cierre: el Orquestador verificó el PR canónico #20, lo integró tras la autorización del usuario y cerró la issue #18. La bitácora registra revisión, merge y cierre.

## Delegación y condición de parada

La unidad está completada. Se conserva este handoff en `active/` según la organización documental existente del repositorio; la fuente de estado del tracker indica issue cerrada.
