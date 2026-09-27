# Handoff para Agente Alquimista — issue #19

- **Tracker:** https://github.com/pronficilio/coup-online/issues/19
- **Plan exacto:** `docs/plans/game-language/plan_game_language.md`
- **Bitácora exacta:** `docs/plans/log/issue-19.jsonl`
- **Estado de unidad:** `WAITING_ORCHESTRATOR`; F1 `CLOSED`; F2 `ACTIVE`; F3 `ACTIVE`; F4 `ACTIVE`, con corrección puntual tras un `FAIL` del Verifier y nueva revisión independiente pendiente. Issue abierta y asignada a `pronficilio`. PR #22 se fusionó en `master` con `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`; la integración parcial no acepta F4 ni cierra #19.
- **Modo/riesgo/verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Verifier requerido ahora:** sí, repetir la revisión FINAL independiente después de corregir los cinco rótulos de arte señalados. El usuario informó que completó el recorrido; Orquestación debe entregar ese informe con plan, inventario, diff y reportes. El Alquimista no autocertifica ni emite PASS.
- **Pregunta de falsificación:** ¿puede una persona en un recorrido normal encontrar texto inglés visible/accesible o activar inglés pese a no existir selector?
- **F1 cerrada:** `docs/plans/game-language/translation_inventory.md` inventaría texto visible/accesible, errores, decisiones, reglas, HTML/PWA, assets y mensajes `g-addLog`; no hubo cambios de producto.
- **Estado actual tras los merges:** #22 se integró con `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`; PR #30 de #21 después añadió cinco familias de botones ilustrados. El worktree canónico se sincronizó con `origin/master@3313d42`. La revisión independiente reportó `FAIL` en AC1/AC2/AC4/AC7 por rótulos ingleses incrustados, y `PASS` en AC3/AC5/AC6. La corrección de etiquetas españolas está en curso; F2/F3 siguen `ACTIVE` y F4 `ACTIVE`, sin cierre ni PASS general. El usuario informó que recorrió portada, lobby y una partida completa y que ve todo en orden. No indicó navegador, dispositivo, pasos concretos o capturas; no se infieren. Issue #19 sigue `OPEN`.
- **Publicación y tracker (estado histórico):** commit `9f97acb` publicó la tanda de producto; en ese punto #19 seguía `OPEN` y #22 estaba `DRAFT`. Posteriormente #22 se fusionó por `5de95ee`; #19 permanece abierta.
- **Documentos fuente:** issue #19; plan indicado arriba; reglas `docs/coup_transcription.md`, `docs/coup_play_reference.md`, `docs/coup_summary_card.md`; recursos de referencia descritos en el plan.

## Subtareas auditadas en F1

1. Auditar textos renderizados por React y atributos accesibles; incluir literales, valores dinámicos presentados al usuario, título/alt, `public/index.html` y `CheatSheet.svg`.
2. Seguir `g-addLog` desde `server/index.js` y `server/game/coup.js` hasta `EventLog.js`; registrar cada mensaje que ve quien juega.
3. Clasificar textos ya españoles, imágenes de referencia en ambos idiomas, cadenas internas excluidas y protocolos/valores que deben permanecer intactos.
4. Proponer el glosario español neutral latinoamericano, claves con espacios de nombres y marcadores nombrados; producir `docs/plans/game-language/translation_inventory.md`.

**Criterio de cierre F1:** la tabla cubre cada texto traducible encontrado, identifica archivo/contexto/clave/es/en/parámetros, preserva las variables y confirma que ningún valor del protocolo se traduce. Si la evidencia revela una superficie omitida, ampliar el inventario; si hace falta una decisión de terminología/alcance, devolver al Orquestador.

## Alcance de ejecución restante

- F2: incorporar las cinco familias de rótulos incrustados de respuesta a la superficie localizada, reutilizando sus claves bilingües existentes; verificar build y revisión visual. El par `claim` está sin uso en esta base y queda inventariado como recurso dormido.
- F3: revisar manualmente las ocho plantillas localizadas en `server/game/coup.js`; los emisores están liberados por PR #23. Mantener payload string, eventos, acciones, cartas, reglas y nombres internos.
- F4: registrar el `FAIL` específico del Verifier, integrar la corrección puntual y solicitar nueva revisión FINAL independiente. El recorrido fue informado por el usuario, no observado por el Alquimista.
- **Evidencia de recorrido reportada por usuario:** recorrió portada, lobby y partida completa, y ve todo en orden. No se proporcionaron datos del navegador/dispositivo, secuencia de pasos ni capturas. El reporte no constituye veredicto independiente ni PASS.
- **Hallazgo de cobertura posterior a #22:** los 10 WebP normal/active de `ba`, `bfa`, `bs`, `c` y `pass` contienen texto inglés visible. Se conectaron a claves `es`/`en` ya existentes mediante etiquetas superpuestas, sin alterar acciones/Socket.IO. `claim`/`claim-active` contienen inglés pero no tienen uso en código. No se afirma que la corrección visual haya sido aceptada hasta revisar el resultado y repetir el Verifier.
- **Sincronización y merge:** PR #22 está `MERGED`/cerrada mediante `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`; #19 sigue `OPEN`. Worktree #19 se actualizó por fast-forward de `ca16e42` a `origin/master@3313d42` sin conflicto. No abrir otra PR ni cerrar issue; F4 `ACTIVE` a la espera del Verifier FINAL.
- No implementar selector, detección, preferencia persistente ni otra ruta para elegir idioma; no añadir ni ejecutar tests automatizados.

## Dependencias y límites

- **Coordinación histórica (2026-09-26):** antes de PR #23, lobby/decisiones/tablero y servidor estaban reservados a #14. PR #23 ya está integrada en master y la última tanda sincronizó esa base en el worktree #19; las reservas anteriores ya no aplican a los cambios publicados.
- **Sincronización vigente (2026-09-27):** `origin/master@2d82fa1`, integrado en #19 por `74432a6`. PR #23 de #14 ya integró las rutas compartidas de lobby/decisión/tablero/servidor; el trabajo publicado está liberado. No se copian cambios locales de otros worktrees. Issue #14 puede seguir abierta por sus propios gates, pero ya no bloquea las superficies incluidas en PR #23.
- **F3:** `g-addLog` actual tiene ocho llamadas en `server/game/coup.js`; `server/index.js` no emite directamente ese evento en la base sincronizada. F3 está `ACTIVE`; falta recorrido manual del registro. Mantener string de payload y demás protocolo intactos.
- #14 puede seguir `OPEN` por sus gates restantes, pero PR #23 integró las rutas incluidas en esta tanda y liberó esos archivos para #19. #18 está cerrada tras PR #20 (`64a507d`), que liberó ReferencePanel.
- #13 es una unidad de despliegue fuera de alcance; no desplegar este cambio desde esta issue.
- No cambies lógica, reglas, shape de Socket.IO ni parámetros de juego para facilitar traducción. Los textos que se envían como datos de juego conservan sus valores en inglés y reciben etiqueta española al renderizarse.

## Evidencia, commits y validaciones

- F1: inventario/glosario en plan; `COMMIT_REQUIRED`, `docs(i18n): issue 19 F1 CLOSED advance_f2`.
- F2: diccionario, cliente/recursos español y reporte; build de cliente, revisión de claves, marcador `es` fijo y recorrido manual; `COMMIT_REQUIRED`, `feat(i18n): issue 19 F2 spanish default and dictionary`.
- F3: mensajes server y reporte; inspección de emisores, prueba manual de mensajes disponibles y `git diff --check`; `COMMIT_REQUIRED`, `feat(i18n): issue 19 F3 spanish game log messages`.
- F4: reporte de cierre, evidencia del build/recorrido y Verifier `PASS`; `COMMIT_REQUIRED`, `docs(i18n): issue 19 F4 CLOSED ready_for_review`.
- No agregues ni ejecutes tests automatizados. Si un build/recorrido requerido no se puede ejecutar, documenta el impedimento sin declarar PASS.

## Topología y reclamo

- **Branch destino:** `issue/19-spanish-default-dictionary`.
- **Worktree destino:** `.worktrees/issue-19-spanish-default-dictionary`.
- **Merge target:** `master`; **PR esperada:** una, desde el branch de #19 a `master` en el fork.
- **PR de revisión:** [#22](https://github.com/pronficilio/coup-online/pull/22), `MERGED`/cerrada el 2026-09-27 con merge commit `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. La issue #19 permanece `OPEN`; el merge fue parcial y no constituye aceptación F4 ni cierre de issue.
- **Secuencia obligatoria:** registrar claim visible en tracker; releer y confirmar issue; crear/confirmar branch desde `origin/master` actualizado; crear/entrar al único worktree; allí mover `inbox/` a `active/`, registrar `claim` y `worktree_confirmed` y commitear el control antes del trabajo técnico.
- **Bitácora:** append-only `docs/plans/log/issue-19.jsonl`.
- **Delegación:** dividir subtareas ordinarias según la política local; si hay Agentes Menores disponibles, asignarles tareas atómicas con este plan y aislamiento; de lo contrario ejecutar la fase desde el Alquimista.
- **Actualizaciones:** mantener issue, plan, fase, bitácora y reportes alineados. Al terminar, dejar la unidad `WAITING_ORCHESTRATOR`; no abrir integración adicional ni cerrar issue.
