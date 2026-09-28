# Issue #26 — reporte independiente F3 FINAL

- **Unidad:** issue #26 — Hacer visible la pausa de partida y guiar la reanudación.
- **Checkpoint:** F3 FINAL.
- **Branch / commit:** `issue/26-paused-game-overlay` / `662125554a76c6724a159a8c572627544a3c19fc`.
- **Base / target:** `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c` / `master` de `pronficilio/coup-online`.
- **Modo / riesgo / política:** FULL / MEDIUM / FINAL.

## Veredicto

**BLOCKED**

## Claim

El overlay de pausa cubre la interfaz, bloquea el tablero y guía a cada participante; solo el líder puede solicitar reanudar cuando el servidor informa `canResume: true`, y el overlay permanece hasta `g-gameResumed`.

## CI_GATES / ADVERSARIAL_CHECK

- **CI_GATES: PASS.** `npm run build` terminó con código 0. El build reportó advertencias ESLint en `src/App.js`, avisos de `postcss-calc` para unidades `dvh` en `ReferencePanel.css` y `caniuse-lite` desactualizado; no se modificaron esos archivos en el cambio. `git diff --check` pasó. Las traducciones tienen 313 claves por idioma, sin claves faltantes ni diferencias en placeholders.
- **ADVERSARIAL_CHECK: BLOCKED.** La lectura adversarial de los estados y permisos no refutó el claim estático. No hay Chromium, Chrome, Firefox ni Playwright en `PATH`, ni herramienta de navegador expuesta. Por ello no pude verificar visualmente el viewport/capa ni recorrer teclado/lector de pantalla y el bloqueo real de los controles en navegador.
- **OVERALL: BLOCKED.** La revisión manual visual y de accesibilidad es criterio obligatorio de F3 y no se pudo completar.

## Criterios

- **Overlay de pantalla completa y controles bloqueados: BLOCKED —** `CoupStyles.css:276-290` declara `position: fixed`, `inset: 0`, fondo opaco translúcido y `z-index: 2001`; `Coup.js:406-415` monta la capa mientras exista `pausedCause`. Esto respalda el mecanismo estático, pero sin navegador no confirmé su cobertura efectiva del viewport ni el bloqueo por puntero/teclado frente a todos los elementos de la página.
- **CTA solo para líder con `canResume`: PASS estático —** `Coup.js:425-430` condiciona el botón a ambos valores; `resumeGame` vuelve a validar ambos antes de emitir `g-resume` (`Coup.js:295-300`).
- **Guía para no líder: PASS estático —** `Coup.js:419-423` presenta el mensaje de espera cuando `canResume` es verdadero y el jugador no es líder.
- **Pausa no recuperable sin CTA falso: PASS estático —** el diálogo muestra el texto de no recuperable si `canResume` es falso (`Coup.js:423`), y el único botón exige `canResume && isLeader` (`Coup.js:425`).
- **Rechazo de reanudación visible: PASS estático —** `g-decisionRejected` guarda el error mientras la pausa sigue activa (`Coup.js:227-234`) y el diálogo lo presenta como `role="alert"` (`Coup.js:431`).
- **Capa persistente hasta `g-gameResumed`: PASS estático —** `g-decision` solo cambia la decisión y no limpia `pausedCause` (`Coup.js:212-216`); el listener que la limpia es `g-gameResumed` (`Coup.js:251-267`).
- **Contrato de permisos del servidor: PASS estático —** no hay cambio del servidor en el diff. En la base, el timeout pausa con `{ recoverable: true }` (`server/game/coup.js:363-367`); `pause()` emite `canResume: Boolean(this.pausedDecision)` (`:221-242`). `resume()` conserva la autorización del socket líder, estado pausado, decisión recuperable y conectividad de todos los asientos humanos (`:474-499`).
- **i18n ES/EN: PASS —** comprobación independiente de `translations.json`: `ES=313 EN=313`, sin diferencia de claves ni placeholders.
- **Build: PASS —** producción compilada con las advertencias descritas arriba.
- **Foco/teclado/lector de pantalla: BLOCKED —** hay gestión estática de foco, diálogo modal y trampa de Tab (`Coup.js:236-267,303-325,406-415`), pero se requiere recorrido manual según el plan; no se pudo observar su comportamiento en navegador ni con lector de pantalla.

## Refutaciones intentadas

1. **Falsificación del timeout recuperable:** inspeccioné la ruta del temporizador en la base exacta. La decisión activa vence en `server/game/coup.js:363-367` y llama `pause(..., { recoverable: true })`; `pause()` conserva `pausedDecision` y deriva el booleano del evento de esa decisión (`:221-242`). No encontré una ruta donde el timeout normal anunciado por esta función resulte `canResume: false`.
2. **CTA rechazable o permiso evadido:** contrasté las condiciones del cliente con el handler servidor. El cliente solo muestra/emite para líder y `canResume`; el servidor vuelve a comprobar líder, fase, decisión pendiente y conectividad. No encontré una evasión estática del permiso.
3. **Interacción subyacente o cierre prematuro:** la capa fija cubre por CSS el viewport y `g-decision` ya no la cierra. La interacción efectiva del tablero y el foco quedan sin verificación dinámica por falta de navegador.
4. **Error oculto después de rechazo:** el listener conserva el error durante la pausa y el overlay lo renderiza en una alerta; no encontré un camino estático que lo limite al panel de decisión.

## Comandos y evidencia

- `git -C .worktrees/issue-26-paused-game-overlay rev-parse HEAD` → `662125554a76c6724a159a8c572627544a3c19fc`.
- `git -C .worktrees/issue-26-paused-game-overlay diff --check 5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c..662125554a76c6724a159a8c572627544a3c19fc` → sin errores.
- `npm run build` en `coup-client` → código 0, bundle de producción generado con warnings indicados.
- Comparación de claves y placeholders ES/EN de `translations.json` → `313/313`, sin diferencias.
- `command -v chromium chromium-browser google-chrome firefox playwright` → ninguno disponible. Revisión de nombres de herramientas expuestas → ninguna herramienta de navegador.
- Fuentes inspeccionadas: `coup-client/src/components/game/Coup.js`, `CoupStyles.css`, `src/i18n/translations.json` y `server/game/coup.js` en el commit base indicado.

## Limitaciones y siguiente paso

No se ejecutaron pruebas automatizadas. No se pudo probar una partida real como líder/no líder, desconexión durante la pausa, rechazo real del socket, `g-gameResumed`, cobertura visual móvil/escritorio, interacción del tablero ni foco/lector de pantalla. El reporte F2 no se tomó como prueba; las conclusiones estáticas se reconstruyeron desde el diff y el código del servidor.

El Orquestador debe conseguir un navegador accesible y completar el recorrido manual de F3. Mantener la unidad sin PASS hasta verificar esos criterios.
