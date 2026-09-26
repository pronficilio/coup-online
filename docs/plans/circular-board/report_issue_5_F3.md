# Reporte F3 — disposición responsiva

**Veredicto:** `CLOSED / READY_REVIEW` — evidencia visual 2..6, turno y estados de influencia lista para revisión independiente.
**Issue:** #5  
**Branch/worktree:** `issue/5-circular-board` / `.worktrees/issue-5-circular-board`

## Cambio

- El modo compacto del tablero se activa hasta `520px` (antes `460px`). En la captura estrecha, Edge reportó `488×1106` CSS px; el nuevo corte hace que las manos y asientos usen el tamaño compacto en ese ancho físico de móvil.
- No hubo animación ni cambio del panel de acciones/turno.

## Matriz visual

Las capturas de escritorio se solicitaron a `1280×1400`; las estrechas a `490×1200` de Edge headless, con viewport medido de `488×1106` CSS px. La ruta temporal montó el `Coup`, `PlayerBoard` y `ActionDecision` reales con un socket local de muestra.

| Jugadores | Escritorio | Ancho compacto | Resultado |
|---:|---|---|---|
| 2 | [2p escritorio](preview_issue_5_F3_2p_desktop.png) | [2p compacto](preview_issue_5_F3_2p_mobile.png) | Asientos enfrentados; mazo centrado; controles visibles debajo. |
| 3 | [3p escritorio](preview_issue_5_F3_3p_desktop.png) | [3p compacto](preview_issue_5_F3_3p_mobile.png) | Rojo abajo, Azul arriba y Verde a la derecha; sin colisión. |
| 4 | [4p escritorio](preview_issue_5_F3_4p_desktop.png) | [4p compacto](preview_issue_5_F3_4p_mobile.png) | Un asiento por orilla; nombres, cartas y mazo caben. |
| 5 | [5p escritorio](preview_issue_5_F3_5p_desktop.png) | [5p compacto](preview_issue_5_F3_5p_mobile.png) | Distribución circular regular; espacios entre asientos. |
| 6 | [6p escritorio](preview_issue_5_F3_6p_desktop.png) | [6p compacto](preview_issue_5_F3_6p_mobile.png) | Máximo de reglas; seis asientos legibles sin tapar el centro. |

## Estados y controles

- [Turno de Azul con 3 jugadores](preview_issue_5_F3_3p_turn_azul.png): el borde neón cambia de Rojo a la mano del jugador activo.
- [Verde perdió una influencia](preview_issue_5_F3_6p_lost_verde.png): queda una carta activa y un slot inactivo, sin mover su asiento.
- [Naranja eliminado](preview_issue_5_F3_6p_dead_naranja.png): conserva su asiento con slots inactivos; el resto del círculo no se reordena.
- `ActionDecision` es el componente de producción: sus siete botones se renderizan debajo de la mesa y no se superponen con asientos ni con el mazo.

## Validación y límites

- `npm run start-pc`: compiló correctamente durante el preview; el servidor se detuvo al terminar.
- `git diff --check`: pasó, con avisos de autocrlf para el CSS modificado pero sin errores de whitespace.
- `App.js` se restauró desde `HEAD`; la ruta/harness temporal no quedó en el producto.
- Los eventos `g-updatePlayers`, `g-updateCurrentPlayer` y `g-chooseAction` se emitieron desde un socket local de muestra para renderizar estados. No se abrió una partida socket real ni se hizo clic en una decisión. La captura demuestra disponibilidad visual de controles, no una validación de red/acción.
- No se ejecutaron tests ni build de producción. Sin cambios de servidor, protocolo, reglas o paneles de acción/turno.

**Siguiente paso:** revisión independiente final del branch. El issue permanece abierto y no se creó PR.
