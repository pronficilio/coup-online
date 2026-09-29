# Handoff para Agente Alquimista — issue #42

- **Issue:** https://github.com/pronficilio/coup-online/issues/42 (abierta, asignada a `pronficilio`).
- **Plan exacto:** `docs/plans/home-coin-turn-favicon/plan_home_coin_turn_favicon.md`.
- **Bitácora exacta:** `docs/plans/log/issue-42.jsonl`.
- **Estado del plan:** unidad `WAITING_ORCHESTRATOR`; F1 `CLOSED (PASS, con limitación de revisión manual documentada)`.
- **Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
- **Verifier requerido ahora:** no.
- **Pregunta de falsificación:** ¿puede el favicon seguir animado cuando ya no es el turno local, con pausa/final, como espectador o después de desmontar la partida?
- **Fase entregada:** F1, integración de favicon por turno propio.
- **Por qué sigue:** #25 ya dejó un favicon estático pequeño; esta solicitud usa seis nuevos fotogramas y depende del estado del turno en cliente.
- **Documentos fuente:** issue #42; plan exacto arriba; `docs/agentes/ORQUESTADOR.md`, `ALQUIMISTA.md`, `AGENTE_MENOR.md`, `docs/plans/PROJECT_ORCHESTRATION.yaml`; issue/plan/branch de #40 para coordinación; `Coup.js`, `index.html`, `public/favicon.ico`.
- **Subtareas ejecutadas:**
  1. El Agente Menor convirtió `fotos/gif/a-coin.png` … `fotos/gif/f-coin.png` a seis PNG RGBA 32×32; total 12,026 bytes, solo derivados versionados en el worktree de #42.
  2. El Alquimista integró el componente en `Coup.js`, derivó turno propio activo y conectó cleanup/restauración.
  3. El Alquimista compiló y documentó evidencia, límite de revisión manual y commit F1.
- **Criterios de aceptación:** rotación solo en turno propio activo; espectadores/pausa/final no animan; derivados ≤32×32 y ≤50 KB total; orden/alfa conservados; limpieza/restauración completa; solo cliente, sin dependencias nuevas, fuentes originales ni tests automatizados; build exitoso.
- **Coordinación observada:** la issue #40 está `CLOSED`; PR #54 se fusionó con `d1eddb834f35d058159343475789b8df20a173a1`. Su worktree canónico está limpio. #42 se rebasó sobre `origin/master@0fa8e7a33319013d0aed8435403a5e8dad35e44a`, tres commits adelante/cero detrás, y el Orquestador reactivó F1 en [comentario de desbloqueo](https://github.com/pronficilio/coup-online/issues/42#issuecomment-5885908403).
- **Política de commits:** `COMMIT_REQUIRED` para F1 con reporte/evidencia y `phase_verdict` en la misma unidad.
- **Commit de cierre:** `feat(favicon): issue 42 animate on own turn`.
- **Branch destino:** `issue/42-home-coin-turn-favicon`.
- **Worktree destino:** `/mnt/e/dev/coup/.worktrees/issue-42-home-coin-turn-favicon`.
- **Merge target:** `master` del fork `pronficilio/coup-online`.
- **Bitácora del issue:** `docs/plans/log/issue-42.jsonl` (append-only; sin helper local).
- **PR esperada:** una PR desde el branch de #42 hacia `master`; no existe todavía.
- **Secuencia obligatoria:** leer issue #42; reclamarla en el tracker y volver a leerla; comprobar que no exista claim/branch/worktree/PR incompatible; crear branch/worktree desde `origin/master` actual; confirmar aislamiento; copiar a ese worktree el plan, handoff, bitácora y actualización de `README_plans.md` desde el checkout raíz; mover el handoff a `active/`; registrar claim/worktree; hacer el primer commit de control antes del código. No trabajar en `master`.
- **Validaciones esperadas:** `cd coup-client && npm run build`; revisión manual de la secuencia, repetición y paradas; medición de las seis salidas; `git diff --check` si se usa como revisión de whitespace. No agregar ni ejecutar tests automatizados.
- **Contrato de evidencia:** dimensiones/bytes por fotograma y total; paths; estado de build; evidencia/manual o límite exacto; respuesta a falsificación; diff y commit.
- **Condición para invocar Verifier:** ninguna; `NONE`.
- **Qué debe revisar el Orquestador:** diff/commit F1, estado `WAITING_ORCHESTRATOR` y la limitación de revisión visual documentada; no integrar ni cerrar la issue con esta entrega.

**Claim, aislamiento y reanudación:** claim remoto publicado en https://github.com/pronficilio/coup-online/issues/42#issuecomment-5865946026. Branch/worktree canónicos `issue/42-home-coin-turn-favicon` / `/mnt/e/dev/coup/.worktrees/issue-42-home-coin-turn-favicon`; rebase y confirmación de aislamiento registrados en la bitácora. Tras el cierre de #40/PR #54, el Orquestador reactivó F1 y se releyeron issue/branch/worktree/diff antes de editar. La integración, build y evidencia quedaron documentados; F1 se cierra en el commit de fase con su `phase_verdict`.

**Reanudación:** tras el cierre de #40, se integró `TurnFavicon` en `Coup.js`; el build pasó con avisos descritos en el plan. La revisión estática cubre predicado, secuencia y cleanup. No había navegador interactivo disponible, por lo que el recorrido visual no se afirma como hecho. F1 queda `CLOSED (PASS, limitación documentada)` y la unidad `WAITING_ORCHESTRATOR`.

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
