# Issue #9 — F1: fondo, centro y escala de cartas

## Resultado

- Convertí `E:\dev\coup\fotos\backgrond.png` (1672×941, RGB, sin alfa) a `coup-client/src/assets/background.webp` (1024×576, RGB, 224710 bytes). La proporción se mantiene mediante redimensionado proporcional. Corrección de PR #10: el fondo blanco cubre el viewport completo y el velo blanco CSS al 70% deja una opacidad efectiva de imagen de 30%.
- El fondo usa `cover` centrado en una capa fija de viewport, sin deformación; la plataforma central del arte permanece reconocible y la imagen también aparece en las franjas superior e inferior de la página. Añadí un disco blanco translúcido centrado detrás del mazo.
- Corrección de cartas solicitada para PR #10: quité el panel blanco exterior de cada asiento y dejé nombre/monedas en etiquetas compactas con color de jugador. Las influencias miden hasta 134 px de ancho en escritorio y usan `clamp(58px, 15.5vw, 82px)` en compacto (76 px a 490 px). El contorno neón sigue en las cartas del jugador actual.
- Para pantallas compactas, los asientos próximos a los bordes desplazan sus cartas hacia adentro según su coordenada horizontal calculada; el cálculo base del círculo se conserva. Así se mantienen completas las cartas laterales en 3, 4, 5 y 6 jugadores.
- Corrección de sombras para PR #10: cada `.PlayerInfluenceSlot` tiene una sombra negra corta y discreta; el mazo usa varias capas `drop-shadow` para sugerir una pila física. El jugador actual recibe un `::after` externo: contorno blanco de 2 px, unos 9 px de aire hasta la carta y halo rojo suave fuera del contorno. La sombra negra de carta/mazo no comparte la capa del neón.
- Para evitar recortes laterales compactos y resolver la proximidad en 6p, el CSS ajusta asientos por borde y eleva 20 px los inferiores de 5p y 32 px los de 6p. No se cambiaron colores, tamaños de cartas, reglas, socket ni paneles. No versioné el PNG fuente.

## Evidencia visual

Capturas de navegador con `PlayerBoard` real, fixtures locales de 2–6 jugadores y `ActionDecision` real debajo de la mesa. Viewports de captura: escritorio 1280×1400 y compacto 490×1200.

| Jugadores | Escritorio | Compacto |
|---|---|---|
| 2 | [preview](preview_issue_9_F1_2p_desktop.png) | [preview](preview_issue_9_F1_2p_mobile.png) |
| 3 | [preview](preview_issue_9_F1_3p_desktop.png) | [preview](preview_issue_9_F1_3p_mobile.png) |
| 4 | [preview](preview_issue_9_F1_4p_desktop.png) | [preview](preview_issue_9_F1_4p_mobile.png) |
| 5 | [preview](preview_issue_9_F1_5p_desktop.png) | [preview](preview_issue_9_F1_5p_mobile.png) |
| 6 | [preview](preview_issue_9_F1_6p_desktop.png) | [preview](preview_issue_9_F1_6p_mobile.png) |

Revisé la composición, en especial 3 y 6 jugadores en escritorio y compacto. El aro activo conserva una franja de aire visible con la imagen de la carta; los halos de las dos cartas activas no se fusionan. En 6p compacto, elevar 32 px los dos asientos laterales inferiores deja un espacio visible de alrededor de 10 px entre sus cartas y las activas. La ampliación del margen lateral evita recortes también en 5p compacto. Se revisaron los diez previews finales. Sombras, mazo, disco, nombres, monedas y controles permanecen legibles. La simulación usa `Coup`/`ActionDecision` reales con fixtures deterministas y socket sin red; no usa partida/socket real ni se hicieron clics en acciones.

## Validación

- `npm ci`: completó para instalar las dependencias del worktree.
- `npm run start-pc`: compiló el cliente con el fixture y volvió a compilar tras restaurar `App.js`. El harness fue temporal y no forma parte del diff. Quedaron advertencias ESLint existentes en `App.js` (`logo`, `Link`) y `Coup.js` (`ReactModal` sin uso).
- `git diff --check`: pasó.
- No ejecuté tests automatizados ni build de producción, de acuerdo con el alcance.

F1 queda cerrada y se entrega al Orquestador. La corrección de viewport se preparó como commit adicional en la misma rama y PR #10; issue abierta y sin merge.
