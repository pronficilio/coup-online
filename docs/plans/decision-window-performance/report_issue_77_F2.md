# F2 — cierre anticipado por prefijo de prioridad (#77)

**Estado:** `CLOSED`; F3 `READY` para Verifier independiente.
**Branch/worktree:** `issue/77-decision-window-performance` / `.worktrees/issue-77-decision-window-performance`.
**Base:** `origin/master@ce53c28`; F1: `aa6c9a9`.

## Implementación

`openWindow()` instala el predicado `windowIsDetermined()`. Este recorre los asientos por prioridad y solo devuelve verdadero cuando encuentra un no-pass después de confirmar una respuesta para cada asiento previo. `submitChoice()` usa ese predicado además del cierre completo vigente. Por tanto, todos pasan todavía espera hasta la última respuesta.

El resultado anticipado usa el `closeDecision()` existente: cancela el timer, invalida la decisión activa al incrementar `stateVersion`, notifica el cierre a los humanos y llama una vez al resolver de la ventana. No se descartan votos que ya llegaron; el callback conserva el resolver de referencia y selecciona por asiento. El cierre tampoco depende del momento de llegada.

El predicado acompaña a `pausedDecision` y se restaura al reanudar. Las respuestas previas se conservan; el asiento que faltaba puede reanudar, recibe un envelope con ID/versión nuevos y las respuestas del envelope viejo se rechazan.

## Cobertura añadida/ajustada

- 144 escenarios diferenciales: `challenge`, `block` y `block_challenge`; las ocho asignaciones pass/no-pass para tres asientos y las seis permutaciones de llegada. En cada escenario se contrasta el seleccionado con el primer no-pass del resolver completo, se verifica que el cierre ocurre en el prefijo mínimo, que cada asiento recibe un único cierre y que una respuesta tardía no vuelve a resolver.
- Integración `challenge`: un challenge de menor prioridad llega primero; la ventana espera el pase previo y después selecciona ese challenge sin esperar otros votos.
- Integración de Ayuda Extranjera: el bloqueo espera los asientos previos y abre una sola ventana `block_challenge`; esta también espera su prefijo.
- La ruta de bloqueo de objetivo con un elegible sigue cubierta por la secuencia de Assassinate de `server/test/coup.test.js`, que responde pass a la ventana de bloqueo y continúa a pérdida de influencia.
- Una ventana excluye asientos muertos del prefijo.
- Se corrigió la prueba de timeout/reanudación para reflejar la conservación del pase, la nueva identidad del envelope y la autorización de un asiento sin responder.

## Validación

- `node test/coup.test.js` desde `server/`: **18 pasaron, 3 fallaron**. Todas las pruebas nuevas y las de challenge/block y timeout/reanudación pasaron. Las fallas restantes son aserciones preexistentes ajenas a #77: (1) `Exchange with one influence keeps one card and returns the rest to the Court deck` espera labels de opciones que el payload actual entrega como `undefined`; (2) `a seat disconnecting during a timeout pause makes that pause non-resumable` espera una pausa que la ruta actual disuelve al desconectar (política fuera del alcance #77); (3) `emergency Codex shutdown aborts an AI challenge and pauses without applying its answer` busca `g-gamePaused` en el registro broadcast del namespace aunque se emite directamente a sockets humanos. No se cambió ninguna de estas aserciones.
- `git diff --check`: sin errores.
- No se ejecutó la suite completa del proyecto.

## Veredicto y siguiente paso

F2 `CLOSED`: hay escenarios con cierre anterior a respuestas posteriores; la selección coincide con la referencia completa en las asignaciones y permutaciones cubiertas; el cierre invalida envelopes tardíos y ocurre una sola vez; timeout/reanudación conserva el prefijo respondido. Las tres fallas ajenas quedan registradas y fuera de alcance. F3 debe intentar falsificar AC1–AC8 independientemente, con atención a todas las rutas de `openWindow()`, cierre/timer y pausas recuperables. No abrir integración hasta recibir el veredicto independiente requerido.
