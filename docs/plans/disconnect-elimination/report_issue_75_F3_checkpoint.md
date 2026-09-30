# Issue #75 — checkpoint de hallazgos F3

## Procedencia y estado

Este archivo registra los hallazgos del Verifier comunicados al Ejecutor; no es una nueva revisión independiente ni sustituye `report_issue_75_F3_verifier.md`. El Verifier informó `FAIL` sobre `d9fad75` y solicitó una nueva F3 después de la corrección F2 actual. No se ejecutaron pruebas, build ni runtime durante esta corrección.

## Hallazgos recibidos

### 1. Blocker desconectado fuera de `block_challenge.allowed`

El blocker no es respondedor de `block_challenge`. Si se desconectaba, el bloque seguía pendiente; un reto posterior podía abrir `prove_claim` para el claimant muerto. `openDecision()` filtraba ese asiento, llamaba `resolve([])` y creaba una pausa no reanudable falsa.

F2 corrigió esta ruta en `d9fad75`: el bloqueo pendiente se registra en `currentAction.pendingBlock`; al desconectarse su blocker, el servidor descarta `block_challenge`, marca el bloque cancelado y resuelve la acción sin bloqueo. La protección en `openProofDecision()` evita abrir una decisión para cualquier claimant muerto.

### 2. Dos humanos desconectados durante una pausa recuperable

Contraejemplo informado para `d9fad75`: asiento B=0 es blocker offline, A=1 es actor de `foreign_aid` offline y C=2 está conectado. Cuando C llama `resume()`, la búsqueda por orden de asientos procesaba primero B. La invalidación del bloque cambiaba la fase a `running` y acreditaba `+2` a A; `resume()` dejaba de buscar y devolvía un rechazo antes de eliminar A. Las acciones dirigidas también requieren procesar primero el actor offline para cancelar su acción antes de la transición causada por otro asiento.

Corrección F2 actual: `resume()` prioriza `currentAction.actor`, luego el blocker pendiente, luego `currentAction.target` y después los demás humanos sin socket; sigue buscando mientras el estado sea `paused` o `running`. Si una desconexión cambia la partida a `running`, las ausencias restantes se procesan antes de salir; al finalizar, la llamada de resume se considera atendida en vez de emitir un rechazo falso. El bucle termina si el juego llega a un estado terminal. En el caso B/A/C, se elimina primero A y se cancela su acción; luego se procesa B y no se concede dinero a un actor desconectado. Para una acción dirigida, el actor ausente se cancela antes de que la desconexión del objetivo/blocker pueda continuar la acción. Priorizar blocker/target además evita que otro challenger complete la ventana con un pase o que la acción se cierre antes de podar el objetivo.

## Evidencia y siguiente paso

Los dos puntos anteriores proceden del Verifier y de la corrección aplicada en `server/game/coup.js` / F2. La revisión actual del Ejecutor es estática. El Verifier debe repetir F3 sobre el nuevo commit para confirmar o refutar la corrección; no se registra aquí un veredicto F3 nuevo.
