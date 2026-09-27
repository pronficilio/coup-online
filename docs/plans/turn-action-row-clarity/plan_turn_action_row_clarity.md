# Plan: hacer claras las acciones del turno — issue #24

**Estado:** `ACTIVE`; F1 `CLOSED / PASS`; F2 `ACTIVE`. El Alquimista reclamó #24 y confirmó el aislamiento canónico para ejecutar F2.
**Issue:** https://github.com/pronficilio/coup-online/issues/24
**Handoff activo:** `docs/plans/active/issue_24_turn_action_row_clarity.md`
**Bitácora:** `docs/plans/log/issue-24.jsonl`
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
**Rama / worktree / integración única:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity` / una PR a `master` de `pronficilio/coup-online`.
**Siguiente dueño:** Alquimista para F2; Verifier independiente para F3.

## Solicitud y definición de éxito

La persona usuaria quiere que las acciones disponibles durante su turno indiquen claramente dónde hacer clic, que el hover tenga un resalte cálido y opaco en toda la fila, y que las acciones prohibidas expliquen por qué están deshabilitadas. Las referencias visuales son `references/a_normal.png`, `references/a_hover.png` y `references/a_dis.png`, copiadas sin cambios desde `fotos/`.

Éxito significa que toda acción aparece en su propia fila con estados visuales reconocibles; las elecciones activables vienen del servidor; las prohibidas explican su motivo; y elegir o cancelar un destino no envía una decisión antes de tiempo. Al elegir, se envía una sola opción con el `choiceId` entregado por el servidor.

## Hechos, fuentes y dependencias

- El issue #6 está `CLOSED` y la PR #11 integrada. Su panel muestra hoy siete acciones y calcula deshabilitación por saldo insuficiente para Coup/Assassinate y por Coup obligatorio con 10+ monedas.
- El issue #21 sigue abierto, pero su contrato se limita a controles gráficos de respuesta (`Block`, `Challenge`, `Pass`) y excluye explícitamente las acciones principales.
- El issue #14 se cerró tras integrar la PR #23. `Coup.js` ahora monta un renderer genérico para `decision.options`; el viejo `ActionDecision.js` conserva markup y estilos, pero ya no se importa desde `Coup.js`.
- El issue #19 sigue abierto tras integrar parcialmente su PR #22 en `5de95ee`. La localización publicada ya incluye las etiquetas y descripciones de las siete acciones y las claves `es`/`en` necesarias. Sus tareas restantes requieren recorrido manual y Verifier, sin otra PR de producto abierta que reserve el renderer de #24.
- El servidor genera los `choiceId` permitidos para cada decisión. En `actionChoices`, Coup con 10+ monedas es la única opción; por debajo se agrega Coup a partir de 7 monedas y Assassinate a partir de 3. Las opciones con objetivo combinan acción y asiento (por ejemplo `coup:<seat>`). El cliente debe enviar esos IDs exactos; el servidor conserva la autoridad de elegibilidad.
- `g-decision` expone solo opciones legales. `Coup.js` las presenta como botones y localiza la etiqueta desde `choiceId`. El saldo del snapshot público permite explicar por qué falta una acción costosa.
- Las referencias visuales estaban en `fotos/`, fuera del historial versionado. Las tres copias de `references/` preservan la evidencia para el Ejecutor.
- Reglas visibles ya comprobadas en el cliente: Assassinate requiere 3 monedas; Coup requiere 7; con 10 o más monedas solo Coup está permitido. Declarar una influencia no requiere tenerla.
- Base rebaseada desde el remoto: `origin/master`, commit `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. Target: `master`.

La revisión F1 confirmó que el renderer y los textos requeridos ya están publicados. #19 permanece abierto por validación manual y Verifier, pero no tiene cambios de producto pendientes que bloqueen #24. El feedback de esos recorridos puede incorporarse a la revisión final de #24.

## Criterios de aceptación

1. Nombre, descripción, distintivos, precio y espacio interior de una acción disponible pertenecen a un solo control de fila; clic, teclado y toque producen la misma acción una vez.
2. El estado normal conserva el pergamino y el layout. Hover y foco resaltan toda la fila con fondo ámbar semitransparente, contorno cálido redondeado y transición breve, sin desplazar filas.
3. Una acción prohibida no activa selección de objetivo, no descuenta monedas y no emite la acción. Su contenido sigue legible y la explicación aparece al apuntar o enfocar; en pantallas táctiles el motivo se puede leer sin hover.
4. Se explican las condiciones vigentes: menos de 3 monedas para Assassinate, menos de 7 para Coup y Coup obligatorio a partir de 10 monedas. Se revisan los límites de saldo 2/3, 6/7 y 9/10. Las otras acciones no ganan restricciones nuevas.
5. Se preservan las declaraciones que pueden ser farol, el flujo de objetivos y cancelación, el cobro del servidor y el protocolo Socket.IO. Coup, Assassinate y Steal abren sus destinos legales; Cancelar regresa al menú sin emitir una decisión; elegir un destino envía una vez su `choiceId` original. Las acciones sin destino envían su opción legal al seleccionarse.
6. Las ayudas nuevas usan el mecanismo de idioma integrado y entradas paralelas `es`/`en`, con parámetros iguales. Los botones tienen nombre y explicación accesibles; foco visible, Enter/Espacio y Escape funcionan.
7. En escritorio y móvil se ven normal, hover/foco y deshabilitada. El hint no queda recortado por el scroll del panel ni tapa la selección de objetivos o las respuestas.
8. Se respeta `prefers-reduced-motion`. El build y un recorrido manual quedan documentados. El Verifier independiente intenta refutar la elegibilidad, la activación de filas y la lectura de los hints. No se agregan tests automatizados.

## Alcance y fuera de alcance

**Incluye:** la rama `decision.type === 'action'` del renderer genérico de `Coup.js`, estilos de esa vista, metadatos localizados existentes, hints nuevos bilingües y evidencia visual/funcional de escritorio y móvil.

**Excluye:** reglas o validación server-side, agregar opciones prohibidas al payload, cambios al shape/nombre de eventos Socket.IO, cambios al motor de cobro, rediseño del tablero, controles de respuesta de #21, dependencias nuevas de animación y tests automatizados.

## Fases

### F1 — Verificar el renderer y las dependencias (`CLOSED / PASS`)

**Pregunta:** ¿qué componente integrado posee las filas y la disponibilidad de acciones, y están libres sus textos y estilos para esta unidad?

**Entrada:** #14/PR #23, #19/PR #22, código ya integrado en `origin/master` y contratos actuales.

**Salida:** reporte `docs/plans/turn-action-row-clarity/report_issue_24_F1.md` que confirma `Coup.js` como dueño del renderer genérico, `decision.options` como opciones legales, `choiceId` de acción/destino, saldo disponible y claves bilingües existentes. `ActionDecision.js` no está montado.

**Veredicto:** `CLOSED / PASS`. #14 se cerró tras integrar PR #23; #19 integró parcialmente PR #22 en `origin/master@5de95ee`. El renderer genérico y la localización de acciones ya están en la base. La inspección de `Coup.js`, `server/game/coup.js` y el diccionario confirma que F2 puede trabajar sin modificar reglas o payloads.
**Falsificación intentada:** buscar el import/montaje de `ActionDecision` y rastrear origen de opciones, saldo y etiquetas. El componente viejo no se monta; `Coup.js` dibuja `decision.options`, el servidor genera `choiceId` legales y el cliente localiza esas etiquetas.
**Artefactos:** reporte F1, actualización de este plan, issue y handoff.
**Commit:** `COMMIT_REQUIRED`; `docs(action-rows): issue 24 F1 generic renderer confirmed`.
**Validación:** releer issues/PRs, inspeccionar código integrado y `git diff --check`.

### F2 — Implementar y documentar la fila interactiva (`ACTIVE`)

**Pregunta:** ¿el renderer final comunica de forma inequívoca dónde activar una acción y por qué una acción no está disponible?

**Entrada:** F1 `CLOSED / PASS`; branch rebaseado sobre `origin/master@5de95ee`; PR #23/#22 releídas.

**Subtareas:** bifurcar solo `decision.type === 'action'` hacia el menú de acciones; agrupar opciones legales por prefijo de `choiceId` para no duplicar filas por destino; usar `decision.options` como única fuente de acciones activables; al elegir Coup, Assassinate o Steal, mostrar los destinos legales y Cancelar; al elegir destino, enviar una vez la opción original; las acciones sin destino envían su opción legal al seleccionarse; mostrar como deshabilitadas las acciones omitidas por saldo o Coup obligatorio, sin inventarles `choiceId`; no emitir decisiones al enfocar, abrir destinos o cancelar; aplicar estados visuales, descripciones/personajes/precios localizados y hints accesibles; documentar capturas y recorrido.

**Áreas previstas:** `coup-client/src/components/game/Coup.js`, estilos del renderer y `coup-client/src/i18n/translations.json` solo si hacen falta claves espejo nuevas. No revivir `ActionDecision.js` ni editar servidor/protocolo.

**Avanzar:** criterios AC1–AC8 se observan en los límites monetarios y en escritorio/móvil con teclado/tacto; solo se emiten `choiceId` originales del servidor; build y evidencia manual quedan registrados.
**Pivotar:** si el renderer no soporta controles de fila o hint accesible sin cambio de arquitectura, regresar al Orquestador con evidencia.
**Repetir:** una corrección localizada por criterio con fallo reproducible.
**Bloquear/cancelar:** vuelve a reservarse un archivo compartido o aparece una necesidad de cambiar reglas/protocolo.
**Commit:** `COMMIT_REQUIRED`; `feat(action-rows): issue 24 F2 accessible action states`.
**Validación:** build de `coup-client`, recorrido manual de mouse/teclado/tacto y saldos 2, 3, 6, 7, 9 y 10; objetivo/cancelación con IDs originales, revisión de `es`/`en` y `git diff --check`. No añadir tests.

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

Issue #24 es la fuente de estado. Esta bitácora es append-only. Toda la unidad usa `issue/24-turn-action-row-clarity` y `.worktrees/issue-24-turn-action-row-clarity`; target `master` del fork; una sola PR al completar F1–F3. La rama fue rebaseada sobre `origin/master@5de95ee`; su único delta es el plan, handoff, referencias y reportes de esta unidad.

## Decisiones

- 2026-09-27: issue separado de #6 porque #6/PR #11 están cerrados; #21 trata respuestas y excluye acciones principales.
- 2026-09-27: por instrucción explícita del usuario, rebasear #24; PR #23 está integrada y PR #22 publicó el renderer y las cadenas necesarias para F2. #19 continúa abierta solo por sus verificaciones manuales/Verifier.
- 2026-09-27: adaptar F2 al renderer genérico y agrupar `choiceId` por acción/destino. La interfaz no amplía las opciones legales del servidor.
- 2026-09-27: clasificar `FULL / MEDIUM / FINAL` por la adaptación investigada al renderer nuevo, el selector de destino y la revisión independiente de elegibilidad.
- 2026-09-27: el Alquimista reclamó la issue en el fork y confirmó branch/worktree limpios; F2 comienza sobre `Coup.js`.
