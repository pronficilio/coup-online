# Handoff para Agente Ejecutor

- **Issue:** https://github.com/pronficilio/coup-online/issues/13
- **Plan:** `docs/plans/active/issue_13_hetzner_deployment.md`
- **Estado:** `WAITING_USER`; inventario F0 cerrado; F1 espera corregir el registro DNS de `coup.ejele.net`.
- **Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL`.
- **Verifier requerido ahora:** no; requerido de forma independiente en F5 antes de integrar/cerrar.
- **Pregunta de falsificación:** ¿puede una petición al hostname nuevo alterar el enrutamiento/certificado existente o impedir el upgrade de Socket.IO?
- **Fase sugerida:** F1 — cambiar el registro erróneo `A ejele` por `A coup → 178.105.138.91` y verificar la resolución pública, conservando el registro raíz.
- **Por qué sigue:** el servidor resuelve `ejele.ejele.net` a `178.108.138.91` y no encuentra `coup.ejele.net`. La IP Hetzner verificada es `178.105.138.91`. Además, hay 67 cambios locales, `HEAD=1e4685f` diverge de `origin/master=64593af` (2 adelante, 16 detrás) y falta una versión aprobada para producción.
- **Fuentes:** el plan de arriba, issue #13, README, `server/index.js`, `CreateGame.js`, `JoinGame.js`, inventario remoto en el plan.
- **Subtareas listas para delegación:**
  1. Corregir/verificar el A `coup.ejele.net → 178.105.138.91` sin tocar la raíz ni otros nombres.
  2. Tras fijar el release, construir exactamente ese SHA y registrar artefacto/hash.
  3. Preparar Compose aislado (sin publicar 80/443), cliente same-origin, CORS acotado y health/rollback.
  4. Desplegar bajo ruta dedicada en Hetzner y probar vía SSH tunnel.
  5. Añadir un vhost acotado y TLS, preservando Mochila/Minecraft.
- **Criterios de aceptación:** ver el plan, issue #13.
- **Evidencia requerida:** resolución DNS del A, SHA de release, resultado de build, pruebas API/Socket.IO, estado de servicios previos antes/después, comprobación post-restart, evidencia HTTPS/WebSocket, rollback.
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
- **Qué actualizar:** issue, plan, log, handoff y manifiesto de evidencia por fase; no guardar secretos ni modificar la configuración live sin copia y ruta de rollback. El A record puede apuntar antes del despliegue, pero el catch-all actual seguirá respondiendo hasta instalar el vhost.
