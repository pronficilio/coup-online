# Plan — Favicon de moneda durante el turno propio (#42)

**Estado:** `WAITING_ORCHESTRATOR`; F1 `ACTIVE`; issue `OPEN` y asignada a `pronficilio`.
**Issue canónico:** https://github.com/pronficilio/coup-online/issues/42
**Handoff:** `docs/plans/active/issue_42_home_coin_turn_favicon.md`
**Bitácora:** `docs/plans/log/issue-42.jsonl` (append-only).
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
**Branch / worktree:** `issue/42-home-coin-turn-favicon` / `.worktrees/issue-42-home-coin-turn-favicon`.
**Base / destino:** `origin/master@f900c0947a0b27ac9c6e0372e3c1871a883be7e6` al crear el aislamiento / `master` de `pronficilio/coup-online`.
**Integración:** una PR para el issue; todavía no existe.
**Siguiente acción:** reactivar la integración solo después de que F2 de #40 esté cerrada y commiteada y `Coup.js` esté estable; releer entonces el estado real de issue, branch, worktree y diff.

## Solicitud y definición de éxito

Mientras le toca jugar a la persona conectada, animar el favicon de la pestaña con los fotogramas A, B, C, D, E y F, repitiendo A→F→A sin fin. Detener la animación y restaurar el favicon estático cuando deje de ser su turno, se pause/termine la partida o se desmonte la pantalla.

Las seis fuentes locales son `fotos/gif/a-coin.png` hasta `fotos/gif/f-coin.png`. Todas son PNG RGBA de 1254×1254 px; suman 8,283,035 bytes y están fuera de Git por la regla de `fotos/`. El favicon estático existente es un ICO de 16×16 y 32×32 px (3,596 bytes). La portada de la issue #25 sigue usando un GIF estático como asset; esta unidad solo cambia el favicon dentro de la partida.

## Hechos, supuestos y coordinación

- Confirmado en `Coup.js`: los props `name` e `isSpectator`, el estado `currentPlayer`, `gamePaused` y `winner` permiten derivar el turno propio sin cambiar el servidor: `currentPlayer === name`, participante activo, partida no pausada ni terminada.
- Confirmado: el cliente recibe actualizaciones de turno desde el servidor; los controles/reglas no necesitan cambios.
- La issue #25 y PR #27 están completadas. El icono estático puede restaurarse desde su `href` original.
- La issue #40 sigue abierta con F2 `ACTIVE`; su branch/worktree canónico `issue/40-event-log-reactions` está cuatro commits adelante de `origin/master` y tiene modificaciones sin commit en `Coup.js`, `EventLog.js`, estilos, traducciones y documentos. Por decisión del propietario, #42 queda `WAITING_ORCHESTRATOR`; reactivar solo después del cierre/commit de F2 y confirmar que `Coup.js` está estable. Al reanudar, releer el estado real de issue, branch, worktree y diff antes de integrar; no editar concurrentemente.
- La issue #24 se cerró al integrar la PR #41 (`2160ada0`); la nota que la muestra abierta en el handoff de #40 está desactualizada.
- Tras reclamar #42 se actualizó `origin/master` y se creó este branch/worktree canónico desde `f900c0947a0b27ac9c6e0372e3c1871a883be7e6`; no se trabajó en `master` ni en la worktree de otro issue.
- Supuesto: “tu turno” significa que el nombre local coincide con `currentPlayer`; espectadores, juego pausado y juego terminado no animan.

## Alcance y exclusiones

Incluye el componente/efecto cliente que alterna el favicon, su integración con el estado del juego y seis derivados de favicon de 32×32 px con alfa, optimizados para descarga rápida. Preferir una cadencia legible y estable; la secuencia debe conservar el orden de las fuentes.

Excluye cambios al servidor/reglas/protocolo, la moneda de portada, `favicon.ico`, manifest/touch icons, otros recursos, nuevas dependencias de runtime y los originales de `fotos/`.

## Criterios de aceptación

1. El favicon rota A→B→C→D→E→F→A mientras la persona conectada tiene el turno y la partida está activa. No anima para espectadores, durante una pausa ni después de terminar.
2. Los seis derivados son de 32×32 px, conservan transparencia y orden, y suman como máximo 50 KB. Se registran dimensiones y bytes finales.
3. En cambio de turno/estado, desmontaje o salida, se limpia el timer y se restaura el favicon inicial. No hay animación residual ni timers duplicados.
4. Solo cambia el cliente y se versionan derivados pequeños; no se incluyen fuentes de `fotos/`, no se cambia el protocolo ni se agregan dependencias.
5. `npm run build` pasa. Se revisan manualmente los estados de inicio, repetición y parada; no agregar ni ejecutar tests automatizados.

## F1 — Animar el favicon durante el turno propio (`READY`)

**Pregunta única:** ¿el favicon sigue el turno propio con los seis fotogramas optimizados y vuelve al estado estático en cuanto ese turno deja de estar activo?

- **Entrada:** issue #42, este plan, estado `Coup.js`, favicon actual y las seis fuentes disponibles en `/mnt/e/dev/coup/fotos/gif/`.
- **Subtareas:** (1) delegar la reducción de los seis PNG a un Agente Menor si la capacidad está disponible; 32×32 px, alfa preservada, total ≤50 KB; (2) integrar un componente aislado de favicon que reciba el estado propio y maneje la secuencia/timer/restauración; (3) comprobar el resultado integrado y actualizar evidencia.
- **Áreas permitidas:** `coup-client/src/components/game/Coup.js`, un componente cliente nuevo si conviene, seis derivados nuevos bajo `coup-client/public/`, este plan/handoff, README de planes y bitácora de #42. No tocar `EventLog.js`, servidor, traducciones ni fuentes.
- **Criterio de avance:** criterios AC1–AC5 satisfechos y ninguna edición concurrente de `Coup.js` con #40.
- **Pivotar:** mover la integración a un punto de montaje aislado o secuenciarla después de #40 si ambas ramas necesitan el mismo fragmento de `Coup.js`; no ampliar alcance.
- **Repetir:** una corrección acotada si build, orden, tamaño o limpieza de timer falla.
- **Bloquear/cancelar:** bloquear si las fuentes no están disponibles en el checkout de ejecución o no se puede establecer identidad del jugador local; cancelar solo a petición del propietario.
- **Salida/evidencia:** seis derivados con tamaños/bytes, diff revisable, resultado de build, recorrido manual o límite concreto de esa revisión y respuesta a la pregunta de falsificación.
- **Commit:** `COMMIT_REQUIRED`; cierre previsto `feat(favicon): issue 42 animate on own turn`.
- **Verifier:** ninguno requerido para esta unidad `LIGHT/LOW`.

## Validación y pregunta de falsificación

Construir el cliente con `cd coup-client && npm run build`. Verificar manualmente que el tab recorre A–F y repite durante el turno local, y vuelve al favicon original al cambiar a otro jugador, al pausar/terminar y al salir. Revisar que las seis imágenes publicadas no exceden 32×32/50 KB agregados y que el diff no incluye `fotos/`.

**¿Qué demostraría que no cumple?** Que el favicon siga girando después de que `currentPlayer` cambie, durante pausa/final, o tras desmontar `Coup`; que el orden o transparencia no se conserve; que el total exceda el límite; o que se modifiquen reglas del servidor.

## Historial

- 2026-09-28: unidad creada aparte de #25 porque #25 ya fue integrada; fuente de seis frames confirmada, 8.28 MB originales en total.
- 2026-09-28: decisión de publicar seis PNG derivados de 32×32, con tope agregado de 50 KB; usar el favicon estático existente fuera del turno.
- 2026-09-28: se detectó solapamiento potencial con F2 cliente de #40; el Ejecutor debe comprobar el estado real y coordinar antes de tocar `Coup.js`.
- 2026-09-28: #42 reclamada; setup copiado al worktree canónico y handoff movido a `active/`. F1 permanece activa mientras se preparan derivados/helper aislado; montaje en `Coup.js` secuenciado por el Orquestador con #40.
- 2026-09-28: checkpoint independiente F1: `coup-client/public/favicon-turn/frame-a.png` … `frame-f.png` son RGBA 32×32 y pesan 2,915 / 2,436 / 1,689 / 872 / 1,680 / 2,434 bytes (12,026 bytes total). Se generaron con Pillow LANCZOS y PNG optimizado; alfa presente en los seis (`0–255`). `TurnFavicon.js` anima A→F cada 220 ms y restaura el `href` original al cambiar `isMyTurn` o desmontar. `git diff --check` pasó. No se ha conectado el predicado desde `Coup.js`, compilado el cliente ni verificado la animación/parada en navegador; F1 sigue `ACTIVE`, sin `phase_verdict`, a la espera de secuenciar esa edición con #40.
- 2026-09-28: por decisión del propietario, unidad `WAITING_ORCHESTRATOR` y F1 `ACTIVE`. Próximo paso: esperar a que F2 de #40 esté cerrada/commiteada y `Coup.js` estable; después releer el estado real antes de integrar.
