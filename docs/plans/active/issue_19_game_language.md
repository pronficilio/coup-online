# Handoff para Agente Alquimista — issue #19

- **Tracker:** https://github.com/pronficilio/coup-online/issues/19
- **Plan exacto:** `docs/plans/game-language/plan_game_language.md`
- **Bitácora exacta:** `docs/plans/log/issue-19.jsonl`
- **Estado:** `ACTIVE`; F1 `CLOSED`; F2 `ACTIVE` en superficies aisladas y pendiente en rutas reservadas; F3 `BLOCKED` por #14; F4 `PENDING`. Issue abierta y asignada a `pronficilio`.
- **Modo/riesgo/verificación:** `FULL` / `MEDIUM` / `FINAL`.
- **Verifier requerido ahora:** no. Requerido en F4 antes de revisión de integración.
- **Pregunta de falsificación:** ¿puede una persona en un recorrido normal encontrar texto inglés visible/accesible o activar inglés pese a no existir selector?
- **F1 cerrada:** `docs/plans/game-language/translation_inventory.md` inventaría texto visible/accesible, errores, decisiones, reglas, HTML/PWA, assets y mensajes `g-addLog`; no hubo cambios de producto.
- **F2 en curso:** la tanda aislada de `src/i18n/**`, `Home.js`, `RulesModal.js`, `CheatSheetModal.js`, `EventLog.js`, `public/index.html`, `public/manifest.json` y `assets/CheatSheet.svg` está implementada en el commit `feat(i18n): issue 19 F2 spanish default and dictionary`, con evidencia en `docs/plans/game-language/report_issue_19_F2.md` (181 claves bilingües, build de producción exitoso). `npm ci` y el build completaron; CRA informó avisos ESLint preexistentes en `App.js` y `game/Coup.js`. No se añadieron ni ejecutaron tests. F2 sigue `ACTIVE`: no editar rutas aún reservadas a #14 ni cerrar hasta sincronizar la base y completar su localización.
- **Documentos fuente:** issue #19; plan indicado arriba; reglas `docs/coup_transcription.md`, `docs/coup_play_reference.md`, `docs/coup_summary_card.md`; recursos de referencia descritos en el plan.

## Subtareas auditadas en F1

1. Auditar textos renderizados por React y atributos accesibles; incluir literales, valores dinámicos presentados al usuario, título/alt, `public/index.html` y `CheatSheet.svg`.
2. Seguir `g-addLog` desde `server/index.js` y `server/game/coup.js` hasta `EventLog.js`; registrar cada mensaje que ve quien juega.
3. Clasificar textos ya españoles, imágenes de referencia en ambos idiomas, cadenas internas excluidas y protocolos/valores que deben permanecer intactos.
4. Proponer el glosario español neutral latinoamericano, claves con espacios de nombres y marcadores nombrados; producir `docs/plans/game-language/translation_inventory.md`.

**Criterio de cierre F1:** la tabla cubre cada texto traducible encontrado, identifica archivo/contexto/clave/es/en/parámetros, preserva las variables y confirma que ningún valor del protocolo se traduce. Si la evidencia revela una superficie omitida, ampliar el inventario; si hace falta una decisión de terminología/alcance, devolver al Orquestador.

## Alcance de ejecución restante

- F2: traducir la interfaz y preparar `coup-client/src/i18n/translations.json` con claves paralelas `es`/`en`; cliente fijo a `es`; declarar `lang="es"`; traducir texto de `CheatSheet.svg` y actualizar `public/manifest.json`; cargar las cinco variantes españolas existentes de las ilustraciones de personaje. El primer commit puede cubrir solo las superficies aisladas autorizadas por el plan; no rediseñar controles a partir de brechas de accesibilidad sin reorquestación.
- F3: traducir únicamente mensajes visibles `g-addLog` y reflejar sus plantillas en el diccionario; conservar payload string, eventos, acciones, cartas, reglas y nombres internos.
- F4: compilar cliente, recorrer portada/lobby/partida manualmente, revisar cobertura y solicitar Verifier FINAL independiente.
- No implementar selector, detección, preferencia persistente ni otra ruta para elegir idioma; no añadir ni ejecutar tests automatizados.

## Dependencias y límites

- **Reserva de archivos confirmada por el Orquestador (2026-09-27):** la tanda actual solo tocó `coup-client/src/i18n/**`, `coup-client/src/components/Home.js`, `RulesModal.js`, `CheatSheetModal.js`, `EventLog.js`, `coup-client/public/index.html`, `coup-client/public/manifest.json` y `coup-client/src/assets/CheatSheet.svg`. Las rutas de lobby/decisión/partida siguen reservadas por #14. PR #20 de #18 se fusionó como `64a507d`, lo que liberó `ReferencePanel.js` y `ReferencePanel.css`; no se editarán hasta sincronizar en la próxima tanda.
- **Rutas reservadas a #14 durante F2:** `coup-client/src/components/CreateGame.js`, `coup-client/src/components/JoinGame.js`, `coup-client/src/components/game/ActionDecision.js`, `BlockChallengeDecision.js`, `BlockDecision.js`, `ChallengeDecision.js`, `ChooseInfluence.js`, `Coup.js`, `ExchangeInfluences.js`, `PlayerBoard.js` y `RevealDecision.js`. La PR #20 de #18 se fusionó en `origin/master` como `64a507d`, liberando `coup-client/src/components/game/ReferencePanel.js` y `ReferencePanel.css`; la issue #18 aún figura abierta. No editar ni resolver cambios ajenos por inferencia. La siguiente tanda sincronizará con `origin/master`, registrará `sync_base`, actualizará el inventario por texto nuevo y completará F2. Esta tanda no sincroniza la base.
- **F3 sigue bloqueada:** #14 tiene cambios activos en `server/game/coup.js` y `server/index.js`. Traducir solo los emisores `g-addLog` después de que #14 libere/integren esos archivos; mantener el string de payload y el resto del protocolo.
- #14 permanece `OPEN` con F2 bloqueada por sus gates de preflight/auth; #18 permanece `OPEN`, aunque PR #20 ya se integró como `64a507d` y liberó `ReferencePanel`. Estas fases no se cancelan ni se relajan; el trabajo aislado de F2 avanza en paralelo.
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
- **Secuencia obligatoria:** registrar claim visible en tracker; releer y confirmar issue; crear/confirmar branch desde `origin/master` actualizado; crear/entrar al único worktree; allí mover `inbox/` a `active/`, registrar `claim` y `worktree_confirmed` y commitear el control antes del trabajo técnico.
- **Bitácora:** append-only `docs/plans/log/issue-19.jsonl`.
- **Delegación:** dividir subtareas ordinarias según la política local; si hay Agentes Menores disponibles, asignarles tareas atómicas con este plan y aislamiento; de lo contrario ejecutar la fase desde el Alquimista.
- **Actualizaciones:** mantener issue, plan, fase, bitácora y reportes alineados. Al terminar, dejar la unidad `WAITING_ORCHESTRATOR`; no abrir integración adicional ni cerrar issue.
