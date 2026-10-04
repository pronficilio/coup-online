# Reporte F1 — renderer y dependencias de issue #24

**Veredicto:** `CLOSED / PASS`
**Fecha:** 2026-09-27
**Branch/worktree:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity`

## Hallazgo

La base rebaseada incluye la PR #23 de #14 y la integración parcial de la PR #22 de #19. #14 está `CLOSED`. #19 sigue `OPEN` porque su recorrido manual y Verifier FINAL están pendientes; su trabajo de producto necesario para #24 ya está integrado, sin otra PR abierta sobre estas superficies.

El componente `ActionDecision.js` no está importado ni montado. El renderer vigente vive en `Coup.js`: para todo tipo de decisión recorre `decision.options`, localiza etiquetas a partir de `choiceId` y envía la opción elegida mediante `g-submitDecision`.

El servidor construye `actionChoices` usando saldo y objetivos vivos. Con 10+ monedas solo ofrece opciones `coup:<seat>`; debajo del umbral ofrece acciones normales, Coup desde 7 y Assassinate desde 3. Las acciones con destino llevan ese asiento en su `choiceId`. El cliente recibe solo elecciones permitidas, y el snapshot público incluye saldo. Así F2 puede agrupar la lista por acción, mostrar motivos para los controles que el servidor omite y activar solo IDs existentes, sin ampliar payloads ni reglas.

El diccionario integrado trae labels, descripciones, costos, beneficios, roles, bloqueos y textos de acción en `es`/`en`. La matriz final de #19 aún requiere recorrido manual; no existe cambio de producto pendiente que reserve el renderer.

## Decisión de orquestación

Cerrar F1 tras confirmar renderer, opciones, IDs, saldo y diccionario en la base publicada. Reorientar F2 al renderer genérico de `Coup.js`; no revivir el componente viejo. La fila de una acción con destinos abre una vista de objetivos y Cancelar vuelve sin enviar; escoger un destino envía exactamente el objeto de opción que generó el servidor. Las acciones simples envían su opción legal al seleccionarse.

La fila deshabilitada será solo informativa: no se crea un `choiceId` ni se llama a `submitChoice` para una acción que el servidor omitió. Se conservan 3/7 monedas y Coup obligatorio a partir de 10. El motor, sus decisiones y el protocolo quedan intactos.

## Evidencia consultada

- Issue #14 `CLOSED`; PR #23 `MERGED` a `master`.
- Issue #19 `OPEN`; PR #22 `MERGED` parcialmente a `master` en `5de95ee`. Sus fases de recorrido y Verifier siguen pendientes.
- `Coup.js`: handler `g-decision`, traducción por `choiceId` y renderer genérico de opciones.
- `server/game/coup.js`: `playTurn`, `actionChoices` y `beginAction` confirman filtro por monedas, IDs acción/destino y autoridad server-side.
- `translations.json`: etiquetas, descripciones, bloqueadores y precios de las siete acciones con mapas `es`/`en`.
- `git diff --check` limpio. No se modificó producto ni se ejecutaron tests o build en F1.

**Salida:** F1 cerrada. F2 queda `READY` para implementación por el Alquimista sobre `Coup.js` y sus estilos; una sola integración continúa prevista.
