# Handoff para Agente Alquimista — issue #19

- **Tracker:** https://github.com/pronficilio/coup-online/issues/19
- **Plan exacto:** `docs/plans/game-language/plan_game_language.md`
- **Bitácora exacta:** `docs/plans/log/issue-19.jsonl`
- **Estado:** `ACTIVE`; F1 `CLOSED`; F2 `ACTIVE`; F3 `ACTIVE`; F4 `BLOCKED` por falta de navegador local para recorrido manual. Issue abierta y asignada a `pronficilio`. La [PR #22](https://github.com/pronficilio/coup-online/pull/22) está `DRAFT` por solicitud del usuario para validar el avance parcial; no está lista para fusionarse.
- **Modo/riesgo/verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Verifier requerido ahora:** sí para cierre de F4, pero aún no asignado; Orquestación debe delegar el verificador FINAL independiente cuando se complete el recorrido manual. El Alquimista no autocertifica.
- **Pregunta de falsificación:** ¿puede una persona en un recorrido normal encontrar texto inglés visible/accesible o activar inglés pese a no existir selector?
- **F1 cerrada:** `docs/plans/game-language/translation_inventory.md` inventaría texto visible/accesible, errores, decisiones, reglas, HTML/PWA, assets y mensajes `g-addLog`; no hubo cambios de producto.
- **Tanda actual F2/F3 tras PR #23:** PR #23 de #14 está integrada en `origin/master@2d82fa1`; #19 la incorporó mediante merge `74432a6` y registró `sync_base`. Se localizaron CreateGame, JoinGame, decisiones, Coup, PlayerBoard y las cinco imágenes españolas; `g-addLog` se localizó en sus ocho emisores actuales en `server/game/coup.js`. El diccionario contiene 307 claves `es`/`en` con marcadores concordantes. Build del cliente exit 0 con warnings preexistentes; `git diff --check` y `node --check` de los archivos server limpios. F2/F3 siguen ACTIVE; el recorrido manual está bloqueado por falta de navegador local y F4 está `BLOCKED`. Issue #19 debe seguir OPEN; PR #22 DRAFT; no selector ni cambio real de idioma.
- **Publicación y tracker (2026-09-27, estado anterior):** commit `9f97acb` se publicó en `origin/issue/19-spanish-default-dictionary`. En esa actualización los cuerpos de #19/#22 describían F4 como `PENDING`; el estado actual cambió a `BLOCKED` tras confirmar que no hay navegador para hacer el recorrido manual. Se mantuvieron #19 `OPEN`/asignada a `pronficilio` y PR #22 `OPEN`/`DRAFT`.
- **Documentos fuente:** issue #19; plan indicado arriba; reglas `docs/coup_transcription.md`, `docs/coup_play_reference.md`, `docs/coup_summary_card.md`; recursos de referencia descritos en el plan.

## Subtareas auditadas en F1

1. Auditar textos renderizados por React y atributos accesibles; incluir literales, valores dinámicos presentados al usuario, título/alt, `public/index.html` y `CheatSheet.svg`.
2. Seguir `g-addLog` desde `server/index.js` y `server/game/coup.js` hasta `EventLog.js`; registrar cada mensaje que ve quien juega.
3. Clasificar textos ya españoles, imágenes de referencia en ambos idiomas, cadenas internas excluidas y protocolos/valores que deben permanecer intactos.
4. Proponer el glosario español neutral latinoamericano, claves con espacios de nombres y marcadores nombrados; producir `docs/plans/game-language/translation_inventory.md`.

**Criterio de cierre F1:** la tabla cubre cada texto traducible encontrado, identifica archivo/contexto/clave/es/en/parámetros, preserva las variables y confirma que ningún valor del protocolo se traduce. Si la evidencia revela una superficie omitida, ampliar el inventario; si hace falta una decisión de terminología/alcance, devolver al Orquestador.

## Alcance de ejecución restante

- F2: terminar revisión/manual de las superficies ahora integradas en master: lobby, decisiones, partida y tablero; documentar cobertura y brechas de accesibilidad sin rediseñar controles. El diccionario y carga de imágenes españolas están implementados.
- F3: revisar manualmente las ocho plantillas localizadas en `server/game/coup.js`; los emisores están liberados por PR #23. Mantener payload string, eventos, acciones, cartas, reglas y nombres internos.
- F4: compilar cliente, recorrer portada/lobby/partida manualmente, revisar cobertura y solicitar Verifier FINAL independiente.
- **Bloqueo F4 (2026-09-27):** no se encontró un navegador ejecutable (`chromium`, `chromium-browser`, Chrome, `chrome` o `firefox`) ni dependencia Playwright/Puppeteer/WebDriver. No se inició recorrido ni se instalaron dependencias. F4 `BLOCKED`; preparar/reclamar Verifier después de habilitar recorrido seguro. A las 17:20:35Z se actualizaron y releyeron los cuerpos de #19/#22; #19 sigue `OPEN`/asignada a `pronficilio` y PR #22 `OPEN`/`DRAFT`.
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
- **PR de revisión:** [#22](https://github.com/pronficilio/coup-online/pull/22), `DRAFT`, abierta el 2026-09-27T04:47:45Z a solicitud explícita del usuario. Es la PR única de esta unidad, para revisión parcial; mantenerla en borrador y no fusionar hasta completar F2/F3/F4 y el veredicto requerido.
- **Secuencia obligatoria:** registrar claim visible en tracker; releer y confirmar issue; crear/confirmar branch desde `origin/master` actualizado; crear/entrar al único worktree; allí mover `inbox/` a `active/`, registrar `claim` y `worktree_confirmed` y commitear el control antes del trabajo técnico.
- **Bitácora:** append-only `docs/plans/log/issue-19.jsonl`.
- **Delegación:** dividir subtareas ordinarias según la política local; si hay Agentes Menores disponibles, asignarles tareas atómicas con este plan y aislamiento; de lo contrario ejecutar la fase desde el Alquimista.
- **Actualizaciones:** mantener issue, plan, fase, bitácora y reportes alineados. Al terminar, dejar la unidad `WAITING_ORCHESTRATOR`; no abrir integración adicional ni cerrar issue.
