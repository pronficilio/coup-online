# Handoff para Agente Alquimista — issue #42

- **Issue:** https://github.com/pronficilio/coup-online/issues/42 (abierta, asignada a `pronficilio`).
- **Plan exacto:** `docs/plans/home-coin-turn-favicon/plan_home_coin_turn_favicon.md`.
- **Bitácora exacta:** `docs/plans/log/issue-42.jsonl`.
- **Estado del plan:** unidad `WAITING_ORCHESTRATOR`; F1 `CLOSED (PASS, propietario confirmó que se ve bien en una partida de tres personas)`; F2 `CLOSED (PASS, revisión visual posterior pendiente)`.
- **Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
- **Verifier requerido ahora:** no.
- **Pregunta de falsificación:** ¿puede el favicon seguir animado cuando ya no es el turno local, con pausa/final, como espectador o después de desmontar la partida?
- **Fase entregada:** F1, integración de favicon por turno propio; el propietario confirmó funcionamiento visual en una partida con tres personas y señaló que el giro aún se siente algo lento/tropezado.
- **Fase entregada:** F2, cargar/decodificar por adelantado los seis fotogramas, elevar la cadencia a 100 ms y aplicar cinco PNG estrictamente equivalentes que reducen el total a 11,890 bytes.
- **Por qué sigue:** #25 ya dejó un favicon estático pequeño; F1 funciona en juego, y la revisión del propietario pide mejorar la fluidez sin inflar los assets ni dañar bordes/transparencia.
- **Documentos fuente:** issue #42; plan exacto arriba; `docs/agentes/ORQUESTADOR.md`, `ALQUIMISTA.md`, `AGENTE_MENOR.md`, `docs/plans/PROJECT_ORCHESTRATION.yaml`; issue/plan/branch de #40 para coordinación; `Coup.js`, `index.html`, `public/favicon.ico`.
- **Subtareas ejecutadas:**
  1. El Agente Menor convirtió `fotos/gif/a-coin.png` … `fotos/gif/f-coin.png` a seis PNG RGBA 32×32; total 12,026 bytes, solo derivados versionados en el worktree de #42.
  2. El Alquimista integró el componente en `Coup.js`, derivó turno propio activo y conectó cleanup/restauración.
  3. El Alquimista compiló y documentó evidencia y commit F1; el propietario después confirmó el comportamiento visual con tres personas.
- **Subtareas F2 ejecutadas:** 1) precarga/decodificación paralela A–F, cadencia de 100 ms, secuencia y cleanup con invalidación de promesas; 2) cinco frames optimizados sin pérdida byte a byte de píxeles; 3) build exitoso y evidencia documentada. No se ejecutaron tests automatizados.
- **Criterios de aceptación:** rotación solo en turno propio activo; espectadores/pausa/final no animan; derivados ≤32×32 y ≤50 KB total; orden/alfa conservados; limpieza/restauración completa; solo cliente, sin dependencias nuevas, fuentes originales ni tests automatizados; build exitoso.
- **Coordinación observada:** la issue #40 está `CLOSED`; PR #54 se fusionó con `d1eddb834f35d058159343475789b8df20a173a1`. Tras F2, la rama #42 se rebasó limpiamente sobre `origin/master@b8df17fd71ad5024228fe7021f8ebb6d3973cff7`; la base está actualizada.
- **Política de commits:** `COMMIT_REQUIRED` para cada fase con resultados/evidencia y `phase_verdict` en el mismo commit. F1 quedó en `901d902` tras el rebase; cierre previsto de F2: `perf(favicon): issue 42 F2 CLOSED smoother turn animation`.
- **Branch destino:** `issue/42-home-coin-turn-favicon`.
- **Worktree destino:** `/mnt/e/dev/coup/.worktrees/issue-42-home-coin-turn-favicon`.
- **Merge target:** `master` del fork `pronficilio/coup-online`.
- **Bitácora del issue:** `docs/plans/log/issue-42.jsonl` (append-only; sin helper local).
- **PR canónica:** [#58](https://github.com/pronficilio/coup-online/pull/58), única PR desde el branch de #42 hacia `master`.
- **Secuencia de integración:** claim, branch/worktree y F1/F2 están cerrados; el branch se rebasó sobre `origin/master@b8df17f` y PR #58 quedó abierta. El Orquestador mantiene la unidad `WAITING_ORCHESTRATOR` hasta revisar CI y evidencia; no integra ni cierra la issue en este paso.
- **Validaciones esperadas:** `cd coup-client && npm run build`; revisión manual de la secuencia, repetición y paradas; medición de las seis salidas; `git diff --check` si se usa como revisión de whitespace. No agregar ni ejecutar tests automatizados.
- **Contrato de evidencia:** dimensiones/bytes por fotograma y total; paths; estado de build; evidencia/manual o límite exacto; respuesta a falsificación; diff y commit.
- **Condición para invocar Verifier:** ninguna; `NONE`.
- **Qué debe revisar el Orquestador:** revisar el diff/evidencia de F2 en PR #58, evaluar CI y observar el resultado manual cuando el propietario pruebe la nueva cadencia. Dejar la unidad `WAITING_ORCHESTRATOR`; no integrar ni cerrar la issue.

**Claim, aislamiento y reanudación:** claim remoto publicado en https://github.com/pronficilio/coup-online/issues/42#issuecomment-5865946026. Branch/worktree canónicos `issue/42-home-coin-turn-favicon` / `/mnt/e/dev/coup/.worktrees/issue-42-home-coin-turn-favicon`; rebase y confirmación de aislamiento registrados en la bitácora. Tras el cierre de #40/PR #54, el Orquestador reactivó F1 y se releyeron issue/branch/worktree/diff antes de editar. La integración, build y evidencia quedaron documentados; F1 se cierra en el commit de fase con su `phase_verdict`.

**Reanudación F1/F2:** tras cerrar #40, `TurnFavicon` se integró en `Coup.js`; el propietario validó F1 en una partida de tres y reportó lenta la cadencia de 220 ms. F2 la cambió a 100 ms, precargó A–F y redujo los PNG sin pérdida a 11,890 bytes. La última prueba visual disponible es la de F1; queda pendiente que el propietario observe la nueva cadencia.

## F2 — Alcance aprobado: fluidez y bytes (2026-09-29)

- **Pregunta única:** ¿la secuencia se percibe más continua al pasar de 220 ms a 100 ms, sin saltos iniciales por carga y manteniendo calidad visual y tamaño pequeño?
- **Entrada:** F1 cerrada, confirmación visual del propietario en una partida de tres personas, helper actual y PNG RGBA A–F de 12,026 bytes totales.
- **Subtareas:** (1) hacer que el helper precargue y decodifique A–F en paralelo solo cuando empieza el turno; mostrar A y no iniciar el intervalo hasta resolver la precarga; proteger el callback con una bandera de cancelación y limpiar el intervalo/restaurar el href como ahora; (2) usar 100 ms por fotograma, conservar A→B→C→D→E→F→A y no crear timers duplicados; (3) comprobar si hay una codificación PNG disponible sin pérdida que reduzca el total, preservando dimensiones y los píxeles RGBA; no aplicar cuantización con pérdida, porque el ensayo previo ahorró alrededor de 2.4 KB de 12 KB y alteró alfa/bordes; (4) compilar y actualizar evidencia/handoff/README/log.
- **Áreas permitidas:** `coup-client/src/components/game/TurnFavicon.js`, los seis PNG solo si una salida sin pérdida es estrictamente equivalente y menor, plan/handoff/README/bitácora #42. No cambiar `Coup.js`, el servidor, reglas, originales de `fotos/`, favicon estático ni dependencias.
- **Avance:** precarga sin callbacks activos luego de desmontaje/cambio de turno; un único intervalo de 100 ms; orden cíclico y restauración intactos; build exitoso; bytes/dimensiones documentados y no superiores a 12,026 bytes salvo explicación verificada.
- **Pivote:** si el navegador no comparte decodificación entre `<img>` y favicon, mantener precarga de red y medir; no reemplazar por GIF, canvas, sprites mayores o dependencias nuevas.
- **Repetición:** una corrección acotada si build o revisión estática detectan una regresión en ciclo/cleanup/tamaño.
- **Bloqueo/cancelación:** bloquear si la precarga no se puede acotar al ciclo de vida del helper o si solo se puede reducir peso degradando perceptiblemente alfa/bordes; cancelar solo a petición del propietario.
- **Salida/evidencia:** diff/commit, resultado build, código de cadencia/precarga/cleanup, bytes A–F y suma, auditoría de compresión, revisión del diff. El usuario puede confirmar la percepción de fluidez al probar la versión actualizada.
- **Commit:** `COMMIT_REQUIRED`; cierre `perf(favicon): issue 42 F2 CLOSED smoother turn animation`.
- **Verifier:** ninguno requerido (`LIGHT/LOW/NONE`).

## Resultado F2 (2026-09-29)

- El helper muestra A al tomar el turno, precarga y decodifica los seis frames en paralelo, y solo después inicia un intervalo de 100 ms. Cada tick recorre A→B→C→D→E→F→A.
- Cleanup pone `cancelled` antes de limpiar el intervalo único y restaurar el `href`; una resolución tardía no puede iniciar el timer ni mutar el favicon. Un error de decode antes de cleanup restaura el favicon estático.
- Auditoría Pillow: `compress_level=9`, sin cuantización. A/B/C/E/F tienen píxeles RGBA idénticos a los PNG previos de `901d902` y se reducen a 2,890/2,403/1,665/1,662/2,398 bytes; D queda en 872. Todos son RGBA 32×32; total 11,890 bytes (136 menos). No hay optimizadores externos PNG instalados; la prueba de Pillow encontró y verificó candidatos estrictamente menores.
- `npm run build` pasó (`Compiled with warnings`, exit 0). Warnings: imports sin uso `logo`/`Link` en `App.js`, precedencia `&&`/`||` en `Coup.js:462`, `dvh` en `ReferencePanel.css:100,106` y `caniuse-lite` desactualizada. JS gzip +438 B, CSS gzip −47 B. No se ejecutaron tests automatizados.
- F1 fue visto por el propietario en una partida de tres personas y la cadencia anterior se sintió lenta. No hubo browser interactivo disponible para validar visualmente el nuevo ritmo; no se afirma una percepción live de F2 y queda para revisión posterior.
- F2 queda `CLOSED (PASS)` por revisión estática y build. Unidad `WAITING_ORCHESTRATOR`; el Orquestador revisa el commit y prepara la única PR, sin integración/cierre de issue en esta fase.

## Checkpoint independiente F1 (2026-09-28)

- El Agente Menor generó `coup-client/public/favicon-turn/frame-a.png` … `frame-f.png` desde las fuentes locales con Pillow LANCZOS y PNG optimizado. Los seis archivos son 32×32 RGBA con alfa; tamaños A–F: 2,915, 2,436, 1,689, 872, 1,680 y 2,434 bytes; total 12,026 bytes (≤50 KB). No se versionaron fuentes `fotos/`.
- `coup-client/src/components/game/TurnFavicon.js` recibe `isMyTurn`, muestra A de inmediato y avanza cada 220 ms. Su cleanup detiene el intervalo y restablece el `href` original cuando cambia la prop o se desmonta.
- Revisión de archivos: los seis frames visibles en orden y alfa presente (`0–255`); `git diff --check` pasó.
- Este checkpoint se realizó antes de que #40 cerrara. Ahora que PR #54 está integrada y el Orquestador rebasó #42, la integración continúa en `Coup.js`; siguen pendientes build y revisión manual en navegador de inicio, repetición y parada ante cambio de turno/pausa/final/desmontaje. No se ejecutan tests. F1 permanece `ACTIVE`; este checkpoint no es `phase_verdict`.

**Nota de reanudación (2026-09-29):** issue #40 cerró con PR #54; su estado y worktree estable se confirmaron antes de integrar #42 en el worktree canónico. Se entrega F1 al Orquestador sin integrar ni cerrar la issue.

## Resultado F1 (2026-09-29)

- `Coup.js` activa la animación solo para el participante local cuyo nombre coincide con `currentPlayer`; excluye espectadores, pausa, espera de pausa, ganador, disolución y desconexión. Las vistas de desconexión/disolución desmontan el helper.
- Revisión estática de `TurnFavicon`: A aparece al iniciar, índice avanza módulo 6 cada 220 ms y el cleanup cancela el intervalo y restaura el `href` original cuando cambia la prop o se desmonta. No fue posible una comprobación visual en navegador: no hay Chromium/Firefox ni herramienta de navegador en el entorno.
- Build `npm run build`: exitoso, `Compiled with warnings`. Warnings: `logo`/`Link` sin uso en `App.js`, mezcla `&&`/`||` en `Coup.js:460`, `dvh` en `ReferencePanel.css:100,106` y `caniuse-lite` desactualizada. No se ejecutaron tests automatizados.
- Derivados RGBA 32×32, bytes A–F `2915/2436/1689/872/1680/2434`, total `12026`; originales `fotos/` no versionados. `git diff --check` pasó. Sin cambios de servidor/protocolo, touch icons ni dependencias de runtime.
- La limitación de navegador deja pendiente observar en vivo el cambio visual del favicon; el código, ciclo, predicado y limpieza se revisaron estáticamente. El Orquestador recibe F1 con esta limitación explícita para revisión; issue abierta, sin PR y sin integración.
