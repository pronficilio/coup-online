# Handoff para Agente Alquimista — issue #49

- **Issue:** https://github.com/pronficilio/coup-online/issues/49 (`OPEN`, asignada a `pronficilio`).
- **Plan exacto:** `docs/plans/coup-seven-coins/plan_coup_seven_coins.md`.
- **Bitácora exacta:** `docs/plans/log/issue-49.jsonl`.
- **Estado:** `WAITING_USER`; F1–F2 `CLOSED`, F3 `BLOCKED` por observación humana requerida.
- **Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL`.
- **Verifier requerido:** sí, independiente antes de integración.
- **Pregunta de falsificación:** ¿puede una selección legal de Coup con 7–9 monedas seguir siendo rechazada o cobrada dos veces, eludir el Coup obligatorio con 10+, reabrir silenciosamente una acción inválida o permitir bloqueo de Coup por Contessa?
- **Branch canónico:** `issue/49-coup-seven-coins`.
- **Worktree canónico:** `.worktrees/issue-49-coup-seven-coins`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **PR esperada:** una PR asociada a #49; aún no existe.

## Evidencia de intake

En `origin/master@0a467c1`, `actionChoices()` ofrece Coup desde 7 monedas, pero `beginAction()` vuelve a abrir la decisión si Coup tiene menos de 10. Así, con 8 monedas la selección legal se descarta en silencio y se recrea el menú. Las reglas versionadas establecen coste de 7, obligatoriedad con 10 y que Coup no se bloquea; Contessa bloquea Assassinate. F1 cerró por inspección estática en `docs/plans/coup-seven-coins/report_issue_49_F1.md`; no se ejecutaron pruebas ni partida dinámica.

## Secuencia obligatoria de reclamo y aislamiento

1. Volver a leer #49, confirmar que sigue abierta y registrar claim visible en el tracker del fork antes de empezar.
2. Volver a leer #49 tras el claim; verificar que no exista branch/worktree/PR incompatible.
3. Confirmar `origin/master` vigente; crear/usar exclusivamente `issue/49-coup-seven-coins` y `.worktrees/issue-49-coup-seven-coins`.
4. Este checkout raíz está atrasado y contiene cambios locales ajenos. Copiar únicamente el plan, este handoff y la bitácora de #49 al worktree nuevo basado en `origin/master`; allí mover `inbox/` a `active/`, registrar `claim` y `worktree_confirmed`, y hacer commit de control antes de cambios de producto. Actualizar `docs/plans/README_plans.md` en el branch con la línea de #49 únicamente; no portar los otros renglones locales sin confirmar de la raíz. No trasladar ni limpiar otros cambios raíz.
5. No usar `upstream`, ni trabajar en `master`, ni tocar el checkout compartido con cambios locales.

## Instrucción por fase

**F1 — CLOSED:** la ruta confirmó la causa del ciclo y que `g-decisionRejected` ya presenta rechazos de envelopes inválidos/obsoletos. Evidencia: `docs/plans/coup-seven-coins/report_issue_49_F1.md`; commit de cierre documentado en bitácora.

**F2 — CLOSED:** se quitó el umbral contradictorio de Coup `< 10`; se conservan coste 7, obligatoriedad desde 10, validación de objetivo y canal de rechazo existente. `git diff --check` y revisión estática pasaron; sin tests automatizados, build cliente ni partida dinámica. Evidencia: `docs/plans/coup-seven-coins/report_issue_49_F2.md`; commit de cierre documentado en bitácora.

**F3 — BLOCKED:** Verifier FINAL independiente inspeccionó `0b73305f5be684bb05cc7109701f958c26a98921` y no encontró refutación estática; devolvió `BLOCKED` porque el protocolo exige observación humana de los criterios interactivos. La app de desarrollo del worktree está lista en `http://127.0.0.1:3000/`, backend local puerto `8011`; página, bundle y endpoint API devuelven HTTP 200. Sigue pendiente el walkthrough descrito en `docs/plans/coup-seven-coins/report_issue_49_F3.md`; no abrir PR ni cambiar código antes del veredicto actualizado.

Al cerrar F1, ejecutar F2 del plan: alinear el mínimo de Coup en 7 con Coup obligatorio desde 10, y resolver de forma visible cualquier rechazo inválido/obsoleto pertinente sin debilitar validación autoritativa. Respetar AC1–AC6 y el alcance aprobado por #49. Antes de tocar código cliente compartido, auditar issues/worktrees/diffs #43, #44 y #45 y coordinar solapamientos. Commit `fix(coup-seven-coins): issue 49 F2 CLOSED advance_f3`.

En F3, pedir al Verifier independiente que intente refutar AC1–AC6 sobre el diff real; no debe arreglar. Documentar el resultado. No agregar ni ejecutar pruebas automatizadas sin instrucción del propietario. Commit de cierre `docs(coup-seven-coins): issue 49 F3 CLOSED ready_review`.

## Criterios de aceptación

1. Con 7, 8 o 9 monedas, Coup se acepta, cobra exactamente 7 y resuelve el objetivo.
2. Con 10 o más, solo Coup se ofrece y el servidor lo impone.
3. Validación autoritativa coincide con opciones emitidas y no se reinicia la selección tras una acción legal.
4. Rechazo genuino de decisión inválida/obsoleta tiene comunicación o recuperación definida, no ciclo silencioso.
5. Coup no abre bloqueo; Contessa bloquea solo Assassinate.
6. Actor, turno, saldo, objetivo, coste y resultado permanecen validados por servidor.

## Subtareas listas para delegación

- F1: trazar contrato servidor/cliente, reglas versionadas y alcance del rechazo silencioso.
- F2: implementar la mínima corrección de reglas y respuesta de decisión que acuerde la evidencia F1.
- F3: falsificación independiente contra AC1–AC6.

El Alquimista puede delegar subtareas ordinarias según las políticas de agentes/modelos vigentes del proyecto; mantener un único dueño para la integración y no delegar el Verifier independiente al implementador.

## Validación, evidencia y operación

- Validación mínima: `git diff --check`; build de cliente si cambia el cliente; inspección del flujo servidor y recorrido funcional permitido por el entorno. No ejecutar pruebas automatizadas sin instrucción del propietario.
- Artefactos: plan exacto indicado arriba; reportes F1/F2/F3 bajo `docs/plans/coup-seven-coins/`; esta bitácora: `docs/plans/log/issue-49.jsonl`.
- Cada fase que produzca cambio/evidencia persistente requiere commit con su evento `phase_verdict`.
- Actualizar issue, plan, handoff y bitácora con evidencia real; no declarar recorrido, CI o test que no ocurrió.
- Issue e integración solo las cierra el Orquestador tras revisar la PR y la verificación independiente.
