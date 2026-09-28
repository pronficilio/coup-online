# Plan — Mantener resaltada la respuesta elegida mientras esperan los demás (#45)

**Estado:** `WAITING_ORCHESTRATOR`; F1 `BLOCKED` solo por walkthrough manual pendiente tras un reintento autorizado; issue `OPEN`.
**Issue:** https://github.com/pronficilio/coup-online/issues/45
**Handoff:** `docs/plans/active/issue_45_submitted_response_highlight.md`
**Bitácora:** `docs/plans/log/issue-45.jsonl` (append-only).
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
**Branch / worktree:** `issue/45-persist-submitted-response-highlight` / `.worktrees/issue-45-persist-submitted-response-highlight`.
**Base / destino:** `origin/master` vigente al reclamar / `master` de `pronficilio/coup-online`.
**Integración:** una PR asociada a #45.

## Solicitud y definición de éxito

Cuando el jugador local elige una respuesta gráfica, mantener la variante visual elegida aunque el botón quede deshabilitado y el puntero salga de él, hasta que el servidor cierre o reemplace esa decisión. Las otras opciones siguen inactivas y bloqueadas; la selección no se arrastra a otra ventana.

## Alcance

Persistir la opción elegida por el cliente durante la espera compartida; aplicar el estado activo al botón gráfico correspondiente aunque esté deshabilitado; limpiar o actualizar el estado al cambiar/cerrar la decisión. Conservar opciones autorizadas por servidor, envío de `choiceId`, elegibilidad, accesibilidad y entrada por mouse/teclado/touch.

Fuera de alcance: reglas o protocolo del juego, assets gráficos, rail de acciones, layout #44 y señalización del tablero #43.

## F1 — Persistencia visual de la opción enviada (`BLOCKED`)

**Estado actual:** implementación localizada en `ResponseImageButton.js`; queda bloqueada únicamente la validación manual de una partida con otro participante. El worktree propio parte del `origin/master` vigente (`f900c09`). No se pudo verificar el diff anunciado por #43 (su branch/worktree aún no aparecen), así que el cambio se restringió al componente que posee las imágenes y al contrato `disabled` ya provisto por el padre; no se tocaron `Coup.js`, `PlayerBoard.js` ni estilos compartidos. La inspección estática confirmó que `disabled` pasa a `true` al enviar, vuelve a `false` en rechazo o nueva decisión, y el componente se desmonta al cerrar la decisión/pausar. El bloqueo de topología anterior queda supersedido para esta edición estrictamente localizada; sigue siendo necesario evitar ampliar el alcance sin revisar #43. Tras la autorización del Orquestador para reintentar el walkthrough local, el sandbox no pudo conectar por loopback y no encontró navegador; la inspección externa del Orquestador vio `127.0.0.1:8000` en escucha, sin PID visible. No hubo evidencia dinámica y F1 continúa `BLOCKED`; no se modifican criterios.

**Pregunta única:** ¿el cliente puede conservar el resaltado de la respuesta enviada sin activar otras opciones ni retener selección obsoleta?

- Reclamar #45 en el tracker y verificar el reclamo; confirmar branch/worktree únicos y sincronizar desde `origin/master` antes de editar.
- Releer #43 y #44 y comprobar su estado y diffs para evitar editar simultáneamente el renderer/componente de respuestas. Mantener el alcance aislado a la selección visual post-envío.
- Guardar de forma transitoria la opción local enviada y aplicar la presentación `-active` a esa opción aunque su botón esté `disabled`; no inferir una selección de la posición del puntero.
- Limpiar la selección al cerrar o cambiar la decisión. Confirmar que errores/reintentos respeten el estado real de envío.
- **Salida:** cambio acotado y `report_issue_45_F1.md` con el ciclo observado y validación; el walkthrough manual sigue pendiente.
- **Avanzar:** la opción elegida permanece resaltada mientras se espera; las demás no se resaltan ni se pueden accionar; una decisión nueva no hereda la elección anterior.
- **Pivotar:** si el servidor confirma/reemplaza opciones de otra forma, adaptar la limpieza al evento/identidad de decisión vigentes sin cambiar el contrato.
- **Repetir:** una corrección focalizada para cualquier estado visual que no coincida con la respuesta enviada.
- **Bloquear:** conflicto activo en componente compartido con #43/#44 o imposibilidad de verificar la ventana de espera; registrar condición y evidencia.
- **Commit:** `COMMIT_REQUIRED`; `feat(response-highlight): issue 45 F1 CLOSED ready_review`.
- **Validación:** build del cliente, recorrido manual de una respuesta propia seguida de respuesta de otro jugador y `git diff --check`. No agregar ni ejecutar pruebas automatizadas.

## Falsificación

¿Puede una respuesta enviada perder el aspecto activo antes del cierre de la ventana, una opción no elegida aparecer resaltada, o una selección anterior sobrevivir a una decisión nueva?

## Topología y siguiente dueño

Una sola unidad: #45 → `issue/45-persist-submitted-response-highlight` → `.worktrees/issue-45-persist-submitted-response-highlight` → una PR a `master` del fork. Antes de reclamar, verificar el estado remoto de #43/#44 y cualquier trabajo activo sobre el renderer; no editar su branch/worktree ni trabajar en el checkout base.

**Siguiente dueño:** Orquestador, coordinar el walkthrough manual en una partida compartida y mantener #45 separada de cualquier cambio de `Coup.js`. Estado remoto: `OPEN`, asignada a `pronficilio`; unidad `WAITING_ORCHESTRATOR` mientras F1 espera esa evidencia.
