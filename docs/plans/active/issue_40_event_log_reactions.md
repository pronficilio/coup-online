# Handoff activo — issue #40

**Issue:** https://github.com/pronficilio/coup-online/issues/40
**Plan exacto:** `docs/plans/event-log-reactions/plan_event_log_reactions.md`
**Bitácora exacta:** `docs/plans/log/issue-40.jsonl`
**Estado del plan:** `ACTIVE`; F1–F3 `CLOSED / PASS`; F4 `ACTIVE`, segundo veredicto independiente pendiente tras el primer `FAIL`.
**Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL`
**Verifier requerido ahora:** sí; revisión independiente `FINAL`, de solo lectura, antes de preparar la PR.
**Pregunta de falsificación:** ¿alguna secuencia de cliente rompe los doce criterios de aceptación, filtra una carta o vínculo persistente jugador→evento/reacción, duplica conteos o deja globos/timers obsoletos?
**Checkpoint F1:** `docs/plans/event-log-reactions/checkpoint_issue_40_F1.md` — F1 aprobada por el Orquestador; la suite general conserva cuatro fallos de expectativas antiguas de pausa/reanudación, fuera del alcance F1.
**Reporte F1:** `docs/plans/event-log-reactions/report_issue_40_F1.md`.
**Branch destino:** `issue/40-event-log-reactions`
**Worktree destino:** `/mnt/e/dev/coup/.worktrees/issue-40-event-log-reactions`
**Merge target:** `master` de `pronficilio/coup-online`
**PR esperada:** una PR desde el branch canónico a `master`; todavía no existe.

## Fase activa: F4 — Falsificación y entrega

F1–F3 están cerradas con `PASS`. La primera revisión independiente F4 dio `FAIL` en AC7: `Coup` no pasaba `reactionPresence` a `PlayerBoard`; AC8 no podía mostrarse y faltaba evidencia funcional AC12. F3 se reabrió y corrigió el cableado, los objetivos táctiles y el recorrido integrado. El build pasó con avisos preexistentes. Chromium confirmó reemplazo y reset del timer, concurrencia, retiro, expiración, movimiento reducido, botones móviles de 44×44 px y layouts de 2–6 asientos en escritorio/móvil. El harness simula eventos de socket en el cliente; no es una partida live multi-cliente. El reporte F3 está en `docs/plans/event-log-reactions/report_issue_40_F3.md`, con evidencia integrada en `evidence_issue_40_F4/`. F4 requiere ahora un segundo veredicto independiente sobre unicidad, agregados, privacidad, temporizadores, ausencia de horas y presentación.

## Dependencia de F1

F1 ya cerró el contrato tipado, los resultados públicos y el estado autoritativo de reacciones que consume el cliente.

## Reclamo, rama y aislamiento

Issue #40 permanece `OPEN` y está asignada a `pronficilio`. El claim inicial quedó publicado y releído en [el issue](https://github.com/pronficilio/coup-online/issues/40#issuecomment-5865134787). El branch único `issue/40-event-log-reactions` se rebasó sobre `origin/master@f900c09` antes de F2, `origin/master@0a467c1` después de F3 y `origin/master@db1d22c` tras el merge de #50, preservando #46 y #49. No se creó otro worktree ni se integró la rama de #24 como dependencia.

F1 se ejecutó directamente en el worktree por falta de delegación disponible en ese contexto. F2 y F3 continúan bajo dirección del Orquestador tras cerrar el hilo del Alquimista que no inició trabajo después de su reanudación.

Comprobaciones iniciales esperadas:

```bash
pwd
git branch --show-current
git worktree list
git status --short --branch
gh issue view 40 --repo pronficilio/coup-online
```

No dupliques ni recrees el branch/worktree. No trabajes desde el checkout raíz ni hagas commit a `master`.

## Documentos fuente

- Issue #40: criterios de aceptación, catálogo, privacidad, comportamiento y fases aprobadas.
- `docs/plans/event-log-reactions/plan_event_log_reactions.md`: plan canónico detallado.
- `docs/agentes/ALQUIMISTA.md` y `docs/agentes/AGENTE_MENOR.md`: contratos de ejecución y delegación.
- `docs/plans/PROJECT_ORCHESTRATION.yaml`: `master`, fork `pronficilio/coup-online`, un issue → un branch/worktree/PR.
- `server/game/coup.js`, `server/i18n.js`, `coup-client/src/components/game/EventLog.js`, `Coup.js`, `PlayerBoard.js`, sus hojas de estilo y `coup-client/src/i18n/translations.json`.
- Issue #24 se cerró con PR #41 y su rail quedó integrado en `origin/master@f900c09`; F2 parte de esa versión y conserva sus cambios.
- Los archivos `fotos/` son referencias locales opcionales y pueden faltar en el worktree. No añadir sus PNG directamente al PR por inferencia.

## F2 cerrada — Registro y controles de reacción

F2 implementó los criterios del plan, compiló y capturó el recorrido de las nueve categorías en escritorio/móvil, la bandeja contextual y resultados de ingreso, ayuda, impuesto, bloqueo, robo de 0/1/2 monedas e intercambio. Ver `docs/plans/event-log-reactions/report_issue_40_F2.md` y `docs/plans/event-log-reactions/evidence_issue_40_F2/`.

## Alcance F1 (cerrado)

Permitidos: `server/game/coup.js`, `server/test/coup.test.js` y tests server estrictamente necesarios, `server/i18n.js` si el contrato lo exige, más este plan/handoff/bitácora y reporte F1.

Reservados para fases posteriores: cliente, CSS, assets, dependencias y diccionario cliente. No cambies reglas de Coup, decisiones, validación de acciones existente ni proveedores de IA.

## Alcance F2 cerrado

Cambios entregados: `coup-client/src/components/game/EventLog.js`, `EventLogStyles.css`, montaje mínimo en `Coup.js`, `coup-client/src/i18n/translations.json`, reporte, capturas y bitácora. El rail de acciones integrado se conservó intacto.

## Criterios y cierre F1

- Cumplir íntegramente pregunta, avance, pivote, repetición acotada y bloqueo escritos en F1 del plan; no reducir AC del issue.
- Cerrar los pendientes del checkpoint F1 antes de añadir `phase_verdict`.
- Evidencia mínima: esquema/revisión del payload, archivos de servidor modificados, resultados verificables de las validaciones aplicables, y refutación de privacidad/concurrencia.
- Cerrar solo con un commit que incluya cambios F1, reporte breve y evento `phase_verdict` en el log.
- Commit: `feat(event-reactions): issue 40 F1 CLOSED advance_f2`.
- Después, mantener issue/plan/handoff en estado real y detenerse en `WAITING_ORCHESTRATOR` para revisión del Orquestador antes de entrar a F2.

## Entrega de F1 y autorización de F2

El Orquestador aprobó F1. Se completaron las pruebas específicas de payload, elegibilidad, catálogos, idempotencia/reemplazo/toggle, agregados, montos, Exchange, snapshots y reset. Sintaxis y whitespace pasan. La suite completa da 43/47: cuatro expectativas existentes de pausa/reanudación no corresponden a las rutas base vigentes; se registraron para seguimiento y no bloquearon F2.

## Criterios de cierre F2

- Todos los nueve tipos de evento y resultados aprobados aparecen con datos reales, participantes coloreados y sin horas.
- Bandeja contextual coincide con `event.reactions`; conteos, selección propia, clic directo, reemplazo y retiro se reconcilian con el servidor.
- El snapshot recupera historial/selección y las actualizaciones de conteo no fuerzan scroll.
- Panel legible y accesible en escritorio/móvil; no duplica ni altera el rail de acciones #24.
- F2 cerró con build cliente PASS, recorrido visual en Chromium sin errores de página, cinco capturas comprimidas y el commit `feat(event-log): issue 40 F2 CLOSED advance_f3`. El build conserva avisos en `App.js` y `ReferencePanel.css`, fuera del diff F2.

## Cierre F3

`Coup.js` pasa `reactionPresence` al `PlayerBoard` real. La presencia pública por asiento tiene como máximo un globo efímero, sin `eventId` ni asociación persistente. Reemplazo con timer reiniciado, retiro, expiración, limpieza de listeners/timers, traducciones y `prefers-reduced-motion` están implementados. El build pasó; el recorrido integrado cubrió temporizadores, dos asientos simultáneos, targets móviles de 44×44 px y layouts desktop/móvil para 2–6 jugadores.

## Alcance activo F4

Revisión independiente de solo lectura frente a issue #40 y su plan aprobado. Falsificar concurrencia/unicidad, agregados, reacciones propias, privacidad, presencia/timers, traducciones, ausencia de horas, legibilidad móvil y regresiones del rail #24. Devolver `PASS`, `FAIL` o `BLOCKED` con criterios cubiertos, comandos/evidencia y defectos reproducibles; no modificar la implementación.

## Política para todo el issue

- Commits de fase dentro del branch único; no crear ramas/worktrees por fase.
- Build cliente, pruebas aplicables, revisión manual y evidencia final según issue #40; Verifier independiente `FINAL` antes de integración.
- El Alquimista no integra a `master`, no cierra issue #40 y no aprueba su propia integración.
