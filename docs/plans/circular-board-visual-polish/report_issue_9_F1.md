# Issue #9 — F1: fondo, centro y escala de cartas

## Resultado

- Convertí `E:\dev\coup\fotos\backgrond.png` (1672×941, RGB, sin alfa) a `coup-client/src/assets/background.webp` (1024×576, RGB, 224710 bytes). La proporción se mantiene mediante redimensionado proporcional. Corrección de PR #10: el fondo blanco cubre el viewport completo y el velo blanco CSS al 70% deja una opacidad efectiva de imagen de 30%.
- El fondo usa `cover` centrado en una capa fija de viewport, sin deformación; la plataforma central del arte permanece reconocible y la imagen también aparece en las franjas superior e inferior de la página. Añadí un disco blanco translúcido centrado detrás del mazo.
- Corrección de cartas solicitada para PR #10: quité el panel blanco exterior de cada asiento y dejé nombre/monedas en etiquetas compactas con color de jugador. Las influencias miden hasta 134 px de ancho en escritorio y usan `clamp(58px, 15.5vw, 82px)` en compacto (76 px a 490 px). El contorno neón sigue en las cartas del jugador actual.
- Para pantallas compactas, los asientos próximos a los bordes desplazan sus cartas hacia adentro según su coordenada horizontal calculada; el cálculo base del círculo se conserva. Así se mantienen completas las cartas laterales en 3, 4, 5 y 6 jugadores.
- Corrección actual de PR #10: cada `.PlayerInfluenceSlot` conserva sombra negra discreta y el mazo su sombra por capas. Solo las cartas del asiento activo reciben `::before` con iluminación roja interior y `::after` con borde blanco de 2 px a unos 3 px de la carta, halo rojo exterior multicapa y esquinas redondeadas. El gap entre cartas activas vuelve a 5 px para que los aros se unan visualmente. El estado del asiento activo sigue el `currentPlayer` que recibe `PlayerBoard`.
- Las cartas mantienen su ancho y se hacen cerca de 8.8% más altas mediante `aspect-ratio: 0.68`. Para despejar las etiquetas en 6p compacto, los laterales superiores suben 24 px; los inferiores conservan el desplazamiento de 32 px y el margen cercano a 8 px con la mano activa. Las reglas, el socket, los paneles, tamaños de ancho y sombras negras no cambian. No versioné el PNG fuente.

## Evidencia visual

Capturas de navegador con `PlayerBoard` real, fixtures locales de 2–6 jugadores y `ActionDecision` real debajo de la mesa. Viewports de captura: escritorio 1280×1400 y compacto 490×1200.

| Jugadores | Escritorio | Compacto |
|---|---|---|
| 2 | [preview](preview_issue_9_F1_2p_desktop.png) | [preview](preview_issue_9_F1_2p_mobile.png) |
| 3 | [preview](preview_issue_9_F1_3p_desktop.png) | [preview](preview_issue_9_F1_3p_mobile.png) |
| 4 | [preview](preview_issue_9_F1_4p_desktop.png) | [preview](preview_issue_9_F1_4p_mobile.png) |
| 5 | [preview](preview_issue_9_F1_5p_desktop.png) | [preview](preview_issue_9_F1_5p_mobile.png) |
| 6 | [preview](preview_issue_9_F1_6p_desktop.png) | [preview](preview_issue_9_F1_6p_mobile.png) |

Se regeneró la matriz completa de diez previews (2–6 jugadores, escritorio/compacto). Revisé 2p compacto, 3p escritorio, 5p compacto y 6p compacto: los aros de las dos cartas activas se unen sin perder el borde blanco, el glow rojo ilumina ambos lados del borde y 6p compacto no cruza etiquetas ni cartas; conserva unos 8 px entre manos laterales inferiores y mano activa. También se cambió el fixture a `?current=Amarillo` en 2p y el aro se movió a su mano, confirmando que sigue el `currentPlayer` que informa Coup.

## Validación

- `npm ci`: completó para instalar las dependencias del worktree.
- `npm run start-pc`: compiló el cliente con el fixture temporal. Restauré `App.js` antes del commit.
- `npm run build`: compiló el cliente después de restaurar `App.js`; quedaron advertencias ESLint existentes en `Coup.js` (`ReactModal` sin uso) y de Browserslist desactualizado.
- `git diff --check`: pasó.
- No ejecuté tests automatizados.

F1 queda cerrada y se entrega al Orquestador. La corrección de viewport se preparó como commit adicional en la misma rama y PR #10; issue abierta y sin merge.
