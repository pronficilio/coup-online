# Handoff Para Agente Ejecutor

**Issue/Ticket:** [#67 — Centrar y diseñar los mensajes de estado sobre el tablero](https://github.com/pronficilio/coup-online/issues/67)
**Plan:** `docs/plans/status-message-layout/plan_status_message_layout.md`
**Estado del plan:** `ACTIVE`; F1 `ACTIVE`.
**Modo de ejecución:** `LIGHT`.
**Nivel de riesgo:** `LOW`.
**Política de verificación:** `NONE` (sin Verifier independiente).
**Verifier requerido ahora:** no.
**Pregunta de falsificación:** ¿Hay un ancho de escritorio o móvil donde la tarjeta toque/cubra el Event Log, se pierda al colapsarlo o empuje/oculte el tablero y sus controles?

## Fase sugerida

**F1 — composición y estilo de los mensajes.** Acomodar espera normal, espera durante pausa y ganador en la zona central de la franja superior, a 15 px del borde superior en escritorio, con ancho medio y espacio respecto al `EventLogPanel`. Esta es la única fase de la unidad.

## Subtareas listas

1. Revisar la geometría real del `EventLogPanel` en escritorio y móvil. En escritorio usa `top: 15px`, `right: 15px` y ancho hasta 340 px; en ≤720 px vuelve al flujo vertical de `GameHeader`. No modificar ni recolocar el componente.
2. Ajustar solo `coup-client/src/components/game/Coup.js` y `coup-client/src/components/game/CoupStyles.css` para presentar el status en la zona central de una franja balanceada de tres zonas: zona del registro preservada, estado de ancho medio y zona vacía opuesta. A 15 px del top en escritorio; resolver viewports estrechos con adaptación responsive sin intersecciones.
3. Aplicar estilo cuidado y consistente a los tres mensajes, tomando como referencia el antiguo `PauseWaitingStatus` (hoy `GameStatusMessage`). Conservar copy, condiciones, traducción, `aria-live` y `role="status"`.
4. Ejecutar build de cliente y `git diff --check`; recorrer visualmente espera normal, pausa y ganador en escritorio/móvil; documentar evidencia y limitaciones en `docs/plans/status-message-layout/report_issue_67_F1.md`.

**Criterios de aceptación:** ver los siete criterios de #67 y la fase F1 del plan. No poner status en flujo después de `PlayerBoard`; respetar `ReferencePanel` y overlays flotantes existentes.

**Archivos permitidos:** `coup-client/src/components/game/Coup.js`, `coup-client/src/components/game/CoupStyles.css`. `EventLog.js`, `EventLogStyles.css`, `PlayerBoard`, `ReferencePanel`, decisión y pausa están fuera de alcance.

**Evidencia requerida:** diff acotado, resultado del build, `git diff --check`, revisión visual responsive de los tres estados y reporte de F1. No agregar ni ejecutar tests automatizados.
**Riesgos/bloqueos:** si el centro no cabe, reducir ancho o adaptar layout por breakpoint; no cambiar tamaño ni posición del Event Log. #61 se cerró al integrar PR #68 (`cf9342b`); la última `origin/master` incluye `zoomDisabled` en el montaje de `PlayerBoard` desde `Coup.js`. Crear el branch desde esa base y conservar la condición.
**Política de commits:** `COMMIT_REQUIRED` para F1, incluyendo su reporte. Cierre previsto: `feat(game-ui): issue 67 F1 CLOSED`.

## Topología y reclamo obligatorios

- **Branch destino:** `issue/67-status-message-layout`.
- **Worktree destino:** `.worktrees/issue-67-status-message-layout`.
- **Merge target:** `master` de `pronficilio/coup-online` (`origin`).
- **Bitácora exacta:** `docs/plans/log/issue-67.jsonl` (append-only).
- **PR esperada:** una PR hacia `master` que cierre #67.
- **Validaciones esperadas:** build del cliente, `git diff --check`, walkthrough manual de escritorio y móvil.

Antes de trabajo técnico, reclama #67 explícitamente en el tracker, vuelve a leerla y confirma que no hay reclamo incompatible. Después crea/confirma el branch y worktree únicos desde la última `origin/master` (incluido el merge de #61); dentro del worktree registra `claim` y `worktree_confirmed` en la bitácora y mueve este handoff de `inbox/` a `active/`. No registres el reclamo con un commit directo a `master`.

No se requiere Verifier. Actualiza el plan, la issue, la bitácora y este handoff con el resultado F1. Delegar subtareas ordinarias solo según la política de agentes/modelos del proyecto; no inventar agentes si el entorno no ofrece jerarquía.
