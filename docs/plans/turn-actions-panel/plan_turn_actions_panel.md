# Plan: panel de acciones del turno — issue #6

**Estado:** `WAITING_ORCHESTRATOR`; F1 está `CLOSED`, F2 está `BLOCKED/PENDING` hasta integrar el issue #5 a `master`.
**Unidad:** https://github.com/pronficilio/coup-online/issues/6  
**Handoff:** `docs/plans/inbox/issue_6_turn_actions_panel.md`  
**Bitácora:** `docs/plans/log/issue-6.jsonl`  
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`  
**Responsables:** Orquestador del plan; Agente Alquimista de la ejecución; Verifier independiente al final.  
**Integración única prevista:** `issue/6-turn-actions-panel` en `.worktrees/issue-6-turn-actions-panel`, PR a `master` de `pronficilio/coup-online`.

## Solicitud y definición de éxito

La persona usuaria solicita llevar las acciones del juego a una experiencia visual clara y fluida, basada en el panel izquierdo de `fotos/ejemplo.png`. El panel debe presentar las acciones disponibles con su beneficio o coste, el personaje que se declara y los personajes que pueden bloquear. Debe aparecer para el jugador local durante su turno y desaparecer cuando el turno corresponde a otra persona, sin perder la orientación del estado de la partida.

**Solicitud operativa:** mejorar primero la presentación de `ActionDecision` en su punto de montaje actual, sin tocar el shell del tablero; después, una vez integrado #5, montar esa presentación en la estructura final, controlar su visibilidad con el estado de Coup y cerrar la experiencia responsiva con transiciones de bajo coste de renderizado.

Éxito significa que cada jugador ve acciones solo en su turno; entiende qué recibe, paga, declara y quién puede bloquear; puede cancelar la selección de objetivo sin perder monedas; las respuestas de desafío/bloqueo siguen accesibles; y la apertura/cierre no desplaza el tablero ni genera animación perceptiblemente entrecortada.

## Fuentes y hechos actuales

- Issue #5 (`https://github.com/pronficilio/coup-online/issues/5`) continúa `OPEN`: F1 está cerrada, F2 aún no se integra y todavía no hay PR. Su contrato excluye expresamente los paneles de acción y turno. F1 de #6 solo modifica la presentación autocontenida de `ActionDecision`; montar el panel en el shell final queda para F2, después de integrar #5 a `master`.
- `coup-client/src/components/game/Coup.js` escucha `g-updateCurrentPlayer` y `g-chooseAction`. Mantiene por separado los estados de desafío, bloqueo, revelación, selección de influencia e intercambio.
- `coup-client/src/components/game/ActionDecision.js` actualmente dibuja botones y pide objetivos para Coup, Assassinate y Steal. Coup y Assassinate descuentan monedas antes de que se confirme el objetivo; `doneAction` oculta la decisión al emitir la acción.
- `server/utilities/constants.js` es la referencia de personajes declarados y bloqueos. Las reglas se basan en declaraciones que pueden ser faroles: la presencia de una influencia en la mano no debe decidir si se ofrece una acción.
- El cliente existente está en inglés. Esta unidad conserva sus etiquetas de juego en inglés y puede explicar costes/beneficios en ese mismo idioma.
- El repositorio define `master` como base, GitHub como tracker, worktree por unidad, una integración por issue y commits requeridos por fase.

## Contrato de contenido

| Acción | Beneficio/coste | Declaración | Bloqueo |
|---|---|---|---|
| Income | Ganas 1 moneda; gratis | Ninguna | Ninguno |
| Foreign Aid | Ganas 2 monedas; gratis | Ninguna | Duke |
| Coup | Pagas 7 monedas | Ninguna | No bloqueable |
| Tax | Ganas 3 monedas; gratis | Duke | No bloqueable |
| Steal | Tomas hasta 2 monedas | Captain | Captain o Ambassador |
| Exchange | Intercambias influencias; gratis | Ambassador | No bloqueable |
| Assassinate | Pagas 3 monedas | Assassin | Contessa |

«Declaras» debe diferenciarse de «posees». Para 10 monedas o más, Coup es la única acción elegible. Las acciones con coste superior al saldo se muestran deshabilitadas y explican el saldo requerido. Beneficios como «hasta 2» no se presentan como un coste.

## Alcance

1. Panel de escritorio a la izquierda que se abre cuando el jugador local recibe su turno. Fuera del turno, se recoge la lista y queda un estado compacto con el turno activo/esperado.
2. En móvil, bandeja inferior con desplazamiento interno, abierta al iniciar el turno local.
3. Al elegir acción con objetivo, cambiar el contenido a selección de jugador; permitir volver sin cobrar. Aplicar coste y emitir la acción una sola vez tras confirmar el objetivo.
4. No permitir que el panel tape decisiones pendientes de desafío, bloqueo, revelación o pérdida de influencia.
5. Transiciones breves basadas en `transform`/`opacity`, sin biblioteca de movimiento, con alternativa inmediata mediante `prefers-reduced-motion`. El cambio visual no debe cambiar el ancho/posición de la mesa.
6. Orden de foco comprensible, foco visible y estados entendibles sin depender exclusivamente del color.

## Fuera de alcance

- Cambiar reglas, seguridad del servidor, protocolo de Socket.IO o privacidad de los datos.
- Rediseñar el tablero, su mazo, sus asientos o sus animaciones.
- Cambiar el idioma general del cliente, incorporar dependencias de animación o añadir tests automatizados.
- Montar el panel en el shell del tablero antes de integrar el issue #5.

## Criterios de aceptación

1. La lista de acciones se monta/activa solo para el jugador local vivo que recibió `g-chooseAction`; al terminar su elección o pasar el turno, los botones dejan de estar disponibles.
2. Para las siete acciones se distinguen correctamente gratuidad, beneficio, coste, declaración de personaje y personajes que pueden bloquear. Se cumple el Coup obligatorio con 10 monedas y se explica el saldo insuficiente.
3. La elección de objetivo permite volver; cancelar no descuenta monedas ni emite una acción. Confirmar descuenta el coste que corresponda y emite una sola elección.
4. Una acción que permite responder no oculta ni bloquea controles de desafío, bloqueo, revelación o selección de influencia.
5. En escritorio y móvil el contenido es legible y el tablero mantiene su área/posición al abrir/cerrar. Se puede usar con ratón, tacto y teclado.
6. La transición usa propiedades visuales de bajo coste y se desactiva con movimiento reducido; no se incorpora una biblioteca de animación.
7. Verifier intenta encontrar estados/eventos que muestren acciones al jugador incorrecto, cobren antes de confirmar, permitan doble envío, escondan una respuesta o causen salto/atasco visual.

## Fases

### F1 — Presentar acciones con semántica correcta (`CLOSED`)

**Pregunta:** ¿el panel comunica de forma clara qué gana/paga el jugador, qué personaje declara y quién puede bloquear?  
**Entrada:** `server/utilities/constants.js`, `ActionDecision.js`, estilos actuales y referencia visual. Se conserva el punto de montaje actual; F1 no depende del shell de #5.  
**Subtareas:** definir la presentación basada en los datos actuales; diseñar filas compactas; etiquetar coste/beneficio, declaración y bloqueos por separado; mostrar gratuidad, fondos insuficientes y Coup obligatorio; conservar callbacks y flujo/socket actual; preparar los estilos para que F2 monte la presentación en el tablero integrado.  
**Áreas:** `coup-client/src/components/game/ActionDecision.js` y estilos/archivos de presentación de acciones. No editar `Coup.js`, tablero, servidor ni protocolo en esta fase.  
**Evidencia:** `docs/plans/turn-actions-panel/report_issue_6_F1.md` y captura `docs/plans/turn-actions-panel/issue_6_f1_visual.png` desde el montaje actual; tabla que contrasta etiquetas con reglas.
**Avanzar:** los siete renglones reflejan el contrato de contenido sin confundir declaración, bloqueo, coste o beneficio y los callbacks actuales siguen conectados. **Pivotar:** separar la presentación en un subcomponente si reduce acoplamiento para F2. **Repetir:** una corrección acotada de etiqueta/legibilidad. **Bloquear/cancelar:** solo si el contrato actual no permite cambiar presentación sin invadir el flujo que #5 está integrando; devolver al Orquestador con evidencia.  
**Validación:** revisión de reglas y visual en vista de acciones; build del cliente si el cambio lo requiere. No añadir tests automatizados.  
**Commit:** `COMMIT_REQUIRED`; cierre `feat(actions-panel): issue 6 F1 CLOSED visual verified`, con reporte, captura y evento `phase_verdict`.

**Estado de ejecución:** `CLOSED / PASS`. La presentación semántica, el build ya registrado y la revisión de `docs/plans/turn-actions-panel/issue_6_f1_visual.png` completan los criterios de F1. La captura a 1440 × 1500 muestra las siete acciones y sus metadatos completos en el montaje actual. Consultar `docs/plans/turn-actions-panel/report_issue_6_F1.md`. F2 queda `BLOCKED/PENDING` hasta integrar el issue #5 a `master`.

### F2 — Montar en el tablero y conectar confirmación (`BLOCKED/PENDING`; depende de #5)

**Pregunta:** ¿el shell integrado muestra el panel solo en el turno local y permite confirmar objetivos sin cobrar prematuramente?  
**Entrada:** F1 cerrada y #5 integrado a `master`; releer su markup/contrato antes de cambiar el montaje.  
**Subtareas:** conectar visibilidad con estado local vivo y eventos de turno; mantener separadas las respuestas; confirmar/recoger al enviar; ofrecer volver/cancelar en selector de objetivos; mover el cobro de Coup y Assassinate a la confirmación; impedir doble envío; conservar la regla de Coup obligatorio y el estado de dinero.  
**Áreas:** `Coup.js`, `ActionDecision.js` y componentes/estilos del panel; sin cambios en `server/`.  
**Evidencia:** `docs/plans/turn-actions-panel/report_issue_6_F2.md`, recorrido manual de inicio/fin de turno, cancelación/confirmación de objetivos y decisiones de respuesta.  
**Avanzar:** los eventos y estados enumerados conservan dueño, saldo y controles esperados. **Pivotar:** ajustar el origen de verdad si #5 organiza el turno en un contenedor nuevo. **Repetir:** una variante acotada por transición incorrecta. **Bloquear/cancelar:** solo sería posible mantener el coste temprano alterando las reglas o el servidor; pedir reorquestación en vez de ampliar alcance unilateralmente.  
**Validación:** recorrido funcional en cliente; build si los cambios lo requieren. No añadir tests automatizados.  
**Commit:** `COMMIT_REQUIRED`; cierre `feat(actions-panel): issue 6 F2 CLOSED advance_f3`, con reporte y evento `phase_verdict`.

### F3 — Cerrar respuesta visual, accesibilidad y movimiento (`PENDING`)

**Pregunta:** ¿el panel se abre y recoge en escritorio y móvil sin mover la mesa, ocultar controles ni crear tirones?  
**Entrada:** F2 cerrada.  
**Subtareas:** fijar drawer de escritorio y bandeja inferior móvil; limitar scroll al contenido del panel; animar solo `transform`/`opacity`; implementar modo de movimiento reducido, ocultamiento semántico y gestión de foco; revisar tablero de 2 a 6 participantes, jugador local/eliminado y decisiones pendientes.  
**Áreas:** estilos/componentes del panel y artefactos de evidencia; no rehacer la mesa.  
**Evidencia:** `docs/plans/turn-actions-panel/report_issue_6_F3.md`, matriz escritorio/móvil, capturas y observaciones de una secuencia repetida de cambio de turno.  
**Avanzar:** criterios 1–7 pasan revisión y no hay colisiones ni cambio de área/posición de mesa. **Pivotar:** convertir la bandeja móvil a un resumen plegado si tapa la mesa o respuestas. **Repetir:** un ajuste localizado por viewport. **Bloquear/cancelar:** si el shell de #5 no permite las áreas seguras sin un cambio fuera de alcance.  
**Validación:** inspección visual/funcional manual, teclado y movimiento reducido; build si cambios lo requieren. No añadir tests automatizados.  
**Commit:** `COMMIT_REQUIRED`; cierre `feat(actions-panel): issue 6 F3 CLOSED ready_review`, con reporte y evento `phase_verdict`.

## Dependencia, integración y revisión

- F1 está cerrada en el montaje actual de `ActionDecision`; no requirió cambios en el tablero de #5. F2 no puede empezar hasta integrar #5 a `master`.
- Antes de F2, el Alquimista vuelve a leer issue #5, el head integrado, este plan y el código; adapta el punto de montaje y contratos de props/eventos. El Orquestador confirma el avance de la dependencia en tracker, plan y bitácora.
- El Alquimista reclama #6 en GitHub, relee el ticket y confirma que no hay reclamo incompatible; crea o confirma `issue/6-turn-actions-panel` desde `origin/master` actualizado en `.worktrees/issue-6-turn-actions-panel`; registra el reclamo antes del trabajo funcional.
- Todas las fases pertenecen a ese branch/worktree y a un solo PR a `master`. El Orquestador revisa diff, evidencia, build/recorridos declarados y veredicto independiente antes de integrar o cerrar.
- Pregunta de falsificación para Verifier: ¿puede algún evento fuera de turno mostrar acciones propias o quedar con botones habilitados; cancelar un objetivo puede descontar dinero; un segundo clic puede duplicar la acción; o una respuesta legítima quedar cubierta por el panel?

## Riesgos y decisiones

- **Dependencia de layout:** el panel de #5 no está integrado aún; no asumir su DOM, anchos ni punto de composición. F1 trabaja sobre `ActionDecision` en el montaje actual y F2 espera el resultado integrado.
- **Cobro distribuido en cliente/socket:** posponer el cobro exige ordenar confirmación, deducción y evento de acción. Conservar protocolo y usar el orden del mismo socket; si las transiciones observadas contradicen este supuesto, bloquear y reorquestar antes de tocar servidor.
- **Farol vs. propiedad de personaje:** los distintivos representan declaración y bloqueadores según reglas; no limitan la disponibilidad a la mano.
- **Rendimiento percibido:** la lista es estática y pequeña. Evitar animaciones de layout, filtros pesados, recalcular la mesa o re-render continuo; usar transiciones cortas compositables.
- **Estado inicial revisado por el Orquestador:** `WAITING_EXECUTOR`; issue #6 está abierto, F1 `READY` y F2 condicionada a #5. No hay branch/worktree ni PR para #6; el Alquimista debe reclamarlos antes de F1.
