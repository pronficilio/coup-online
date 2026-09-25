# Issue #3: chequeo rápido de seguridad de Coup Online

**Estado:** `WAITING_VERIFIER`
**Issue:** https://github.com/pronficilio/coup-online/issues/3
**Handoff:** `docs/plans/active/handoff_issue_3_quick_security_check.md`
**Bitácora:** `docs/plans/log/issue-3.jsonl`

> Es la segunda issue de trabajo creada en el fork. GitHub asignó el número #3 porque el pull request #2 comparte la secuencia global de números.

## Objetivo

Hacer un chequeo rápido, de solo lectura, de la superficie de seguridad del cliente React y el servidor Express/Socket.IO. Entregar un informe breve con hallazgos reproducibles, impacto y evidencia (archivo/línea o salida de herramienta).

## Perfil operativo

- Proyecto: `coup-online`; tracker GitHub en `pronficilio/coup-online`.
- Rama base y merge target detectados: `master` (contrato del proyecto).
- Aislamiento: un worktree y branch propios de la issue, según el patrón `issue/<id>-<slug>` y `.worktrees/issue-<id>-<slug>`; aún no reclamados ni creados.
- Modo: `FULL`, porque el tema es seguridad, manteniendo la revisión acotada a una sola fase.
- Riesgo: `HIGH`.
- Verificación independiente: `FINAL`, obligatoria para seguridad según `docs/plans/PROJECT_ORCHESTRATION.yaml`.

## Alcance

Revisión estática del código y auditoría de dependencias declaradas/lockfiles:

- Entradas HTTP y Socket.IO; validación de mensajes y control de quién puede ejecutar acciones de partida.
- Aislamiento de información privada de jugadores y datos emitidos a cada socket.
- CORS, validación de nombres/códigos de sala y tratamiento de entradas no confiables.
- Secretos o configuración sensible expuestos en archivos versionados o en el cliente.
- Dependencias del cliente y servidor con la herramienta de auditoría disponible; registrar comando, fecha, resultado y limitaciones.
- Rutas iniciales para inspección: `server/index.js`, `server/game/coup.js`, `server/game/utils.js`, `server/utilities/`, eventos Socket.IO en `coup-client/src/`, y ambos `package.json`/lockfiles.

El alcance es un chequeo inicial, no una certificación de seguridad ni una prueba de penetración.

## Fuera de alcance

- No cambiar código, configuración ni dependencias; no hacer fixes en esta issue.
- No probar contra el servicio público ni usar datos reales; no realizar explotación activa.
- No afirmar que el sistema es seguro solo porque no aparezcan hallazgos en la revisión acotada.
- Si se encuentra un problema, documentar evidencia segura y proponer una issue de corrección separada; no ampliar esta unidad para implementarlo.

## Fases

### F1 — Revisar la superficie de seguridad y documentar hallazgos (`CLOSED — evidencia lista; verificación FINAL pendiente`)

- **Pregunta:** ¿la revisión acotada identifica fallos demostrables en los controles de entrada, autorización de acciones, aislamiento de datos o dependencias del cliente/servidor?
- **Cierre:** cada punto del alcance queda etiquetado `PASS`, `FINDING` o `NOT_CHECKED`, con evidencia suficiente; los hallazgos tienen severidad (Crítico/Alto/Medio/Bajo/Informativo), impacto y reproducción segura local/estática; se registran limitaciones y recomendaciones; el Verifier independiente intenta refutar la conclusión principal y emite `PASS`, `FAIL` o `BLOCKED`.
- **Commit:** `COMMIT_REQUIRED` para el informe, handoff actualizado y evento `phase_verdict` de F1 en esta bitácora. Mensaje sugerido: `docs(security): issue 3 F1 CLOSED report`.
- **Veredicto:** avanzar a revisión final si el reporte y la evidencia cubren el alcance; bloquear si faltan evidencias críticas o no se puede distinguir una limitación del entorno de un resultado negativo.
- No se requieren cambios de producto ni validación del servicio desplegado.

## Estado y siguiente dueño

F1 tiene evidencia y reporte para revisión independiente en `docs/plans/active/report_issue_3_quick_security_check_F1.md`. La issue remota #3 permanece abierta y asignada a `pronficilio`. El siguiente dueño es un Verifier independiente, quien debe intentar refutar los hallazgos principales y emitir `PASS`, `FAIL` o `BLOCKED`; no implementar fixes ni integrar en esta unidad.
