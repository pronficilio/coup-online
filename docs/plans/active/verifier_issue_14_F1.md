# Issue #14 — informe PHASE independiente F1

**Veredicto:** FAIL.
**Revisión:** commit f9de90f (implementación 608089d y sincronización documental).
**Branch:** issue/14-codex-ai-players; worktree .worktrees/issue-14-codex-ai-players.
**Cambios del Verifier:** ninguno.

## Hallazgos que refutan F1

1. **Asesinato permite evitar la segunda pérdida de influencia tras un desafío fallido.** Cuando el objetivo desafía la afirmación Assassin y pierde, server/game/coup.js:471 pierde una influencia y luego llama afterActionClaim; esa función vuelve a abrir la ventana de bloqueo (líneas 482–513). Si el objetivo conserva Contessa, puede bloquear y evitar la pérdida que debe causar la Asesinación. La regla de doble peligro está en docs/coup_transcription.md:179–182 y docs/coup_llm_summary.md:53. El Verifier reprodujo que, después de perder una influencia, el objetivo todavía recibe block:contessa. La prueba existente server/test/coup.test.js:189–220 cubre un objetivo que pasa el desafío y el bloqueo; falta cubrir que el propio objetivo desafíe y pierda.

2. **Exchange aumenta influencias cuando el jugador solo tiene una.** server/game/coup.js:652–684 genera opciones para conservar siempre dos cartas y asigna la pareja a player.influences. Con una influencia previa, el jugador sale con dos, contrario a la regla de reemplazar sus cartas ocultas mediante Exchange (docs/coup_transcription.md:100–102). El Verifier reprodujo que el conteo sube de uno a dos. La suite no contiene una prueba de Exchange.

## Validación independiente

- npm test en server/: pasa.
- node test/coup.test.js: pasan sus 12 pruebas; node test/lobby.test.js: pasa su prueba.
- node --check y git diff --check: pasan.
- El build y los tests React no se pudieron ejecutar porque falta react-scripts.
- No se hizo partida en vivo ni se inició Codex.

El resto de criterios revisados —roster, socket/actor, payload exacto, proyecciones privadas, prioridad fija, timeout/pausa/reanudación y setup— no produjo otra refutación material. Corregir ambos hallazgos y añadir cobertura antes de repetir PHASE.
