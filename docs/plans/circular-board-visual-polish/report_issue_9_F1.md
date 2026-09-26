# Issue #9 — F1: fondo, centro y escala de cartas

## Resultado

- Convertí `E:\dev\coup\fotos\backgrond.png` (1672×941, RGB, sin alfa) a `coup-client/src/assets/background.webp` (1024×576, RGB, 224710 bytes). La proporción se mantiene mediante redimensionado proporcional. Corrección de PR #10: el fondo blanco cubre el viewport completo y el velo blanco CSS al 70% deja una opacidad efectiva de imagen de 30%.
- El fondo usa `cover` centrado en una capa fija de viewport, sin deformación; la plataforma central del arte permanece reconocible y la imagen también aparece en las franjas superior e inferior de la página. Añadí un disco blanco translúcido centrado detrás del mazo y amplié las cartas a 56×76 px en escritorio y 46×64 px en compacto.
- No cambié posiciones, colores, resalte neón, reversos, reglas, socket ni paneles. No versioné el PNG fuente.

## Evidencia visual

Capturas de navegador con `PlayerBoard` real, fixtures locales de 2–6 jugadores y `ActionDecision` real debajo de la mesa. Viewports de captura: escritorio 1280×1400 y compacto 490×1200.

| Jugadores | Escritorio | Compacto |
|---|---|---|
| 2 | [preview](preview_issue_9_F1_2p_desktop.png) | [preview](preview_issue_9_F1_2p_mobile.png) |
| 3 | [preview](preview_issue_9_F1_3p_desktop.png) | [preview](preview_issue_9_F1_3p_mobile.png) |
| 4 | [preview](preview_issue_9_F1_4p_desktop.png) | [preview](preview_issue_9_F1_4p_mobile.png) |
| 5 | [preview](preview_issue_9_F1_5p_desktop.png) | [preview](preview_issue_9_F1_5p_mobile.png) |
| 6 | [preview](preview_issue_9_F1_6p_desktop.png) | [preview](preview_issue_9_F1_6p_mobile.png) |

Revisé la composición, en especial 3 y 6 jugadores. Los paneles y controles quedan visibles. En compacto para 3 jugadores, el asiento derecho se recorta parcialmente; el layout queda intacto en esta corrección, fuera del alcance solicitado. La simulación no usa partida/socket real ni se hicieron clics en acciones.

## Validación

- `npm ci`: completó para instalar las dependencias del worktree.
- `npm run start-pc`: compiló el cliente, incluidos los cambios de `PlayerBoard`. Para generar capturas se usó temporalmente un harness en `App.js`, restaurado antes del cierre. Quedaron advertencias ESLint ya existentes en `App.js` (`logo`, `Link`) y `Coup.js` (`ReactModal` sin uso).
- `git diff --check`: pasó.
- No ejecuté tests automatizados ni build de producción, de acuerdo con el alcance.

F1 queda cerrada y se entrega al Orquestador. La corrección de viewport se preparó como commit adicional en la misma rama y PR #10; issue abierta y sin merge.
