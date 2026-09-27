# Reporte F4 — cobertura final y revisión independiente

**Estado:** `BLOCKED`; no se completó el recorrido manual requerido. Este documento no es un veredicto de aceptación.
**Base y evidencia:** producto en `9f97acb`; la comprobación local se inició desde HEAD `1e28666`, y este reporte F4 quedó versionado en `e9be456` sobre el branch canónico `issue/19-spanish-default-dictionary`.
**Estado de fases:** F1 `CLOSED`; F2/F3 `ACTIVE`; F4 `BLOCKED`. Issue #19 permanece `OPEN`; PR #22 sigue `DRAFT` mientras Orquestación prepara la integración parcial autorizada por el usuario.

## Alcance requerido

F4 debe revisar la correspondencia inventario→diccionario/interfaz, confirmar claves y marcadores, el build, y observar manualmente portada, lobby y partida (decisiones y registro incluidos). Después debe emitir un Verifier FINAL independiente con `PASS`, `FAIL` o `BLOCKED`. No se cierra F4 sin recorrido y veredicto independiente.

## Comprobación del entorno y bloqueo

- Se comprobó `PATH` para `chromium`, `chromium-browser`, `google-chrome`, `google-chrome-stable`, `chrome` y `firefox`; ninguno resolvió a un ejecutable.
- `coup-client/package.json` contiene scripts `start`, `start-pc`, `build`, `test` y `eject`; no declara Playwright, Puppeteer ni WebDriver en dependencias.
- No se encontró navegador disponible por otra herramienta local de esta sesión. No se inició el juego ni se observó/renderizó ninguna pantalla, decisión o mensaje de registro.
- No se instalaron dependencias para simular el entorno. No se añadieron ni ejecutaron tests.

Por estas razones, no hay evidencia visual/manual para portada, lobby, decisiones, tablero ni mensajes `g-addLog`; tampoco se puede afirmar que no haya texto inglés visible/accesible en un recorrido normal. El build previo de F2/F3 y las comprobaciones estáticas no sustituyen esta observación.

## Resultado y siguiente acción

F4 queda `BLOCKED` hasta habilitar un navegador y entorno local seguro para la partida manual. Una vez exista, recorrer portada, creación/unión de lobby, decisiones, tablero y registro; guardar pasos y resultados reproducibles. Luego Orquestación debe asignar un Verifier FINAL independiente con `translation_inventory.md`, el plan y criterios AC1–AC7, reportes F2/F3, este reporte y el diff consolidado. El Verifier debe inspeccionar inglés visible/accesible, ausencia de selector/ruta a `en`, paridad de claves/marcadores y preservación de valores/protocolos. El Alquimista no reclama ni emite ese veredicto por sí mismo.

El usuario autorizó ahora la integración parcial de PR #22 en `master` para revisión incremental aunque F4 siga bloqueada. Esa autorización no es aceptación del resultado: no marca F4 cerrada, no equivale al veredicto FINAL y no cierra #19. Orquestación ejecutará la transición desde DRAFT y el merge; al registrar esta actualización, la issue sigue `OPEN` y PR #22 sigue `DRAFT`.

Los cuerpos de issue #19 y PR #22 se actualizaron y releyeron el 2026-09-27 tras la reorquestación. La API confirmó #19 `OPEN`/asignada a `pronficilio` y PR #22 `OPEN`/`DRAFT`; ambos reflejan la autorización de integración parcial sin cambiar F4 `BLOCKED` y declaran que no hubo recorrido manual. El Alquimista no hizo transición de DRAFT ni merge.
