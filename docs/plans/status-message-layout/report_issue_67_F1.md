# Reporte F1 — issue #67

**Estado:** `COMPLETED` por instrucción explícita del usuario; walkthrough visual `WAIVED`
**Fecha:** 2026-09-29
**Branch/worktree:** `issue/67-status-message-layout` / `.worktrees/issue-67-status-message-layout`
**Issue:** [#67](https://github.com/pronficilio/coup-online/issues/67).

## Resultado

Se centraron y diseñaron los mensajes existentes de `.DecisionsSection` en la franja superior. Además, por petición del usuario, `.PlayerBoardContainer` recibe `margin-top: 50px`, conservando el centrado horizontal y sus 12 px inferiores.

El usuario pidió cerrar el cambio con ese ajuste y luego autorizó explícitamente el merge a `master`. Por esa instrucción no se recorrieron visualmente los estados de partida; no se declara un `PASS` visual.

## Validaciones

- **Build cliente:** `npm run build` terminó con código 0 y `Compiled with warnings`.
- Warnings: imports sin uso `logo` y `Link` en `App.js`; `dvh` no reconocido por `postcss-calc` en `ReferencePanel.css`; `caniuse-lite` desactualizado.
- **Cliente de desarrollo:** compiló correctamente en el worktree y devolvió HTTP 200.
- **`git diff --check`:** código de salida 0.
- **Tests automatizados:** no se agregaron ni ejecutaron.

## Revisión visual

La única captura obtenida muestra la portada de la app, no una partida, así que no verifica `.DecisionsSection`. No se recorrieron espera normal, espera durante pausa ni ganador en desktop o móvil. Los intentos iniciales de Chromium en sandbox fallaron con `setsockopt: Operation not permitted` y `chrome-headless-shell` exit 133; después se logró capturar la portada fuera del sandbox.

El cálculo previo de 721–1024 px omitió `transform: translateX(-50%)`. Al incluirlo, la separación estática calculada es de unos 15.5 px en ese breakpoint y de 16 px en el layout amplio. Esto no sustituye la inspección visual.

**Decisión de integración:** se integra por la instrucción explícita del usuario del 2026-09-29. La validación visual de los tres estados permanece sin realizar y no se presenta como aprobada.
