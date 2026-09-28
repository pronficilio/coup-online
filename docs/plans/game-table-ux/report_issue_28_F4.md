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
| 2. Tablero, HUD y margen | **FAIL — medio** | La corrección de cinco asientos funciona geométricamente: el asiento superior vuelve a `top: 14%` efectivo. En móvil de 390 px, el asiento superior derecho puede ocupar aproximadamente x=240–315, y=77–128. El Event Log usa `top:60px; right:15px` en móvil; su ancho depende del texto en ese HEAD. `PlayerBoardContainer` aparece después de `GameHeader`, crea un contexto de apilamiento y cada asiento usa `z-index: 3`; por ello el asiento puede cubrir texto y el scroll del log. No se capturó una partida para medir la intersección real. |
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

El margen del asiento superior queda cerca del objetivo en 390×844 y 1440×900 (aprox. 56 px y 50 px), pero a 390 px el asiento superior derecho ocupa aproximadamente x=240–315, y=56–128, encima del Event Log. Revisión del cascade confirma que el log conserva `top:60px; right:15px` por debajo de 1024 px; a 390×844 y ancho 130 px ocupa x≈245–375 y se cruza con el asiento. Desde 1024 px, la media query establece `top:10vh; right:10vw`. El `z-index:4` hace accesible el log, aunque su fondo transparente deja el nombre y las cartas parcialmente cubiertos. En escritorios altos el clamp de −180 px satura el lift: el margen calculado sube a ~68 px con 1200 px de alto y ~104 px con 1440 px.

Los criterios 1 y 3–6 pasaron estáticamente. El Verifier confirmó que los estilos `.Pause*` y los recursos de #36 siguen presentes. No inspeccionó una partida renderizada. F2 vuelve a `ACTIVE` para resolver ambos hallazgos y añadir el criterio visual del propietario del asiento respondible. No publicar la rama antes de un nuevo PASS independiente.

## Seguimiento F2 en curso; revisión visual pendiente

El candidato conserva el anclaje responsive vigente del Event Log: `top:10vh; right:10vw` hasta 1199 px y `top:60px; right:15px` desde 1200 px. En cinco jugadores y hasta 520 px limita su ancho a 100–130 px, mantiene 9vh de scroll y ajusta el wrap. Las cajas calculadas en 390×844 son: log x≈221–351, asiento superior izquierdo x≈47–122 y derecho x≈134–203; a 320×844, log x≈188–288, asiento izquierdo x≈29–95 y derecho x≈106–163. Son estimaciones CSS, no mediciones de captura. Los halos de nombre e influencias activas se compactan en 5p móvil; el blur y su interacción con cartas requieren la revisión visual del propietario.

Los tres `clamp()` se conservan; el piso desktop cambia de −180 a −240 px. Con el tablero limitado a 900 px, la fórmula da lift ≈−198 px a 1440×1200 y ≈−234 px a 1440×1440; el margen superior se estima cercano a 50 px y el clamp conserva un límite para alturas extremas. `Coup.js` deriva la ventana respondible de `decision.options` locales. `responseAvailable` cesa al enviar cualquier opción, incluido Pass; el `--current` formal se suspende mientras esa decisión local esté abierta y se restablece al cerrarse. No cambia el protocolo.

F2 cerró en `4b1dc92` después del build y las comprobaciones estáticas. El build terminó con código 0 y avisos conocidos de `App.js`, `ReferencePanel.css` (`dvh` en `postcss-calc`) y `caniuse-lite`; también pasan `git diff --check`, `node --check server/game/coup.js`, el parseo JSON y la respuesta HTTP 200 del preview `http://localhost:3015`. No se ejecutaron tests automatizados. El propietario revisó únicamente el preview anterior de dos jugadores; quedan pendientes 5p/390 px y los estados abrir/enviar/cerrar de respuesta. No repetir F4 hasta esa confirmación ni afirmar que se inspeccionó una partida actual.

## Dictamen F4 FINAL independiente — producto HEAD `bae24fc9c99fd68d1358f8486cc2be8a8407ce1e`

**Veredicto: `FAIL` medio, criterio 2.** La revisión estática confirma que la geometría especial de cinco jugadores separa las dos cartas superiores del Event Log a 390×844 y 320×844, pero el mismo resultado no cubre las demás cantidades ni el rango tablet. Además, el `clamp()` todavía se satura en pantallas altas. Los criterios 1, 3–7 pasan estáticamente.

### Alcance y estado

- Branch: `issue/28-table-game-ux`; worktree: `.worktrees/issue-28-table-game-ux`.
- SHA exacto del producto revisado: `bae24fc9c99fd68d1358f8486cc2be8a8407ce1e`; base declarada: `origin/master@094a61e4a45b08ffb6aba68098bb424d21b9b7d2`.
- Durante la redacción, el tip de la rama avanzó a `7c6c795bd5415cadc1d042562dd9f3a458b46c76` con documentación solamente; `git diff bae24fc..7c6c795 -- coup-client server` está vacío. Este dictamen se refiere al código del SHA `bae24fc`.
- La revisión visual que reportó el usuario cubrió dos jugadores en móvil; no confirmó un SHA ni escritorio, otros conteos o los estados de respuesta. El Verifier no capturó ni ejecutó la aplicación, y no ejecutó build o tests.

### Resultado por criterio

| Criterio | Resultado | Evidencia puntual |
|---|---|---|
| 1. Influencias localizadas | PASS | `Coup.js:401–423` renderiza HUD, tablero y panel sin `InfluenceSection`; `PlayerBoard.js:58–80, 188–191` muestra etiquetas de roles bajo cartas propias. `Coup.js` no contiene `InfluenceSection` ni “your influences”. |
| 2. Tablero, HUD, Event Log y margen superior | **FAIL — medio** | El `transform`/`translate` solo afecta a `.PlayerBoardContainer` (`PlayerBoardStyles.css:1–25`), por lo que You are/Coins, Rules y Cheat Sheet conservan su anclaje (`CoupStyles.css:1–49, 254–257, 994–1034`). En 5p móvil las cajas calculadas sí quedan separadas: a 390 px el Event Log ocupa x≈245–375 y los dos asientos superiores x≈47–122 y x≈134–203; a 320 px el log ocupa x≈205–305 y los asientos x≈31–94 y x≈106–163. La regla de ancho del log y los desplazamientos de asientos solo cubren 5p móvil (`CoupStyles.css:187–196`; `PlayerBoardStyles.css:463–525`). Para 2–4p y 6p, el asiento superior centrado ocupa aproximadamente x≈157–233 (390 px) o x≈129–192 (320 px); el Event Log no tiene ancho máximo para esas partidas (`CoupStyles.css:165–185`). Una línea larga de log que mida >142 px a 390 o >114 px a 320 puede cruzar la carta/asiento y bloquear el área scrollable. En tablet, 5p tampoco tiene el ajuste: a 521×844 la caja superior derecha se aproxima a x≈320–421, mientras una línea de log de más de 85 px puede hacer que el Event Log, anclado a right:15px/top:60px, se extienda a x<421; sus cajas también coinciden verticalmente. El tablero se pinta después del header y forma su propio contexto de apilamiento (`Coup.js:401–423`; `.PlayerBoardContainer` con `isolation`/transform en `PlayerBoardStyles.css:1–9`; cada asiento tiene z-index 3, líneas 103–114), así que el asiento puede cubrir texto y capturar el gesto de scroll. Por separado, a 768×1200 la media tablet limita el lift a −240px (`PlayerBoardStyles.css:16–20`): con header de 22vh, tablero de 768px y cartas rivales de 48×70.6px, el encabezado superior queda a unos 90px del borde, frente a los ~50px pedidos. |
| 3. Conteo sobre Court | PASS | `PlayerBoard.js:108–117` coloca el conteo antes de la imagen; `PlayerBoardStyles.css:64–94` lo ancla encima de la carta del mazo y lo mantiene legible. |
| 4. Conteo y privacidad | PASS estático | `server/game/utils.js:3–8` crea 15 cartas; `server/game/coup.js:113–124` reparte dos por jugador y `144–173` publica `this.deck.length`, roles revelados y solo `ownInfluences` para cada jugador humano (vacío para espectadores), sin manos rivales. `resolveAction` resta dos antes de Exchange y actualiza (`server/game/coup.js:906–925`); la resolución devuelve dos y publica el nuevo tamaño (`931–968`). El reemplazo tras prueba devuelve una carta y roba una, neto cero (`843–854`); `resetGame` reconstruye/redistribuye al iniciar revancha (`101–129`, `997–1005`). No se halló ventana de snapshot desfasado ni identidad privada en el payload público. |
| 5. Reglas y protocolo | PASS | No cambian reglas ni el flujo de decisiones. `courtCount` es un campo numérico adicional del `g-updatePlayers` existente (`server/game/coup.js:155–173`); el cliente consume ese campo (`Coup.js:242–249`) sin reemplazar eventos/acciones existentes. |
| 6. Cartas perdidas y roles ocultos | PASS | `PlayerBoard.js:41–80` deriva cartas perdidas de `revealedInfluences`, añade etiqueta accesible con el rol y marca ×/gris; `83–98` no incluye identidades rivales ocultas en atributos o hijos. El reemplazo probado no se agrega a `revealedInfluences` (`server/game/coup.js:831–854`), por lo que no aparece como pérdida. `.Pause*` de #26 se conserva (`CoupStyles.css:263–370`); los assets usados por el tablero tras #36 están presentes en el árbol de `bae24fc` (imports `PlayerBoard.js:2–10`). |
| 7. Halo local de respuesta | PASS estático | `Coup.js:22, 253–266, 322–330, 376–388` exige una decisión Challenge/Block/Block Challenge con opciones locales; `submitChoice` apaga el estado de inmediato y `g-decisionClosed` lo elimina. `responseButtonFor` presenta Pass (`Coup.js:24–35`) y usa el mismo callback de envío. `PlayerBoard.js:119–153` aplica `--respondable` solo al asiento observador y suprime `--current` mientras sigue abierta la respuesta; espectador/sin opciones no cumple `responseWindowOpen`. El halo CSS está en `PlayerBoardStyles.css:233–269`. No se recorrieron estos estados en una partida viva. |

### Motivo de devolución y limitación

El defecto restante es responsive del criterio 2: extender la separación o limitación del Event Log a todas las configuraciones afectadas y calcular el lift de tabletas/pantallas altas sin saturarlo antes de alcanzar el margen solicitado. No mover controles ni cambiar el anclaje acordado del HUD. Los números de cajas son derivaciones de CSS y contenido intrínseco; no son mediciones de render. La revisión de dos jugadores en móvil se mantiene separada de esta revisión independiente. No se ejecutaron tests, build ni capturas.

## Corrección de alcance visual y seguimiento F2

La respuesta del usuario “Se ve todo muy bien, lo probé con 2 jugadores y en celular” acredita únicamente la revisión en móvil con dos jugadores del preview disponible en ese momento. No acredita por sí sola que se inspeccionara `bae24fc` por SHA ni que pasaran los otros conteos, escritorio o el ciclo de respuesta. Por ello F2/F4 continúan abiertas hasta levantar el preview del candidato actualizado y revisar la variante siguiente.

Corrección del cascade consignado en la nota histórica “Seguimiento F2 en curso”: el override `top:10vh; right:10vw` empieza en 1024 px (`@media min-width:1024px`), no en móvil ni hasta 1199 px. Por debajo de 1024 px rige `top:60px; right:15px`.

El nuevo candidato limita y envuelve el Event Log para todos los conteos hasta 1199 px. El cascade real lo ancla a `right:15px; top:60px` hasta 1023 px; desde 1024 px cambia a `right:10vw; top:10vh`. En 320×844 el log mide 88 px y empieza cerca de x=217; en 390×844 mide ~92.6 px y empieza cerca de x=282. En móvil, el asiento superior centrado de 2–4 jugadores queda aprox. x=101–187 a 320 px y x=127–224 a 390 px. En 6p, los tres asientos de la fila superior quedan aprox. x=16–74, x=84–148 y x=148–206 a 320 px; x=12–82, x=86–162 y x=171–241 a 390 px. En tablet de 521 px, el log empieza cerca de x=395; el asiento superior derecho de 5p queda alrededor de x=271–376 y el de 6p en x=307–385. A 1024 px, el log empieza cerca de x=742; los asientos superiores derechos compactados quedan aproximadamente 10 px antes del log. Son cálculos CSS previos a la revisión visual, no capturas ni mediciones de render. El lift ya no tiene el piso que causó saturación. Se volverá a compilar tras los cambios de anclaje/compactación; quedan revisión visual y PASS del mismo Verifier.

## Cierre F2 sobre HEAD `4ccce67` (2026-09-27)

F2 cierra la geometría y el comportamiento del halo en ese HEAD; la evidencia detallada está en `report_issue_28_F2.md`. El build, diff-check, `node --check` y parseo JSON pasan. No hay captura de esta variante en el reporte. F4 permanece `ACTIVE`, sin PASS, para verificación FINAL independiente tras la revisión visual pendiente del propietario.

## Confirmación visual del propietario — candidato `4ccce67` (2026-09-27)

El propietario confirmó “todo confirmado” tras revisar el preview actual `http://localhost:3016`, servido desde este worktree y conectado a la API `:8015`. El bundle contiene el marcador del producto `4ccce67`; el tip `7711d20` solo añade documentación y `git diff 4ccce67..HEAD -- coup-client server` está vacío.

Alcance confirmado por el propietario:

- En móvil (~390 px) con cinco jugadores, los asientos quedan completos y el Event Log permanece legible y desplazable sin cruces.
- Durante una ventana Challenge/Block, el asiento local se ilumina solo mientras tiene opciones; se apaga al enviar Pass/otra opción o al cerrar la ventana.

Esto cierra la revisión visual solicitada en esos dos casos. La confirmación anterior de dos jugadores en móvil pertenece a un preview previo; no se atribuye a este SHA ni se afirma revisión manual de escritorio u otros conteos. F4 sigue `ACTIVE` hasta que el mismo Verifier independiente emita el pase FINAL sobre el producto `4ccce67`. No se ejecutaron tests automatizados.

## Tercera revisión independiente — producto `4ccce67` (2026-09-27)

**Veredicto: `FAIL` medio, criterio 2.** El mismo Verifier revisó estáticamente el producto `4ccce679f082d84956de844472e395fc67a90bf7`; el tip documental `7711d20` no alteraba el cliente ni el servidor. No modificó archivos ni ejecutó build, tests o capturas.

| Criterio | Resultado | Evidencia |
|---|---|---|
| 1. Influencias localizadas y legibles | PASS | Se retiró la sección global; `PlayerBoard.js` conserva nombres de rol y estados activo/perdido. |
| 2. Tablero, HUD, margen y Event Log | **FAIL — medio** | A 1200×900, el tablero de 900 px empieza en x≈150; asiento superior derecho 5p cerca de x≈790 y cartas hasta x≈859. El Event Log termina en x≈1080 (`right:10vw`), pero desde 1200 px no se limita ni envuelve su ancho. Una línea larga de ~260 px empieza cerca de x≈820 e invade las cartas ~39 px en zona vertical compartida. Cálculo CSS, no medición del navegador. |
| 3. Contador Court | PASS | `courtCount` aparece junto al mazo. |
| 4. Privacidad y estado público | PASS | El cliente recibe sus influencias propias; espectadores no reciben manos; `courtCount` no revela roles. |
| 5. Reglas y protocolo | PASS | Se conserva 2–6 jugadores y el protocolo de decisiones. |
| 6. Cartas perdidas y pruebas temporales | PASS | Las pérdidas reveladas se marcan y una carta devuelta tras desafío no queda marcada. |
| 7. Halo respondible | PASS | Depende de opciones locales; el propietario confirmó que se apaga al responder o cerrar. |

El propietario confirmó visualmente 5p móvil (~390 px) y el ciclo del halo, pero no 5p escritorio; la confirmación móvil no cubre este fallo. F2 y F4 se devuelven para aplicar el límite/wrap del Event Log también desde 1200 px, sin mover sus anclajes. El fix quedó en `d37dacc`; el build pasó con código 0 y el bundle actualizado está en `http://localhost:3016`. Se espera la revisión visual del propietario en 5p desktop y luego la verificación FINAL del mismo Verifier sobre `d37dacc`. No push/PR ni cierre hasta PASS.
