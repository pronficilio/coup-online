# Plan: pausa visible y reanudación clara

- **Issue:** [#26 — Hacer visible la pausa de partida y guiar la reanudación](https://github.com/pronficilio/coup-online/issues/26)
- **Estado:** `WAITING_ORCHESTRATOR`; F1 revalidada `CLOSED`; F2 corregida `CLOSED`; F3 manual `BLOCKED`, Verifier `FINAL` nuevo solicitado.
- **Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL` (cambio de autorización server-side).
- **Branch / worktree:** `issue/26-paused-game-overlay` / `.worktrees/issue-26-paused-game-overlay`.
- **Merge target:** `master` de `pronficilio/coup-online`; una PR al cerrar la unidad.
- **Handoff:** `docs/plans/active/issue_26_paused_game_overlay.md`.
- **Bitácora append-only:** `docs/plans/log/issue-26.jsonl`.

## Solicitud reescrita

Cuando vence una decisión por falta de respuesta, cubrir la vista de cada jugador con una capa oscura translúcida, explicar que la partida está pausada y exponer una acción de reanudación clara solo cuando el servidor autorice esa pausa y a esa persona.

## Objetivo y definición de éxito

Cuando vence una decisión, únicamente los asientos humanos que no respondieron pueden reanudarla. El overlay y su CTA se muestran solo a esos asientos; cada otro jugador ve un aviso de espera no modal y no recibe overlay. El servidor deriva los responsables del estado de la decisión, nunca de datos enviados por el cliente. Las pausas sin responsable humano (incluidas las de Codex) y las demás causas no recuperables muestran guía a todos sin CTA.

## Hechos, inferencias y desconocidos

### Hechos confirmados

- La base original de #26 fue `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. PR #27 de #25 avanzó `origin/master` a `c601410952184c85f552ee5cbb73ef6fe52519ff`; luego `1ff478c308478af3be61131daa1bd88652bdc77f` cerró #25 y sincronizó sus documentos. El branch se rebasó limpiamente sobre ambas actualizaciones; el diff #25 quedó preservado y ya no aparece como cambio local de #26.
- En la base, el timeout llamaba `pause(..., { recoverable: true })`, y `g-resume` autorizaba al líder. Esa regla ha sido reemplazada para #26 por la aclaración explícita del usuario.
- `openDecision()` guarda `allowed` y `responses`; los responsables humanos de un timeout se calculan como `allowed - responses`, con las claves resueltas a asientos desde estado servidor. Quien ya respondió nunca recibe permiso.
- La base no ofrece reconexión/reasignación de asiento después de iniciar: `lobby.js` rechaza nuevas conexiones. Una desconexión invalida la pausa y exige recrear la partida. El propietario se guarda por número de asiento, no por socket ID, de modo que cualquier reasignación confiable futura conservará el asiento autorizado; no se aceptan IDs de asiento/socket del cliente.
- En la base, la pausa se presentaba en `Coup.js` sin cubrir el tablero. La revisión previa mostró CTA del líder; el nuevo cliente solo muestra overlay/CTA si el payload privado del servidor lo marca responsable.
- La issue #19 sigue abierta por su propio recorrido/Verifier. PR #27 de #25 (`c601410`) solo añadió cambios de portada/favicon y sus documentos; `translations.json` recibió una modificación menor de #25, preservada en el rebase. La corrección de #26 se inspeccionó sobre esta base actualizada.

### Diagnóstico e inferencia

El análisis histórico encontró una ruta de reanudación para el líder; la aclaración actual cambia quién puede usarla y también exige emisiones por receptor. La causa concreta de una sesión reportada puede variar: timeout humano pendiente, timeout solo Codex, desconexión u otro error; el servidor debe distinguirlos sin atribuir culpabilidad por conveniencia.

### Aclaración vigente del usuario

Esta regla de issue #26 prevalece sobre la política anterior basada en líder incluida en el body inicial de #26 y en los reportes F1/F2 previos. El servidor calcula los asientos pendientes usando `allowed - responses`, filtra a controladores humanos y guarda `resumeOwnerSeats`. Solo esos asientos pueden reanudar. El líder no recibe excepción. No se envían identidades responsables al cliente ni se confía en una identidad proporcionada por este.

Si queda pendiente únicamente un actor Codex, no existe responsable humano: el servidor no guarda decisión reanudable y muestra la pausa no recuperable a todos. Si se desconecta alguien o surge otra causa no recuperable, no se inventa responsable ni CTA.

## Alcance

- Auditar las causas de pausa y el permiso vigente antes de implementar.
- Añadir una capa de pausa de pantalla completa y su presentación accesible/responsiva en el cliente.
- Incorporar las nuevas cadenas al diccionario bilingüe integrado por #19. Confirmar con el Orquestador que no haya comenzado una corrección concurrente antes de editar `Coup.js`/`translations.json`.
- Cambiar servidor para derivar dueños por asiento no respondido y autorizar `g-resume` contra el asiento que controla el socket actual. Ninguna identidad del cliente determina ownership.

## Fuera de alcance

- Permitir a cualquier asiento reanudar; solo los asientos humanos aún pendientes pueden hacerlo.
- Reanudar pausas que el servidor considera no recuperables.
- Desplegar el cambio.

## Fases

### F1 — Clasificar pausa y permisos (`CLOSED`, revalidada)

- **Pregunta única:** ¿el timeout identifica solo a los humanos pendientes como responsables y qué ocurre cuando no hay responsable humano?
- **Entrada:** base vigente `1ff478c308478af3be61131daa1bd88652bdc77f`; código integrado de `server/game/coup.js`; cliente; issue #26 y sus comentarios de aclaración/sincronización.
- **Salida:** matriz actualizada de emisores, responsables por asiento, estado visible por receptor y comportamiento de pausas no recuperables.
- **Criterio de avance:** timeout con humanos pendientes conserva la decisión y autoriza exclusivamente a esos asientos; actor Codex pendiente sin humanos no crea responsable; disconnect/error no ofrece reanudación.
- **Pivote:** una causa no puede traducirse o recuperarse sin cambiar reglas/protocolo; elevar la decisión al Orquestador.
- **Repetición acotada:** una segunda lectura del caso concreto si quedan rutas de pausa sin clasificar.
- **Bloqueo/cancelación:** bloquear si la base cambió durante la auditoría o el contrato de #14 no coincide con el código integrado; cancelar solo por decisión del usuario.
- **Artefactos:** `docs/plans/paused-game-overlay/report_issue_26_F1.md` (hallazgo previo histórico) y `report_issue_26_F1_recheck.md` (criterio actual). Los resultados anteriores que autorizaban al líder quedan obsoletos.
- **Commit:** `COMMIT_REQUIRED`; `docs(game): issue 26 F1 rechecked timeout owners`.
- **Validación:** inspección estática de todos los emisores y del handler `g-resume`; no ejecutar tests.

### F2 — Mostrar overlay y acción autorizada (`CLOSED`, corregida)

- **Pregunta única:** ¿solo el responsable recibe overlay/CTA y todos los demás quedan informados sin overlay?
- **Entrada:** F1 revalidada; `origin/master` actualizado a `1ff478c308478af3be61131daa1bd88652bdc77f`; comprobar que no haya corrección concurrente en Coup.js/estados de pausa.
- **Salida:** capa fija semitransparente que cubre el área de juego, bloquea controles inferiores y muestra copy accesible en español.
- **Copy:** responsable: «Tu respuesta quedó pendiente. Puedes volver a abrir la decisión para continuar.»; otros: aviso accesible no modal indicando espera de personas con respuestas pendientes; pausa no recuperable: explicar que no admite reanudación y omitir CTA.
- **Criterio de avance:** solo responsable obtiene overlay/CTA; resto no recibe overlay y queda en espera accesible; el servidor rechaza líder/responsable no pendiente/spectator y payload con identidad; el CTA evita duplicados; `g-gameResumed` despeja overlay/espera; la pérdida de recuperabilidad muestra overlay sin CTA a todos.
- **Pivote:** si el servidor rechaza el caso normal de timeout o el copy exige otro contrato, detenerse y reorquestar.
- **Repetición acotada:** una corrección de estado/foco por defecto reproducible.
- **Bloqueo/cancelación:** bloquear si #19 inicia correcciones simultáneas en las superficies afectadas; no editar en paralelo. Cancelar solo por decisión del usuario.
- **Artefactos:** corrección de autorización/entrega personalizada de pausa, overlay, aviso de espera, claves bilingües, reporte F2 revalidado y solicitud de Verifier nuevo.
- **Commit:** `COMMIT_REQUIRED`; `fix(game): resume timed-out decisions by pending seat`.
- **Validación:** `npm run build` exit 0 con avisos conocidos; revisión estática de ownership/resume; i18n 313/313 claves y placeholders; `git diff --check` exit 0. No se agregaron ni ejecutaron tests automatizados.

### F3 — Revisar pausa y reanudación (`BLOCKED` para walkthrough)

- **Pregunta única:** ¿el overlay orienta a cada participante sin sugerir acciones rechazadas ni ocultar un fallo real de reanudación?
- **Entrada:** F1 y F2 cerradas; nuevo Verifier FINAL solicitado sobre HEAD actualizado.
- **Salida:** recorrido manual en escritorio, móvil y teclado, más revisión independiente FINAL.
- **Criterio de cierre:** validar responsable, líder no responsable, respondedor previo, varios actores pendientes, timeout con Codex solamente, payload falsificado/no vacío, desconexión, `g-gameResumed`, teclado/foco y espera sin overlay. Registrar build, evidencia visual/manual y Verifier FINAL independiente en el commit nuevo.
- **Pivote:** cualquier CTA no autorizado, decisión antigua aplicada o ventana sin recuperación debe regresar a la fase propietaria.
- **Repetición acotada:** una ronda de corrección y revisión por hallazgo material.
- **Bloqueo/cancelación:** no se puede hacer recorrido visual aquí por falta de navegador. El F3 anterior corresponde solo a `6621255` y a criterio líder; es histórico/obsoleto. Verifier FINAL independiente solicitado sobre el nuevo HEAD; no declarar PASS global sin recorrido visual.
- **Artefactos:** conservar `report_issue_26_F3.md` sin alterarlo como reporte histórico y añadir resultado de la nueva revisión cuando llegue.
- **Commit:** `COMMIT_REQUIRED`; `docs(game-ui): issue 26 F3 READY_FOR_REVIEW`.
- **Validación:** build, inspección manual y Verifier independiente. No ejecutar tests automatizados.

## Riesgos y pregunta de falsificación

- **Riesgo HIGH:** el cambio modifica autorización server-side y emisiones personalizadas; el servidor sigue siendo autoridad, deriva `allowed - responses`, guarda asientos responsables y exige socket→asiento verificado en el momento de reanudar.
- **Dependencia de idioma:** las cadenas pasan por #19 para evitar texto español fuera del diccionario bilingüe.
- **Pregunta adversarial:** ¿un líder/respondedor/tercero puede reanudar un timeout, un responsable pierde permiso si cambia la conexión pero conserva asiento confiable, aparece CTA si solo falta Codex o cualquier no responsable recibe el overlay?

## Reclamo, aislamiento e integración

Antes de crear branch/worktree, el Ejecutor relee la issue #26 en `pronficilio/coup-online`, registra claim visible y confirma que no existe uno incompatible. Después crea un único branch y worktree desde `origin/master` actualizado. El control local de esta unidad está preparado en `docs/plans/`; copiar selectivamente plan, handoff y bitácora a ese worktree, sin copiar ni limpiar otros cambios del checkout raíz. Toda implementación ocurre en ese worktree y termina en una sola PR hacia `master` del fork.

Branch/worktree de #26 son canónicos y están aislados; no hay PR abierta ni despliegue. Orquestador asigna el Verifier FINAL nuevo y consigue navegador para el recorrido manual pendiente.
