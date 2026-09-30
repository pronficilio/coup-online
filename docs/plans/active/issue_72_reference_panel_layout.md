# Handoff Para Agente Ejecutor

**Issue/Ticket:** https://github.com/pronficilio/coup-online/issues/72 (OPEN)
**PR canónica:** https://github.com/pronficilio/coup-online/pull/74 (OPEN, DRAFT; base `master`)
**Plan:** `docs/plans/reference-panel-layout/plan_reference_panel_layout.md`
**Bitácora:** `docs/plans/log/issue-72.jsonl`
**Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED (PASS limitado a atribución estática + evidencia desktop previa)`; F2 `CLOSED (build + cota estática; walkthrough pendiente)`; F3 `IN_PROGRESS_VERIFIER` sobre el hash corregido.
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL` independiente en F3.
**Verifier requerido ahora:** sí; el `PASS_LIMITED` anterior no cubre la estructura y geometría corregidas. También falta el walkthrough/DOM del propietario antes de cerrar la unidad.
**Pregunta de falsificación:** ¿alguna combinación de ancho/alto y jugadores deja espacio de flujo por los transforms, triggers estáticos bajo 1200 px, solapamiento con contenido o acceso perdido a un trigger?

## Estado de fases

- F1 está documentada en `docs/plans/reference-panel-layout/report_issue_72_F1.md`. Reutiliza la medición desktop de #44 y evalúa aritméticamente las expresiones CSS por breakpoint. No hay navegador local ni rectángulos dinámicos <1200 px; no se afirman métricas de DOM para esos tamaños.
- F2 mueve el `margin-top` del wrapper por ambos offsets y elimina el transform del hijo. `ReferencePanel` queda anclado al section observer: usa el ancho de la fila propia y comparte su borde inferior. El dock narrow adapta targets y mantiene foco visible dentro del botón; bajo 521 px se oculta solo el tooltip visual y el primer tooltip se limita al viewport hasta 600 px. El reporte F2 documenta fórmulas y límites; el antiguo `PASS_LIMITED` de F3 corresponde a la geometría precedente y debe revalidarse.

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
7. F3 independiente sobre `5e3369f8de047f3883d116333ab8c9bfa3d9e609`: `PASS_LIMITED` estático para los anchos evaluados ≥263 px. Sin navegador, rectángulos DOM ni aprobación visual; se solicita walkthrough del propietario antes del cierre.
8. PR canónica #74 abierta en draft contra `master`; issue actualizado con el veredicto y checklist de walkthrough: https://github.com/pronficilio/coup-online/issues/72#issuecomment-5903217562. Issue sigue `OPEN`/unidad `WAITING_USER` hasta esa comprobación.
9. Preview del propietario pidió corregir el top de flujo del wrapper y mover el rail a la derecha de la fila propia, alineando abajo. El diff actual retira el transform del hijo, traslada margin-top por los offsets base/5p, y ancla panel/row dentro del asiento observer. El F3 previo queda supersedido para este hash; requiere revalidación estática. No hay browser/DOMRects locales ni walkthrough visual.

## Criterios de aceptación

Los criterios completos están en el plan y en la issue #72. En particular: máximo 16 px de espacio final tras el contenido pintado del tablero; referencias laterales alineadas a cartas cuando quepan; sin altura extra bajo 1200 px; controles operables y sin tapar Event Log, cartas, decisiones ni safe areas.

## Evidencia y validaciones esperadas

- F1: `docs/plans/reference-panel-layout/report_issue_72_F1.md` con geometría/causas por breakpoint.
- F2: `docs/plans/reference-panel-layout/report_issue_72_F2.md`; build del cliente, `git diff --check`, visual walkthrough en 2, 3, 5 y 6 jugadores en desktop y móvil o límites reproducibles documentados.
- F3: `docs/plans/reference-panel-layout/report_issue_72_F3_verifier.md` independiente; resultado `PASS_LIMITED` estático, walkthrough del propietario pendiente.
- No agregar ni ejecutar pruebas automatizadas. No declarar aprobación visual si solo hay revisión estática.

## Topología y commits

- Una sola branch: `issue/72-reference-panel-layout`.
- Un solo worktree: `.worktrees/issue-72-reference-panel-layout`.
- Target: `master` del fork `pronficilio/coup-online`; PR canónica #74 en draft.
- Cada fase con cambios/evidencia persistente requiere commit. Mensajes previstos: `docs(plans): close issue 72 F1 layout diagnosis`; `fix(game-ui): reclaim space under board and dock reference controls`; `docs(plans): record issue 72 final verification`.
- No editar upstream ni crear una segunda integración para la fase.

## Riesgos y bloqueo

Riesgo medio: el dock se ubica ahora respecto a la caja real del asiento observer; la fórmula compacta deja ≥5 px a la derecha desde 259 px, pero F3 debe revalidar el hash corregido y el entorno no certifica sombras, tooltips con idiomas largos, stacking/colisiones en 5/6p, Event Log/decisiones ni `scrollHeight` ≤16 px. El walkthrough/DOM del propietario sigue pendiente. Bajo 259 px el ancho mínimo de targets no conserva el margen estático.

## Actualizaciones del ejecutor

Actualizar plan, issue y bitácora tras cada veredicto. F1 termina en `avanzar`, `pivotar`, `repetir con variante acotada`, `bloquear` o `cancelar`. Entregar al Orquestador al cerrar F2; no abrir PR, hacer merge ni cerrar issue por cuenta propia.
