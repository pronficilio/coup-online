# Issue #72 — F1: diagnóstico geométrico del tablero y las referencias

**Fecha:** 2026-09-29 19:29 -06:00  
**Base:** `origin/master@ce53c286155c054bc4c50defeb5ec19cc04fd5fb`  
**Veredicto:** `CLOSED (PASS limitado a atribución estática y evidencia desktop previa)`  
**Alcance:** geometría y layout; no se modificó producto durante F1.

## Hallazgo causal

La posición del último nodo DOM no determina el final visual de la página. En el viewport desktop medido previamente en #44 (1247×563), `.PlayerBoardContainer` conserva una caja cuadrada de 900×900 px. Su `transform` calculado lo mueve `−102.45px`, pero la caja de flujo permanece en su lugar. El borde visual inferior medido queda en docY≈894 y `.DecisionsSection` empieza en docY=1012: hay 118 px entre ambos. Al deshacer el desplazamiento solo para comparar flujo, el borde habría quedado en docY≈996.45; el remanente hacia las decisiones es ≈15.55 px. El `transform` explica la mayor parte del hueco.

En esa misma evidencia aportada por el propietario, los triggers se mantienen en viewportY=491–543 con distintos valores de scroll (`position: fixed`). No aportan altura en ese ancho; su posición al final del árbol DOM es irrelevante para el espacio observado en desktop.

La causa cambia bajo 1200 px: `ReferencePanel.css` vuelve `.reference-panel__triggers` a `position: static`. En una fila, tres controles de 52 px, dos gaps de 10 px y márgenes verticales 8/12 px forman un grupo de 176×52 px y reservan nominalmente 72 px de flujo. Ese grupo aparece después del tablero y, por tanto, alarga la página en los anchos menores a 1200 px. Si el grupo hace wrap, la altura puede ser mayor.

## Geometría por breakpoint

La tabla contiene cálculos de las fórmulas CSS actuales para tamaños representativos; **no son rectángulos medidos en navegador**. La dimensión de tablero es `min(100% del padre, 900px)`. Los desplazamientos de cinco asientos se muestran aparte. A 720 px o menos, una regla posterior anula ambos desplazamientos del tablero.

| Viewport representativo | Caja cuadrada de flujo | Desplazamiento base aplicado al tablero | Extra de 5 asientos | Triggers en la base |
|---|---:|---:|---:|---|
| 390×844 | 390×390 | 0 px (regla `max-width:720px`) | 0 px | static; +72 px nominales |
| 720×900 | 720×720 | 0 px (regla `max-width:720px`) | 0 px | static; +72 px nominales |
| 721×563 | 721×721 | −124.80 px (`100−22vh−14vw`) | −49.60 px | static; +72 px nominales |
| 1023×563 | 900×900 | −149.86 px (`100−22vh−126px`) | −61.92 px | static; +72 px nominales |
| 1024×563 | 900×900 | −102.45 px (`108−15vh−126px`) | −61.92 px | static; +72 px nominales |
| 1199×563 | 900×900 | −102.45 px | −61.92 px | static; +72 px nominales |
| 1200×563 | 900×900 | −102.45 px | −61.92 px | fixed; no altura de flujo |

La diferencia en la fórmula al pasar de 1023 a 1024 px produce un salto calculado de aproximadamente 47.4 px en el desplazamiento base; la compensación debe seguir las mismas media queries, no extrapolar una sola constante. Entre 521 y 720 px aplica la media query de tablero, pero la regla de hasta 720 px en `PlayerBoardStyles.css` termina imponiendo `transform:none` y `translate:none`.

El `seat` del jugador local está centrado en `(50%, 86%)`. Para mesas de 5, el tablero completo recibe además `translate: 0 -6.88%`; su magnitud es 6.88% de la caja cuadrada: 49.60 px en un tablero de 721 px y 61.92 px cuando el ancho del tablero llega a 900 px. Los asientos bajos de 5/6 jugadores también tienen ajustes propios, pero no cambian la caja de flujo del tablero.

## Espacio lateral y riesgo de colisión

- El tablero tiene como máximo 900 px y permanece centrado. El ancho de los triggers en fila es 176 px.
- Desde 721 px, el jugador local dispone de dos slots de influencia de al menos 76 px cada uno (157 px incluida la separación de 5 px); la franja izquierda entre el borde del tablero y el comienzo de esas cartas cabe estáticamente para un rail de 176 px en el borde del tablero.
- Hasta 520 px, los slots propios miden `clamp(58px, 15.5vw, 82px)`. Una fila de triggers de 176 px no cabe entre el borde y las cartas; una cuadrícula compacta de dos columnas mide 114×114 px y cabe en esa franja con una separación breve en 390 px. En 5/6 jugadores, el anillo tiene asientos bajos cerca de esa área; la inspección estática no descarta solapamientos en la cuadrícula estrecha.
- `.EventLogContainer` está anclado arriba a la derecha en el encabezado (en escritorio, `top:10vh`; el bloque mide `9vh`). Las referencias ubicadas al lado izquierdo y a `top:86%` del tablero quedan fuera de esa región según las coordenadas CSS. `.DecisionsSection` es fija arriba en escritorio y estática en móvil. Los estados/eventos que cambian alturas reales y las decisiones visibles necesitan revisión en runtime.

## Evidencia disponible y límites

**Dinámica previa, aportada por el propietario y no reproducida:** dos capturas DOM de #44 a 1247×563, con `scrollY=168` y `82`; `.PlayerBoardContainer` mide 900×900 y su borde de documento permanece en `−6…894`, el borde de influencias propias cerca de 889–890, `.DecisionsSection` comienza en docY=1012 y los triggers permanecen en viewportY=491–543. La fórmula CSS base da `−102.45px`, coherente con esos datos.

**Revisión estática realizada aquí:** reglas de `PlayerBoardStyles.css`, `ReferencePanel.css`, `CoupStyles.css`, el árbol JSX de `Coup.js`, las posiciones de `playerBoardLayout.js` y el ancho/tamaño de asientos en `PlayerBoardStyles.css`. `command -v chromium chromium-browser google-chrome google-chrome-stable firefox` no encontró un navegador disponible en PATH.

**Pendiente explícito:** no hay `getBoundingClientRect()` ni `scrollHeight` dinámicos para 390, 720, 1024, 1199 o 1200 px, orientaciones, altos cortos, wrap, ni mesas de 2–6 jugadores. Los valores del cuadro son evaluación aritmética de CSS, no datos del DOM. No se declara aprobación visual ni ausencia runtime de colisiones.

## Decisión para F2

Mantener un wrapper cuadrado compartido para el tablero y `ReferencePanel`. Compensar en el margen inferior del wrapper el mismo desplazamiento vertical que pinta el tablero, sumando el caso de cinco asientos. Sacar los triggers del flujo; ubicar el grupo en el lateral izquierdo junto a la fila propia desde 521 px, y usar una cuadrícula compacta de dos columnas en pantallas menores. La cuadrícula de 5/6 jugadores y los casos de viewport bajo quedan sujetos a walkthrough F3/propietario; esta limitación no bloquea la implementación.
