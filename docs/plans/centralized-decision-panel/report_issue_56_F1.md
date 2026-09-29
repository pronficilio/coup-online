# Issue #56 — F1: inventario de decisiones, renderers y assets

**Veredicto:** `PASS` para inventario estático. No se modificó código de producto ni se hizo walkthrough dinámico.
**Base inspeccionada:** `origin/master@b8df17fd71ad5024228fe7021f8ebb6d3973cff7`, que contiene PR #55 y #57.

## Contrato y ubicación actuales

El servidor crea la lista autorizada por asiento y `activateDecision` emite la decisión únicamente a los asientos elegibles, junto con sus `options`. El cliente envía una selección usando `{ decisionId, stateVersion, choiceId }`. F2 debe conservar este contrato y no inferir opciones permitidas en el navegador.

| Tipo visible | Origen/uso | Render actual | Destino en F2 |
| --- | --- | --- | --- |
| `action` | Acciones del turno propio | `renderActionDecision` en `ActionDecisionRail` | Se conserva en el panel común |
| `exchange` | Intercambio del Embajador; pool privado de cartas | `ExchangeDecisionPanel` en `ActionDecisionRail` | Se conserva dentro del panel común |
| `challenge` | Reclamo de influencia de una acción | `.DecisionsSection` debajo del tablero; Challenge/Pass usan imágenes | Botones textuales en panel común |
| `block` | Contraacción elegible para esa acción | `.DecisionsSection`; Block usa imágenes y Pass imagen | Botones textuales en panel común |
| `block_challenge` | Reclamo de un bloqueo | `.DecisionsSection`; Challenge/Pass usan imágenes | Botones textuales en panel común |
| `prove_claim` | Jugador que debe probar un reclamo | `.DecisionsSection`; botones planos | Botones textuales en panel común |
| `lose_influence` | Elegir una influencia que revelar/perder | `.DecisionsSection`; botones planos | Botones textuales en panel común |

`claim` se registra en el historial del servidor, pero no es un `decision.type` enviado para renderizar opciones. No se encontró otro tipo visible en el ciclo actual. #47 ya puso Exchange dentro del rail y #45 añadió estado local para conservar resaltada la respuesta enviada; la migración de botones debe preservar ambos comportamientos.

`Coup.js` monta en `.DecisionsSection` dos controles fuera de las decisiones de juego: emergencia de Codex y revancha. Ambos también son botones bajo el tablero. F2 moverá emergencia al encabezado y revancha al panel central de resultado para dejar la sección inferior sin botones.

## Assets y estilos

`Coup.js` importa y `ResponseImageButton` consume cinco pares WebP de `coup-client/src/assets/action-buttons/`: `ba`, `bfa`, `bs`, `c` y `pass`, cada uno con una variante `-active`. Las búsquedas de importación/referencia en `coup-client/src` solo encuentran esos recursos en `Coup.js`/`ResponseImageButton.js` y sus reglas en `CoupStyles.css`. `claim.webp` y `claim-active.webp` están presentes en la carpeta pero no tienen consumidor en el código cliente.

Después de retirar importaciones y renderer, los doce WebP de `action-buttons/`, `ResponseImageButton.js` y los selectores CSS `ResponseImageButton*` quedan sin referencias de producto. El Ejecutor comprobará referencias de código de nuevo antes de eliminarlos; menciones históricas en documentos no son consumidores de runtime.

## Copy y presentación

El manual separa Actions, Counteractions y Challenges. Se mantiene el título de trabajo «Acciones y contraacciones» / “Actions and counteractions”, con encabezados auxiliares específicos de la decisión. Ayuda general propuesta: «Elige una acción o respuesta. Las acciones con reclamos de influencia pueden desafiarse; solo algunas admiten bloqueo o contraacción, según las reglas.» La pantalla de bloqueo debe indicar que el reclamo puede ser desafiado. Los desafíos, la prueba de reclamo, la pérdida de influencia y el intercambio tendrán instrucciones propias; no se repetirá una promesa genérica de bloqueo.

## Ciclo de vida que debe permanecer

- Nueva decisión: reset de selección/enviado/error y desmontaje de la decisión anterior.
- `g-decisionAccepted`: controles quedan enviados/deshabilitados; conservar visualmente la opción seleccionada del botón textual.
- `g-decisionRejected`: permitir reintento y retirar el resaltado enviado.
- Cierre, pausa, reanudación, game over y desconexión: no dejar botones de decisiones obsoletas; pausa conserva su overlay y acción de reanudar.
- Rail: reutilizar el anchor y posicionamiento portalizado de `ActionDecisionRail`, extenderlo a todo tipo de decisión recibido y conservar respuesta bajo el panel de acciones sin render bajo `PlayerBoard`.

## Cierre F1

La ruta de render, inventario de opciones y referencias de assets están identificados para F2. Hallazgo adversarial: si se quita la instancia inferior pero no se incluye `prove_claim`/`lose_influence` en el rail, el jugador podría quedarse sin forma de resolver una decisión válida. F2 los migrará desde `decision.options` y F3 comprobará los tipos restantes.
