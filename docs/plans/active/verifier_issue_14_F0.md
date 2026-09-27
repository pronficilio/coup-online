# Verifier PHASE — Issue #14 F0

Fecha: 2026-09-26

Commit revisado: `b189cc0` (`issue/14-codex-ai-players`)

Veredicto: **PASS**

## Alcance

Revisión independiente estática del contrato `docs/plans/codex-ai-players/f0_contract.md`, las cuatro fuentes de reglas versionadas, el reporte y el veredicto final de Issue #3, y los eventos Socket.IO actuales. No se modificaron archivos ni se ejecutaron pruebas, partidas o llamadas a Codex.

## Hallazgos

- El contrato conserva el acceso/lobby actual y no agrega cuentas ni invitaciones. Explica que el vínculo temporal socket→asiento valida qué asiento puede actuar, pero no autentica a una persona. Define la derivación de actor del socket asociado y la separación entre estado público y mano/opciones privadas por asiento.
- Las respuestas usan `decisionId`, `stateVersion` y `choiceId`; el contrato exige una sola aplicación y el rechazo de decisiones fuera de fase o versión. Las fases de respuesta comparten una ventana; los desafíos/bloqueos concurrentes se resuelven por el orden fijo horario desde quien declaró, sin depender de latencia.
- Timeout, fallo y desconexión llevan a pausa visible, sin convertir silencio en `pass` o avance automático. La palanca solo apaga; invalida decisiones aunque un proceso no termine y solo se rearma por SSH, sin reproducir salidas antiguas.
- La transcripción está identificada como fuente normativa y las tres referencias como derivadas. Las reglas citadas concuerdan; el desempate queda marcado como decisión digital, no como regla impresa. F1 recibe explícitamente las discrepancias de inicio, monedas en partida de dos jugadores y cartas de influencia reveladas.
- El reporte F1 y el veredicto `PASS` de Issue #3 respaldan los riesgos actuales del código. `server/index.js:111–115` acepta inicio/roster del cliente; `server/game/coup.js:52–70, 206–233` toma decisiones del payload sin vincular el actor al socket; `server/game/coup.js:240–242` junto con `server/game/utils.js:75–80` difunde influencias ocultas. Son defectos actuales que F1/F3 deben corregir, no afirmaciones de que el código actual ya cumple el contrato.

## Pregunta de falsificación

No encontré una omisión material que, bajo el contrato, permita a otro socket actuar por un asiento ajeno, filtrar manos rivales o aplicar una respuesta vencida. Si un proceso sigue activo después de apagar Codex, el contrato invalida su ID/versión, pausa las partidas y prohíbe reproducir su resultado; la limitación de no poder matar un proceso no le devuelve autoridad.

## Limitaciones

La revisión verifica el diseño documental contra el código y las fuentes; no demuestra que el motor actual implemente esas garantías. La implementación y su validación pertenecen a F1 y fases posteriores.
