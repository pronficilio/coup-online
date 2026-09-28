# Handoff Para Agente Ejecutor

**Issue/Ticket:** [#46 — Disolver la partida si se desconecta un jugador activo durante una pausa](https://github.com/pronficilio/coup-online/issues/46), `OPEN`.
**Plan:** `docs/plans/paused-disconnect/plan_paused_disconnect.md`.
**Estado del plan:** `ACTIVE`; F1–F2 `CLOSED (PASS)`, F3 `ACTIVE`.
**Modo de ejecución:** `FULL`.
**Nivel de riesgo:** `HIGH` (transición concurrente de estado de partida y desconexión).
**Política de verificación:** `FINAL` independiente; Verifier requerido en F3.
**Verifier requerido ahora:** sí; revisión FINAL independiente de F3 antes de entregar al Orquestador.
**Pregunta de falsificación:** ¿alguna intercalación disconnect/timeout/resume/respuesta tardía deja un overlay eterno, bloquea continuar tras desconexión de eliminado o reactiva una partida disuelta?
**Fase sugerida:** F3 — revisión FINAL independiente.
**Por qué esta fase sigue:** implementación F2 cerrada con revisión estática; el nivel HIGH exige refutar carreras/eventos obsoletos antes de entregar integración.

## Fuentes y alcance

- Plan canónico: `docs/plans/paused-disconnect/plan_paused_disconnect.md`.
- Código inicial: `server/game/coup.js`, `server/game/lobby.js`, `server/index.js`, `coup-client/src/components/game/Coup.js`, `coup-client/src/i18n/translations.json`.
- Criterio operativo: participante vivo desconectado en `running` o `paused` termina la partida de forma terminal y visible; jugador eliminado desconectado se ignora y no bloquea `resume()`; no crear reconexión/transferencia de identidad.
- La issue #26 permanece como decisión previa sobre ownership de pausa; no cambiar quién puede reanudar.

## Criterios de aceptación

Aplicar y evidenciar los criterios 1–8 del plan. La pantalla/estado terminal debe salir de pausa sin requerir recarga y comunicarse también a espectadores. El resultado normal de `gameover` conserva prioridad si ya fue declarado.

## F1 cerrada

La matriz de fases y asientos, rutas de eventos, ciclo de vida de namespace y contrato de terminación quedan documentados en `docs/plans/paused-disconnect/report_issue_46_F1.md` y en la sección F1 del plan canónico.

## F2 cerrada

La terminación visible y la continuidad de asientos eliminados están implementadas y revisadas estáticamente. Evidencia: `docs/plans/paused-disconnect/report_issue_46_F2.md`. F3 requiere Verifier independiente.

## Subtareas listas

1. F3: Verifier independiente revisa diff e intenta falsificar la pregunta del plan con intercalaciones y eventos obsoletos.

## Riesgos, evidencia y validación

- No asumir que el broadcast de namespace sobrevive a `cleanup()`. Verificar orden evento/desconexión/limpieza.
- No usar `g-gameOver` si implica ganador o revancha autorizada; proponer estado terminal explícito con motivo de disolución.
- Evidencia mínima: referencias a guardias de estado, invalidación de trabajo pendiente, consumidor del evento terminal, ruta visual sin reload y tabla de matriz. Distinguir estático/dinámico.
- No añadir ni ejecutar pruebas automatizadas. No declarar walkthrough dinámico si no se realizó.
- Verifier F3 busca: race resume contra disconnect, disconnect repetido, Codex tardío, desconexión muerta con pausa recuperable, espectadores y gameover ya anunciado.

## Topología y operación

- **Branch destino del issue:** `issue/46-paused-disconnect`.
- **Worktree destino del issue:** `.worktrees/issue-46-paused-disconnect`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **Bitácora del issue:** `docs/plans/log/issue-46.jsonl`.
- **PR/MR esperado:** una PR hacia `master`, asociada únicamente a #46.
- **Secuencia obligatoria:** registrar reclamo en el issue del fork y releer; confirmar branch/worktree existentes; crear/usar el aislamiento canónico; mover este handoff `inbox/` → `active/` solo al reclamar; registrar `claim` y `worktree_confirmed`; commits de cierre por fase.
- **Política de commits:** `COMMIT_REQUIRED` por fase; mensajes previstos en el plan.
- **Qué actualizar:** issue, plan, bitácora y handoff al pasar a `active/`; reportes F1–F3; preservar la rama base y otros worktrees.
- **Delegación:** delegar subtareas ordinarias según la jerarquía/política de agentes del proyecto; si no existe, realizar el trabajo sin inventar roles.
