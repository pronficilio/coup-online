# Issue #8 — F1: referencias WebP

**Veredicto:** `CLOSED`
**Fecha:** 2026-09-25 (America/Mexico_City)
**Encoder:** Pillow 11.3.0 / libwebp 1.5.0, Python 3.12.4
**Método:** resize con Lanczos; WebP `quality=85`, `method=6`.

## Resultados

| Fuente local | Activo versionado | Dimensiones fuente → final | Bytes finales |
|---|---|---:|---:|
| `fotos/card.png` | `card-en.webp` | 1024×1536 → 1024×1536 | 196622 |
| `fotos/tarjeta.png` | `card-es.webp` | 1024×1536 → 1024×1536 | 191454 |
| `fotos/table.png` | `table-en.webp` | 1448×1086 → 1024×768 | 64782 |
| `fotos/tabla.png` | `table-es.webp` | 1448×1086 → 1024×768 | 64214 |

Los cuatro resultados se reabrieron con Pillow y se verificaron como WebP de 1024 px de ancho. Las tarjetas mantuvieron 2:3; las tablas, 4:3. Suman **517072 bytes**. Las cuatro fuentes sumaban 8470413 bytes; los resultados pesan aproximadamente 6.1% de ese total, incluyendo la reducción de resolución de las tablas.

## Revisión visual y reglas

Se inspeccionaron los cuatro WebP a sus dimensiones nativas. Los títulos, textos, iconos y líneas permanecen completos, sin recortes visibles ni artefactos que impidan leerlos. La tipografía secundaria de las tablas es pequeña en su presentación completa y requiere ampliación para lectura cómoda en un viewport estrecho; el plan de F2 ya contempla ajuste y ampliación.

Se contrastaron ambos idiomas con `coup-client/src/components/RulesModal.js`, `coup-client/src/components/game/ActionDecision.js` y `server/utilities/constants.js`. Ingreso/Income da 1 moneda; Ayuda Extranjera/Foreign Aid, 2 y puede bloquearla el Duque; Impuesto/Tax, 3; robar/Steal, 2; Asesinar/Assassinate cuesta 3 y hace perder una influencia; Intercambiar/Exchange usa dos cartas; Golpe/Coup cuesta 7 y requiere Coup al iniciar con 10 o más. El contraataque de **robar** en la tabla está representado como bloqueo por Capitán o Embajador (Captain or Ambassador), según el contrato del issue y la interfaz de reglas.

Al revisar el código se observó que `ActionTypes.steal.blockableBy` repite `AMBASSADOR`, mientras la interfaz, `CounterActions.block_steal` y la resolución del juego contemplan Capitán y Embajador. No se cambió código fuera de F1; la imagen concuerda con las reglas visibles y con la resolución del contraataque. Queda registrado para que la integración de F2 valide el recorrido.

## Alcance y evidencia

- En `coup-client/src/assets/references/` se generan solo los cuatro WebP previstos; no se copió ni versionó ningún PNG fuente.
- Las fuentes permanecen en el directorio local ignorado `fotos/`.
- F1 no requiere build; se validaron formato/dimensiones con Pillow e inspección visual de cada archivo.
- F1 queda cerrada. F2 permanece pendiente de coordinación con #6 antes de modificar la cabecera/juego.
