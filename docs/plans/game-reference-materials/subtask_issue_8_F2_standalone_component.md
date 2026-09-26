# Issue #8 — F2 subtask: componente de referencias aislado

**Estado del subtask:** `DONE — LISTO PARA REVISIÓN`

**Estado de F2:** `ACTIVE — PARCIAL`; no se emite `phase_verdict`.

**Dependencia de montaje:** issue #6, PR draft #11 abierto; modifica `Coup.js`/GameHeader y el shell de la partida.

## Entregable

- `coup-client/src/components/game/ReferencePanel.js`
- `coup-client/src/components/game/ReferencePanel.css`

El componente ofrece botones separados `Tarjeta` y `Tabla`; cada uno abre su propio modal con una sola referencia. No hay encabezado, título ni controles para cambiar de referencia dentro del modal. El idioma está fijo en español hasta que exista la configuración de idioma. Cada imagen se ajusta al viewport para evitar el scroll.

Cada modal usa `react-modal`: cierra con botón, Escape o fondo y devuelve el foco a su botón de apertura. El `img` solo está montado para el modal abierto y usa `decoding="async"`; la solicitud de red real queda pendiente del montaje y el recorrido.

## Límite de este avance

No se modificaron `Coup.js`, GameHeader ni estilos existentes del shell. El componente aún no está montado dentro de una partida, así que F2 no demuestra recorrido vivo/eliminado, continuidad de decisiones, retorno de foco observado ni solicitudes reales de red. Hay previews visuales aislados, pero no capturas de una partida integrada. F2 queda abierta hasta coordinar PR #11, montar el componente y recorrer la partida.

No se ejecutaron build ni pruebas automatizadas. La animación local de hoja ya está preparada: entrada/salida con `transform` y `opacity`, y sin transición ni demora de cierre con `prefers-reduced-motion`. F3 sigue formalmente `PENDING` porque requiere F2 integrada; no se emite veredicto ni se afirma validación de rendimiento.

## Capturas de preview aislado

**Caption:** “Preview del componente aislado; no captura de partida”. Las imágenes muestran `ReferencePanel` sobre un fondo neutro; no son evidencia de F2 integrada ni cierran F2/F3.

- `preview_issue_8_desktop.webp`: modal independiente de Tarjeta / Español. Viewport observado: `1252 × 1399 CSS px`; WebP: `1282 × 1494 px`. La tarjeta aparece completa dentro del modal.
- `preview_issue_8_mobile.webp`: modal independiente de Tabla / Español. Viewport observado: `492 × 843 CSS px`; WebP: `518 × 938 px`, escala 1:1. La tabla aparece completa dentro del modal, sin scroll.

Los PNG temporales de captura no se versionan. Git conserva solo estos dos WebP de evidencia.
