# Handoff para Agente Alquimista — issue #45

- **Issue:** https://github.com/pronficilio/coup-online/issues/45 (`OPEN`, asignada a `pronficilio`).
- **Plan exacto:** `docs/plans/submitted-response-highlight/plan_submitted_response_highlight.md`.
- **Bitácora exacta:** `docs/plans/log/issue-45.jsonl`.
- **Estado:** unidad `WAITING_ORCHESTRATOR`; F1 `CLOSED` con walkthrough manual del propietario.
- **Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
- **Verifier requerido:** no.
- **Pregunta de falsificación:** ¿puede una respuesta enviada perder el aspecto activo antes del cierre, aparecer activa una opción no elegida o sobrevivir una selección a una decisión nueva?
- **Branch canónico:** `issue/45-persist-submitted-response-highlight`.
- **Worktree canónico:** `.worktrees/issue-45-persist-submitted-response-highlight`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **PR:** [#51](https://github.com/pronficilio/coup-online/pull/51), abierta hacia `master` y referenciada a #45.
- **Fase sugerida:** F1, persistencia visual de la respuesta elegida durante la espera.

## Reclamo y aislamiento

Releer #45 en el fork y registrar el reclamo visible antes de crear branch/worktree. Confirmar que no exista una topología incompatible, usar `origin/master` vigente y volver a leer el issue después del reclamo. Trabajar solo en el aislamiento canónico; no editar `master` ni hacer push a `upstream`.

Antes de editar, releer las issues #43 y #44, sus ramas/worktrees/diffs y confirmar que nadie esté modificando al mismo tiempo el renderer o el componente de botones de respuesta. Mantener el fix en su propia unidad y no incluir cambios de #43/#44.

**Evidencia al reclamo (2026-09-28):** #45 fue asignada y releída en el fork; sigue `OPEN`. El branch/worktree de #45 no existía y se creó desde el `origin/master` vigente (`f900c0947a0b27ac9c6e0372e3c1871a883be7e6`). #43 sigue `OPEN`, asignada a `pronficilio`, con comentario reciente `ACTIVE` que afirma iniciar F1; sin embargo, `issue/43-turn-vote-highlights` devuelve 404 en la API de GitHub, no existe como branch local y su worktree canónico no figura en `git worktree list`. No se pudo revisar ese diff, por lo que se mantuvo el cambio de #45 estrictamente en `ResponseImageButton.js`, sin editar `Coup.js`, `PlayerBoard.js` ni CSS compartido. El bloqueo inicial por solapamiento queda supersedido para este cambio acotado; no ampliar el alcance hasta resolver #43. #44 sigue `OPEN`, sin asignación/comentarios y con F1 de solo lectura.

**Resultado F1:** el botón conserva localmente la variante activa al enviar; el estado se limpia cuando el padre vuelve a habilitar los controles por rechazo o decisión nueva. El cierre desmonta el renderer. El propietario completó el walkthrough en una partida de tres participantes: la opción elegida siguió `active` al apartar el puntero mientras esperaban otros; probó `Pasar` y varios bloqueos, y reportó que todo luce bien ([evidencia en #45](https://github.com/pronficilio/coup-online/issues/45#issuecomment-5875638751)). F1 queda `CLOSED`; no se afirma cobertura dinámica de teclado ni touch. Tras sincronizar `origin/master@db1d22c` por merge (`918e070`), `npm run build` compiló con advertencias y `git diff --check` pasó. La unidad permanece `WAITING_ORCHESTRATOR` para revisión e integración. Ver reporte: `docs/plans/submitted-response-highlight/report_issue_45_F1.md`.

## Instrucción F1

En los botones gráficos que usan arte normal y `-active`, conserva una referencia transitoria a la opción local enviada y representa esa opción con su variante activa mientras siga vigente la misma decisión, aunque esté deshabilitada y el puntero abandone el botón. Las opciones no elegidas permanecen inactivas/deshabilitadas. Limpia la selección al cerrar o cambiar la decisión y conserva el contrato actual de `choiceId`, errores, reintentos y accesibilidad.

Produce `docs/plans/submitted-response-highlight/report_issue_45_F1.md`. Valida build cliente, `git diff --check` y recorrido manual donde este usuario responde primero y observa el estado hasta que otro participante cierre la ventana. No agregues ni ejecutes pruebas automatizadas.

**Criterios de aceptación:** la opción elegida se mantiene activa tras salir el mouse; ninguna otra opción se activa ni vuelve accionable; al cerrar/cambiar decisión no queda selección obsoleta; mouse, teclado y touch conservan el estado correcto.

**Commit de cierre:** `feat(response-highlight): issue 45 F1 CLOSED ready_review`, incluyendo implementación, reporte y evento `phase_verdict` en la bitácora.

Actualiza el issue, plan, handoff activo y bitácora con evidencia concreta. Al terminar, deja la unidad `WAITING_ORCHESTRATOR` para revisión e integración.
