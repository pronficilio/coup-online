# Plan — Opciones de decisión debajo del tablero (#44)

**Estado:** `SUPERSEDED`; F1 diagnóstico geométrico desktop `CLOSED (PASS)`; issue `CLOSED` como `NOT_PLANNED`.
**Issue canónico:** https://github.com/pronficilio/coup-online/issues/44
**Cierre administrativo:** `docs/plans/completed/issue_44_player_decisions_layout.md`
**Bitácora:** `docs/plans/log/issue-44.jsonl` (append-only).
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL` independiente.
**Branch / worktree:** `issue/44-player-decisions-layout` / `.worktrees/issue-44-player-decisions-layout`.
**Base / destino:** `origin/master` vigente al reclamar / `master` de `pronficilio/coup-online`.
**Integración:** no hubo cambios de producto ni PR; #44 fue sustituida por #56.

## Solicitud y definición de éxito

Investigar el espacio vertical excesivo entre `PlayerBoardContainer` y `DecisionsSection`, ubicar las opciones del cliente local inmediatamente debajo de sus cartas y comprobar de forma sistemática qué controles se muestran para cada tipo de decisión y estado del juego. Evaluar si las opciones caben dentro de `PlayerBoardContainer` o si una estructura de layout cercana preserva mejor el tablero y los controles.

Éxito significa tener una explicación causal medida, un layout compacto/responsivo y evidencia de que cada control visible corresponde a una opción autorizada para ese cliente; no quedan instancias accionables obsoletas, ausentes, duplicadas ni cubiertas.

## Hechos confirmados al intake

- `Coup.js` monta `PlayerBoard`, luego `ReferencePanel`, y después `.DecisionsSection`; el rail para `decision.type === 'action'` se porta a `document.body` junto a Cheat Sheet/Resumen.
- `.PlayerBoardContainer` tiene ancho `min(100%, 900px)`, `aspect-ratio: 1`, margen vertical de 12 px y desplazamiento visual con `transform: translateY(...)`; el tablero cuadrado conserva su caja de flujo aunque se pinte más arriba. En un contenedor que alcanza 900 px de ancho, esa caja reserva hasta 900 px de alto, además de márgenes.
- **Inferencia pendiente de medición:** la diferencia entre la caja de flujo conservada y la posición pintada del tablero probablemente explica gran parte del espacio percibido; hay que medir DOM/viewport real, incluir `ReferencePanel`, y comprobar márgenes/estilos responsive antes de declarar causa.
- `DecisionsSection` dibuja decisiones cuyo tipo no es `action`; para cada una recorre `decision.options`. #24 mantiene las acciones principales en un rail portalizado y fue cerrada mediante PR #41; su renderer no debe duplicarse ni rediseñarse en esta unidad.
- El servidor produce decisiones `action`, `claim`, `challenge`, `block`, `block_challenge`, `prove_claim`, `lose_influence` y `exchange` en rutas distintas. F1 debe determinar cuáles llegan efectivamente como decisiones visibles, su elegibilidad y etiquetas exactas; no inferirlas solo por el listado del código servidor.
- `Coup.js` también gestiona enviada/aceptada/rechazada, espera, pausa, fin de partida, revancha y desconexión; el inventario del Ejecutor debe comprobar transiciones y prioridad de render.
- Al planear #44, #43 estaba `OPEN` y compartía `PlayerBoard.js`, el cliente de juego y el servidor. Después #43 se integró por PR #57 y quedó `CLOSED`; #44 fue sustituida por #56 antes de F2. No se hicieron cambios concurrentes ni se absorbió alcance de #43.
- El checkout raíz contiene cambios locales preexistentes para #42 y #43. No incluirlos, descartarlos ni trasladarlos al branch de #44.

## Alcance y límites

Incluye diagnóstico de caja de flujo/rectángulos, responsive, ubicación de action rail y decisiones de respuesta, accesibilidad, ciclo de vida de controles y walkthrough manual. Áreas probables: `Coup.js`, `PlayerBoard.js`, `PlayerBoardStyles.css`, `CoupStyles.css`, componentes de decisión, y fuente de estado de servidor solo para confirmar el contrato.

No cambiar reglas, elegibilidad, `decision.options`, `choiceId`, payloads Socket.IO ni resolución del servidor; no añadir opciones desde el cliente. No reabrir el rediseño de #24 ni cambiar el significado de señales de #43. No agregar ni ejecutar tests automatizados. No iniciar F2 en superficie compartida hasta revisar #43 y confirmar un branch/worktree limpio y una base actual.

## F1 — Causa del hueco y matriz del renderer (`CLOSED (PASS)` limitado a diagnóstico desktop)

**Pregunta única:** ¿qué dimensiones/estilos mantienen la distancia, y qué controles se esperan/renderizan para cada combinación de decisión y estado local?

- Reconstruir ciclo server → emisión/estado React → renderer y autoridad de `decision.options`; listar tipos realmente visibles, opciones/labels, requerimientos de objetivo/influencia y decisiones especiales.
- Medir rectángulos (`getBoundingClientRect`) de caja de `.PlayerBoardContainer`, asientos/cartas propias, `ReferencePanel`, `.DecisionsSection` y acción/response rail; comparar con alturas/cajas de flujo e identificar transformaciones, márgenes, breakpoints y posiciones fixed/absolute. Capturar al menos un móvil y un escritorio; cubrir tablero de 2 y 6 jugadores en esta fase si se reproduce con facilidad.
- Producir tabla de estados: antes de recibir decisión; action local; respuesta local elegible; otro jugador/observador sin opción; enviada; rechazada/error; pausa/espera/reanudar; `lose_influence` y `exchange`; game over/revancha; desconexión. Marcar evidencia `estática`, `dinámica` o `no reproducida`.
- Comparar alternativas para dejar opciones justo debajo de cartas propias, incluida dentro de `PlayerBoardContainer`; evaluar impacto de su aspect ratio/cuadrado, responsive, asientos, scroll, stacking, focus/aria-live y modales. Recomendar ubicación concreta antes de F2.
- **Salida:** `docs/plans/player-decisions-layout/report_issue_44_F1.md` con causa sustentada en métricas y matriz completa; no cambiar código de producto.
- **Avanzar:** explicación geométrica falsable y propuesta que acerca opciones sin tapar/cortar estados o alterar la elegibilidad.
- **Pivotar:** si el hueco no nace del flujo descrito o paneles portalizados hacen insegura la ubicación elegida, documentar causa alternativa y propuesta ajustada.
- **Repetir:** una medición adicional acotada si la caja real no concuerda con CSS/DOM estático.
- **Bloquear:** no hay cliente/servidor reproducible ni acceso a viewport; completar rastreo estático, distinguir el límite y dejar F1 `BLOCKED` para evidencia dinámica.
- **Commit:** `COMMIT_REQUIRED`; `docs(player-decisions): issue 44 F1 CLOSED diagnosis matrix`.
- **Validación:** revisión de fuente y DOM/mediciones manuales, `git diff --check`; sin tests automatizados.

## F2 — Ubicar los controles debajo de las cartas (`NOT EXECUTED`; unidad sustituida)

**Pregunta única:** ¿puede el layout propuesto acercar controles al asiento/carta propia para los tipos de decisión actuales sin alterar otros controles o el contrato?

- Implementar solo tras aceptar el resultado F1 y releer #43. Esperar la integración de #43 si hace falta para no editar `PlayerBoard` concurrentemente; si puede resolverse desde shell/CSS sin esa superficie, documentar la decisión y mantener integración secuencial.
- Preferir un layout explícito que mida/separe tablero y controles según F1; alojarlos dentro de `PlayerBoardContainer` solo si no estira/redefine el tablero cuadrado, desplaza asientos, crea clipping o altera contextos de posicionamiento. Mantener rail de action único según #24 y controles de respuesta en una sola instancia.
- Aplicar la posición bajo las cartas del asiento propio cuando existe decisión local; no cambiar `decision.options`, `choiceId`, callbacks, envío, foco, pausa, modal ni indicadores de #43.
- Verificar visualmente escritorio y móvil, tablero de 2–6 jugadores; registrar coordenadas/capturas y comportamiento de scroll/resize. Validar caso con decisión action, respuesta gráfica, decisión de influencia y ausencia de decisión.
- **Salida:** cambio acotado y `report_issue_44_F2.md` con comparaciones pre/post y validación del contrato.
- **Avanzar:** gap breve consistente y ninguna regresión de visibilidad/uso de tablero o controles.
- **Pivotar:** retirar solo la estrategia geométrica que no soporte asientos/viewports y aplicar la alternativa aprobada por F1.
- **Repetir:** un ciclo por regresión localizada y reproducible.
- **Bloquear:** conflicto de base/propiedad con #43 o pérdida de accesibilidad/controles sin resolver.
- **Commit:** `COMMIT_REQUIRED`; `feat(player-decisions): issue 44 F2 CLOSED compact layout`.
- **Validación:** build cliente y recorrido manual; `git diff --check`; sin tests automatizados.

## F3 — Auditoría final y refutación independiente (`NOT EXECUTED`; unidad sustituida)

**Pregunta única:** ¿hay un estado válido donde falte, sobre, se duplique o quede inaccesible un botón, o donde el espacio vuelva a crecer?

- Recorrer cada tipo/estado identificado en F1 con dueño de turno/no-dueño, participante eliminable/espectador cuando aplique, decisión pendiente/enviada/cerrada/rechazada, pausa/reanudación, game over/revancha y desconexión; registrar cada caso como PASS/FAIL/BLOCKED y qué medio de evidencia lo respalda.
- Cubrir 2, 3, 4, 5 y 6 asientos, al menos móvil y escritorio, cambio entre action/respuesta y estados con una/múltiples respuestas pendientes. Coordinar base e integración #43 y comprobar las clases/indicadores resultantes sin convertirlos en fuente de elegibilidad.
- Inspeccionar conteo DOM/IDs, disabled/aria, solapamiento y foco/teclado; comprobar que cada control deriva de opciones de la decisión y que enviar/cancelar conserva su comportamiento.
- Invocar Verifier independiente sobre el commit/HEAD exacto y la pregunta adversarial de esta unidad. El Verifier debe intentar producir un estado que muestre botón ilegal, omita opción legal o ponga el control bajo/encima de otro asiento.
- **Avanzar:** matriz sin FAIL; limitaciones no reproducidas explícitas; build y walkthrough documentados; Verifier `PASS`; dejar unidad `WAITING_ORCHESTRATOR` para una PR única.
- **Pivotar:** volver a F2 con el estado exacto y la evidencia de fallo.
- **Repetir:** revisión focalizada del criterio reparado.
- **Bloquear:** escenario crítico que no se puede observar o resultado independiente FAIL/BLOCKED.
- **Commit:** `COMMIT_REQUIRED`; `docs(player-decisions): issue 44 F3 CLOSED ready_review`.
- **Validación:** recorrido manual/build y revisión independiente FINAL; sin tests automatizados.

## Topología y próximo dueño

Una sola unidad #44 → `issue/44-player-decisions-layout` → `.worktrees/issue-44-player-decisions-layout` → una PR a `master` de `pronficilio/coup-online`. Antes de reclamar/crear branch, leer issue #44 y comprobar branch/worktree/PR candidato; registrar claim en fork y volver a verificarlo, luego crear el aislamiento desde `origin/master` actualizado. No usar `upstream`.

**Cierre:** #44 quedó `NOT_PLANNED` y sustituida por #56. Se conserva F1 como diagnóstico limitado a desktop con mediciones del propietario; F2/F3 no se ejecutaron. Ver cierre administrativo y reporte F1.

**Falsificación:** ¿puede existir combinación alcanzable de tipo de decisión, asiento local y estado de juego que omita una opción legal, exponga una acción no permitida, duplique un control o lo oculte/cubra después del cambio de layout?
