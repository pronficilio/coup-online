# Issue #72 — F3: verificación independiente

**Veredicto:** `PASS_LIMITED` por revisión estática para anchos de **259 px en adelante**, con los roles actuales en español/inglés. No es un `PASS` visual ni de DOM.

**Commit verificado:** `dcef853f221eec2f723bfb3593d46d441fb82419` (`fix(game-ui): align reference rail with player cards`). HEAD coincide con ese hash y el worktree estaba limpio.

## Refutación estática

- **Caja de flujo:** `.PlayerBoardLayout` compensa en `margin-top` los mismos offsets base y de cinco jugadores que antes trasladaban el tablero pintado; `.PlayerBoardContainer` ya no aplica ese transform. La caja del tablero queda limitada a `min(100%, 900px)`. Hasta 720 px ambos offsets vuelven a cero. El asiento observer sigue centrado en `top:86%`, de modo que queda el 14% inferior usado por la fórmula.
- **Reserva inferior:** la fórmula añade al margen solo `max(0, sectionBottom−B)` y mantiene 12 px después del contenido estimado. Desktop usa `39.36px + media altura de carta − min(14vw,126px)`; móvil usa `31.36px + media altura de carta − 14vw`. Los términos constantes incluyen medio header (30/18 px), medio margen (7/3 px), el gap y una etiqueta de hasta dos líneas. Las dos etiquetas de las cartas están en columnas: se usa la entrada más alta, no se suman ambas. El clearance calculado es ≈37.2 px a 263 px, ≈32 px a 300 px, ≈29.2 px a 320 px, ≈22.3 px a 521 px y ≈5.1 px con tablero de 900 px y carta de 124.8 px.
- **Posición horizontal:** el rail es absoluto, parte del borde derecho del ancho de la fila observer (`2 × ancho de entrada + 5px`) con su separación responsive, y alinea su borde inferior al section. Los tamaños estáticos caben desde 259 px; a ese ancho mínimo deja 5 px al borde derecho. En 361–438 px ocupa 90×90 px, en 439–520 px 114×114 px, entre 521–531 px 160 px de ancho y desde 532 px el rail de 172 px deja ≈9.5 px en el viewport mínimo y más al crecer el ancho.
- **Asientos 5p/6p y accesibilidad:** las cajas de los asientos laterales bajos pueden coincidir horizontalmente con el dock, pero quedan por encima en el modelo estático. El tooltip visual se oculta hasta 520 px y los botones conservan `aria-label`; entre 521–600 px el primero se limita a `100vw - 12px`. Las traducciones largas aún requieren verificación visual. El anillo de foco se dibuja dentro del botón en los anchos compactos.

## Límites y evidencia pendiente

La reserva contempla hasta dos líneas para los nombres de rol actuales (`Embajador`/`Ambassador`). El CSS permite wrapping sin límite; una cadena más larga, por ejemplo el fallback “Personaje desconocido” o una traducción futura, podría desbordar esa cota. Bajo 259 px el dock mínimo de 58 px ya no conserva los 5 px laterales.

No hubo navegador/runtime durante F3. No se midieron `getBoundingClientRect()` ni `scrollHeight`, ni se verificaron visualmente sombras, stacking, labels, foco real, tooltips, EventLog, decisiones, modales, orientación o altura corta. Por ello el criterio de ≤16 px después del borde pintado sigue pendiente de DOM y walkthrough del propietario.

El walkthrough debe revisar 2, 3, 5 y 6 jugadores; anchos 259/300/320/361/390/438/439/520/521/600/720/900/1024/1200 px; foco y tooltips con hover/teclado; asientos bajos con labels visibles; EventLog expandido, decisiones y cada modal; además de `getBoundingClientRect()` y `scrollHeight`.

La unidad queda `WAITING_USER`. No se afirma aprobación visual ni cobertura dinámica.
