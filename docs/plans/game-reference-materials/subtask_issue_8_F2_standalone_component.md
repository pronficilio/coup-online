# Issue #8 — F2 subtask: componente de referencias aislado

**Estado del subtask:** `DONE — LISTO PARA REVISIÓN`

**Estado de F2:** `ACTIVE — PARCIAL`; no se emite `phase_verdict`.

**Dependencia de montaje:** issue #6, PR draft #11 abierto; modifica `Coup.js`/GameHeader y el shell de la partida.

## Entregable

- `coup-client/src/components/game/ReferencePanel.js`
- `coup-client/src/components/game/ReferencePanel.css`

El componente aporta su propio botón `Referencias` y modal con pestañas `Tarjeta`/`Tabla`. Abre en inglés y permite elegir `English` o `Español`. Incluye ajuste de imagen y vista a tamaño de 1024 px con desplazamiento cuando el viewport es estrecho.

El modal usa `react-modal`: cierra con botón, Escape o fondo y devuelve el foco al botón de apertura. Las pestañas tienen semántica ARIA y navegación con flechas izquierda/derecha, Home y End. El `img` se renderiza solo con el modal abierto y su `src` apunta a la combinación activa; lleva `decoding="async"`. La solicitud de red real queda pendiente del montaje y el recorrido.

## Límite de este avance

No se modificaron `Coup.js`, GameHeader ni estilos existentes del shell. El componente aún no está montado dentro de una partida, así que F2 no demuestra recorrido vivo/eliminado, continuidad de decisiones, retorno de foco observado ni solicitudes reales de red. Hay previews visuales aislados, pero no capturas de una partida integrada. F2 queda abierta hasta coordinar PR #11, montar el componente y recorrer la partida.

No se ejecutaron build ni pruebas automatizadas. La animación local de hoja ya está preparada: entrada/salida con `transform` y `opacity`, y sin transición ni demora de cierre con `prefers-reduced-motion`. F3 sigue formalmente `PENDING` porque requiere F2 integrada; no se emite veredicto ni se afirma validación de rendimiento.

## Capturas de preview aislado

**Caption:** “Preview del componente aislado; no captura de partida”. Las imágenes muestran `ReferencePanel` sobre un fondo neutro; no son evidencia de F2 integrada ni cierran F2/F3.

- `preview_issue_8_desktop.webp`: Tarjeta / English. Viewport observado: `1252 × 1399 CSS px`; WebP: `1282 × 1494 px`. La tarjeta se cargó y se decodificó (`naturalWidth=1024`).
- `preview_issue_8_mobile.webp`: Tabla / Español. Viewport observado: `492 × 843 CSS px`; WebP: `518 × 938 px`, escala 1:1. Se ven completos los controles y la tabla.

Los PNG temporales de captura no se versionan. Git conserva solo estos dos WebP de evidencia.
