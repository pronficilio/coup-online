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

No se modificaron `Coup.js`, GameHeader ni estilos existentes del shell. El componente aún no está montado dentro de una partida, así que F2 no demuestra recorrido vivo/eliminado, continuidad de decisiones, retorno de foco observado ni solicitudes reales de red, y todavía no hay capturas del panel. F2 queda abierta hasta integrar PR #11, montar el componente, recorrer la partida y guardar capturas.

No se ejecutaron build ni pruebas automatizadas; la revisión actual es estática y aislada. F3 no comenzó.
