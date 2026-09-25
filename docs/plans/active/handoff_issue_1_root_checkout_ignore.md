# Handoff — Issue #1: checkout raíz y reglas de exclusión

**Estado:** `WAITING_ORCHESTRATOR`  
**Issue:** https://github.com/pronficilio/coup-online/issues/1  
**Plan largo:** `docs/plans/active/issue_1_root_checkout_ignore.md`  
**Bitácora:** `docs/plans/log/issue-1.jsonl`

## Entrada de ejecución

- **Unidad:** issue GitHub #1.
- **Claim:** registrado en la issue #1 y en `docs/plans/log/issue-1.jsonl`.
- **Fase:** F1, `CLOSED`.
- **Subtarea:** establecer el checkout del fork en la raíz del workspace, crear un worktree para la rama de la issue, y añadir reglas que excluyan los directorios locales `fotos/` y `docs/agentes/`.
- **Objetivo verificable:** el checkout raíz conserva el historial del fork; `origin` apunta al fork y `upstream` al repositorio fuente; `.gitignore` excluye `/fotos/` y `/docs/agentes/`; el PR contiene exactamente `.gitignore` y cinco artefactos de control: `docs/plans/README_plans.md`, `docs/plans/PROJECT_ORCHESTRATION.yaml`, `docs/plans/active/issue_1_root_checkout_ignore.md`, `docs/plans/active/handoff_issue_1_root_checkout_ignore.md` y `docs/plans/log/issue-1.jsonl`.
- **Rama:** `issue/1-root-checkout-ignore`.
- **Worktree:** `.worktrees/issue-1-root-checkout-ignore`.
- **Base y merge target:** `master` del fork `pronficilio/coup-online`.
- **Checkout raíz:** `E:\dev\coup`, rama `master`, desde `origin/master` (commit `64458b7`).
- **Remotos:** `origin=https://github.com/pronficilio/coup-online.git`; `upstream=https://github.com/Cheneth/coup-online.git`.
- **Commit de cierre:** `859696e` (`chore(fork-setup): issue 1 F1 CLOSED advance_review`).
- **PR:** https://github.com/pronficilio/coup-online/pull/2 hacia `master`.
- **Head previo a corrección:** `6df6397`; el Verifier emitió `FAIL` por el inventario documental. Este commit docs-only deja descritas las seis rutas del PR; revalidar el HEAD resultante de la rama.
- **Integración:** un PR hacia `master`, asociado a issue #1. El Ejecutor no integra ni cierra la issue.
- **Modo / riesgo:** `LIGHT` / `MEDIUM`.
- **Verificación:** `FINAL`; el Verifier debe confirmar las seis rutas descritas, las reglas de ignore y la ausencia de contenido personal en el HEAD actualizado.

## Alcance de archivos

- Puede inicializar el repositorio en la raíz, configurar sus remotos y crear el worktree indicado.
- Puede modificar el `.gitignore` de la rama de trabajo, actualizar los artefactos indicados de `docs/plans/` y cambiar la metadata Git necesaria para el checkout.
- No abra, copie, mueva, agregue ni publique contenido de `fotos/` ni `docs/agentes/`.
- No incluya en el commit otros documentos locales fuera de estos artefactos del plano de control: `README_plans.md`, `PROJECT_ORCHESTRATION.yaml`, el plan de issue #1, el handoff reclamado y `log/issue-1.jsonl`.
- No modifique archivos del juego, README, licencia, configuración de aplicación ni workflows.

## Pasos sugeridos

1. [x] Comprueba que la raíz no tenía `.git` y que el destino del worktree no existía.
2. [x] Inicializa el repositorio en la raíz; configura `origin` y `upstream`; trae y checkout de `origin/master`, preservando las carpetas locales.
3. [x] Crea el worktree y la rama indicados desde `origin/master`.
4. [x] Lee el `.gitignore` upstream en el worktree y conserva sus reglas; añade `/fotos/` y `/docs/agentes/`.
5. [x] `git check-ignore -v --no-index` confirma ambas rutas.
6. [x] Revisa el estado y el diff; el staging contiene solo `.gitignore` y cinco artefactos permitidos, sin carpetas personales.
7. [x] Reclama el handoff moviéndolo a `active/`; actualiza plan, handoff y descripción de issue #1.
8. [x] Copia al worktree únicamente los artefactos permitidos; registra F1 CLOSED y la espera de revisión en la bitácora.
9. [x] Crea `859696e` con `.gitignore` y los artefactos permitidos; súbelo y abre el PR #2 hacia `master`.
10. [x] Registra rama, worktree, commit y PR en la bitácora; detente para verificación independiente.

## Política de cierre

- **Commit requerido:** `chore(fork-setup): issue 1 F1 CLOSED advance_review`; debe incluir el resultado de F1 y el evento `phase_verdict` junto con los cambios.
- **Validaciones:** remotos, rama base, `git check-ignore`, estado de staging y lista de archivos del commit/PR.
- **No ejecutar suites de pruebas:** el cambio no toca código de aplicación.
- **Condición de parada:** PR #2 abierto y evidencia registrada; issue #1 sigue OPEN. El Verifier revalida el HEAD actualizado; después continúa el Orquestador. No hacer merge ni cerrar la issue.
