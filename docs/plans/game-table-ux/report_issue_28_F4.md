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
| 2. Tablero, HUD y margen | **FAIL — medio** | La corrección de cinco asientos funciona geométricamente: el asiento superior vuelve a `top: 14%` efectivo. En móvil de 390 px, el asiento superior derecho puede ocupar aproximadamente x=240–315, y=77–128. La regla base del Event Log usa `top: 60px`, pero el cascade móvil hasta 1199 px la sobrescribe con `top: 10vh; right: 10vw`; su ancho depende del texto en ese HEAD. `PlayerBoardContainer` aparece después de `GameHeader`, crea un contexto de apilamiento y cada asiento usa `z-index: 3`; por ello el asiento puede cubrir texto y el scroll del log. No se capturó una partida para medir la intersección real. |
| 3. Conteo sobre Court | PASS | `PlayerBoard.js` muestra el conteo antes de la imagen y `PlayerBoardStyles.css` lo coloca encima del mazo. |
| 4. Transiciones y privacidad del conteo | PASS estático | Servidor proyecta `this.deck.length` para jugadores/espectadores; el snapshot cubre Exchange pendiente/resuelto, reemplazo por desafío, inicio y revancha. El payload no incluye cartas. |
| 5. Reglas y protocolo | PASS | No se alteraron reglas ni el protocolo de decisiones. |
| 6. Cartas perdidas y roles ocultos | PASS | La marca deriva de `revealedInfluences`, incluye símbolo/etiqueta y conserva el rol. Las cartas activas rivales usan el reverso; las cartas de prueba de desafío no se marcan como perdidas. |

El Verifier comprobó que los estilos `.Pause*` de #26 siguen presentes y que los recursos usados por `PlayerBoard.js` existen tras #36. No observó problemas en los criterios 1, 3–6.

## Seguimiento requerido

Resolver el solapamiento para los viewports estrechos manteniendo el Event Log y los controles en sus posiciones actuales, haciendo accesibles sus textos/scroll y conservando las cartas y encabezados de todos los asientos de 2–6 jugadores. No cambiar reglas, privacidad, acciones, protocolo o el conteo Court. Después correr el build solicitado, `git diff --check` y `node --check server/game/coup.js`, documentar la geometría afectada y reabrir F4 con el mismo Verifier. No hacer push ni PR hasta recibir PASS independiente.

## Limitaciones

El análisis del solapamiento proviene de anclajes CSS, orden del DOM y apilamiento; no de una captura renderizada. No se ejecutaron pruebas automatizadas.

## Seguimiento F2 antes de repetir F4

El siguiente candidato F2 corrige el cruce geométrico y el lift en pantallas altas, e incorpora el halo de respuesta. Sus cambios y verificaciones se registran después del dictamen independiente sobre `cbc0892`.

## Segunda revisión independiente — HEAD `cbc0892`

**Veredicto:** `FAIL` medio en el criterio 2. La revisión corresponde al commit `cbc0892c2efbec05c3f99f13c4e6e64ac6886ed9` sobre `origin/master@094a61e4a45b08ffb6aba68098bb424d21b9b7d2`; el Verifier no modificó archivos ni ejecutó build, tests o capturas.

El margen del asiento superior queda cerca del objetivo en 390×844 y 1440×900 (aprox. 56 px y 50 px), pero a 390 px el asiento superior derecho ocupa aproximadamente x=240–315, y=56–128, encima del Event Log. La nota inicial del análisis citó `top: 60px`; revisión del cascade confirma que la media query de hasta 1199 px aplica `top: 10vh; right: 10vw`, de modo que a 390×844 el log se ancla en y≈84 px y a la derecha en x≈221 px cuando mide 130 px. Esa corrección de coordenadas no elimina el cruce: el `z-index: 4` hace accesible el log, aunque su fondo transparente deja el nombre y las cartas parcialmente cubiertos. En escritorios altos el clamp de −180 px satura el lift: el margen calculado sube a ~68 px con 1200 px de alto y ~104 px con 1440 px.

Los criterios 1 y 3–6 pasaron estáticamente. El Verifier confirmó que los estilos `.Pause*` y los recursos de #36 siguen presentes. No inspeccionó una partida renderizada. F2 vuelve a `ACTIVE` para resolver ambos hallazgos y añadir el criterio visual del propietario del asiento respondible. No publicar la rama antes de un nuevo PASS independiente.

## Seguimiento F2 aprobado visualmente; repetición pendiente

El candidato conserva el anclaje vigente del Event Log: top:60px; right:15px por debajo de 1024 px; desde 1024 px aplica top:10vh; right:10vw. En 5p y hasta 520 px limita su ancho a 100–130 px y ajusta el wrap. Las cajas calculadas en 390×844 son: log x≈245–375, asiento superior izquierdo x≈49–120 y derecho x≈134–203; a 320×844, log x≈205–305, asiento izquierdo x≈29–95 y derecho x≈106–163. Son cálculos de CSS, no mediciones de captura.

El lift responsive usa min(-40px, calc(...)) en desktop, tablet y móvil, por lo que no se satura en alturas grandes. El resaltado local depende de que g-decision sea una decisión de respuesta con opciones para este cliente. Se apaga sincrónicamente al enviar, incluido Pass, y al cerrarse la decisión; al responder no deja marcado como actual al actor localmente mientras sigue abierta la ventana.

git diff --check, node --check server/game/coup.js, parseo JSON y build pasan. El build terminó con código 0 y avisos conocidos de App.js, ReferencePanel.css y caniuse-lite. El preview http://localhost:3015 responde HTTP 200. El propietario aprobó visualmente esta versión el 2026-09-27. El mismo Verifier repetirá F4 sobre el commit de seguimiento, incluyendo estados del halo. No se ejecutaron tests automatizados ni se afirma una inspección propia de una partida viva.
