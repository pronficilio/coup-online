# Reporte F2 — issue #24

**Veredicto:** `BLOCKED`

**Issue:** [#24](https://github.com/pronficilio/coup-online/issues/24), sigue `OPEN` y asignada a `pronficilio`.

**Fase siguiente:** F3 permanece `PENDING`; requiere que F2 complete su recorrido manual.

**Branch/worktree:** `issue/24-turn-action-row-clarity` / `.worktrees/issue-24-turn-action-row-clarity`.

## Trabajo revisado

- `Coup.js` limita el nuevo renderer a `decision.type === 'action'`; los demás tipos siguen por la ruta genérica existente.
- El menú agrupa las opciones que contiene `decision.options` por el prefijo de `choiceId`. Las filas disponibles usan los objetos originales del servidor y `submitActionChoice` comprueba que el objeto siga presente en `decision.options` antes de enviarlo. Esta revisión es estática; no se observó tráfico Socket.IO en un navegador.
- Coup, Assassinate y Steal abren únicamente destinos contenidos en las opciones agrupadas. La cancelación vuelve al menú sin llamar al emisor; el código usa un cerrojo local para evitar doble envío.
- Las filas sin opciones no reciben handler de acción ni selector de destino, no construyen un `choiceId` y exponen el motivo con `aria-describedby`. El hint se presenta como bubble al hover/foco y queda visible para dispositivos con `hover: none` o puntero grueso. Estilos incluyen estado de foco y `prefers-reduced-motion`.
- Se añadieron entradas paralelas `es`/`en` para precios y disponibilidad. El diff de producto se limita a `Coup.js`, `CoupStyles.css` y `translations.json`.

Estos puntos son observaciones del código y no confirman el comportamiento en navegador.

## Comprobaciones ejecutadas

- `npm run build` desde `coup-client`: **exit 0**, “Compiled with warnings”; artefactos de producción generados. Tamaños reportados: 108.14 kB JS y 6.75 kB CSS gzip.
- Warnings del build: imports `logo` y `Link` sin usar en `src/App.js`; `postcss-calc` no interpreta las unidades `dvh` existentes en `src/components/game/ReferencePanel.css` (líneas 100 y 106); `caniuse-lite` está desactualizado. El reporte de lint no señala los archivos modificados.
- `git diff --check`: **pasa**.
- No se ejecutaron tests automatizados, según el handoff.
- La inspección de disponibilidad de navegador no encontró Playwright, Puppeteer, `@playwright/test`, Chromium, `chromium-browser` ni `google-chrome` disponibles en este entorno. El Chrome instalado en Windows, ejecutado desde WSL, falla antes de abrir con `/bin/bash: ... WSL (2 - ) ERROR: UtilBindVsockAnyPort:307: socket failed 1`.

## Evidencia pendiente

No se hizo recorrido manual ni se generaron capturas. Quedan sin observarse en ejecución:

- Estado normal, hover/foco y disabled comparados visualmente con las tres referencias, incluidos contraste, redondeo, calidez y ausencia de desplazamiento de filas.
- Explicación disabled al apuntar/enfocar, legibilidad en táctil, recorte en primera/última fila y posible solapamiento con objetivos o respuestas.
- Umbrales 2/3, 6/7 y 9/10 monedas; teclado (Enter/Espacio/Escape), foco restaurado al cancelar, toque y lector de pantalla.
- Selección de destinos legales, cancelación sin emisión, envío único del `choiceId` original y ausencia de emisiones al activar/enfocar filas prohibidas.
- `prefers-reduced-motion` y continuidad del renderer para otros tipos de decisión.

## Motivo y siguiente paso

F2 no puede recibir `CLOSED / PASS` mientras falte la validación manual explícita en el plan. El bloqueo concreto es que el worktree no tiene una vía funcional para abrir la aplicación en un navegador; instalar dependencias/herramientas nuevas no se consideró. El Orquestador debe coordinar acceso a un navegador funcional; entonces se completará el recorrido y se registrará evidencia antes de iniciar F3 con Verifier independiente. La issue continúa abierta; no se abrió PR ni se integró el branch.
