# Handoff para Agente Alquimista — issue #42

- **Issue:** https://github.com/pronficilio/coup-online/issues/42 (abierta, asignada a `pronficilio`).
- **Plan exacto:** `docs/plans/home-coin-turn-favicon/plan_home_coin_turn_favicon.md`.
- **Bitácora exacta:** `docs/plans/log/issue-42.jsonl`.
- **Estado del plan:** unidad `ACTIVE`; F1 `ACTIVE` (helper/assets independientes; montaje pendiente de secuenciación con #40).
- **Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
- **Verifier requerido ahora:** no.
- **Pregunta de falsificación:** ¿puede el favicon seguir animado cuando ya no es el turno local, con pausa/final, como espectador o después de desmontar la partida?
- **Fase sugerida:** F1, integración de favicon por turno propio.
- **Por qué sigue:** #25 ya dejó un favicon estático pequeño; esta solicitud usa seis nuevos fotogramas y depende del estado del turno en cliente.
- **Documentos fuente:** issue #42; plan exacto arriba; `docs/agentes/ORQUESTADOR.md`, `ALQUIMISTA.md`, `AGENTE_MENOR.md`, `docs/plans/PROJECT_ORCHESTRATION.yaml`; issue/plan/branch de #40 para coordinación; `Coup.js`, `index.html`, `public/favicon.ico`.
- **Subtareas listas para delegación:**
  1. A un Agente Menor: convertir `fotos/gif/a-coin.png` … `fotos/gif/f-coin.png` a seis PNG RGBA de 32×32 px, medir bytes, máximo agregado 50 KB y entregar solo derivados dentro del worktree de #42.
  2. Al Alquimista: reclamar y aislar #42; implementar alternancia A→F→A al ser turno local, limpiar/restaurar favicon al cambiar estado/desmontar; integrar los derivados y revisar el diff.
  3. Al Alquimista: compilar, comprobar visualmente o documentar el límite de revisión y registrar evidencia/commit F1.
- **Criterios de aceptación:** rotación solo en turno propio activo; espectadores/pausa/final no animan; derivados ≤32×32 y ≤50 KB total; orden/alfa conservados; limpieza/restauración completa; solo cliente, sin dependencias nuevas, fuentes originales ni tests automatizados; build exitoso.
- **Coordinación observada:** la issue #40 sigue `OPEN`, F2 `ACTIVE`; su worktree canónico tiene cambios sin commit en `Coup.js` y otros archivos de cliente. El Orquestador confirmó no editar `Coup.js` en paralelo y secuenciar el montaje mediante [comentario de coordinación](https://github.com/pronficilio/coup-online/issues/40#issuecomment-5865924784). #24 cerró con PR #41; `origin/master` se actualizó a `f900c0947a0b27ac9c6e0372e3c1871a883be7e6` antes de crear el worktree #42.
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
- **Qué debe actualizar el Alquimista:** claim en issue/log, mover handoff `inbox→active`, estado del plan/issue, reporte F1, tamaños, validación y commit; detenerse y devolver a Orquestador si #40 requiere secuenciación de integración.

**Claim y aislamiento:** claim remoto publicado y releído en https://github.com/pronficilio/coup-online/issues/42#issuecomment-5865946026. Branch/worktree `issue/42-home-coin-turn-favicon` / `/mnt/e/dev/coup/.worktrees/issue-42-home-coin-turn-favicon`, creado desde `origin/master@f900c0947a0b27ac9c6e0372e3c1871a883be7e6`. La bitácora registra setup y confirmación. Mantener F1 `ACTIVE`; no registrar `phase_verdict` hasta integrar de forma segura y satisfacer todos los criterios.

## Checkpoint independiente F1 (2026-09-28)

- El Agente Menor generó `coup-client/public/favicon-turn/frame-a.png` … `frame-f.png` desde las fuentes locales con Pillow LANCZOS y PNG optimizado. Los seis archivos son 32×32 RGBA con alfa; tamaños A–F: 2,915, 2,436, 1,689, 872, 1,680 y 2,434 bytes; total 12,026 bytes (≤50 KB). No se versionaron fuentes `fotos/`.
- `coup-client/src/components/game/TurnFavicon.js` recibe `isMyTurn`, muestra A de inmediato y avanza cada 220 ms. Su cleanup detiene el intervalo y restablece el `href` original cuando cambia la prop o se desmonta.
- Revisión de archivos: los seis frames visibles en orden y alfa presente (`0–255`); `git diff --check` pasó.
- Pendiente por coordinación: integrar el predicado en `Coup.js` cuando F2 #40 deje libre esa superficie; después compilar `coup-client` y revisar en navegador inicio, repetición y parada ante cambio de turno/pausa/final/desmontaje. No se ejecutaron tests. F1 permanece `ACTIVE`; este checkpoint no es `phase_verdict`.

**Nota de coordinación previa a claim:** issue #40 sigue abierta con F2 `ACTIVE`. No editar `Coup.js` a la vez que esa unidad: relee su issue y worktree/branch al empezar. El Orquestador registró que #24 se cerró con PR #41 y que #42 necesita integrar el favicon en la misma superficie.
