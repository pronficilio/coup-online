# Handoff para Agente Ejecutor

- **Issue:** https://github.com/pronficilio/coup-online/issues/13
- **Plan:** `docs/plans/active/issue_13_hetzner_deployment.md`
- **Estado:** `WAITING_USER`; inventario F0 cerrado; F1 espera fijar el commit/tag de release.
- **Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL`.
- **Verifier requerido ahora:** no; requerido de forma independiente en F5 antes de integrar/cerrar.
- **Pregunta de falsificación:** ¿puede una petición al hostname nuevo alterar el enrutamiento/certificado existente o impedir el upgrade de Socket.IO?
- **Fase sugerida:** F1 — fijar SHA/tag reproducible, una vez que el usuario elija el código que desea publicar.
- **Por qué sigue:** hay 67 cambios locales, `HEAD=1e4685f` diverge de `origin/master=64593af` (2 adelante, 16 detrás) y no hay versión aprobada para producción.
- **Fuentes:** el plan de arriba, issue #13, README, `server/index.js`, `CreateGame.js`, `JoinGame.js`, inventario remoto en el plan.
- **Subtareas listas para delegación:**
  1. Después de la decisión de release, construir/testear exactamente ese SHA y registrar artefacto/hash.
  2. Preparar Compose aislado (sin publicar 80/443), cliente same-origin, CORS acotado y health/rollback.
  3. Desplegar bajo ruta dedicada en Hetzner y probar vía SSH tunnel.
  4. Tras compra/configuración DNS, añadir un vhost acotado y TLS, preservando Mochila/Minecraft.
- **Criterios de aceptación:** ver el plan, issue #13.
- **Evidencia requerida:** SHA de release, resultado de build, pruebas API/Socket.IO, estado de servicios previos antes/después, comprobación post-restart, evidencia HTTPS/WebSocket cuando haya dominio, rollback.
- **Riesgos/bloqueos:** proxy compartido; no domain aún; release no fijado; CORS actual abierto.
- **Política de commits:** `COMMIT_AFTER_REVIEW` en F1/F3/F4; `COMMIT_REQUIRED` en F2/F5. Un solo branch/worktree/PR para el issue.
- **Branch destino:** `issue/13-hetzner-deployment`.
- **Worktree destino:** `.worktrees/issue-13-hetzner-deployment`.
- **Merge target:** `master`.
- **Bitácora:** `docs/plans/log/issue-13.jsonl` (append-only).
- **PR esperado:** un PR `issue/13-hetzner-deployment` → `master`, después de completar fases y verificación.
- **Secuencia de aislamiento:** reclamar en issue; volver a leer issue y descartar reclamo incompatible; usar el branch/worktree canónico ya preparado; registrar claim/worktree en log; commits de fase siempre en el mismo branch.
- **Validaciones esperadas:** SHA/checkout limpio; build; curl API; handshake HTTP y WebSocket de Socket.IO; recreación/reinicio de Compose; probar host viejo y nuevo en Nginx; validar certificados y rollback.
- **Verifier:** en F5, intentar refutar aislamiento, CORS/rutas, WebSocket, TLS, coexistencia y rollback; solo reporta evidencia y no modifica la implementación.
- **Qué actualizar:** issue, plan, log, handoff y manifiesto de evidencia por fase; no guardar secretos ni modificar la configuración live sin copia y ruta de rollback.
