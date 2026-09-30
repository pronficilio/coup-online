# Issue #72 — F3: verificación independiente

**Veredicto:** `PASS_LIMITED` para los anchos evaluados de **263 px en adelante**, por inspección estática. No es un `PASS` visual ni de DOM.

**Commit verificado:** `5e3369f8de047f3883d116333ab8c9bfa3d9e609` (`fix(game-ui): refine reference rail focus and tooltips`).

## Refutación estática

- **Borde y foco:** hasta 540 px, `outline-offset: -3px` dibuja el anillo de foco de 3 px dentro del botón. El primer botón ya no recorta el anillo en x=0 (incluidos 300, 321–337 y 521 px); en las cuadrículas con `gap: 2px`, el anillo no invade el control vecino. Falta comprobar por teclado que el indicador siga claramente visible y no tape el icono.
- **Tooltip:** entre 522 y 540 px el tooltip del primer trigger conserva `left: 0`, permite envolver texto y limita su caja a `100vw - 12px`; no se predice recorte horizontal. A 541 px el rail empieza aproximadamente en x=10 y el tooltip español corto “Tarjeta” queda centrado dentro del viewport. A ≤520 px se oculta la burbuja visual y se conservan los `aria-label`; el texto visual tiene `aria-hidden`.
- **Cartas y flujo:** el modelo CSS no muestra colisión del dock con las cartas ni con el siguiente bloque en ≥263 px. A 263 px el trigger compacto mide 32 px y deja unos 5 px hasta las cartas. En 321–360 px el dock sobresale 3 px del wrapper y quedan 9 px hasta el siguiente contenido; no hay colisión y supera el margen mínimo estático de 5 px.
- **Límite:** bajo 263 px la separación con cartas disminuye; bajo 253 px las cajas se cruzan. El CSS no impone ancho mínimo y este informe no aprueba ese rango.

## Evidencia pendiente en navegador

No hubo Chromium/runtime disponible. No se midieron `getBoundingClientRect()`, `scrollHeight` ni el espacio final, y no se probaron labels, sombras, EventLog, decisiones, tooltips, modales, orientación, altura corta ni navegación real por teclado/touch. La compensación de flujo está comprobada algebraicamente, pero no certifica el criterio de ≤16 px después del borde visual del tablero.

El walkthrough del propietario debe revisar mesas de 2, 3, 5 y 6 jugadores; anchos 263, 300, 320, 321–360, 361, 390, 438–439, 520–522, 540–541, 720–721, 1023–1024 y 1199–1200 px; foco a 263/300/521 px; tooltips con hover/teclado e idiomas largos; EventLog expandido; decisiones y apertura/cierre de cada modal; orientación y viewport de altura corta. Medir cajas de cartas, asientos, rail y EventLog, además de `scrollHeight` y el espacio al final.

La geometría estática no presenta un fallo en los anchos evaluados de 263 px o más. La tarea queda `WAITING_USER` para validación visual; no se afirma cobertura dinámica.
