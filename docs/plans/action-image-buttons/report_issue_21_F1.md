# Reporte F1 — issue #21: reducción e importación WebP

**Estado:** `CLOSED`
**Branch/worktree:** `issue/21-action-image-buttons` / `.worktrees/issue-21-action-image-buttons`
**Scope aplicado:** reducir las diez fuentes al 50 % y convertirlas a WebP, preservando el canvas RGB y el fondo. No se extrajo transparencia ni se reconstruyó el arte.

## Procedimiento

- Fuentes leídas en `/mnt/e/dev/coup/fotos/`; son PNG RGB ignorados por Git. No se escribieron ni versionaron.
- Derivados guardados en `coup-client/src/assets/action-buttons/`.
- Pillow 12.0.0 con libwebp 1.6.0.
- Redimensionado con `Image.Resampling.LANCZOS`; cada dimensión destino es `floor(origen × 0.5 + 0.5)`, que redondea las mitades hacia arriba.
- Codificación WebP con `quality=95`, `method=6`, `format="WEBP"`. Se conservaron los modos RGB y el canvas completo; alpha esperado: no.
- `gdk-pixbuf-thumbnailer` no se usó: una sonda con extensión `.webp` produjo PNG. Pillow confirmó soporte WebP y se utilizó para los derivados.

## Inventario

| Asset | PNG fuente | WebP derivado | Tamaño fuente | Tamaño WebP | Modo / alfa | Salida |
|---|---|---|---:|---:|---|---:|
| `ba.webp` | `ba.png` | `ba.webp` | 2172×724 | 1086×362 | RGB / no | 98,820 B |
| `ba-active.webp` | `ba-active.png` | `ba-active.webp` | 2172×724 | 1086×362 | RGB / no | 104,448 B |
| `bfa.webp` | `bfa.png` | `bfa.webp` | 1024×341 | 512×171 | RGB / no | 22,790 B |
| `bfa-active.webp` | `bfa-active.png` | `bfa-active.webp` | 1024×341 | 512×171 | RGB / no | 25,630 B |
| `bs.webp` | `bs.png` | `bs.webp` | 1024×341 | 512×171 | RGB / no | 27,080 B |
| `bs-active.webp` | `bs-active.png` | `bs-active.webp` | 1024×341 | 512×171 | RGB / no | 30,848 B |
| `pass.webp` | `pass.png` | `pass.webp` | 1020×341 | 510×171 | RGB / no | 20,838 B |
| `pass-active.webp` | `pass-active.png` | `pass-active.webp` | 1020×341 | 510×171 | RGB / no | 26,036 B |
| `c.webp` | `c.png` | `c.webp` | 1400×468 | 700×234 | RGB / no | 39,370 B |
| `c-active.webp` | `c-active.png` | `c-active.webp` | 1400×468 | 700×234 | RGB / no | 42,766 B |

Las diez salidas se volvieron a abrir como WebP después de escribirlas; las dimensiones/modes impresos por Pillow coincidieron con este inventario y cada pareja normal/activa coincide en tamaño.

## Revisión visual

Se comparó un contacto visual de las diez fuentes con otro de las diez salidas. Los cinco pares mantienen sus rótulos, símbolos, bordes, halos activos y fondos originales. No se observó recorte, cambio de proporción, pérdida visible de contenido ni fondo transparente inesperado. Los previews se generaron en `/tmp/issue21-source-review.png` y `/tmp/issue21-output-review.png`.

No se añadieron ni ejecutaron tests automatizados, ni se ejecutó build: F1 solo contiene recursos estáticos y el handoff reserva build/recorrido para F2/F3.

## Entrega y siguiente fase

F1 queda cerrada en el commit `feat(action-images): issue 21 F1 import optimized webp controls`. F2 permanece bloqueada por la coordinación/liberación de `Coup.js` y componentes de respuesta con #14 y #19; no se editaron superficies compartidas.
