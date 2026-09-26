# Plan: encabezado del jugador con saldo y neón de turno — issue #16

**Estado:** `ACTIVE`; F1 `FAILED` — requiere reorquestación.
**Unidad:** https://github.com/pronficilio/coup-online/issues/16
**Handoff:** `docs/plans/active/issue_16_player_header.md`
**Bitácora:** `docs/plans/log/issue-16.jsonl`
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
**Responsables:** Orquestador del plan; Agente Alquimista de la ejecución; revisión final del Orquestador.
**Integración única:** `issue/16-player-header` en `.worktrees/issue-16-player-header`, PR a `master` de `pronficilio/coup-online`.

## Solicitud y definición de éxito

Rediseñar la identificación visual de cada jugador según `fotos/jugador.png`: barra con icono y nombre, seguida a la derecha por una barra más corta con moneda y saldo. En el turno activo, el nombre tendrá el neón rojo de `fotos/focus.png`, coordinado con el efecto que ya tienen las cartas.

Éxito significa que el nombre y saldo se leen de un vistazo en partidas de 2 a 6 jugadores; el neón identifica correctamente el turno; y el encabezado funciona en escritorio y móvil sin recortar saldos ni chocar con cartas, jugadores o controles.

## Fuentes, hechos y supuestos

- La rama base y merge target actuales del fork son `master`; el tracker canónico es GitHub en `pronficilio/coup-online`.
- `PlayerBoard.js` obtiene el jugador activo de `props.currentPlayer` y ya aplica una clase de turno a las cartas. Los datos de saldo provienen de `player.money`.
- El tablero circular ya está integrado en `master` (#5 y #9). La PR #11 de #6 sigue abierta y modifica `Coup.js`, `ActionDecision.js` y `CoupStyles.css`; no incluye `PlayerBoard.js` ni `PlayerBoardStyles.css`. La PR #12 de #8 está fusionada y modifica paneles de referencia, sin solapamiento con este alcance.
- GitHub todavía muestra #6 y #8 abiertas, aunque sus cuerpos/docs locales contienen referencias de seguimiento anteriores a esas integraciones. No se editarán esas unidades como parte de #16.
- `fotos/player.webp` y `fotos/coin.webp` existen en el checkout local, pero son fuentes locales, no assets del repositorio remoto. El Ejecutor debe copiarlas explícitamente al worktree de #16 antes de usarlas. No versionar los PNG fuente.
- Se conserva la geometría y el cálculo de asientos actuales. Se asume que el ancho del encabezado puede limitarse con CSS sin cambiar el tablero; si la evidencia visual contradice esto, detenerse y reorquestar.

## Alcance y criterios de aceptación

1. Cada jugador muestra en una sola fila su icono, nombre y una barra neutra de monedas a la derecha, con altura alineada y el valor real, incluido cero y cifras de dos dígitos.
2. Solo el jugador activo recibe fondo rojo, contorno claro y halo rojo en la barra del nombre. El efecto sigue a `props.currentPlayer` y se coordina con las cartas actuales. La barra de monedas mantiene el fondo neutro.
3. El color asignado al jugador se conserva en el nombre cuando no es su turno. Los iconos mantienen transparencia y proporción.
4. En móvil, las barras siguen en una fila. Nombres largos se abrevian visualmente, conservando el nombre completo accesible; icono y saldo permanecen visibles.
5. La inspección de 2 a 6 jugadores no encuentra encabezados recortados o superpuestos entre sí, con cartas o con controles.
6. Los cambios se limitan a encabezado, estilos y assets derivados necesarios; no alteran datos de juego, turno, asientos ni lógica del servidor.

## F1 — Construir y revisar el encabezado (`FAILED`; reorquestación requerida)

**Pregunta única:** ¿el nuevo encabezado reproduce las referencias, sigue el turno real y permanece legible para 2–6 jugadores en escritorio y móvil?
**Entrada:** issue #16, este plan, `fotos/jugador.png`, `fotos/focus.png`, `fotos/player.webp`, `fotos/coin.webp`, `PlayerBoard.js` y `PlayerBoardStyles.css` desde `origin/master`.
**Subtareas:** copiar selectivamente los dos WebP locales a `coup-client/src/assets/`; incorporar icono y saldo en una fila; aplicar el estado activo al nombre usando la señal existente; ajustar tamaños, truncado y desbordamiento para móviles; producir reporte y capturas de evidencia.
**Áreas permitidas:** `coup-client/src/components/game/PlayerBoard.js`, `PlayerBoardStyles.css`, `coup-client/src/assets/player.webp`, `coin.webp` y artefactos de `docs/plans/player-header/`. No cambiar `playerBoardLayout.js`, `Coup.js`, servidor, reglas o controles del shell.
**Resultado:** el saldo completo queda visible a 320 CSS px, pero la inspección CDP válida encontró colisiones de encabezados con las cartas/asientos laterales en partidas de 5 y 6 jugadores. La misma geometría saturada aparece en el baseline de `origin/master`; eliminar esos cruces exige reposicionar asientos/cartas/controles, fuera del alcance autorizado. F1 queda `FAILED` y requiere reorquestación antes de otra implementación.
**Avanzar:** pasan los seis criterios anteriores y se entrega evidencia visual más compilación del cliente. **Pivotar:** solo ajustes CSS localizados dentro del encabezado. **Repetir:** una corrección visual acotada por viewport. **Bloquear/reorquestar:** si resolver una colisión requiere cambiar geometría de asientos, cartas u otras áreas fuera de alcance.
**Falsificación:** con seis jugadores y nombres largos a 320 px, ¿se oculta el saldo, se recorta el neón o se superpone el encabezado con otro jugador, las cartas o controles?
**Validación:** revisión manual en escritorio y móvil, incluidas vista de 320 px, 2–6 jugadores, nombres largos, saldos 0/2/10, turnos activo/inactivo y jugadores eliminados; compilación de coup-client y `git diff --check`. No añadir ni ejecutar tests automatizados.
**Publicación:** F1 falló el criterio 5 y requiere reorquestación. Por solicitud explícita del usuario, publicar esta rama en un PR draft para revisión visual de las capturas; declarar claramente que no está listo para integrar. Mantener la issue abierta y no fusionar ni cerrar.

## Topología, riesgos y revisión

El Alquimista reclama #16 en GitHub, relee el ticket y confirma que no hay reclamo incompatible; después crea/confirmar rama y worktree únicos desde `origin/master` actualizado. Todo el trabajo de F1 y su commit ocurre en ese worktree, asociado a una sola PR hacia `master`. El Orquestador revisa diff, reporte, capturas y compilación antes de aprobar integración o cierre.

El checkout raíz tiene cambios locales ajenos a esta unidad. No se deben limpiar, copiar ni incluir en la rama #16. El riesgo operativo principal son las fuentes de imagen locales e ignoradas, que deben copiarse selectivamente desde `fotos/`; no asumir que existen en `origin/master`. La PR #11 puede integrar cambios al shell durante la ejecución: antes de F1 el Alquimista parte de la base remota actual y revisa `PlayerBoard.js`/sus estilos vigentes.
