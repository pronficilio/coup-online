# Handoff para Agente Alquimista — issue #9

**Issue:** https://github.com/pronficilio/coup-online/issues/9  
**Plan exacto:** `docs/plans/circular-board-visual-polish/plan_circular_board_visual_polish.md`  
**Bitácora exacta:** `docs/plans/log/issue-9.jsonl`  
**Estado:** `WAITING_ORCHESTRATOR`
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`  
**Branch:** `issue/9-circular-board-visual-polish`  
**Worktree:** `.worktrees/issue-9-circular-board-visual-polish`  
**Merge target:** `master` de `pronficilio/coup-online`  
**PR esperado:** una PR desde el branch indicado.

## Reclamo, base y aislamiento

La issue #9 ya está creada y asignada a `pronficilio`. El Orquestador creó este worktree desde `origin/master` en `64593af` (merge de #5). Confirma el branch, ruta, base y estado limpio antes de editar; trabaja solo aquí. No uses el checkout raíz ni los worktrees #6/#8.

## Subtarea F1

Implementar conjuntamente el fondo, el disco central y el aumento de tamaño de las cartas según el plan. El PNG fuente disponible en el checkout local es `E:\dev\coup\fotos\backgrond.png`; se escribe solamente el resultado WebP al worktree como `coup-client/src/assets/background.webp`, con ancho ≤1024, proporción y alfa preservados. No agregar, mover ni renombrar el PNG.

La revisión del usuario precisó el fondo: debe cubrir la página/viewport completo y verse como paisaje, no como una imagen de detalle. Usa `cover` centrado y sin deformación sobre blanco, con una capa blanca del 70% (opacidad efectiva de imagen 0.30), y `pointer-events: none`. Colocar el disco blanco translúcido centrado detrás del mazo y encima del fondo. Aumentar cartas sin cambiar la geometría de posiciones.

### Archivos permitidos

- `coup-client/src/components/game/PlayerBoard.js`
- `coup-client/src/components/game/PlayerBoardStyles.css`
- `coup-client/src/assets/background.webp`
- Este plan/handoff/bitácora y capturas visuales acotadas en `docs/plans/circular-board-visual-polish/`, si son necesarias para que el usuario revise la propuesta.

No modificar `Coup.js`, `ActionDecision.js`, paneles de acción/referencias, servidor, reglas, protocolo, cálculo de asientos ni el checkout raíz. No añadir animaciones o dependencias.

## Validaciones y evidencia

- Verificar dimensiones del WebP (ancho ≤1024), proporción y alfa; diff sin PNG fuente.
- Iniciar la app de escritorio local y obtener previews de 2–6 jugadores en escritorio y compacto; inspeccionar al menos la composición de 3 y la densidad de 6, asegurando centro/control visibles y ningún solapamiento.
- Confirmar compilación del cliente. No agregar ni ejecutar tests automatizados.
- Revisar el diff propio y `git diff --check`; un commit para F1 con prefijo `feat(board): issue 9 F1`.

## Coordinación

#6 está abierto para el panel de acciones; #8 para referencias visuales. El fondo/círculo/cartas no deben montar ni rediseñar esos paneles. Si descubres colisión real en el shell, detente y reporta al Orquestador con captura/diff mínimo; no amplíes el alcance.

## Criterio de cierre

Entregar commit, reporte breve, dimensiones/peso del WebP, previews, comandos y resultado de compilación; detenerte para revisión del Orquestador. La issue permanece abierta y no se integra sin su revisión.

## Reporte F1

F1 quedó implementada y revisada visualmente en 2–6 jugadores para 1280×1400 y 490×1200. Tras la corrección, el fondo cubre el viewport completo con opacidad efectiva 0.30; el informe, WebP y capturas están registrados en `docs/plans/circular-board-visual-polish/report_issue_9_F1.md`. Cliente compilado; `git diff --check` pasó. PR #10 abierto; issue abierta y sin merge.
