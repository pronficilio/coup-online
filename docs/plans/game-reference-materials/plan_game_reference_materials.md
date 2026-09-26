# Issue #8: referencias visuales para la partida

**Estado:** `ACTIVE`
**Issue:** https://github.com/pronficilio/coup-online/issues/8
**Handoff:** `docs/plans/inbox/issue_8_game_reference_materials.md`
**Bitácora:** `docs/plans/log/issue-8.jsonl`

## Objetivo

Dar acceso dentro de la partida a la tarjeta de acciones y a la tabla de referencia, ambas en inglés y español. Optimizar las cuatro imágenes como WebP de 1024 px de ancho y calidad 85; versionar solo esos WebP entre los recursos gráficos de esta función.

## Perfil operativo

- Proyecto: `coup-online`; tracker GitHub en `pronficilio/coup-online`.
- Rama base y merge target: `master`, según `docs/plans/PROJECT_ORCHESTRATION.yaml` y los remotos del checkout.
- Issue canónica: #8, abierta.
- Rama/worktree de la unidad: `issue/8-game-reference-assets` / `.worktrees/issue-8-game-reference-assets`.
- Aislamiento creado desde `origin/master` actualizado, commit base `febec397d3dcd9c2472a61910c8441800c939326`.
- Claim: la issue #8 está asignada a `pronficilio` por el Orquestador; antes de asignar se verificó que estaba abierta y sin reclamo previo.
- Integración: un único PR de la rama de issue a `master`, asociado a #8.
- Ejecutor: Agente Alquimista.
- Modo: `LIGHT`; riesgo: `LOW`; verificación independiente: `NONE`.
- Validación funcional y visual: manual, con build del cliente en cierre; no agregar pruebas automatizadas para esta función.

## Alcance

- Sustituir el acceso actual a `Cheat Sheet` por un botón `Referencias` dentro de la partida. Conservar el acceso separado a las reglas.
- Presentar `Tarjeta` y `Tabla` en un panel, con selector de idioma `English / Español`; abrir inicialmente en inglés.
- Generar cuatro archivos en `coup-client/src/assets/references/`:
  - `card-en.webp` desde `fotos/card.png`.
  - `card-es.webp` desde `fotos/tarjeta.png`.
  - `table-en.webp` desde `fotos/table.png`.
  - `table-es.webp` desde `fotos/tabla.png`.
- Cada archivo final mide exactamente 1024 px de ancho, mantiene su proporción original y usa codificación WebP calidad 85. Las tarjetas fuente ya miden 1024 px de ancho; las tablas fuente miden 1448 px y se reducen proporcionalmente.
- Los PNG fuente están en el directorio local ignorado `fotos/`. No agregarlos ni copiarlos a la rama. De las imágenes de referencia, el diff de Git contiene solo los cuatro WebP finales.
- Cargar la imagen activa bajo demanda; no precargar ni montar las otras tres al abrir la partida.
- Hacer el panel responsive y permitir ampliar/desplazar la imagen para leer texto en pantallas pequeñas.
- Animar la entrada y salida como una hoja mediante `transform` y `opacity`. Respetar `prefers-reduced-motion` y no instalar dependencias de animación.
- Mantener intactos reglas, servidor, Socket.IO y flujo de decisiones.

## Criterios de aceptación

1. Hay cuatro WebP, uno por imagen e idioma; cada uno mide 1024 px de ancho, conserva proporción y se codificó con calidad 85. El reporte F1 registra dimensiones, bytes, encoder/versión y método de conversión.
2. El arte y sus textos siguen siendo legibles con ajuste a pantalla y al ampliar. Se contrasta el contenido con las reglas actuales; una discrepancia se documenta para reorquestación, no se corrige alterando arte sin aprobación.
3. El diff no agrega PNG ni formatos de imagen alternativos para estas referencias; `/fotos/` permanece como fuente local ignorada.
4. Durante una partida cualquier jugador vivo o eliminado puede abrir ambas referencias, alternar idioma y cerrar la consulta sin perder el estado de juego.
5. La carga de la partida no solicita estas imágenes antes de abrir el panel; al abrir o alternar se solicita solo el WebP seleccionado.
6. El panel sirve en escritorio y móvil; cerrar con botón, Escape o fondo funciona y el foco vuelve al control que lo abrió. Se puede usar con teclado y tacto.
7. La entrada y salida usan solo `transform`/`opacity`, no causan desplazamiento del tablero ni interfieren con una respuesta del juego; movimiento reducido elimina la transición.
8. El build del cliente pasa y la revisión manual documenta apertura, cierre, pestañas, idiomas, solicitudes de red, legibilidad, viewport pequeño y movimiento reducido.

## Fuera de alcance

- Rediseñar el tablero, el panel de acciones, el registro de eventos o las reglas.
- Traducir la interfaz general del juego.
- Cambiar contenido o ilustraciones de las cuatro fuentes.
- Agregar lógica, endpoints, eventos Socket.IO, dependencias o pruebas automatizadas.
- Versionar PNG originales o artefactos de conversión intermedios.

## Fases de ejecución

### F1 — Preparar las cuatro referencias WebP (`ACTIVE`)

**Pregunta:** ¿se pueden entregar las cuatro referencias en WebP calidad 85 y ancho exacto de 1024 px, conservando proporción y legibilidad?
**Entrada:** las fuentes locales `fotos/card.png`, `fotos/tarjeta.png`, `fotos/table.png` y `fotos/tabla.png`; el contrato de dimensiones y formato de esta issue.
**Trabajo:** confirmar acceso a las fuentes desde el worktree; usar un encoder disponible sin sumar dependencias; conservar proporción; generar los cuatro WebP en `coup-client/src/assets/references/`; comprobar dimensiones finales, visualización y bytes; comparar el contenido con las reglas; escribir reporte y registrar la fase en bitácora. No copiar los PNG fuente al worktree.
**Evidencia:** `docs/plans/game-reference-materials/report_issue_8_F1.md` con tabla origen/destino, dimensiones, proporción, encoder y versión, calidad, tamaño en bytes y revisión visual.
**Avanzar:** cuatro archivos cumplen formato, ancho, proporción y legibilidad; el diff de activos contiene solo WebP. **Pivotar:** si el encoder disponible altera proporción o arte, cambiar el método local de conversión sin añadir dependencia al producto. **Repetir:** una corrección acotada por archivo si dimensión o legibilidad falla. **Bloquear:** si alguna fuente local no está disponible o la calidad 85 no mantiene la lectura a 1024 px; informar exactamente cuál recurso o evidencia falta.
**Validación:** inspección de metadatos/dimensiones y revisión visual a ajuste y ampliación; no se requiere build todavía.
**Commit:** `COMMIT_REQUIRED`; incluir cuatro WebP, reporte y evento `phase_verdict`; mensaje `feat(reference-assets): issue 8 F1 CLOSED advance_f2`.

**Estado actual (2026-09-25):** reanudada tras la autorización del usuario para completar #8 y abrir el PR con capturas. Las fuentes existen en `E:\dev\coup\fotos\`; F1 continúa con conversión local, inspección visual y reporte.

### F2 — Integrar el botón y el panel de consulta (`PENDING`)

**Pregunta:** ¿el jugador puede abrir, navegar y cerrar las cuatro referencias desde la partida sin alterar el estado de juego?
**Dependencias:** F1 cerrada y #5 integrada a `master`. Antes de editar `Coup.js` o su cabecera, revisar el estado de #6 y acordar/registrar el punto de montaje para evitar dos cambios concurrentes al mismo shell. Si #6 está editando esa zona, esperar su integración o una reorquestación explícita del Orquestador.
**Trabajo:** reemplazar el disparador visual del `CheatSheetModal` por `Referencias`; mantener `RulesModal`; crear pestañas `Tarjeta`/`Tabla`, selector de idioma con inglés inicial, carga condicional de una sola imagen, cierre por control/Escape/fondo, retorno de foco y presentación accesible para teclado/tacto. Mantener el juego y las decisiones utilizables inmediatamente tras cerrar.
**Evidencia:** `docs/plans/game-reference-materials/report_issue_8_F2.md` con montaje utilizado, matriz de controles y resultado de recorridos en partida.
**Avanzar:** ambos tipos de referencia y ambos idiomas funcionan desde la partida en los estados vivo/eliminado; no se pierden turnos ni decisiones al abrir/cerrar. **Pivotar:** ajustar el punto de composición tras revisar #5/#6. **Repetir:** una corrección localizada de control, foco o viewport. **Bloquear:** si el shell integrado no ofrece un punto seguro sin invadir cambios activos de #5/#6; devolverlo al Orquestador con estado de dependencias.
**Validación:** recorrido manual; comprobar en herramientas de red que solo se solicita el recurso seleccionado.
**Commit:** `COMMIT_REQUIRED`; incluir reporte y evento `phase_verdict`; mensaje `feat(reference-panel): issue 8 F2 CLOSED advance_f3`.

### F3 — Afinar movimiento, accesibilidad y rendimiento (`PENDING`)

**Pregunta:** ¿la consulta se abre y se cierra con suavidad y sigue siendo legible y ligera en equipos modestos y pantallas estrechas?
**Entrada:** F2 cerrada y shell integrado de #5/#6 revisado.
**Trabajo:** aplicar la entrada/salida de hoja solo con `transform`/`opacity`, añadir alternativa `prefers-reduced-motion`, ajustar scroll/ampliación y confirmar que el cierre devuelve acceso a decisiones. Evitar desenfoques, reproducción continua, nuevas dependencias o animar la mesa completa.
**Evidencia:** `docs/plans/game-reference-materials/report_issue_8_F3.md` con matriz escritorio/móvil, comprobación de movimiento reducido, bytes de cada activo, solicitudes observadas y resultado del build.
**Avanzar:** los criterios 1–8 pasan revisión, el juego no solicita imágenes antes de abrir la consulta y no se observan bloqueos o saltos al repetir apertura/cierre. **Pivotar:** simplificar la transición o cambiar el control de ampliación si afecta fluidez/lectura. **Repetir:** un ajuste acotado de timing o viewport. **Bloquear:** regresión que requiera cambiar reglas, servidor o contrato de #5/#6; pedir reorquestación.
**Validación:** build del cliente y recorrido visual/funcional manual en escritorio y viewport móvil, con movimiento normal y reducido. No agregar tests automatizados.
**Commit:** `COMMIT_REQUIRED`; incluir reporte y evento `phase_verdict`; mensaje `feat(reference-panel): issue 8 F3 CLOSED ready_review`.

## Integración y revisión final

- Todas las fases pertenecen a `issue/8-game-reference-assets` y `.worktrees/issue-8-game-reference-assets`; solo habrá un PR a `master` asociado a #8.
- El Alquimista debe confirmar issue abierta, ausencia de reclamo incompatible y el worktree preparado. La rama/worktree fueron creados por el Orquestador para preservar el aislamiento; esto no equivale a reclamar la issue.
- Antes del primer cambio de producto, registrar `claim` y `worktree_confirmed` en la bitácora y confirmar el control administrativo junto a esos eventos.
- La implementación de F2 espera #5 integrado y coordinación con #6 porque ambas unidades tocan el shell de partida. No hacer cambios concurrentes en `Coup.js` sin coordinación registrada.
- En la revisión final intentar refutar: que se descarguen activos antes de pedirlos; que una pestaña o idioma muestre recurso incorrecto; que alguna imagen no mida 1024 px; que el cierre robe foco, oculte una respuesta o afecte el tablero; y que movimiento reducido todavía anime.
- El Orquestador revisa diff, reportes, solicitudes de red/build, una sola integración y estado de #5/#6 antes de aprobar el PR y cerrar la issue.
