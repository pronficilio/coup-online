# Handoff para Agente Alquimista — issue #40

**Issue:** https://github.com/pronficilio/coup-online/issues/40  
**Plan exacto:** `docs/plans/event-log-reactions/plan_event_log_reactions.md`  
**Bitácora exacta:** `docs/plans/log/issue-40.jsonl`  
**Estado del plan:** `ACTIVE`; F1 `ACTIVE`
**Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL`  
**Verifier requerido ahora:** no; se requiere al final de F4.  
**Pregunta de falsificación:** ¿pueden dos emisiones concurrentes dejar dos reacciones del mismo jugador en un evento, desajustar conteos, revelar vínculo persistente jugador→reacción o exponer una carta oculta?  
**Checkpoint F1:** `docs/plans/event-log-reactions/checkpoint_issue_40_F1.md` — envelope público y primera implementación; F1 sigue activa, validaciones pendientes.
**Branch destino:** `issue/40-event-log-reactions`  
**Worktree destino:** `/mnt/e/dev/coup/.worktrees/issue-40-event-log-reactions`  
**Merge target:** `master` de `pronficilio/coup-online`  
**PR esperada:** una PR desde el branch canónico a `master`; todavía no existe.

## Fase sugerida

**F1 — Contrato público y autoridad del servidor.**  
Pregunta: ¿puede el servidor identificar eventos públicos y mantener reacciones válidas, únicas por asiento/evento y libres de datos privados?

## Por qué sigue F1

El cliente hoy recibe `g-addLog` como string. La UI de reacciones depende de IDs de evento y un estado autoritativo que aún no existe. Cerrar primero el envelope público, los resultados reales, la privacidad de Exchange y la regla de una selección por jugador/evento habilita F2 sin clasificar frases localizadas ni duplicar reglas en el cliente.

## Reclamo, rama y aislamiento

Issue #40 permanece `OPEN` y está asignada a `pronficilio`. El claim del Alquimista quedó publicado y releído en [el issue](https://github.com/pronficilio/coup-online/issues/40#issuecomment-5865134787): branch `issue/40-event-log-reactions`, worktree `/mnt/e/dev/coup/.worktrees/issue-40-event-log-reactions`, target `master`, estado `F1 ACTIVE`. Solo había el handoff del Orquestador; no se encontró claim incompatible ni PR candidata. El aislamiento fue confirmado en el worktree canónico, limpio, en `c44b768` sobre `origin/master@a3d23f3`. La superficie cliente queda intacta; F1 se limita a servidor.

El runtime no expone capacidad de subagentes. Dada la instrucción explícita del propietario de ejecutar F1, el Alquimista continúa directamente y deja esta excepción registrada; no inventará una herramienta de delegación.

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
- Issue #24 sigue abierta y tiene cambios de UI del turno en `Coup.js`/estilos. Relee el estado/diff y coordina antes de editar las mismas superficies; no copies ni reviertas ese trabajo. F1 de servidor puede proceder de manera independiente.
- Los archivos `fotos/` son referencias locales opcionales y pueden faltar en el worktree. No añadir sus PNG directamente al PR por inferencia.

## Subtareas listas para delegación

1. Cerrar contrato de eventos públicos desde `addLog` y puntos de resolución: ID por partida, tipo, turno, actores/destinos públicos, resultado y datos localizables; ninguna identidad privada de Exchange.
2. Implementar estado por partida para conteos por reacción y selección propia; derivar asiento del socket, validar catálogo por tipo/resultado, y soportar reemplazo, toggle/remoción y emisiones simultáneas sin duplicados.
3. Emitir cambios agregados solo con conteos y confirmación privada de la selección propia; emitir presencia efímera con asiento/reacción sin agregar un mapa persistente de identidades al registro.
4. Añadir y revisar verificaciones de servidor para payload inválido, actor no elegible, evento desconocido, concurrencia, toggle/reemplazo y reset de rematch.

Coordina la delegación según la política real de agentes del entorno. Si no hay Agente Menor utilizable, registra esa limitación y sigue el contrato local sin inventar herramientas.

## Alcance de archivos F1

Permitidos: `server/game/coup.js`, `server/test/coup.test.js` y tests server estrictamente necesarios, `server/i18n.js` si el contrato lo exige, más este plan/handoff/bitácora y reporte F1.

Reservados para fases posteriores: cliente, CSS, assets, dependencias y diccionario cliente. No cambies reglas de Coup, decisiones, validación de acciones existente ni proveedores de IA.

## Criterios y cierre F1

- Cumplir íntegramente pregunta, avance, pivote, repetición acotada y bloqueo escritos en F1 del plan; no reducir AC del issue.
- Cerrar los pendientes del checkpoint F1 antes de añadir `phase_verdict`.
- Evidencia mínima: esquema/revisión del payload, archivos de servidor modificados, resultados verificables de las validaciones aplicables, y refutación de privacidad/concurrencia.
- Cerrar solo con un commit que incluya cambios F1, reporte breve y evento `phase_verdict` en el log.
- Commit: `feat(event-reactions): issue 40 F1 CLOSED advance_f2`.
- Después, mantener issue/plan/handoff en estado real y detenerse en `WAITING_ORCHESTRATOR` para revisión del Orquestador antes de entrar a F2.

## Política para todo el issue

- Commits de fase dentro del branch único; no crear ramas/worktrees por fase.
- Build cliente, pruebas aplicables, revisión manual y evidencia final según issue #40; Verifier independiente `FINAL` antes de integración.
- El Alquimista no integra a `master`, no cierra issue #40 y no aprueba su propia integración.
