# Handoff para Agente Alquimista — issue #56

- **Issue:** https://github.com/pronficilio/coup-online/issues/56 (`OPEN`, asignada a `pronficilio`).
- **Plan exacto:** `docs/plans/centralized-decision-panel/plan_centralized_decision_panel.md`.
- **Bitácora exacta:** `docs/plans/log/issue-56.jsonl`.
- **Estado:** `ACTIVE`; F1 `CLOSED (PASS)` estáticamente; F2 `IN_PROGRESS` sobre la base sincronizada con PR #55/#57.
- **Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL` independiente en F3.
- **Verifier requerido ahora:** no; invocarlo en F3.
- **Pregunta de falsificación:** ¿hay estado donde falte/sobre una opción, quede un botón debajo de las cartas o el copy prometa una respuesta que las reglas no permiten?
- **Branch canónico:** `issue/56-centralized-decision-panel`.
- **Worktree canónico:** `.worktrees/issue-56-centralized-decision-panel`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **PR esperada:** una PR asociada solo a #56.
- **Fase sugerida:** F1, inventario del contrato visible, renderers, assets y copy; solo lectura de producto.

## Reclamo y aislamiento

Releer #56 en el fork; el reclamo visible está registrado y el worktree canónico parte de `origin/master@b8df17f`, que incluye #43/#57 y #53/#55. No trabajar en `master`, no incluir cambios locales existentes ni hacer push a `upstream`. F1 es de solo lectura de producto. #45/#51 y #47/#52 están integradas; conservar sus comportamientos al migrar.

## Instrucción F1

F1 se cerró con inventario estático en `docs/plans/centralized-decision-panel/report_issue_56_F1.md`; no se hizo walkthrough dinámico. Sigue F2 según el plan canónico.

Cierra F1 con reporte, bitácora y commit `docs(decisions): issue 56 F1 inventory and copy`. Revisión estática y `git diff --check`; no añadas ni ejecutes tests automatizados. Mantén F2 pendiente hasta la señal del Orquestador de que #43/#53 dejan libre la superficie compartida.

## Criterios y fase posterior

Sigue las fases, criterios de avance/pivote/bloqueo, política de commit y reportes del plan canónico. El resultado final exige una única superficie de decisión, sin botones debajo de las dos cartas, copy preciso, opciones respaldadas por el servidor, build y walkthrough manual, y Verifier FINAL independiente. Eliminar assets solo tras demostrar que no quedan consumidores.

**Bitácora append-only:** `docs/plans/log/issue-56.jsonl`. Actualiza issue #56, plan, handoff y bitácora al cerrar cada fase. No crear branch/worktree por fase ni alterar el historial de #44; #44 fue cerrada como sustituida por #56.
