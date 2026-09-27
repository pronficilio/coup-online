# Plan: pausa visible y reanudación clara

- **Issue:** [#26 — Hacer visible la pausa de partida y guiar la reanudación](https://github.com/pronficilio/coup-online/issues/26)
- **Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED`; F2 `CLOSED`; F3 `BLOCKED`.
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Branch / worktree:** `issue/26-paused-game-overlay` / `.worktrees/issue-26-paused-game-overlay`.
- **Merge target:** `master` de `pronficilio/coup-online`; una PR al cerrar la unidad.
- **Handoff:** `docs/plans/active/issue_26_paused_game_overlay.md`.
- **Bitácora append-only:** `docs/plans/log/issue-26.jsonl`.

## Solicitud reescrita

Cuando vence una decisión por falta de respuesta, cubrir la vista de cada jugador con una capa oscura translúcida, explicar que la partida está pausada y exponer una acción de reanudación clara solo cuando el servidor autorice esa pausa y a esa persona.

## Objetivo y definición de éxito

Todas las personas conectadas reconocen inmediatamente la pausa. En un timeout recuperable, quien creó la sala puede volver a solicitar la misma decisión; el resto sabe quién debe actuar. Las pausas no recuperables no ofrecen una acción que el servidor rechazará.

## Hechos, inferencias y desconocidos

### Hechos confirmados

- `origin/master` fue actualizado para este trabajo y apunta a `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`, merge del PR #22 de #19. El worktree de #26 parte de ese commit; el checkout raíz permanece intacto.
- En `server/game/coup.js`, el temporizador de una decisión llama `pause(..., { recoverable: true })`. La pausa emite `g-gamePaused` con `canResume` derivado de una decisión recuperable.
- El mismo servidor acepta `g-resume` solo del socket líder, solo para una pausa recuperable y mientras cada asiento humano siga conectado. Al reanudar, crea una decisión con nueva identidad/versión.
- En `coup-client/src/components/game/Coup.js`, la pausa se presenta como texto dentro de `DecisionsSection`; `Resume game` solo se renderiza si `canResume && isLeader`. No hay una capa que cubra el tablero.
- La issue #19 sigue abierta porque falta su recorrido manual y Verifier FINAL. Su PR #22 ya integró `Coup.js` y `translations.json` en `master` mediante `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. En la revalidación posterior al claim, su worktree seguía limpio en `ca16e426`; no se observan cambios de producto pendientes. La dependencia de código quedó liberada. Si #19 reabre cambios en esas superficies, coordinar antes de editarlas.

### Diagnóstico e inferencia

Para el timeout normal, el servidor ya dispone de una ruta de reanudación para el líder. La falta de señalización a pantalla completa y la ausencia de CTA para el resto de la sala explican por qué la pausa puede parecer bloqueada. Todavía no está confirmado que la sesión reportada corresponda a ese camino recuperable: F1 debe clasificar todos los emisores de `g-gamePaused`.

### Decisión vigente

Conservar el contrato de #14: reanuda solo el líder y solo cuando `canResume` sea verdadero. No ampliar el permiso a cualquier participante ni cambiar reglas/protocolo sin reorquestación explícita.

## Alcance

- Auditar las causas de pausa y el permiso vigente antes de implementar.
- Añadir una capa de pausa de pantalla completa y su presentación accesible/responsiva en el cliente.
- Incorporar las nuevas cadenas al diccionario bilingüe integrado por #19. Confirmar con el Orquestador que no haya comenzado una corrección concurrente antes de editar `Coup.js`/`translations.json`.
- Cambiar servidor solo si F1 demuestra que una pausa causada por falta de respuesta queda incorrectamente marcada como no recuperable. Ese hallazgo devuelve el plan al Orquestador para reclasificar riesgo/verificación.

## Fuera de alcance

- Permitir a cualquier asiento reanudar, cambiar el liderazgo, ajustar timeouts o automatizar una acción/pase.
- Reanudar pausas que el servidor considera no recuperables.
- Desplegar el cambio.

## Fases

### F1 — Clasificar pausa y permisos (`CLOSED`)

- **Pregunta única:** ¿cada causa de `g-gamePaused` comunica de forma coherente si la partida puede reanudarse y quién puede hacerlo?
- **Entrada:** `origin/master` actualizado; contrato `docs/plans/codex-ai-players/f0_contract.md`; `server/game/coup.js`; `coup-client/src/components/game/Coup.js`; issue #19 y PR #22.
- **Salida:** matriz de llamadas a `pause()` con causa, `canResume`, identidad autorizada y estado visible actual; confirmación de si el caso reportado corresponde al timeout recuperable.
- **Criterio de avance:** cada ruta queda clasificada. Si el timeout de una decisión humana se marca no recuperable, detener cambios de interfaz y pedir reorquestación para corregir el contrato del servidor.
- **Pivote:** una causa no puede traducirse o recuperarse sin cambiar reglas/protocolo; elevar la decisión al Orquestador.
- **Repetición acotada:** una segunda lectura del caso concreto si quedan rutas de pausa sin clasificar.
- **Bloqueo/cancelación:** bloquear si la base cambió durante la auditoría o el contrato de #14 no coincide con el código integrado; cancelar solo por decisión del usuario.
- **Artefactos:** `docs/plans/paused-game-overlay/report_issue_26_F1.md` y actualización de este plan. Resultado: cada emisor está clasificado; el timeout ordinario conserva la decisión y permite reanudar solo al líder mientras todos sigan conectados. No se requiere cambio de servidor.
- **Commit:** `COMMIT_REQUIRED`; `docs(ui): issue 26 F1 CLOSED advance_f2`.
- **Validación:** inspección estática de todos los emisores y del handler `g-resume`; no ejecutar tests.

### F2 — Mostrar overlay y acción autorizada (`CLOSED`)

- **Pregunta única:** ¿todas las personas entienden que el juego está pausado y puede reanudarlo quien tiene permiso?
- **Entrada:** F1 cerrada; `origin/master` actualizado al menos a `5de95ee`; comprobar que #19 no abrió una corrección concurrente; decisión del Orquestador si F1 encontró un defecto de servidor.
- **Salida:** capa fija semitransparente que cubre el área de juego, bloquea controles inferiores y muestra copy accesible en español.
- **Copy inicial, sujeto al glosario de #19:** encabezado «Partida en pausa»; explicación de timeout «Se agotó el tiempo para responder»; CTA del líder «Reanudar partida»; mensaje para otros «Esperando a que el anfitrión reanude. Todos deben seguir conectados»; para una pausa no recuperable, explicar que no admite reanudación desde ese estado y omitir CTA.
- **Criterio de avance:** toda ventana recibe la capa; solo el líder con `canResume` ve el botón; el botón evita emisiones duplicadas mientras espera; la capa se cierra con `g-gameResumed`; errores permanecen visibles y no reactivan controles detrás del overlay.
- **Pivote:** si el servidor rechaza el caso normal de timeout o el copy exige otro contrato, detenerse y reorquestar.
- **Repetición acotada:** una corrección de estado/foco por defecto reproducible.
- **Bloqueo/cancelación:** bloquear si #19 inicia correcciones simultáneas en las superficies afectadas; no editar en paralelo. Cancelar solo por decisión del usuario.
- **Artefactos:** código del overlay, claves bilingües y reporte F2.
- **Commit:** `COMMIT_REQUIRED`; `feat(game-ui): issue 26 fullscreen pause overlay`.
- **Validación:** build del cliente, revisión estática de condiciones/estados, claves bilingües y `git diff --check` pasaron. El recorrido manual no estuvo disponible en este entorno y se conserva como requisito de F3; no agregar ni ejecutar tests automatizados.

### F3 — Revisar pausa y reanudación (`BLOCKED`)

- **Pregunta única:** ¿el overlay orienta a cada participante sin sugerir acciones rechazadas ni ocultar un fallo real de reanudación?
- **Entrada:** F1 y F2 cerradas.
- **Salida:** recorrido manual en escritorio, móvil y teclado, más revisión independiente FINAL.
- **Criterio de cierre:** revisar timeout recuperable visto por líder y no líder, desconexión durante la pausa, rechazo de `g-resume`, confirmación `g-gameResumed`, foco/lector de pantalla y ausencia de interacción con el tablero bajo el overlay. Registrar build, evidencia y resultado del Verifier.
- **Pivote:** cualquier CTA no autorizado, decisión antigua aplicada o ventana sin recuperación debe regresar a la fase propietaria.
- **Repetición acotada:** una ronda de corrección y revisión por hallazgo material.
- **Bloqueo/cancelación:** bloqueada: no hay navegador local ni herramienta de navegador expuesta; Verifier FINAL independiente sigue pendiente. Orquestador debe proveer/reclamar un entorno navegable y asignar Verifier. Cancelar solo por decisión del usuario.
- **Artefactos:** `docs/plans/paused-game-overlay/report_issue_26_F3.md` y evidencia visual/manual pertinente.
- **Commit:** `COMMIT_REQUIRED`; `docs(game-ui): issue 26 F3 READY_FOR_REVIEW`.
- **Validación:** build, inspección manual y Verifier independiente. No ejecutar tests automatizados.

## Riesgos y pregunta de falsificación

- **Riesgo MEDIUM:** la capa cubre controles de juego y el CTA inicia una decisión nueva; el servidor sigue siendo autoridad y conserva su verificación de líder, conectividad y recuperabilidad.
- **Dependencia de idioma:** las cadenas pasan por #19 para evitar texto español fuera del diccionario bilingüe.
- **Pregunta adversarial:** ¿alguna pausa por timeout se anuncia como no recuperable, presenta un CTA que el servidor rechazará o deja actuar los controles del tablero antes de `g-gameResumed`?

## Reclamo, aislamiento e integración

Antes de crear branch/worktree, el Ejecutor relee la issue #26 en `pronficilio/coup-online`, registra claim visible y confirma que no existe uno incompatible. Después crea un único branch y worktree desde `origin/master` actualizado. El control local de esta unidad está preparado en `docs/plans/`; copiar selectivamente plan, handoff y bitácora a ese worktree, sin copiar ni limpiar otros cambios del checkout raíz. Toda implementación ocurre en ese worktree y termina en una sola PR hacia `master` del fork.

No hay branch/worktree ni PR de #26 todavía. #19 sigue abierta por una validación manual/verificación independiente pendiente, pero PR #22 ya liberó en `master` las superficies requeridas por F2.
