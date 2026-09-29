# Plan — centrar y diseñar los mensajes de estado (#67)

**Estado:** `COMPLETED` por instrucción explícita del usuario; F1 `CLOSED` con walkthrough visual omitido por esa instrucción.
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
**Issue:** [#67](https://github.com/pronficilio/coup-online/issues/67).
**Solicitud:** llevar los mensajes existentes al centro de la franja superior, a la altura `top: 15px` del registro de eventos, con ancho medio, separación y diseño visual cuidado. Mantener intacto el registro.

## Estado confirmado

- El commit `43f798b` ya colocó `.DecisionsSection` entre `GameHeader` y `PlayerBoard`, y unificó los estilos bajo `.GameStatusMessage`. El componente no debe volver bajo el tablero.
- En escritorio, `.EventLogPanel` es fijo a `top: 15px; right: 15px` y tiene hasta 340 px de ancho. Hasta 720 px pasa al flujo vertical dentro de `GameHeader`.
- `.DecisionsSection` muestra los estados existentes de espera, espera por pausa y ganador, sin controles. #56 está cerrada y cubre la ubicación centralizada de las decisiones.
- #61 quedó cerrada al integrar [PR #68](https://github.com/pronficilio/coup-online/pull/68) en `cf9342b95b24ec5f6f390571b2fb2d62973d99be` después de preparar #67. La base nueva añade `zoomDisabled` al montaje de `PlayerBoard` en `Coup.js`; el Ejecutor debe partir de la última `origin/master` y preservar esa condición, que desactiva el zoom con pausa, espera, decisión o ganador.

## Objetivo y alcance

Presentar los mensajes de estado en una composición superior balanceada de tres zonas: preservar el `EventLogPanel` en su lado actual, colocar el mensaje en la zona central con ancho medio y dejar vacía la zona opuesta. Alinear arriba a 15 px en escritorio y adaptar el acomodo a ventanas estrechas y móvil sin superponer elementos ni empujar/ocultar el tablero.

Archivos permitidos: `coup-client/src/components/game/Coup.js` y `coup-client/src/components/game/CoupStyles.css`. Se pueden ajustar montaje/estilos de `.DecisionsSection` y `.GameStatusMessage`; no modificar `EventLog.js`, `EventLogStyles.css`, `PlayerBoard`, `ReferencePanel`, el rail de decisiones, pausa ni lógica de partida. Conservar contenido localizado, condiciones, `aria-live` y `role="status"`.

El tratamiento visual debe ser coherente y legible para espera normal, espera durante pausa y ganador, tomando como referencia el antiguo `PauseWaitingStatus`; esa clase ya no existe en la base actual.

## F1 — composición y estilo de los mensajes

- **Pregunta:** ¿Los tres mensajes quedan en la zona central de la franja superior, alineados con el registro y separados de él, en escritorio y móvil?
- **Entrada:** `Coup.js`, `CoupStyles.css`, `EventLogStyles.css` como referencia de la ubicación actual, issue #67.
- **Salida:** ajuste de UI acotado y `report_issue_67_F1.md` con el diff, build, `git diff --check` y walkthrough visual de escritorio/móvil.
- **Criterios de avance:** `DecisionsSection` sigue antes de `PlayerBoard`; el estado queda a 15 px arriba en escritorio con ancho medio y una zona exterior vacía; no se toca el Event Log; en móvil/ventana angosta no hay solapamiento, recorte ni pérdida de lectura; estados, copy, localización y accesibilidad permanecen.
- **Falsificación:** ¿algún ancho o estado hace que el mensaje toque/cubra el registro, desaparezca al colapsarlo o se superponga con controles/tablero?
- **Pivote:** si el centro exacto no cabe junto al panel, reducir el ancho central o adaptar las zonas a una composición vertical por breakpoint; no mover ni redimensionar el registro.
- **Repetición acotada:** una segunda variante CSS responsive si la primera deja colisión/recorte; documentar medidas y variante elegida.
- **Bloqueo/cancelación:** bloquear si el requisito depende de cambiar el Event Log o de una decisión visual que no pueda resolverse conservando su geometría; pedir al propietario que resuelva el alcance antes de ampliar archivos.
- **Subtareas:** implementar montaje/estilos en los dos archivos autorizados; revisar visualmente espera normal, espera de pausa y ganador a escritorio/móvil; reportar resultados y limitaciones.
- **Política de commit:** `COMMIT_REQUIRED`.
- **Commit de cierre:** `feat(game-ui): issue 67 F1 CLOSED`.
- **Validaciones:** build cliente, `git diff --check` y revisión visual manual responsive; no agregar ni ejecutar tests automatizados.

### Resultado de ejecución F1 (2026-09-29)

- **Veredicto:** implementación integrada por instrucción explícita del usuario; no se declara `PASS` de revisión visual.
- Se aplicaron los estilos de `.GameStatusMessage`/`.DecisionsSection` y `margin-top: 50px` al `.PlayerBoardContainer`, preservando su centrado y margen inferior.
- `npm run build` terminó con código 0 (`Compiled with warnings`): imports sin uso `logo`/`Link` en `App.js`, `dvh` en `ReferencePanel.css` y `caniuse-lite` desactualizado.
- `git diff --check` terminó con código 0. No se agregaron ni ejecutaron tests.
- La captura disponible muestra la portada, no una partida. No se recorrieron los tres estados en desktop/móvil; el usuario pidió cerrar el cambio con el margen indicado y autorizó después el merge sin exigir ese walkthrough.
- La señal anterior de solapamiento en 721–1024 px omitía `translateX(-50%)`; el cálculo corregido deja unos 15.5 px hasta el registro en ese breakpoint. Es una inferencia estática, no una comprobación en navegador.
- **Autorización de integración:** el usuario pidió explícitamente merge a `master` el 2026-09-29.

## Topología canónica

- Branch: `issue/67-status-message-layout`.
- Worktree: `.worktrees/issue-67-status-message-layout`.
- Merge target: `master` de `pronficilio/coup-online` (`origin`). Una PR para #67.
- Plan: `docs/plans/status-message-layout/plan_status_message_layout.md`.
- Cierre: `docs/plans/completed/issue_67_status_message_layout.md`.
- Bitácora append-only: `docs/plans/log/issue-67.jsonl`.
- Reporte de F1: `docs/plans/status-message-layout/report_issue_67_F1.md`.
