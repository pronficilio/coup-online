# Plan: tablero circular de Coup — issue #5

**Estado:** `ACTIVE`

**Unidad:** https://github.com/pronficilio/coup-online/issues/5

**Handoff:** `docs/plans/active/handoff_issue_5_circular_board.md`

**Bitácora:** `docs/plans/log/issue-5.jsonl`

**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`

**Responsables:** Orquestador del plan; Agente Alquimista de la ejecución; Verifier independiente al final.

**Integración única:** `issue/5-circular-board` en `.worktrees/issue-5-circular-board`, PR a `master` del fork `pronficilio/coup-online`.

## Solicitud y definición de éxito

El usuario pide maquetar una representación circular del juego inspirada en `fotos/mini.png`, con `fotos/ejemplo.png` como contexto de la interfaz completa. Quiere: asientos enfrentados con 2, la composición exacta de referencia con 3, un jugador en cada lado con 4, distribución matemática desde 5 hasta el máximo permitido, color por jugador, borde rojo neón alrededor de las cartas del jugador en turno y `fotos/deck.png` convertido a WebP y centrado. Pide componentes preparados para animaciones futuras, sin animaciones en esta unidad. Los paneles de acciones y turno vistos en `ejemplo.png` tendrán otro issue.

**Solicitud operativa:** sustituir la fila de `PlayerBoard` por un tablero circular conectado al estado real de `Coup`, preservando decisiones y controles, con asientos estables de 2 a 6 jugadores, cartas correctas según observador, mazo WebP centrado y disposición adaptable.

Éxito significa que una partida de cualquier tamaño permitido conserva posiciones reconocibles y legibilidad durante turnos, pérdida de influencia y eliminación; el mazo permanece centrado; el único asset nuevo del mazo versionado es WebP; y los controles actuales siguen disponibles.

## Fuentes, hechos y supuestos

- `docs/coup_transcription.md` y `docs/coup_llm_summary.md`: 15 cartas, 2 influencias por jugador, ocultas a rivales; los eliminados dejan las cartas reveladas en mesa. El máximo operativo es 6: seis tarjetas de referencia en reglas y límite explícito `partyMembers.length >= 6` en `server/index.js`.
- `coup-client/src/components/game/Coup.js` recibe `players` y `currentPlayer` por socket, pero hoy filtra `isDead` antes de pasar jugadores a `PlayerBoard`. `PlayerBoard.js` dibuja una fila; no dispone de mazo central. `player` contiene nombre, dinero, color, influencias e `isDead`.
- El servidor no envía un contador de mazo ni un historial de cartas reveladas en el contrato actual. La interfaz no inventará un número de cartas ni identificará una carta perdida si el dato no existe. Los espacios perdidos pueden quedar inactivos.
- `server/game/utils.js` asigna un color a cada jugador. Su `exportPlayers` actual entrega las influencias a todos los clientes. Esta unidad restringe lo que se representa en el DOM para rivales; no debe afirmar que resuelve la privacidad del protocolo. No se cambia el servidor en esta unidad.
- `fotos/` y `docs/agentes/` están ignorados en Git. `fotos/deck.png` es la fuente local; el nuevo asset versionable será, por ejemplo, `coup-client/src/assets/deck.webp`. Los WebP de personajes existen en el `master` local, pero aún no forman parte de `origin/master`.
- El checkout local `master` está dos commits adelante y seis atrás respecto de `origin/master` al planear. El Ejecutor debe crear su rama desde la base remota actual, conservar el checkout y tomar selectivamente los WebP locales que necesite, sin arrastrar commits ajenos por accidente.

## Alcance

1. Componentes del tablero, asiento, cartas y mazo, con cálculo puro de posiciones. El jugador local queda en la base del círculo; el orden relativo de rivales sigue el orden inicial de la partida.
2. Geometrías especiales: 2 = abajo y arriba; 3 = abajo, arriba y derecha como `mini.png`; 4 = abajo, derecha, arriba e izquierda. Para 5 y 6, usar ángulos equidistantes sobre una elipse/círculo adaptable, comenzando abajo. Una fórmula válida es `x = cx + rx cos(π/2 − 2πi/n)` y `y = cy + ry sin(π/2 − 2πi/n)`. Mantener cartas verticales, sin rotarlas con el asiento.
3. Dos espacios de influencia por jugador; cartas propias vigentes con personaje, cartas rivales vigentes con el reverso; pérdida/eliminación visible sin compactar el arreglo de asientos. Mostrar nombre, color y monedas. Resaltar solo la mano cuyo nombre coincide con `currentPlayer` mediante borde rojo neón.
4. WebP del mazo centrado en el círculo. Fondo blanco admisible. La imagen de referencia no obliga a copiar paneles laterales, colores de fondo ni estilos de monedas.
5. Ajuste responsivo: dimensionar mesa, radios, cartas y áreas reservadas para controles. En pantallas estrechas se admite desplazamiento de la región de mesa cuando evite solapamiento o cartas ilegibles. Incluir contraste/foco y `prefers-reduced-motion` como base para efectos posteriores, sin animación activa ahora.

## Fuera de alcance

- Rediseñar ventanas de acción, resumen de turno, Tesorería, chat o configuración mostrados en `ejemplo.png`; podrán ser otro issue.
- Cambiar reglas, cantidad máxima, protocolo socket, privacidad de transporte o lógica del servidor.
- Implementar animaciones, librerías de movimiento o contadores de mazo sin dato real.
- Añadir PNGs nuevos al repositorio, incluido `fotos/deck.png`.

## Criterios de aceptación

1. Para 2, 3, 4, 5 y 6 participantes, la posición del observador y de los rivales cumple la geometría pactada, con mazo visualmente centrado y sin solapamiento a tamaños de escritorio y móvil.
2. Un cambio de turno mueve el borde rojo neón a la mano correcta; el color de identidad de cada jugador permanece visible. La señal de turno también se comunica sin depender solo del color.
3. Las cartas ajenas vigentes muestran reverso aun cuando el objeto `player` recibido incluya nombres de influencias. Las propias muestran el personaje correcto; espacios perdidos/eliminados no provocan reordenamiento.
4. Los nombres y monedas permanecen legibles. La mesa no impide usar decisiones, modales o controles existentes, incluso con 6 participantes.
5. El WebP centrado deriva de `fotos/deck.png` y el diff del PR no incluye el PNG fuente ni PNGs nuevos. No aparece un contador de Court inventado.
6. La lógica de posición y los componentes mantienen identidades estables y admiten futuras transiciones con `transform`/`opacity` sin cambiar el cálculo de asientos ni añadir movimiento ahora.

## Fases de ejecución

### F1 — Fijar asientos estables y contrato visual (`CLOSED`)

**Pregunta:** ¿pueden los datos actuales asignarse de forma determinista a las posiciones de 2 a 6 sin mover a los eliminados ni revelar cartas ajenas?

**Entrada:** reglas, `Coup.js`, `PlayerBoard.js`, estado socket y referencias.

**Subtareas:** definir función pura de orden/posiciones; crear componentes de mesa/asiento que reciban observador, jugadores y turno; dejar dos espacios de influencia con selección de cara/reverso y estado inactivo.

**Áreas:** `coup-client/src/components/game/`; no cambiar `server/`, paneles de decisiones ni archivos locales `fotos/`.

**Evidencia:** código y `docs/plans/circular-board/report_issue_5_F1.md` con tabla de asientos para n=2..6 y tratamiento de eliminación.

**Avanzar:** geometrías y privacidad de representación cumplen criterios 1 y 3 en revisión del código. **Pivotar:** si el contrato real de datos exige adaptar solo la interfaz del componente. **Repetir:** un ajuste acotado por error de orden. **Bloquear/cancelar:** ausencia de datos básicos que impida identificar observador o turno.

**Validación mínima:** comprobar tabla geométrica y ausencia de identidades ajenas en el DOM de cartas ocultas.

**Commit:** `COMMIT_REQUIRED`; cierre previsto `feat(board): issue 5 F1 CLOSED advance_f2`, junto con resultado y evento `phase_verdict`.

### F2 — Integrar mesa y mazo WebP (`ACTIVE`)

**Pregunta:** ¿la mesa circular ya definida presenta las cartas y el mazo gráfico centrado sin interrumpir los controles del juego?

**Entrada:** F1 cerrada y `fotos/deck.png`.

**Subtareas:** convertir `fotos/deck.png` a WebP conservando transparencia; renderizar la pila Court centrada en el círculo; usar los WebP de personajes y reverso en las cartas propias y rivales cuando estén disponibles, tomando solo los assets necesarios del checkout local si faltan en la base remota; conservar nombres, monedas, color y resalte de turno definidos en F1. No rehacer el cálculo de asientos ni la conexión de roster ya cerrados.

**Áreas:** React y `coup-client/src/assets/`; no versionar fuentes PNG ni incorporar commits locales ajenos. Mantener fuera de alcance los paneles de acción/turno y los ajustes responsivos detallados, que pertenecen a F3.

**Evidencia:** `docs/plans/circular-board/report_issue_5_F2.md`, captura de una mesa de 3 con la pila centrada, verificación de los WebP usados y lista del diff de assets.

**Avanzar:** la pila queda centrada, las caras/reversos muestran el estado correcto, el turno conserva su borde y los controles siguen accesibles. **Pivotar:** adaptar medidas o estructura si el mazo colisiona con asientos. **Repetir:** una variante acotada de escala/posición. **Bloquear/cancelar:** asset no convertible o imposible de integrar sin cambiar protocolo, con evidencia.

**Validación mínima:** inspección del WebP y transparencia, diff limitado a assets `.webp`, recorrido manual del flujo de decisiones y confirmación de que el PNG fuente no aparece en el diff.

**Commit:** `COMMIT_REQUIRED`; cierre previsto `feat(board): issue 5 F2 CLOSED advance_f3`, junto con resultado y evento `phase_verdict`.

### F3 — Cerrar disposición responsiva y evidencia (`PENDING`)

**Pregunta:** ¿resiste la mesa las cinco cantidades permitidas y los cambios de estado en escritorio y móvil sin solapamientos ni regresiones visibles?

**Entrada:** F2 cerrada.

**Subtareas:** ajustar radios, tamaños y reservas de espacio; inspeccionar 2..6, turno, pérdida y eliminación; corregir fallos observados; registrar capturas y límites conocidos.

**Áreas:** estilos/componentes del tablero y documento de resultados; sin rediseñar los paneles aplazados.

**Evidencia:** `docs/plans/circular-board/report_issue_5_F3.md` con matriz visual 2..6, capturas, viewport y resultados; salida de build si se ejecuta por riesgo concreto.

**Avanzar:** todos los criterios de aceptación sostenidos por evidencia. **Pivotar:** escoger desplazamiento horizontal u otra medida legible para pantalla estrecha. **Repetir:** ajuste localizado del caso que falle. **Bloquear/cancelar:** limitación persistente que no pueda resolverse en el alcance.

**Validación mínima:** revisión visual en escritorio/móvil de n=2..6 y recorrido de turno/eliminación; build de React si el cambio lo requiere.

**Commit:** `COMMIT_REQUIRED`; cierre previsto `feat(board): issue 5 F3 CLOSED ready_review`, junto con resultado y evento `phase_verdict`.

## Revisión e integración

- El Verifier independiente actúa al final, sobre el head del PR, y trata de refutar: «para alguna cantidad 2..6 o transición de estado, ¿se desplaza un asiento, se muestra una carta rival, se oculta un control o se descentra el mazo?» Debe informar `PASS`, `FAIL` o `BLOCKED` con evidencia sin implementar cambios.
- El Alquimista reclama #5 en GitHub, relee la unidad, confirma ausencia de reclamo incompatible, crea/confirma el branch y worktree únicos desde `origin/master` actualizado, registra `claim` y `worktree_confirmed`, y ejecuta fases allí. Un PR único apunta a `master`.
- El Orquestador revisa diff, artefactos, veredicto y PR; solo integra y cierra la issue tras verificación. Ninguna fase cierra por una captura aislada sin comprobar el estado real.

## Revisión F1 y autorización F2

El Orquestador revisó el commit `5d77ffdc3805b3ba7b50d0d0619caca15e7613d9` en el worktree canónico contra el reporte, diff, plan y bitácora. F1 cumple su pregunta de fase: el helper determina las posiciones de 2..6 con el observador abajo, conserva el roster y objetos eliminados, y `PlayerBoard` no renderiza valores de influencias rivales. `Coup` mantiene por separado el roster del tablero y los jugadores activos usados por las decisiones. El diff está dentro de alcance y el worktree estaba limpio, dos commits adelante de `origin/master`.

`git diff --check` y la bitácora JSONL pasaron según evidencia registrada. No se ejecutaron tests ni build, no requeridos para cerrar este contrato F1; la inspección visual responsiva permanece en F3. El issue no tiene PR abierto. Veredicto del Orquestador: **aprobar F1 y liberar F2**. F2 queda `READY` en el mismo branch/worktree; la verificación independiente `FINAL` sigue pendiente para el checkpoint final de la unidad.

## Checkpoint F2 y siguiente acción

La implementación de F2 integra caras WebP propias, el reverso de rivales y la pila Court centrada. La captura del componente React de tres jugadores, conversión/transparencia y lista de assets están en `docs/plans/circular-board/report_issue_5_F2.md`. El cliente compiló con el servidor de desarrollo y `git diff --check` pasó. No se ejecutó una partida con socket ni se interactuó con una decisión.

F2 sigue `ACTIVE` porque queda pendiente la validación interactiva de decisiones. Siguiente paso verificable: activar una ventana de decisión en una partida/socket y comprobar que permanece utilizable junto al mazo. Siguiente dueño: Orquestador, para proveer/autorizar esa verificación o aceptar el límite documentado. No empezar F3; sigue `PENDING`.

## Riesgos, preguntas y decisiones

- **Riesgo responsivo:** seis manos alrededor de un círculo pueden requerir una mesa con ancho mínimo y desplazamiento en móvil. Priorizar cartas legibles y controles accesibles sobre comprimir el diseño.
- **Riesgo de datos:** `Coup` filtra eliminados y el servidor no conserva cartas reveladas para una representación exacta. Mantener los asientos; representar espacios perdidos inactivos. La exhibición exacta de cartas reveladas necesita otra decisión de datos.
- **Riesgo de base:** `master` local y `origin/master` divergen. No hacer reset ni mezclar los dos commits locales completos en el PR por comodidad. Reutilizar únicamente assets pertinentes y registrar su procedencia.
- **Pregunta no bloqueante:** la dirección angular de rivales en 5 y 6 seguirá el orden estable que entrega el juego; las referencias solo fijan posiciones para 2, 3 y 4.
- **Decisión inicial:** una unidad `FULL`, riesgo `MEDIUM`, Verifier `FINAL` por la integración de estado, componentes, assets y diseño responsivo; sin cambio de reglas o servidor.

## Siguiente acción

Orquestador: revisar el checkpoint F2 en `issue/5-circular-board` y `.worktrees/issue-5-circular-board`; decidir si realiza/acepta la validación interactiva pendiente antes de cerrar F2. No reclamar otra unidad ni abrir otro worktree. F3 queda pendiente.
