# Handoff Para Agente Ejecutor

**Issue/Ticket:** https://github.com/pronficilio/coup-online/issues/72 (OPEN)
**Plan:** `docs/plans/reference-panel-layout/plan_reference_panel_layout.md`
**Bitácora:** `docs/plans/log/issue-72.jsonl`
**Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED (PASS limitado a atribución estática + evidencia desktop previa)`; F2 `CLOSED (remediación estática/build; revalidación visual independiente pendiente)`; F3 `IN_PROGRESS_VERIFIER`.
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL` independiente en F3.
**Verifier requerido ahora:** sí; revalidación independiente en curso, sin cerrar F3.
**Pregunta de falsificación:** ¿alguna combinación de ancho/alto y jugadores deja espacio de flujo por los transforms, triggers estáticos bajo 1200 px, solapamiento con contenido o acceso perdido a un trigger?

## Estado de fases

- F1 está documentada en `docs/plans/reference-panel-layout/report_issue_72_F1.md`. Reutiliza la medición desktop de #44 y evalúa aritméticamente las expresiones CSS por breakpoint. No hay navegador local ni rectángulos dinámicos <1200 px; no se afirman métricas de DOM para esos tamaños.
- F2 implementa wrapper compartido, compensa los transforms en flujo y saca triggers del flujo; la revisión F3 compactó a 90×90 px el dock de 361–438 px y añadió targets adaptativos a ≤320 px, manteniendo el margen base de flujo. Reporte y validaciones están en `docs/plans/reference-panel-layout/report_issue_72_F2.md`. F3 debe revalidar estas correcciones y completar el walkthrough; no se declara aprobado visual.

## Documentos fuente

- `docs/plans/reference-panel-layout/plan_reference_panel_layout.md` (plan canónico)
- `docs/plans/player-decisions-layout/report_issue_44_F1.md` (geometría desktop previa)
- `coup-client/src/components/game/PlayerBoardStyles.css`
- `coup-client/src/components/game/ReferencePanel.css`
- `coup-client/src/components/game/Coup.js`
- `docs/plans/log/issue-72.jsonl`

## Registro de ejecución

1. Claim publicado en https://github.com/pronficilio/coup-online/issues/72#issuecomment-5902164311; relectura posterior confirmó `OPEN`, solo comentario propio y sin reclamo incompatible.
2. Worktree limpio en `issue/72-reference-panel-layout`, base `origin/master@ce53c286155c054bc4c50defeb5ec19cc04fd5fb`. El Orquestador reservó branch/worktree durante intake antes del claim; `git ls-remote` falló por DNS y el Orquestador confirmó `master` por GitHub API.
3. Handoff movido de `inbox/` a `active/`; claim, worktree e inicio/cierre de fase están en la bitácora JSONL.
4. F1 cerrada con evidencia estática y medición desktop heredada de #44; no se inventaron métricas dinámicas menores a 1200 px.
5. F2 terminó en este branch/worktree; el reporte documenta el wrapper, las fórmulas del rail, build y `git diff --check`. No se añadieron ni ejecutaron pruebas automatizadas.
6. Entrega a `WAITING_ORCHESTRATOR` para revisión; el Verifier independiente se invoca por separado en F3. No abrir PR, hacer merge ni cerrar issue desde el Ejecutor.

## Criterios de aceptación

Los criterios completos están en el plan y en la issue #72. En particular: máximo 16 px de espacio final tras el contenido pintado del tablero; referencias laterales alineadas a cartas cuando quepan; sin altura extra bajo 1200 px; controles operables y sin tapar Event Log, cartas, decisiones ni safe areas.

## Evidencia y validaciones esperadas

- F1: `docs/plans/reference-panel-layout/report_issue_72_F1.md` con geometría/causas por breakpoint.
- F2: `docs/plans/reference-panel-layout/report_issue_72_F2.md`; build del cliente, `git diff --check`, visual walkthrough en 2, 3, 5 y 6 jugadores en desktop y móvil o límites reproducibles documentados.
- F3: `docs/plans/reference-panel-layout/report_issue_72_F3_verifier.md` independiente.
- No agregar ni ejecutar pruebas automatizadas. No declarar aprobación visual si solo hay revisión estática.

## Topología y commits

- Una sola branch: `issue/72-reference-panel-layout`.
- Un solo worktree: `.worktrees/issue-72-reference-panel-layout`.
- Target: `master` del fork `pronficilio/coup-online`; una PR canónica para #72.
- Cada fase con cambios/evidencia persistente requiere commit. Mensajes previstos: `docs(plans): close issue 72 F1 layout diagnosis`; `fix(game-ui): reclaim space under board and dock reference controls`; `docs(plans): record issue 72 final verification`.
- No editar upstream ni crear una segunda integración para la fase.

## Riesgos y bloqueo

Riesgo medio: el Verifier señaló y F2 compactó la grilla en 361–438 px, bajó el dock estrecho para despejar asientos 6p, ajustó la caja de flujo y suprimió tooltips visuales bajo 521 px. F3 debe revalidar estos cambios, confirmar outline/sombra y separación vertical real en mesas 5/6p (el modelo deja ≈10px a 361px y ≈18px a 300px), revisar aria-labels y el tooltip a 521 px, y comprobar que el alto final de scroll queda a ≤16 px. El cálculo deja 7.5 px de caja horizontal en 300/320 px; bajo 263 px baja de 5 px y luego cruza, rango que no debe aprobarse sin ajuste/validación. No hay navegador local ni captura para validar estas afirmaciones; no se declaran `PASS` visuales.

## Actualizaciones del ejecutor

Actualizar plan, issue y bitácora tras cada veredicto. F1 termina en `avanzar`, `pivotar`, `repetir con variante acotada`, `bloquear` o `cancelar`. Entregar al Orquestador al cerrar F2; no abrir PR, hacer merge ni cerrar issue por cuenta propia.
