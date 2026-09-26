# Plan: pulir la presentación visual del tablero circular — issue #9

**Estado:** `WAITING_ORCHESTRATOR`
**Issue:** https://github.com/pronficilio/coup-online/issues/9  
**Handoff:** `docs/plans/inbox/issue_9_circular_board_visual_polish.md`  
**Bitácora:** `docs/plans/log/issue-9.jsonl`  
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`  
**Branch / worktree:** `issue/9-circular-board-visual-polish` / `.worktrees/issue-9-circular-board-visual-polish`  
**Merge target:** `master` de `pronficilio/coup-online`; una sola PR.

## Solicitud y objetivo

El usuario quiere acercar la apariencia del tablero circular a `fotos/ejemplo.png`: usar la imagen de fondo de la plataforma sin deformarla, dar más presencia a las cartas de los jugadores y marcar el centro con un disco blanco traslúcido como en `fotos/mini.png`.

En el checkout local, el archivo de fondo disponible se llama `fotos/backgrond.png` (sic); conservar ese original local e ignorado y producir solo `coup-client/src/assets/background.webp` con ancho máximo de 1024 px, proporción y alfa preservados. La instrucción de “20% de absorción” se interpreta como mostrar la imagen al 80% sobre una base blanca. La imagen debe quedar centrada y sin estiramiento; el punto de partida visual será `background-size: cover` si la inspección responsiva confirma que el recorte no elimina el círculo/plataforma central.

## Alcance

1. Convertir el PNG local de fondo a un WebP responsivo de máximo 1024 px de ancho, manteniendo la proporción y transparencia. No versionar ningún PNG fuente.
2. Añadir el fondo al área del tablero circular centrado, sobre blanco y con opacidad inicial aproximada de 0.8. La capa no debe capturar eventos ni tapar el contenido.
3. Añadir detrás del mazo un disco central circular blanco translúcido que se perciba como una zona central, inspirado en `fotos/mini.png`.
4. Aumentar visiblemente el tamaño de las influencias de jugador, manteniendo las manos dentro de sus asientos y sin colisiones entre 2 y 6 participantes.
5. Conservar posiciones, identidad/colores, resalte de turno, reversos rivales, slots inactivos, controles y proporción del mazo ya integrados en #5. No implementar animaciones.

## Fuera de alcance y coordinación

- No cambiar reglas, servidor, socket, estado del turno, paneles de acción ni paneles de referencias.
- Limitar la implementación a `PlayerBoard.js`, `PlayerBoardStyles.css` y el WebP nuevo, salvo que el Ejecutor documente una necesidad concreta.
- #6 trabaja en el panel de acciones y #8 en materiales de referencia; evitar `Coup.js`, `ActionDecision.js` y sus estilos. Los paneles existentes deben seguir accesibles.
- No cambiar la mesa geométrica ni su cálculo de asientos; #5 ya se integró a `master`.

## Criterios de aceptación

1. `background.webp` mide como máximo 1024 px de ancho, conserva proporción/transparencia y es el único asset nuevo; el PNG local no aparece en el diff.
2. El fondo se muestra centrado sin deformarse, con una mezcla blanca inicial cercana a 20%; la plataforma circular central del arte sigue reconocible.
3. El disco central es claramente circular, traslúcido, está centrado detrás del mazo y no altera su tamaño ni interacción.
4. Las cartas de jugador se perciben mayores que las actuales (desktop 48×64 px, compacto 42×58 px) y no se solapan ni ocultan monedas, asientos, centro o controles para 2, 3, 4, 5 y 6 jugadores.
5. Se mantienen visibles los colores y el contorno neón del turno, cartas propias/rivales, y estados de influencia perdida/eliminación.
6. Previews de escritorio y ancho compacto permiten comparar la composición con las referencias; el navegador compila el cliente sin errores.

## Ejecución y cierre

Una fase `F1 — Integrar fondo, centro y escala de cartas`. Pregunta: ¿el tablero conserva legibilidad y asientos estables al introducir las tres capas visuales? El Ejecutor debe comprobar tamaños 2–6, priorizando además capturas de 3 jugadores (referencia principal) y 6 (caso más denso), escritorio y compacto. El reporte es una nota breve dentro del handoff o issue; no se requiere plan de fases adicional.

## Registro de ejecución

- 2026-09-25 20:03 -06:00: Alquimista reclamó F1 en la rama `issue/9-circular-board-visual-polish`; worktree limpio y basado en `origin/master` (`64593af`), con un commit previo de checkpoint documental (`bf38210`). Fuente inspeccionada: 1672×941 RGB, sin canal alfa. El recorte centrado cuadrado conserva la plataforma circular central.
- 2026-09-25 20:54 -06:00: F1 cerrada; fondo WebP 1024×576 RGB (224710 bytes), proporción preservada por redimensionado, sin alfa en el PNG fuente. El tablero con disco y cartas mayores se revisó en 2–6 jugadores, 1280×1400 y 490×1200; panel de acciones visible debajo. Evidencia: `docs/plans/circular-board-visual-polish/report_issue_9_F1.md`. Dev server compiló con advertencias ESLint preexistentes; `git diff --check` correcto; no se ejecutaron tests ni build de producción. Pasa a revisión del Orquestador.

**Validación mínima:** inspección visual de previews y compilación local del cliente. No agregar ni ejecutar tests automatizados para este cambio visual.

**Commit:** requerido, un commit acotado de F1; no abrir otra rama por fase. El Orquestador revisará diff, dimensiones del asset, capturas y estado del issue antes de integrar.

## Riesgos y supuestos

- `cover` conserva proporción pero puede recortar bordes en móviles; ajustar tamaño/posición si se recorta la plataforma, sin deformar el arte.
- La opacidad 0.8 y el nivel del disco son puntos de partida visuales para que el usuario revise; no son valores finales inmutables.
- La imagen fuente es local e ignorada; el Ejecutor debe comprobar la ruta exacta y no sustituirla por otra imagen por el nombre tipográfico.
- No hay verificador independiente obligatorio: unidad visual, localizada y de bajo riesgo (`LIGHT/LOW/NONE`).
