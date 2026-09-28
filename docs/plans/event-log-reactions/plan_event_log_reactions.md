# Plan — Registro de eventos y reacciones (#40)

**Estado:** `ACTIVE`; F1–F3 `CLOSED / PASS`; F4 `ACTIVE`; issue `OPEN`, asignada a `pronficilio`.

**Issue canónico:** https://github.com/pronficilio/coup-online/issues/40
**Handoff:** `docs/plans/active/issue_40_event_log_reactions.md`
**Bitácora:** `docs/plans/log/issue-40.jsonl`
**Modo / riesgo / verificación:** `FULL` / `HIGH` / `FINAL`.
**Branch / worktree:** `issue/40-event-log-reactions` / `.worktrees/issue-40-event-log-reactions`.
**Base / destino:** `origin/master` (`0a467c10a8d2c6c1b57eff5911c682aab9362ebf`) / `master` de `pronficilio/coup-online`.
**Integración:** una PR para el issue completo; aún no existe.

## Solicitud y resultado esperado

Rediseñar el registro de partida para conservar cada tipo de evento actual, comunicar resultados reales y omitir horas. Añadir reacciones contextuales con conteos, una reacción como máximo por participante y evento, y globos de presencia efímeros al lado del nombre de quien reaccionó. El usuario aprobó la dirección detallada en el issue #40.

El issue #40 es la fuente canónica de los doce criterios de aceptación, catálogo de reacciones, categorías de eventos, reglas de privacidad y comportamiento visual. No se debe recortar ni reinterpretar su alcance para facilitar la implementación.

## Estado observado

- `server/game/coup.js` emite mensajes de texto por `g-addLog`; el cliente los guarda como strings en `Coup.js` y los presenta en `EventLog.js`.
- Las traducciones actuales están en `coup-client/src/i18n/translations.json`; el tablero expone nombre, monedas y asiento en `PlayerBoard.js`.
- Los PNG de `fotos/` son referencias locales excluidas de Git y pueden faltar en este worktree. No importarlos ni agregarlos al PR sin validar disponibilidad y optimizar los derivados.
- La issue #24 se cerró al fusionarse la PR #41 (`2160ada`); su rail y sus estilos ya están en `origin/master`. Esta rama se rebasó sobre `f900c09` antes de F2 y sobre `0a467c1` tras F3, que incluye el cierre de #46. Preservar ambos cambios y mantener el CSS del registro en `EventLogStyles.css`.
- El Orquestador creó este branch/worktree a petición explícita del usuario, antes del reclamo del Alquimista. El Alquimista debe volver a leer issue/PR/branch, confirmar que no hay reclamo incompatible y registrar su propio `claim` remoto antes de cambios de producto.

## Decisiones aprobadas

- No renderizar hora, timestamp ni hueco reservado para hora; usar separación discreta por turno.
- Conservar acciones, desafíos, bloqueos, afirmaciones probadas/fallidas, pérdidas de influencia y eliminaciones; agregar resultados de ingreso, ayuda extranjera, impuesto, robo y resolución de intercambio con valores reales.
- No revelar cartas privadas de intercambio ni publicar el vínculo permanente participante→reacción. Los conteos públicos contienen solo totales; la selección propia se confirma al cliente de ese asiento.
- El servidor deriva la identidad desde el socket, valida evento y catálogo contextual, y conserva un resultado canónico frente a emisiones simultáneas.
- Selección propia: reemplazar al escoger otra reacción; quitar al pulsar la propia; clic en grupo existente para sumarse directamente. Conteos y selecciones viven en memoria durante la partida y se limpian al rematch.
- El globo se difunde como presencia efímera. Máximo uno por asiento; una acción siguiente lo reemplaza y reinicia la expiración (~3,5 s). Globos de distintos asientos pueden coexistir.
- Sin reacciones automáticas de IA y sin emisión de reacciones por espectadores. Sin avatares ni listas de participantes por grupo.
- Movimiento breve y reducido cuando corresponda, accesibilidad de teclado/touch, soporte móvil y sin saltos de layout ni scroll forzado por reacciones.

## Fases

### F1 — Contrato público y autoridad del servidor

**Pregunta única:** ¿Puede el servidor identificar eventos públicos y mantener reacciones válidas, únicas por asiento/evento y libres de datos privados?

- **Entrada:** issue #40, mensajes `addLog`, flujo de resolución de acciones, sockets y modelos de juego.
- **Áreas:** `server/game/coup.js`, `server/test/coup.test.js` y otros tests server estrictamente necesarios, `server/i18n.js` si hace falta el contrato localizado, este plan/handoff/bitácora. No tocar UI todavía.
- **Trabajo:** definir envelope tipado con ID único por partida, tipo/turno y campos públicos mínimos; registrar resultados reales sin duplicar bloqueos/pérdidas; conservar privacidad de Exchange; mantener historial/estado de reacción en memoria; validar seat/evento/reacción del lado servidor; emitir totales, selección propia y presencia efímera según issue.
- **Checkpoint/reporte:** `docs/plans/event-log-reactions/checkpoint_issue_40_F1.md` y `docs/plans/event-log-reactions/report_issue_40_F1.md` registran contrato, implementación y evidencia. Las verificaciones F1 requeridas pasan; la suite completa tiene cuatro fallos preexistentes en pausa/reanudación, descritos para revisión del Orquestador.
- **Salida/evidencia:** contrato y código revisables, verificaciones aplicables y nota breve de privacidad/concurrencia.
- **Avance:** el servidor rechaza emisor, evento o reacción inválidos; repetir/reordenar emisiones mantiene una sola selección por asiento/evento y conteos exactos; rematch limpia el estado; payloads públicos no incluyen datos ocultos.
- **Pivotar:** si el protocolo actual no permite identidad inequívoca por socket o el modelo no puede arbitrar selección de forma segura, detenerse y devolver una propuesta de contrato al Orquestador.
- **Repetir:** solo ante fallo determinista de validación/concurrencia, una corrección acotada y repetición del mismo escenario.
- **Bloquear/cancelar:** bloquear si no puede probarse la identidad autoritativa o evitar filtraciones; cancelar solo si el usuario retira la función.
- **Commit:** `feat(event-reactions): issue 40 F1 CLOSED advance_f2` (`COMMIT_REQUIRED`).
- **Verifier:** no en esta fase; resultado independiente `FINAL` obligatorio antes de integrar.
- **Revisión del Orquestador:** F1 aprobada. Las cuatro fallas generales son expectativas existentes de pausa/reanudación no modificadas en F1; están registradas para seguimiento de la suite y no bloquean la superficie independiente de F2.
- **Estado de entrega:** F4 `ACTIVE`; F1–F3 `CLOSED / PASS`. #24/PR #41 y #46/PR #48 están integradas en `origin/master@0a467c1`. Preservar el rail, cierre de partida, CSS separado de EventLog y cableado de presencia.

### F2 — Registro y controles de reacción

**Pregunta única:** ¿Puede leerse cada evento y seleccionarse la reacción contextual sin horas ni pérdida de contexto?

- **Entrada:** envelope F1 integrado en el mismo branch y contrato de payload cerrado.
- **Áreas:** `coup-client/src/components/game/EventLog.js`, `EventLogStyles.css`, cableado mínimo en `Coup.js` y traducciones es/en. No se requieren assets raster.
- **Trabajo:** renderizar todos los tipos/resultados, participantes con colores, iconos y grupos por turno; bandeja contextual; conteo/selección propia y click para agregar/reemplazar/quitar; conservar scroll; panel escritorio/móvil.
- **Salida/evidencia:** recorrido de todas las categorías, variantes bloqueadas y robo de 0/1/2 monedas; capturas representativas de escritorio/móvil.
- **Avance:** cobertura completa, ausencia total de horas, opciones por contexto correctas y estado del cliente consistente con servidor.
- **Pivotar:** recolocar/reducir el panel si cubre asientos o controles; no retirar categorías ni reacciones aprobadas.
- **Repetir:** una repetición por defecto ante un defecto visual reproducible, después de una corrección acotada.
- **Bloquear/cancelar:** bloquear si aparece un conflicto con el rail de #24 ya integrado o si el registro tapa decisiones/asientos sin una recolocación clara.
- **Commit:** `feat(event-log): issue 40 F2 CLOSED advance_f3` (`COMMIT_REQUIRED`).
- **Entrega/revisión:** F2 `CLOSED / PASS`. El reporte `docs/plans/event-log-reactions/report_issue_40_F2.md` registra el build, los avisos existentes fuera del diff, el recorrido con las nueve categorías y los resultados ingreso/ayuda/impuesto/bloqueo/robo 0–2/intercambio. Las capturas de escritorio, bandeja y móvil están en `evidence_issue_40_F2/`.
- **Estado de entrega:** F2 fue aprobada por el Orquestador; F3 inicia en el mismo branch. F2 no incluyó cambios de PlayerBoard ni globos de presencia.

### F3 — Globos efímeros y acabado accesible

**Pregunta única:** ¿Puede verse quién acaba de reaccionar, por poco tiempo, sin enlazar permanentemente a esa persona con una reacción del log?

- **Entrada:** emisión de presencia F1 y asientos/render F2.
- **Áreas:** encabezados/asientos de `PlayerBoard`, estilos y componente de globo; traducciones/atributos accesibles necesarios.
- **Trabajo:** un globo por asiento junto al nombre y opuesto a monedas; orientar hacia interior en bordes; reemplazar/reiniciar timer del mismo asiento; coexistencia entre asientos; movimiento reducido y navegación accesible.
- **Salida/evidencia:** escenarios de reacciones sucesivas en un asiento, concurrencia entre asientos, expiración, retiro y bordes con 2–6 jugadores; capturas compactas.
- **Avance:** globo transitorio correcto, conteo sin atribución individual persistente, sin recorte, timers limpios y layouts estables.
- **Pivotar:** cambiar orientación/anclaje si tapa el nombre, saldo o viewport; no mostrar relación con una fila concreta.
- **Repetir:** repetir una vez tras corregir un fallo visual o de temporizador reproducible.
- **Bloquear/cancelar:** bloquear si hace falta identificar globalmente el evento en el globo o alterar privacidad aprobada.
- **Commit:** `feat(reaction-bubbles): issue 40 F3 CLOSED advance_f4` (`COMMIT_REQUIRED`).
- **Entrega/revisión:** F3 `CLOSED / PASS`, incluida la corrección AC9 de opacidad/escala detectada durante F4. El build posterior al rebase y la corrección pasó; quedan documentados los avisos preexistentes y de #46. Reporte y recorrido visual: `docs/plans/event-log-reactions/report_issue_40_F3.md`, `evidence_issue_40_F3/`. F4 falsifica las secuencias de reemplazo, retiro y caducidad en el flujo completo.

### F4 — Falsificación y entrega

**Estado:** `ACTIVE`; F3 `CLOSED / PASS` tras corregir la escala requerida por AC9. El Verifier realiza la revisión estática independiente antes del veredicto final.

**Pregunta única:** ¿Puede una ruta cliente o secuencia concurrente refutar unicidad, conteos, privacidad, caducidad o presentación sin horas?

- **Entrada:** F1–F3 cerradas en el mismo branch.
- **Trabajo/evidencia:** build y verificaciones pertinentes, revisión visual/funcional de escritorio y móvil, resultados de escenarios críticos y evidencia para AC1–AC12.
- **Verifier:** revisión independiente `FINAL`, sin modificar la implementación. Debe intentar refutar unicidad bajo concurrencia, exactitud de agregados, privacidad, borde/temporizador y ausencia de horas.
- **Avance:** evidencia cubre todos los criterios y Verifier da `PASS`; dejar PR única lista para revisión del Orquestador.
- **Repetir:** si hay un defecto, regresar a la fase dueña del criterio, corregir en el mismo branch y repetir solo la evidencia afectada más el checkpoint Verifier.
- **Bloquear/cancelar:** no integrar ante `FAIL`/`BLOCKED` no resuelto ni relajar criterios; cancelar solo por decisión explícita del propietario.
- **Commit:** `docs(event-reactions): issue 40 F4 CLOSED ready_review` (`COMMIT_REQUIRED`).

## Contrato de integración y control

- Mantener un único branch, worktree y PR hacia `master`; no crear aislamiento por fase.
- Commit de control inicial: `chore(event-reactions): issue 40 setup control`, con plan, handoff, log y actualización del índice.
- Cada fase con artefactos persistentes termina en commit que contiene reporte/actualización de fase y evento JSONL de veredicto.
- El Alquimista debe seguir `docs/agentes/ALQUIMISTA.md`, reclamar/releer issue #40 y verificar este worktree antes de trabajo técnico. No tocar `master` ni el checkout raíz.
- No declarar la unidad completa ni integrar/cerrar: entregar al Orquestador para revisión independiente de la integración.

## Historial de decisiones

- 2026-09-27/28: el propietario aprobó en conversación el diseño del registro sin horas, resultados explícitos de acciones, reacciones contextuales, conteos Telegram y globos de identidad transitorios.
- 2026-09-28: el propietario pidió crear el branch/worktree e invocar Alquimista. El worktree se creó desde el `origin/master` remoto verificado, después de confirmar issue abierta/asignada y ausencia de branch/PR duplicados.
