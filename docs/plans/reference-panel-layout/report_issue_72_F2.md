# Issue #72 — F2: wrapper de flujo y rail de referencias

**Estado:** implementación terminada; build y revisión estática `PASS`, con límites visuales pendientes de F3/propietario.
**Branch:** `issue/72-reference-panel-layout`
**Base:** `origin/master@ce53c286155c054bc4c50defeb5ec19cc04fd5fb`

## Cambios

- `coup-client/src/components/game/Coup.js`: `PlayerBoard` y `ReferencePanel` ahora comparten `.PlayerBoardLayout`. Los modales siguen portalizados en `document.body` por `ReactModal`; los diálogos no heredan el transform del tablero.
- `coup-client/src/components/game/PlayerBoardStyles.css`: el wrapper conserva una caja cuadrada en flujo; el tablero pintado ocupa esa caja de forma absoluta. El margen inferior del wrapper es `12px + desplazamiento base + desplazamiento extra de 5 jugadores`. Se conservan las fórmulas responsive existentes; en 721 px se activa la regla de tablet, y hasta 720 px los dos desplazamientos se anulan y queda un margen de 12 px.
- `coup-client/src/components/game/ReferencePanel.css`: los triggers están absolutos respecto al wrapper y ya no reservan una fila estática. Desde 521 px el grupo de 176×52 px se coloca 6 px a la izquierda de la fila de influencias propias. El `top` añade las mismas variables de desplazamiento que el tablero, así que sigue su posición pintada. Hasta 520 px los tres botones usan una cuadrícula 2×2 de 114×114 px a la izquierda de las cartas. Hasta 360 px los targets pasan a 44×44 px y la cuadrícula queda en 90×90 px; se mantiene el centro vertical a 42 px del borde del wrapper, por lo que la caja pintada va de B−87 a B+3. El wrapper conserva 12 px bajo la caja, con 9 px estáticos antes del siguiente bloque de flujo.

## Comprobación geométrica estática

Los slots propios miden 76 px como mínimo desde 521 px, por lo que su fila mide 157 px y comienza a `(anchoTablero−157)/2`. El cálculo del rail deja 6 px entre su borde derecho y esa fila. A 521 px el rail empieza en x=0; en tablero de 900 px, con slots de 93.6 px, empieza en x≈172 y termina en x≈348, mientras las cartas empiezan en x≈354. En viewports más amplios aumenta el tamaño de las cartas hasta el máximo de 134 px y la fórmula conserva el mismo margen.

La cuadrícula narrow mide 114 px de ancho. A 390 px de ancho comienza en x≈10, termina en x≈124 y deja 8 px antes de las cartas, que empiezan en x≈132. Hasta 360 px mide 90 px. A 320 px comienza en x=0, termina en x=90 y el borde de las cartas propias heredado de #44 está en x≈99.5: la separación calculada es 9.5 px. Esta aritmética no es una medición dinámica ni valida el límite visible de las cartas. Por la misma fórmula, a 300 px el borde de las cartas estaría en x≈89.5, así que bajo 301 px se predice cruce horizontal; F3 debe validar o fijar un ancho mínimo/ajuste antes de aprobar ese rango. El cambio de breakpoint a 360 px cubre el cruce estimado de 347–348 px que ocurriría con la grilla de 114 px.

El grupo horizontal mide 52 px de alto y se alinea a 89% del wrapper más los transforms efectivos. En móvil, la cuadrícula de 114 px se alinea a 87%; hasta 360 px se usa la caja de 90 px centrada a B−42 px. Los asientos inferiores de 5 jugadores están alrededor de 61% de la caja y los de 6 alrededor de 68%; en ≤720 px el estilo de asiento los sube 20/32 px respectivamente. En el modelo de 320 px, el dock compacto empieza en B−87 y la tarjeta de un asiento inferior de 6 jugadores puede acercarse a esa altura tras su traslación de 32 px. Sin navegador no se puede certificar el borde inferior real de la tarjeta ni aprobar que no haya solapamiento vertical; F3 debe verificar expresamente cartas, nombres y tooltips de asientos inferiores de 5/6 jugadores. El Event Log ocupa la parte superior derecha del encabezado; el rail ocupa la parte inferior izquierda junto a las cartas. Las decisiones permanecen como estaban. La caja pintada termina en B+3 y el flujo deja 9 px antes del siguiente bloque, cálculo estático que también requiere walkthrough.

## Validación

- `npm ci` en `coup-client/`: completó usando `package-lock.json`; creó `node_modules` ignorado por Git.
- `npm run build` en `coup-client/`: exit 0, `Compiled with warnings`. Advierte `logo` y `Link` sin usar en `src/App.js`, una lista Browserslist desactualizada y errores de parseo `postcss-calc` para `66.6667dvh` y `133.3333dvh` en las reglas preexistentes de tamaño de los modales de `ReferencePanel.css` (este diff no modifica esas declaraciones). La salida incluye artefactos optimizados.
- `git diff --check`: sin errores.
- No se añadieron ni ejecutaron tests automatizados. No hay navegador instalado localmente; no se declara walkthrough, medición DOM, cobertura de 2–6 jugadores, hover/touch/teclado ni aprobación visual.

## Límites para F3 / propietario

Revisar 2, 3, 5 y 6 jugadores; 300, 320, 347–361, 390 px, alrededor de 520/521 px, 720/721 px, 1024 px, 1199/1200 px; orientación y alto corto; `EventLog` expandido; hover/tooltips, tab/foco, touch y modales. A 320 px confirmar al menos 5 px entre dock y cartas y refutar cruces verticales con asientos inferiores de 5/6 jugadores, incluyendo labels/tooltips. Bajo 301 px la fórmula actual predice cruce horizontal y hace falta decidir/aplicar un ajuste antes de aprobar ese ancho. Comprobar el margen respecto a decisiones y que el final de scroll termina dentro de 16 px del contenido visible. No elevar estas hipótesis estáticas a `PASS` visual.
