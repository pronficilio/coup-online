# Reporte F4 — issue #28: revalidación independiente

## Veredicto

`FAIL` medio. La revisión independiente confirmó que el ajuste para cinco jugadores deja el margen superior cerca del objetivo, pero encontró un solapamiento posible entre el asiento superior derecho y el Event Log en móvil. F2 se devuelve para corregir el criterio 2; F4 permanece `RETURNED` y se repetirá con el mismo Verifier después de otro build/commit.

## Alcance revisado

- **Branch:** `issue/28-table-game-ux`
- **HEAD revisado:** `a9cbeb21b6581af78d16018cd9d4ba2b178476aa`
- **Base:** `origin/master@094a61e4a45b08ffb6aba68098bb424d21b9b7d2`
- **Worktree:** `.worktrees/issue-28-table-game-ux`
- La revisión fue estática. El Verifier no modificó archivos ni ejecutó build, tests o capturas. La aprobación visual del propietario en `http://localhost:3015` es evidencia separada.

## Resultado por criterio

| Criterio | Resultado | Evidencia del Verifier |
|---|---|---|
| 1. Influencias propias | PASS | `Coup.js` ya no renderiza la sección global. `PlayerBoard.js` presenta `game.roles.*` bajo las cartas propias. |
| 2. Tablero, HUD y margen | **FAIL — medio** | La corrección de cinco asientos funciona geométricamente: el asiento superior vuelve a `top: 14%` efectivo. En móvil de 390 px, el asiento superior derecho puede ocupar aproximadamente x=240–315, y=77–128. `.EventLogContainer` queda anclado en `top: 60px` y su ancho depende del texto. `PlayerBoardContainer` aparece después de `GameHeader`, crea un contexto de apilamiento y cada asiento usa `z-index: 3`; por ello el asiento puede cubrir texto y el scroll del log. No se capturó una partida para medir la intersección real. |
| 3. Conteo sobre Court | PASS | `PlayerBoard.js` muestra el conteo antes de la imagen y `PlayerBoardStyles.css` lo coloca encima del mazo. |
| 4. Transiciones y privacidad del conteo | PASS estático | Servidor proyecta `this.deck.length` para jugadores/espectadores; el snapshot cubre Exchange pendiente/resuelto, reemplazo por desafío, inicio y revancha. El payload no incluye cartas. |
| 5. Reglas y protocolo | PASS | No se alteraron reglas ni el protocolo de decisiones. |
| 6. Cartas perdidas y roles ocultos | PASS | La marca deriva de `revealedInfluences`, incluye símbolo/etiqueta y conserva el rol. Las cartas activas rivales usan el reverso; las cartas de prueba de desafío no se marcan como perdidas. |

El Verifier comprobó que los estilos `.Pause*` de #26 siguen presentes y que los recursos usados por `PlayerBoard.js` existen tras #36. No observó problemas en los criterios 1, 3–6.

## Seguimiento requerido

Resolver el solapamiento para los viewports estrechos manteniendo el Event Log y los controles en sus posiciones actuales, haciendo accesibles sus textos/scroll y conservando las cartas y encabezados de todos los asientos de 2–6 jugadores. No cambiar reglas, privacidad, acciones, protocolo o el conteo Court. Después correr el build solicitado, `git diff --check` y `node --check server/game/coup.js`, documentar la geometría afectada y reabrir F4 con el mismo Verifier. No hacer push ni PR hasta recibir PASS independiente.

## Limitaciones

El análisis del solapamiento proviene de anclajes CSS, orden del DOM y apilamiento; no de una captura renderizada. No se ejecutaron pruebas automatizadas.
