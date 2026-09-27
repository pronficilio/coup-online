# Moneda animada en la portada y favicon optimizado — issue #25

**Estado:** `WAITING_ORCHESTRATOR`; F1 `BLOCKED`.
**Unidad:** https://github.com/pronficilio/coup-online/issues/25
**Handoff:** `docs/plans/active/issue_25_home_coin_favicon.md`
**Bitácora:** `docs/plans/log/issue-25.jsonl`
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
**Siguiente dueño:** Agente Orquestador para completar revisión visual manual y decidir el cierre de F1.
**Integración esperada:** `issue/25-home-coin-favicon` en `.worktrees/issue-25-home-coin-favicon`, una PR a `master`.

## Solicitud y definición de éxito

Reemplazar la imagen de pollo en la portada por `fotos/gif.gif`, una moneda que gira, y derivar de `fotos/coin.png` un favicon pequeño. La portada conserva la animación, muestra el GIF a 256×256 cuando cabe y lo escala proporcionalmente en móvil. La pestaña del navegador muestra la moneda con un favicon válido y optimizado.

## Hechos confirmados y fuentes

- La portada está en `coup-client/src/components/Home.js`; importa `Chicken.svg` y renderiza el pollo como imagen principal.
- `coup-client/src/index.css` aplica 100×100 px a cualquier imagen dentro de `.homeContainer`; la imagen nueva necesita reglas responsivas y acotadas que no afecten otros elementos.
- `fotos/gif.gif` mide 256×256 px y 109,685 bytes. `fotos/coin.png` mide 480×460 px, es RGBA y pesa 408,320 bytes. `fotos/` está ignorada por Git; las fuentes no se deben versionar.
- `coup-client/public/favicon.ico` contiene hoy un PNG de 48×48 px. `index.html` y `manifest.json` ya referencian esa ruta; el manifest declara tamaños 64×64, 32×32, 24×24 y 16×16.
- La PR #22 de la issue #19 se integró en `master` el 2026-09-27 (commit `5de95ee93ba37ceb34f30af66b42cdbb1cd2f77c`) e incluye cambios en `Home.js`. Conservar los textos y atributos de idioma integrados. El Orquestador confirmó que #25 está desbloqueada.
- El issue #21 cambia controles de respuesta dentro de la partida; queda fuera de esta unidad.

Fuentes de verdad: issue #25, este plan, el código de la portada y la configuración actual del favicon.

## Alcance y exclusiones

**Incluye:** `Home.js`, las reglas de la imagen principal en `src/index.css`, `public/favicon.ico`, la declaración de tamaños de `public/manifest.json` para que corresponda con el archivo generado, y `src/i18n/translations.json` únicamente para localizar el texto alternativo de la moneda.

**Excluye:** cualquier otro cambio de traducción/copy, recursos y controles de la partida, touch icon de Apple, demás iconos PWA, nuevas dependencias en tiempo de ejecución y despliegue.

## Criterios de aceptación

1. La portada ya no muestra el muslo de pollo y presenta la moneda animada con `alt={t('home.coin.alt')}`. `translations.json` contiene esa clave en ambos idiomas: “Moneda giratoria” (`es`) y “Spinning coin” (`en`); no cambia ningún otro texto.
2. Se conserva el GIF original de 256×256 px, salvo que el Ejecutor demuestre una derivación más ligera que conserve la animación y calidad. En escritorio no supera 256×256; en móvil se reduce proporcionalmente, no desborda ni domina toda la pantalla.
3. `public/favicon.ico` es un ICO válido derivado de `fotos/coin.png`, con resoluciones de 16×16 y 32×32 px. `manifest.json` declara los tamaños presentes. El PNG original de 408 KB no se sirve como favicon.
4. No se añaden dependencias de procesamiento al runtime, no se versionan archivos fuente de `fotos/` y las claves `es`/`en` mantienen paridad.
5. Se registran dimensiones y bytes finales de GIF/favicon. `npm run build` termina correctamente y una revisión manual en escritorio y móvil confirma el tamaño y la visibilidad de los controles de portada. No agregar ni ejecutar tests automatizados.

## Fase única

### F1 — Integrar moneda de portada y favicon (`READY`)

**Pregunta:** ¿la portada puede mostrar la moneda animada y usar un favicon derivado pequeño sin saturar la vista móvil ni aumentar innecesariamente los recursos?

**Entrada:** #25, este plan, fuentes locales `fotos/gif.gif` y `fotos/coin.png`, y `origin/master` actualizado con la integración de PR #22.

**Salida/evidencia:** cambio de portada y estilos responsivos; clave `home.coin.alt` localizada solo para la moneda; ICO de 16×16/32×32 y manifest consistente; tamaños de recursos documentados aquí o en el handoff; paridad del diccionario, build y comprobación visual manual registrados.

**Avanzar:** criterios AC1–AC5 satisfechos; dejar #25 `WAITING_ORCHESTRATOR` para revisar la única PR.
**Pivotar:** si el GIF no cabe junto al contenido móvil, ajustar su límite responsivo preservando el área disponible para Create/Join.
**Repetir:** una corrección localizada si el build, el favicon a 16 px o el layout móvil falla.
**Bloquear/cancelar:** reaparece un conflicto material en `Home.js`, las fuentes no están disponibles en el checkout del Ejecutor o hace falta alterar el alcance del producto.

**Commit:** `COMMIT_REQUIRED`; `feat(home): issue 25 animated coin and favicon`.
**Validación:** build del cliente, inspección del formato/dimensiones/tamaño de recursos, revisión de `home.coin.alt` en `es`/`en` y recorrido visual de portada en escritorio y móvil; sin tests automatizados.

## Evidencia y veredicto F1 — 2026-09-27

- **AC1–AC4:** implementación y revisión del diff conformes. `Home.js` muestra el GIF con `alt={t('home.coin.alt')}`; el diccionario conserva paridad de claves y solo cambia ese alt a “Moneda giratoria” (`es`) / “Spinning coin” (`en`).
- **GIF:** 256×256, 6 frames, 109,685 bytes; SHA-256 igual a la fuente local. La fuente de `fotos/` continúa ignorada y no versionada.
- **Favicon:** ICO válido con imágenes PNG de 16×16 y 32×32, 3,596 bytes. El manifest declara `32x32 16x16`; el build contiene el favicon y no usa el PNG fuente de 408,320 bytes.
- **Build:** `npm run build` en `coup-client` terminó con exit 0 (“Compiled with warnings”). Los warnings observados son imports `logo` y `Link` sin uso en `src/App.js` y `postcss-calc` con `dvh` en `game/ReferencePanel.css:100,106`.
- **Tamaño responsive estático:** CSS calcula 256×256 en 1440×900; 175.5×175.5 en 390×844; 160×160 en 360×640. `height: auto` preserva la relación cuadrada.
- **AC5 parcial:** el build y la inspección de artefactos están completos, pero no se pudo abrir un navegador en el entorno (Chrome, Chromium y Firefox no están disponibles; tampoco hay herramienta de navegador integrada). No se verificaron visualmente los controles de escritorio/móvil. No se agregaron ni ejecutaron tests.
- **PR draft:** [#27](https://github.com/pronficilio/coup-online/pull/27) hacia `master`.
- **Veredicto:** F1 `BLOCKED` por falta de renderer local; unidad `WAITING_ORCHESTRATOR`. Siguiente acción concreta: revisar visualmente la PR #27 en escritorio y móvil, verificando que Create/Join y reglas sigan visibles/usables, y luego actualizar el veredicto. No se declara F1 cerrada.

## Topología y coordinación

La unidad está desbloqueada tras integrar PR #22 y la confirmación del Orquestador. El Ejecutor debe releer #25, reclamarla en el fork y confirmar el estado; después crear o confirmar `issue/25-home-coin-favicon` desde `origin/master` actualizado y `.worktrees/issue-25-home-coin-favicon`. Copiar selectivamente las fuentes locales ignoradas al worktree; versionar solo el GIF usado por el cliente y el favicon derivado. Registrar `claim` y `worktree_confirmed` en la bitácora dentro del branch antes de la implementación. Toda la unidad culmina en una única PR a `master`.

## Pregunta de falsificación

¿La moneda a 16×16 sigue siendo reconocible como favicon, y en una pantalla móvil estrecha la portada deja visibles y utilizables los controles para crear o unirse a una partida?

## Historial de decisiones

- 2026-09-27: crear la unidad como `LIGHT/LOW/NONE`; mantener el GIF original de 256×256 porque pesa 109,685 bytes.
- 2026-09-27: usar un ICO derivado en tamaños habituales 16×16 y 32×32, no redimensionar el favicon a ~100 px.
- 2026-09-27: desbloquear F1 después de integrar la PR #22 de #19; conservar la localización ya integrada en `Home.js`.
- 2026-09-27: incluir solo el `alt` bilingüe de la moneda (`home.coin.alt`) para satisfacer el criterio de accesibilidad sin traducir otros textos.

**Aclaración de alcance del Orquestador (2026-09-27):** autoriza únicamente localizar el `alt` de la moneda con `home.coin.alt` (“Moneda giratoria” / “Spinning coin”) y conservar paridad `es`/`en`; no se modifica ningún otro texto. Confirmada en la issue #25 actualizada.
