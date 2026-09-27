# Issue #26 — reporte de implementación F2 (copy mínimo)

- **Unidad:** issue #26 — Hacer visible la pausa de partida y guiar la reanudación.
- **Fase:** F2 copy follow-up.
- **Branch / commit de implementación:** `issue/26-paused-game-overlay` / `4e3043b4c5d85e63e6aba47b0b5da7f0869ace2f`.
- **Base / target:** `be93e975072b364365a90206931f732fb44dc6f1` / `master` de `pronficilio/coup-online` (`origin`).
- **Modo / riesgo / política:** FULL / HIGH / FINAL.

## Resultado F2

**IMPLEMENTED; awaiting human visual review and independent Verifier FINAL.**

- El overlay del responsable muestra únicamente el heading `Partida en pausa` y el botón `Reanudar partida`. Mientras la petición se procesa, el botón se deshabilita y conserva su etiqueta.
- La pausa no recuperable presenta el mismo heading, sin botón ni párrafo.
- Los demás participantes ven únicamente el status no modal `La partida está en pausa.`
- El overlay conserva `role="dialog"`, `aria-modal="true"` y `aria-labelledby="PauseOverlayTitle"`; se quitó `aria-describedby` al retirar la descripción.
- Los rechazos dinámicos reales del servidor permanecen en `role="alert"`.
- Se removieron `pausedMessage`, las claves de traducción de causas/hints y los estilos de párrafos de explicación. El estado visual usa un booleano (`gamePaused`) en vez de guardar/renderizar la causa.
- Copy inglés: `Game paused`, `Resume game` y `The game is paused.`

## Validación

- `npm run build` después del rebase a `be93e975`: exit 0. CRA informó warnings preexistentes: imports `logo`/`Link` sin uso en `src/App.js`, parseo de unidades `dvh` por `postcss-calc` en `ReferencePanel.css` y base `caniuse-lite` desactualizada.
- `git diff --check origin/master...HEAD`: exit 0.
- Paridad i18n: ES=292, EN=292, cero claves ausentes y cero diferencias de placeholders.
- El Orquestador confirmó que CRA compiló y el bundle servido en `localhost:3012` contiene las cadenas nuevas y no contiene el copy anterior.
- No se agregaron ni ejecutaron tests automatizados.

La prueba visual humana en `localhost:3012` sigue pendiente, incluyendo estados recuperable/no recuperable, status no modal, teclado y viewport móvil. F3 no se declara aprobada. Solicitar Verifier FINAL independiente sobre el HEAD que registra este reporte/handoff.
