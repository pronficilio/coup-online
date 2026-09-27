# Handoff para Agente Alquimista — issue #19

- **Tracker:** https://github.com/pronficilio/coup-online/issues/19
- **Plan exacto:** `docs/plans/game-language/plan_game_language.md`
- **Bitácora exacta:** `docs/plans/log/issue-19.jsonl`
- **Estado de unidad:** `WAITING_USER`; F1 `CLOSED`; F2 `ACTIVE`; F3 `ACTIVE`; F4 `BLOCKED` a la espera de inspección visual focalizada del ajuste 38–80% de `Desafiar`. Verifier FINAL independiente sobre el producto `c9d62676ffa33a177a0edced26dfc91e2529365c`: AC1/AC3/AC5/AC6 `PASS`; AC2/AC4 `PASS estático`; AC7 `BLOCKED` porque no observó recorrido humano en estados normal/activo ni ambos anchos. Issue abierta y asignada a `pronficilio`. PR #22 se fusionó parcialmente en `master` con `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`; PR de continuación #33 sigue `DRAFT`.
- **Modo/riesgo/verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Pendiente inmediato:** revisión humana focalizada en el producto `c9d6267`, luego entrega del resultado al Verifier para evaluar AC7. Su revisión estática actual considera cubierto el texto inglés por la máscara y dejó AC2/AC4 `PASS estático`; no observó la aplicación ni los controles en navegador. La inspección debe confirmar estados normal/activo, escritorio y ancho estrecho, ausencia de inglés y ausencia de recorte/superposición. El comentario previo del usuario fue aprobación para continuar, no resultado de esta revisión.
- **Corrección actual:** producto publicado en `c9d62676ffa33a177a0edced26dfc91e2529365c`; la máscara CSS de `Desafiar` va de 38–80% y cubre el lettering medido x≈39.3–77.9%, tanto normal como activo. No cambian los otros cuatro rótulos. Build `npm run build` exit 0 con avisos existentes (`App.js`, `caniuse-lite`, `ReferencePanel.css:dvh`); `git diff --check` pasó. El branch avanzó después al HEAD documental `cbfaee5`. API releyó #19 `OPEN` y PR #33 `OPEN`/`DRAFT`. Verifier: AC2/AC4 `PASS estático`, AC7 `BLOCKED`; falta inspección humana, no hay PASS global.
- **Pregunta de falsificación:** ¿puede una persona en un recorrido normal encontrar texto inglés visible/accesible o activar inglés pese a no existir selector?
- **F1 cerrada:** `docs/plans/game-language/translation_inventory.md` inventaría texto visible/accesible, errores, decisiones, reglas, HTML/PWA, assets y mensajes `g-addLog`; no hubo cambios de producto.
- **Estado actual tras los merges:** #22 se integró con `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`; PR #30 de #21 después añadió cinco familias de botones ilustrados. El worktree canónico se sincronizó primero con `origin/master@3313d42` y luego con `origin/master@be93e97` mediante merge `318c119` (PR #31/#29). La revisión independiente reportó `FAIL` en AC1/AC2/AC4/AC7 por rótulos ingleses incrustados, y `PASS` en AC3/AC5/AC6. La corrección de etiquetas españolas está publicada en `8d55413`; F2/F3 siguen `ACTIVE` y F4 `BLOCKED`, sin cierre ni PASS general. El usuario informó que recorrió portada, lobby y una partida completa y que ve todo en orden; no indicó navegador, dispositivo, pasos concretos o capturas. Ese recorrido antecede a la corrección. Issue #19 sigue `OPEN`.
- **Estado actual tras la corrección focalizada:** el Verifier volvió a medir `c.webp`/`c-active.webp` en commit `3c9a3af` y devolvió `FAIL` en AC2/AC4/AC7 por tinta inglesa fuera de la capa, x≈201–399/512 frente a x=204.8–394.24. El overlay se amplió solo para Desafiar a 38–80%; en los demás botones no cambió ninguna regla. Issue #19 permanece `OPEN`, PR #33 `DRAFT`; F4 `BLOCKED` hasta inspección humana del render actualizado y nuevo veredicto independiente.
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
- **Aprobación posterior:** el usuario elogió los botones españoles y aprobó continuar, pero no aportó detalle de una revisión por botón/estado o anchos. La corrección 38–80% necesita confirmar que desapareció todo `CHALLENGE`, sin cubrir espada ni marco; las demás etiquetas responsive no se modificaron.
- **Hallazgo de cobertura posterior a #22:** los 10 WebP normal/active de `ba`, `bfa`, `bs`, `c` y `pass` contienen texto inglés visible. Se conectaron a claves `es`/`en` ya existentes mediante etiquetas superpuestas, sin alterar acciones/Socket.IO. `claim`/`claim-active` contienen inglés pero no tienen uso en código. No se afirma que la corrección visual haya sido aceptada hasta revisar el resultado y repetir el Verifier.
- **Excepción de integración reorquestada:** PR #22 ya se fusionó parcialmente; PR #30/#21 añadió después los cinco rótulos ingleses descubiertos. La corrección se terminó en la misma rama y worktree de #19. Orquestación abrió PR de continuación [#33](https://github.com/pronficilio/coup-online/pull/33) a `master`, actualmente `DRAFT`; esta excepción al patrón de una PR por issue queda documentada por la integración parcial previa y el hallazgo tardío. No hacer merge hasta completar la revisión FINAL y la aprobación del usuario; #19 sigue `OPEN`.
- No implementar selector, detección, preferencia persistente ni otra ruta para elegir idioma; no añadir ni ejecutar tests automatizados.

## Dependencias y límites

- **Coordinación histórica (2026-09-26):** antes de PR #23, lobby/decisiones/tablero y servidor estaban reservados a #14. PR #23 ya está integrada en master y la última tanda sincronizó esa base en el worktree #19; las reservas anteriores ya no aplican a los cambios publicados.
- **Sincronización vigente (2026-09-27):** `origin/master@2d82fa1`, integrado en #19 por `74432a6`. PR #23 de #14 ya integró las rutas compartidas de lobby/decisión/tablero/servidor; el trabajo publicado está liberado. No se copian cambios locales de otros worktrees. Issue #14 puede seguir abierta por sus propios gates, pero ya no bloquea las superficies incluidas en PR #23. La base actual se actualizó después a `origin/master@be93e97` mediante merge `318c119`, que también trae PR #31/#29.
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
- **Merge target:** `master`; se conserva el branch y worktree únicos de #19. La base actual `origin/master@be93e97` se integró con merge `318c119`. Por la integración parcial de #22, PR de continuación [#33](https://github.com/pronficilio/coup-online/pull/33) se abrió desde ese mismo branch y está `DRAFT` para revisión visual/independiente.
- **PR histórica:** [#22](https://github.com/pronficilio/coup-online/pull/22), `MERGED`/cerrada el 2026-09-27 con merge commit `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`. La issue #19 permanece `OPEN`; ese merge parcial no constituye aceptación F4 ni cierre.
- **Secuencia obligatoria:** registrar claim visible en tracker; releer y confirmar issue; crear/confirmar branch desde `origin/master` actualizado; crear/entrar al único worktree; allí mover `inbox/` a `active/`, registrar `claim` y `worktree_confirmed` y commitear el control antes del trabajo técnico.
- **Bitácora:** append-only `docs/plans/log/issue-19.jsonl`.
- **Delegación:** dividir subtareas ordinarias según la política local; si hay Agentes Menores disponibles, asignarles tareas atómicas con este plan y aislamiento; de lo contrario ejecutar la fase desde el Alquimista.
- **Actualizaciones:** mantener issue, plan, fase, bitácora y reportes alineados. Al terminar, dejar la unidad `WAITING_ORCHESTRATOR`; Orquestación abrirá y registrará la PR de continuación, sin cerrar la issue.
