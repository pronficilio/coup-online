# Plan — Favicon de moneda durante el turno propio (#42)

**Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED (PASS, validación del propietario con tres participantes)`; F2 `CLOSED (PASS, revisión visual posterior de F2 pendiente)`; issue `OPEN` y asignada a `pronficilio`.
**Issue canónico:** https://github.com/pronficilio/coup-online/issues/42
**Handoff:** `docs/plans/active/issue_42_home_coin_turn_favicon.md`
**Bitácora:** `docs/plans/log/issue-42.jsonl` (append-only).
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
**Branch / worktree:** `issue/42-home-coin-turn-favicon` / `.worktrees/issue-42-home-coin-turn-favicon`.
**Base / destino:** F2 se cerró sobre `origin/master@f950420891dd0a349b125ec5468c45868e60cc04`; `origin/master` avanzó luego a `b8df17f`. Se registró `sync_base`; el Orquestador rebasará la rama antes del PR / `master` de `pronficilio/coup-online`.
**Integración:** una PR para el issue; GitHub confirma que aún no existe para este branch.
**Siguiente acción:** el Orquestador revisa el commit/evidencia de F2 y prepara la única PR; el propietario puede confirmar la nueva cadencia visualmente cuando haya preview.

## Solicitud y definición de éxito

Mientras le toca jugar a la persona conectada, animar el favicon de la pestaña con los fotogramas A, B, C, D, E y F, repitiendo A→F→A sin fin. Detener la animación y restaurar el favicon estático cuando deje de ser su turno, se pause/termine la partida o se desmonte la pantalla.

Las seis fuentes locales son `fotos/gif/a-coin.png` hasta `fotos/gif/f-coin.png`. Todas son PNG RGBA de 1254×1254 px; suman 8,283,035 bytes y están fuera de Git por la regla de `fotos/`. El favicon estático existente es un ICO de 16×16 y 32×32 px (3,596 bytes). La portada de la issue #25 sigue usando un GIF estático como asset; esta unidad solo cambia el favicon dentro de la partida.

## Hechos, supuestos y coordinación

- Confirmado en `Coup.js`: los props `name` e `isSpectator`, el estado `currentPlayer`, `gamePaused` y `winner` permiten derivar el turno propio sin cambiar el servidor: `currentPlayer === name`, participante activo, partida no pausada ni terminada.
- Confirmado: el cliente recibe actualizaciones de turno desde el servidor; los controles/reglas no necesitan cambios.
- La issue #25 y PR #27 están completadas. El icono estático puede restaurarse desde su `href` original.
- La issue #40 cerró mediante PR #54 (`d1eddb834f35d058159343475789b8df20a173a1`). #42 se rebasó sobre `f950420891dd0a349b125ec5468c45868e60cc04`; mientras se ejecutaba F2, `origin/master` avanzó a `b8df17f` con reconciliación documental. La rama feature quedó seis commits adelante y uno detrás y requiere actualización antes del PR. GitHub confirma #42 abierta, asignada a `pronficilio`, sin PR existente.
- La issue #24 se cerró al integrar la PR #41 (`2160ada0`); la nota que la muestra abierta en el handoff de #40 está desactualizada.
- El branch/worktree canónico se creó originalmente desde `f900c0947a0b27ac9c6e0372e3c1871a883be7e6`; se rebasó durante F1 y F2 quedó sobre `f950420`. Antes de la sincronización registrada, `origin/master` estaba en `b8df17f`.
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

## F1 — Animar el favicon durante el turno propio (`CLOSED — PASS con limitación manual documentada`)

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

## Resultado F1 (2026-09-29)

- **Integración:** `Coup.js` monta `TurnFavicon` solo si hay nombre local, la persona no es espectadora, `currentPlayer === name`, y no hay pausa (`gamePaused` o `pauseWaiting`), ganador, disolución ni desconexión. En los estados desconectado/disuelto, `Coup` devuelve otra vista y desmonta el helper.
- **Ciclo y restauración (revisión estática):** el helper muestra A al comenzar y avanza A→B→C→D→E→F→A cada 220 ms (`frameIndex % 6`). Al cambiar `isMyTurn` o desmontarse, el cleanup limpia el intervalo y restaura el `href` que tenía `link[rel~="icon"]` al entrar al efecto. El HTML conserva el favicon estático `favicon.ico` como valor inicial. No se pudo observar la pestaña en un navegador: este entorno no tiene Chromium, Firefox ni una herramienta de navegador interactivo; por eso no se afirma una comprobación visual en vivo.
- **Derivados:** `coup-client/public/favicon-turn/frame-{a..f}.png`, todos RGBA 32×32 con alfa 0–255. Bytes A–F: 2,915 / 2,436 / 1,689 / 872 / 1,680 / 2,434; total 12,026 bytes (≤50 KB). Los originales de 1254×1254 permanecen fuera de Git bajo `fotos/`.
- **Build:** `cd coup-client && npm run build` terminó correctamente (`Compiled with warnings`). Avisos: imports sin uso `logo`/`Link` en `src/App.js`; precedencia `&&`/`||` en `Coup.js:460`; `postcss-calc` no interpreta `dvh` en `ReferencePanel.css:100,106`; base `caniuse-lite` desactualizada. No se ejecutaron tests automatizados.
- **Falsificación:** la inspección del predicado y cleanup no encontró una ruta que mantenga el timer cuando la prop pasa a `false` o `Coup` desmonta el helper. La comprobación empírica del favicon del navegador queda pendiente por la ausencia de navegador disponible; el Orquestador debe considerar ese límite antes de integrar.
- **Diff / alcance:** integración de cliente en `Coup.js`, helper y seis derivados pequeños; sin cambios al servidor/protocolo, reglas, touch icons, dependencias de runtime ni fuentes `fotos/`. `git diff --check` pasa.

### Validación manual posterior del propietario

El propietario probó la función en una partida de tres personas y confirmó: “se ve bien”. También reportó que el giro se siente algo lento/tropezado. Se toma como evidencia de que el favicon sí sigue el turno en una partida real; la cadencia requiere ajuste y observación adicional tras F2. Esto no afirma que se probaran individualmente los estados de pausa/final/desmontaje.

## F2 — Fluidez y tamaño de los fotogramas (`CLOSED — PASS; revisión visual posterior pendiente`)

**Pregunta única:** ¿la secuencia se percibe más continua al pasar de 220 ms a 100 ms, sin pausas iniciales por descarga, y conserva el tamaño/calidad de los iconos?

- **Entrada:** F1 `CLOSED`; prueba live del propietario con tres participantes; helper de 220 ms; seis PNG RGBA 32×32 que suman 12,026 bytes.
- **Subtareas:** (1) precargar y decodificar A–F en paralelo solo al activar el turno; mostrar A, esperar a que las imágenes estén listas y luego iniciar un solo intervalo; cancelar callbacks pendientes y restaurar el `href` al perder el turno o desmontar; (2) cambiar a 100 ms y preservar A→B→C→D→E→F→A; (3) auditar opciones de compresión sin pérdida y actualizar PNG solo si conserva exactamente los píxeles/dimensiones y reduce tamaño; (4) compilar el cliente y documentar evidencia. No agregar/ejecutar tests automatizados.
- **Alcance permitido:** `TurnFavicon.js`, PNG solo con equivalencia sin pérdida, plan/handoff/README/bitácora. No tocar `Coup.js`, servidor, reglas, `fotos/`, favicon estático ni dependencias.
- **Criterio de avance:** una sola animación y un solo timer; sin cambio tardío después de cleanup; frames listos antes de empezar el ciclo repetido; intervalo de 100 ms; build exitoso; suma ≤12,026 bytes o justificación concreta si un optimizador sin pérdida no está disponible.
- **Criterio de pivote:** si el navegador no reutiliza la decodificación, mantener las peticiones precargadas; no adoptar GIF, canvas ni assets más grandes.
- **Repetir:** una corrección acotada si build o revisión de ciclo, cleanup, orden o bytes falla.
- **Bloquear/cancelar:** bloquear si se detecta un callback no cancelable o si reducir bytes exige pérdida visible de alfa/bordes; cancelar solo a petición del propietario.
- **Salida/evidencia:** diff y commit, build, bytes/dimensiones A–F, auditoría de compresión, revisión estática de los estados de cleanup. La impresión subjetiva final de suavidad la confirma el propietario con la nueva cadencia.
- **Commit:** `COMMIT_REQUIRED`; `perf(favicon): issue 42 F2 CLOSED smoother turn animation`.
- **Verifier:** no requerido (`LIGHT/LOW/NONE`).

### Resultado F2 (2026-09-29)

- **Precarga/cadencia:** `TurnFavicon` crea seis `Image` y espera en paralelo `decode()` antes de empezar un solo intervalo de 100 ms. A se muestra al activarse; después cada tick incrementa el índice módulo 6 y conserva A→B→C→D→E→F→A.
- **Cleanup/fallos:** la limpieza invalida la continuación con `cancelled`, limpia el único intervalo si ya inició y restaura el `href` original. Si la decodificación falla antes de cleanup, se restaura el icono estático. Ningún callback pendiente puede cambiar el favicon después del cleanup.
- **PNG sin pérdida:** se compararon salidas Pillow con nivel zlib 9 contra los blobs previos del commit `901d902`. A/B/C/E/F conservan exactamente cada píxel RGBA y 32×32 y bajan de 2,915/2,436/1,689/1,680/2,434 a 2,890/2,403/1,665/1,662/2,398 bytes. D conserva sus 872 bytes. Total: 11,890 bytes, una reducción estrictamente sin pérdida de 136 bytes frente a 12,026. No se aplicó cuantización con pérdida ni se tocaron originales.
- **Build:** `cd coup-client && npm run build` finalizó con exit 0 (`Compiled with warnings`). Warnings: `App.js` imports `logo`/`Link` sin uso; precedencia `&&`/`||` en `Coup.js:462`; `postcss-calc` no interpreta `dvh` en `ReferencePanel.css:100,106`; base Browserslist desactualizada. Bundle gzip JS +438 B y CSS −47 B frente al build anterior. No se ejecutaron tests automatizados.
- **Evidencia manual:** el propietario había confirmado F1 en una partida real de tres personas y reportó la cadencia de 220 ms lenta/tropezada. No se pudo observar F2 en un navegador durante esta fase; por tanto, el paso objetivo a 100 ms está verificado en código pero la percepción final de fluidez queda para el propietario/Orquestador.
- **Alcance:** solo `TurnFavicon.js`, cinco PNG equivalentes más pequeños y documentos; no se modificaron `Coup.js`, servidor, reglas, fuentes `fotos/` ni dependencias.
- **Veredicto:** revisión estática de ciclo, decode, orden, cancelación, timer y restauración pasa; los seis archivos permanecen RGBA 32×32 y totalizan ≤12,026 bytes; build pasa. F2 se entrega `CLOSED (PASS)` con la limitación de revisión visual anterior expresamente pendiente.

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
- 2026-09-29: #40 cerró por PR #54; el Orquestador rebasó y desbloqueó #42. Issue, branch/worktree y diff fueron releídos; se reanuda integración de F1.
- 2026-09-29: el propietario validó el favicon en partida de tres personas y reportó el giro lento/tropezado; se prepara F2 para bajar de 220 ms a 100 ms y precargar A–F.
