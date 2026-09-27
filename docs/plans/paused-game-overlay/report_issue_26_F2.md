# Issue #26 — reporte F2: overlay de pausa y reanudación

- **Fase:** F2 `CLOSED`; F3 `BLOCKED`, unidad `WAITING_ORCHESTRATOR`.
- **Branch / worktree:** `issue/26-paused-game-overlay` / `.worktrees/issue-26-paused-game-overlay`.
- **Base:** F1 `2347fa0`; `origin/master` `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`.
- **Implementación:** `coup-client/src/components/game/Coup.js`, `CoupStyles.css`, `src/i18n/translations.json`.

## Resultado

- `Coup.js` presenta un diálogo fijo a pantalla completa cuando llega `g-gamePaused`; solo muestra **Reanudar partida** si `canResume` y `isLeader` son verdaderos. Quienes no pueden actuar reciben un mensaje de espera; una pausa no recuperable explica que hay que crear otra partida y no ofrece CTA.
- Una guarda local impide emitir `g-resume` más de una vez mientras se espera. El rechazo se presenta dentro del diálogo con `role="alert"`. El diálogo mantiene el foco y atrapa Tab; restaura el foco al terminar. `g-decision` no cierra la capa: solo `g-gameResumed` limpia el estado de pausa.
- `CoupStyles.css` cubre el viewport con fondo translúcido, `z-index: 2001` sobre el modal de ReferencePanel y tipografía/tamaño adaptables.
- `translations.json` contiene seis claves nuevas para español e inglés: título, estado del líder, espera del resto, conectividad, pausa no recuperable y solicitud pendiente. La paridad de claves y parámetros se verificó sobre las 313 claves actuales.
- No se modificó servidor, permisos ni protocolo.

## Validación ejecutada

- `npm ci` en `coup-client`: terminó con código 0; instaló dependencias desde el lockfile. npm reportó 81 avisos de seguridad para dependencias; no se investigaron ni se cambiaron.
- `npm run build`: terminó con código 0. Reportó avisos existentes en `src/App.js` por imports sin uso y en `ReferencePanel.css` porque `postcss-calc` no analiza unidades `dvh`; también señaló `caniuse-lite` desactualizado.
- `git diff --check`: pasó.
- Paridad i18n: 313/313 claves; marcadores de parámetros en paridad.
- No se agregaron ni ejecutaron tests automatizados.

## Bloqueo de F3

No se hizo recorrido visual de escritorio/móvil/teclado: `chromium`, Chrome y Firefox no están disponibles en `PATH`, y este entorno no expone herramienta de navegador. Por eso no se afirma PASS para foco/lector de pantalla ni recorrido de timeout, participante no líder, desconexión durante la pausa o rechazo real de `g-resume`. La fase F3 necesita un navegador accesible y Verifier FINAL independiente antes de cualquier cierre o integración; queda a cargo del Orquestador conseguir esos insumos.

**Veredicto F2:** `CLOSED`, implementación y build completos; recorrido manual trasladado como requisito pendiente de F3 por limitación del entorno. **F3:** `BLOCKED`; **siguiente dueño:** Orquestador. No se abrió PR ni se desplegó.
