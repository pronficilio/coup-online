# Plan — Coup con 7–9 monedas

- **Issue:** [#49](https://github.com/pronficilio/coup-online/issues/49), `OPEN`.
- **Estado operativo:** `WAITING_ORCHESTRATOR_REVIEW`; PR #50 abierta a `master`.
- **Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL`.
- **Perfil:** `coup-online`; target `master` del fork `pronficilio/coup-online`; aislamiento `git_worktree`.
- **Branch / worktree canónicos:** `issue/49-coup-seven-coins` / `.worktrees/issue-49-coup-seven-coins`.
- **Bitácora:** `docs/plans/log/issue-49.jsonl` (append-only).

## Objetivo

Permitir Coup con 7, 8 o 9 monedas y conservar Coup obligatorio desde 10 monedas. Evitar que una elección legal de destino sea rechazada en silencio y reinicie el turno. Verificar que Contessa bloquea solo Assassinate y que las decisiones inválidas/obsoletas no produzcan ciclos silenciosos.

## Hallazgo F0

La lectura de `origin/master` en `0a467c1` confirma la discrepancia: `actionChoices()` ofrece `coup` desde 7 monedas, mientras `beginAction()` vuelve a `playTurn()` cuando Coup tiene menos de 10. Con 8 monedas el servidor consume la decisión, rechaza el golpe y publica un menú nuevo. La regla versionada dice que Coup cuesta 7 monedas y no tiene bloqueo; Contessa bloquea Assassinate. Esto explica el síntoma sin atribuirlo a la carta rival.

La rama local `master` estaba seis commits detrás antes de actualizar refs; `origin/master` quedó en `0a467c1`. El worktree aislado de #49 parte de esa referencia y el checkout compartido no se usó para implementar.

## Estado de integración

El propietario confirmó que realizó la verificación y autorizó el merge. El reporte independiente F3 permanece `BLOCKED` por falta de observaciones detalladas por criterio; el Orquestador documentó la excepción autorizada y no presenta ese estado como Verifier PASS. La PR única #50 está abierta a `master`; la integración/cierre quedan en manos del Orquestador.

## Criterios de aceptación

1. Coup con saldo 7–9 se acepta; cobra exactamente 7 y continúa por la resolución normal del objetivo.
2. Desde 10 monedas el servidor ofrece y exige Coup.
3. El validador de acción del servidor concuerda con las opciones legales; una elección legal no abre otra decisión de acción.
4. Una decisión inválida/obsoleta rechazada por el servidor comunica un error comprensible o el comportamiento recuperable ya definido, nunca reinicia silenciosamente el mismo turno.
5. Coup no abre una ventana de bloqueo y Contessa sigue siendo elegible únicamente para bloquear Assassinate.
6. El servidor conserva autoridad sobre actor, turno, saldo, objetivo, coste y resultado.

## Fases

### F1 — Contrato del rechazo y confirmación del alcance

**Pregunta:** ¿El ciclo proviene solo del umbral contradictorio de Coup o hay otras rutas de rechazo silencioso que afecten la selección de acciones?

- Rastrear `actionChoices`, `beginAction`, `g-submitDecision`, `rejectDecision` y el estado de decisión/error cliente-servidor.
- Confirmar en las reglas versionadas coste, obligatoriedad y bloqueos de Coup/Assassinate.
- Distinguir rechazos esperados de decisiones obsoletas/inválidas de la discrepancia reproducible con 7–9 monedas.
- No ampliar alcance a rechazos ajenos al flujo de acción salvo evidencia directa y anotación para reorquestar.
- **Evidencia:** `docs/plans/coup-seven-coins/report_issue_49_F1.md` con rutas/fragmentos relevantes, secuencia causal y veredicto.
- **Commit:** `COMMIT_REQUIRED`; `docs(coup-seven-coins): issue 49 F1 CLOSED advance_f2`.

### F2 — Corregir autorización de Coup y manejo visible del rechazo

**Pregunta:** ¿El servidor puede aceptar todas las opciones que ofrece y reportar un rechazo no recuperable sin reiniciar la decisión?

- Alinear la validación de coste/obligatoriedad con la generación de opciones: mínimo 7; obligatorio a partir de 10.
- Inspeccionar el canal de rechazo y mantener visibles error/recuperación ante decisión genuinamente inválida u obsoleta. No crear mensajes paralelos si el protocolo existente cubre el caso.
- Preservar pago único, validación de turno/objetivo y el flujo de Assassinate/Contessa.
- No editar partes no relacionadas de la UI compartida. Antes de tocar `Coup.js` o el contrato común, releer issues/branches/worktrees/diffs #43, #44 y #45; coordinar si una modificación concurrente pisa la misma zona.
- **Evidencia:** `docs/plans/coup-seven-coins/report_issue_49_F2.md`; `git diff --check`, build del cliente si cambia el cliente y revisión/recorrido permitido sin pruebas automatizadas.
- **Commit:** `COMMIT_REQUIRED`; `fix(coup-seven-coins): issue 49 F2 CLOSED advance_f3`.

### F3 — Falsificación independiente e integración

**Pregunta:** ¿Existe una secuencia de estado o decisión que aún cause cobro incorrecto, repetición o un bloqueo ilegal?

- Verifier independiente revisa el diff y trata de refutar AC1–AC6, especialmente 7/8/9 monedas, 10 monedas, cobro único, objetivo, respuesta a decisión caducada y Contessa contra Coup.
- Registrar límites: no añadir ni ejecutar tests automatizados; no declarar recorrido dinámico si no se hizo.
- Revisar PR única hacia `master` del fork y evidencia/CI disponibles. Corregir todo FAIL material antes de integrar.
- **Evidencia:** `docs/plans/coup-seven-coins/report_issue_49_F3.md` y bitácora.
- **Commit de cierre:** `COMMIT_REQUIRED`; `docs(coup-seven-coins): issue 49 F3 CLOSED ready_review`.

## Pregunta de falsificación

¿Puede un actor con 7–9 monedas escoger un Coup que el servidor aún rechaza o cobra dos veces; puede un actor con 10 monedas ejecutar otra acción; puede una selección inválida/obsoleta reabrir el menú sin explicación; o puede Contessa bloquear Coup?

## Restricciones

- Una unidad de integración: una rama, un worktree y una PR.
- No modificar upstream, no editar directamente `master`, no incluir cambios ajenos.
- No agregar ni ejecutar pruebas automatizadas sin instrucción del propietario.
- Claim remoto antes de crear/entrar al worktree; después, claim/worktree-confirmed en bitácora y commit de control antes del código.
- Solo cerrar issue/unidad después de que el Orquestador verifique e integre la PR.
