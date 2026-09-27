# Plan: hacer claras las acciones del turno — issue #24

**Estado:** `WAITING_ORCHESTRATOR`; F1 `BLOCKED` por el renderer compartido de #14 y la traducción pendiente de #19. No iniciar cambios de producto hasta cerrar la dependencia descrita abajo.
**Issue:** https://github.com/pronficilio/coup-online/issues/24
**Handoff:** `docs/plans/blocked/issue_24_turn_action_row_clarity.md`
**Bitácora:** `docs/plans/log/issue-24.jsonl`
**Modo / riesgo / verificación:** `LIGHT` / `MEDIUM` / `FINAL`.
**Rama / worktree / integración única:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity` / una PR a `master` de `pronficilio/coup-online`.
**Siguiente dueño:** Orquestador, hasta liberar las superficies.

## Solicitud y definición de éxito

La persona usuaria quiere que las acciones disponibles durante su turno indiquen claramente dónde hacer clic, que el hover tenga un resalte cálido y opaco en toda la fila, y que las acciones prohibidas expliquen por qué están deshabilitadas. Las referencias visuales son `references/a_normal.png`, `references/a_hover.png` y `references/a_dis.png`, copiadas sin cambios desde `fotos/`.

Éxito significa que toda la fila funciona como una unidad interactiva; las acciones disponibles y prohibidas se distinguen con los tres estados de referencia; el motivo de indisponibilidad se entiende con mouse, teclado y toque; y la selección, confirmación, cancelación y cobro conservan el flujo del renderer que quede integrado.

## Hechos, fuentes y dependencias

- El issue #6 está `CLOSED` y la PR #11 integrada. Su panel muestra hoy siete acciones y calcula deshabilitación por saldo insuficiente para Coup/Assassinate y por Coup obligatorio con 10+ monedas.
- El issue #21 sigue abierto, pero su contrato se limita a controles gráficos de respuesta (`Block`, `Challenge`, `Pass`) y excluye explícitamente las acciones principales.
- El issue #14 está abierto; su PR #23 cambia el renderer de decisiones y elimina componentes de respuesta heredados. El destino final de las acciones debe confirmarse sobre esa integración.
- El issue #19 está abierto y su PR draft #22 deja traducción de decisiones pendiente. Sus archivos reservados incluyen los componentes de juego y sus textos accesibles.
- Las referencias visuales estaban en `fotos/`, fuera del historial versionado. Las tres copias de `references/` preservan la evidencia para el Ejecutor.
- Reglas visibles ya comprobadas en el cliente: Assassinate requiere 3 monedas; Coup requiere 7; con 10 o más monedas solo Coup está permitido. Declarar una influencia no requiere tenerla.
- Base detectada desde el remoto: `origin/master`, commit `c0119cb70995974f6c5f5e71c19af8bba5f94011`. Target: `master`.

La dependencia queda satisfecha cuando el Orquestador verifica la integración de #14 y la liberación explícita por #19 del renderer, los textos y estilos que esta unidad necesite. Si el renderer final no conserva una fila equivalente o cambia el origen de su elegibilidad, el Orquestador actualiza el alcance antes de habilitar F2. No se debe resolver una colisión integrando ramas ajenas o editando los mismos componentes en paralelo.

## Criterios de aceptación

1. Nombre, descripción, distintivos, precio y espacio interior de una acción disponible pertenecen a un solo control de fila; clic, teclado y toque producen la misma acción una vez.
2. El estado normal conserva el pergamino y el layout. Hover y foco resaltan toda la fila con fondo ámbar semitransparente, contorno cálido redondeado y transición breve, sin desplazar filas.
3. Una acción prohibida no activa selección de objetivo, no descuenta monedas y no emite la acción. Su contenido sigue legible y la explicación aparece al apuntar o enfocar; en pantallas táctiles el motivo se puede leer sin hover.
4. Se explican las condiciones vigentes: menos de 3 monedas para Assassinate, menos de 7 para Coup y Coup obligatorio a partir de 10 monedas. Se revisan los límites de saldo 2/3, 6/7 y 9/10. Las otras acciones no ganan restricciones nuevas.
5. Se preservan las declaraciones que pueden ser farol, el orden y el flujo de confirmación/cancelación, el cobro existente y el protocolo Socket.IO.
6. Las ayudas nuevas usan el mecanismo de idioma integrado y entradas paralelas `es`/`en`, con parámetros iguales. Los botones tienen nombre y explicación accesibles; foco visible, Enter/Espacio y Escape funcionan.
7. En escritorio y móvil se ven normal, hover/foco y deshabilitada. El hint no queda recortado por el scroll del panel ni tapa la selección de objetivos o las respuestas.
8. Se respeta `prefers-reduced-motion`. El build y un recorrido manual quedan documentados. El Verifier independiente intenta refutar la elegibilidad, la activación de filas y la lectura de los hints. No se agregan tests automatizados.

## Alcance y fuera de alcance

**Incluye:** renderer final de las acciones del turno, estilos necesarios, hints y su contenido bilingüe, y evidencia visual/funcional de escritorio y móvil.

**Excluye:** reglas o validación server-side, cambios de payload/socket, protocolo de cobro, rediseño del tablero, cambio de renderer sin reorquestación, controles de respuesta de #21, dependencias nuevas de animación y tests automatizados.

## Fases

### F1 — Resolver el renderer y liberar superficies (`BLOCKED`)

**Pregunta:** ¿qué componente integrado posee las filas y la disponibilidad de acciones, y están libres sus textos y estilos para esta unidad?

**Entrada:** #14/PR #23, #19/PR #22, código ya integrado en `origin/master` y contratos actuales.

**Salida:** nota que confirme componente/handlers/estado final, ubicación de elegibilidad, API de traducción y liberación de cada archivo solapado. No modificar código de producto ni copiar trabajo desde otros worktrees.

**Avanzar:** #14 está integrada o el renderer final está acordado por el Orquestador, y #19 libera los textos/archivos requeridos; se comprueba que siguen aplicando los criterios de este plan.
**Pivotar:** el renderer final tiene acciones genéricas sin filas o un contrato de disponibilidad distinto; el Orquestador actualiza objetivo y criterios antes de F2.
**Repetir:** una lectura dirigida si la liberación de archivos o API no queda explícita.
**Bloquear/cancelar:** #14/#19 conservan la reserva, las ramas siguen cambiando el renderer o no hay acuerdo sobre la superficie. Mantener `WAITING_ORCHESTRATOR`.
**Artefactos:** reporte F1 y actualización del issue, handoff y plan.
**Commit:** `COMMIT_REQUIRED`; `docs(action-rows): issue 24 F1 renderer released`.
**Validación:** volver a leer estado remoto, diff integrado y lista de archivos reservados; `git diff --check`.

### F2 — Implementar y documentar la fila interactiva (`PENDING`)

**Pregunta:** ¿el renderer final comunica de forma inequívoca dónde activar una acción y por qué una acción no está disponible?

**Entrada:** F1 `CLOSED`, renderer/base sincronizados y archivos liberados.

**Subtareas:** hacer clicable la fila entera con semántica accesible y una única activación; conservar el flujo de objetivo/confirmación; unificar el cálculo de disponibilidad y su explicación con los datos existentes; diseñar normal/hover/foco/deshabilitada; mostrar hints fuera del área de recorte cuando sea necesario y texto persistente en táctil; integrar traducciones `es`/`en`; documentar capturas y recorrido.

**Áreas previstas:** el componente que F1 confirme, estilos del panel y diccionario del cliente. No editar servidor ni protocolo.

**Avanzar:** criterios AC1–AC7 se observan en los límites monetarios, escritorio/móvil y teclado/tacto; build y evidencia manual quedan registrados.
**Pivotar:** si el renderer no soporta controles de fila o hint accesible sin cambio de arquitectura, regresar al Orquestador con evidencia.
**Repetir:** una corrección localizada por criterio con fallo reproducible.
**Bloquear/cancelar:** vuelve a reservarse un archivo compartido o aparece una necesidad de cambiar reglas/protocolo.
**Commit:** `COMMIT_REQUIRED`; `feat(action-rows): issue 24 F2 accessible action states`.
**Validación:** build de `coup-client`, recorrido manual de mouse/teclado/tacto y saldos 2, 3, 6, 7, 9 y 10; revisión de `es`/`en` y `git diff --check`. No añadir tests.

### F3 — Verificación independiente y entrega (`PENDING`)

**Pregunta:** ¿puede refutarse que la fila comunica el mismo estado que ejecuta y que ninguna acción deshabilitada se envía?

**Entrada:** F2 `CLOSED`, diff y evidencia vigentes.

**Salida:** informe FINAL independiente, capturas de los estados y entrega del branch/PR canónico al Orquestador.

**Prueba adversarial:** intentar activar una fila deshabilitada desde nombre, descripción, precio, foco y clic rápido; comprobar que no inicia objetivo, no cambia el saldo ni produce Socket.IO. Buscar recortes del tooltip en primera/última fila, diferencias de idioma y pérdida de foco al cambiar turno.

**Avanzar:** criterios pasan y Verifier `PASS`; dejar unidad en `WAITING_ORCHESTRATOR` para revisión de una única PR.
**Pivotar:** devolver a F2 solo el criterio refutado con reproducción.
**Repetir:** una verificación focalizada tras una corrección y commit nuevos.
**Bloquear/cancelar:** dependencia reabierta, build no reproducible o queda un fallo de criterio.
**Commit:** `COMMIT_REQUIRED`; `docs(action-rows): issue 24 F3 CLOSED ready_for_review`.
**Validación:** revisión independiente `FINAL`, build y recorrido manual documentados. El Ejecutor no integra ni cierra la unidad.

## Trazabilidad y topología

Issue #24 es la fuente de estado. Esta bitácora es append-only. Toda la unidad usa `issue/24-turn-action-row-clarity` y `.worktrees/issue-24-turn-action-row-clarity`; target `master` del fork; una sola PR al completar F1–F3. No hay PR abierta ni trabajo de producto para #24. Las fases F2/F3 no se activan hasta que F1 resuelva la dependencia.

## Decisiones

- 2026-09-27: issue separado de #6 porque #6/PR #11 están cerrados; #21 trata respuestas y excluye acciones principales.
- 2026-09-27: mantener #24 en `WAITING_ORCHESTRATOR` hasta liberar el renderer por #14 y los textos por #19.
- 2026-09-27: `LIGHT / MEDIUM / FINAL`; la implementación es localizada y reversible, pero la disponibilidad de acciones requiere verificación independiente.
