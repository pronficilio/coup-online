# Reporte F2 — mesa y mazo WebP

**Veredicto:** `CLOSED` por aprobación visual del usuario; captura e implementación aceptadas. La validación interactiva del flujo de decisiones no se ejecutó y no se declara aprobada.
**Issue:** #5

**Branch/worktree:** `issue/5-circular-board` / `.worktrees/issue-5-circular-board`
**Fase siguiente:** F3 `PENDING`

## Resultado

- `PlayerBoard` usa los WebP de los cinco personajes en las influencias propias y `reverso.webp` en las rivales. No pasa el valor de una influencia rival a la imagen ni a un atributo del DOM.
- `deck.webp` se muestra en el centro del tablero, a 50%/50%, sin contador. La pila queda bajo los asientos y usa `pointer-events: none`.
- Se conservaron el roster, la geometría y el borde neón de turno de F1. `Coup.js` y sus componentes de decisión no cambiaron.

## Assets y procedencia

`fotos/deck.png` (PNG/RGBA, 1089×1444, 2,461,479 bytes) se convirtió a `coup-client/src/assets/deck.webp` (WebP/ARGB, 1089×1444, 1,816,658 bytes). El MD5 del plano alfa coincide (`7eae5a996b5903d25a4ac4f219682c1c`); la comparación encontró cero diferencias en alfa y RGB visible. Solo difiere RGB de 90 píxeles completamente transparentes. La fuente PNG no está en el diff.

Los seis WebP ingleses (`duke`, `captain`, `assassin`, `contessa`, `ambassador`, `reverso`) se copiaron desde `E:\dev\coup\coup-client\src\assets\characters\`; sus SHA256 coinciden con las fuentes. El diff de assets contiene únicamente estos seis WebP y `deck.webp`.

## Evidencia y validación

- [Captura del `PlayerBoard` de tres jugadores](preview_issue_5_F2_3players.png): el navegador cargó el componente React real con props de muestra. Muestra el mazo centrado, los asientos arriba/derecha/abajo, caras propias, reversos rivales y el borde neón rojo. La ruta temporal de preview se retiró después de capturarla.
- [Captura del `PlayerBoard` de dos jugadores](preview_issue_5_F2_2players.png): preview React local con exactamente dos props; observador Rojo abajo, rival Azul arriba, turno resaltado en Rojo, reversos rivales y mazo al centro. La ruta temporal se retiró después de capturarla.
- `npm run start-pc`: el cliente compiló. Emitió advertencias preexistentes por imports sin uso en `App.js` y `Coup.js`; F2 no modificó esos archivos.
- `git diff --check`: pasó.
- La capa central no intercepta entradas (`pointer-events: none`) y queda debajo de los asientos; el área de decisiones permanece en `Coup.js` sin cambios. No se ejecutó una partida con socket ni se hizo clic en una decisión: la herramienta CUA falló dos veces antes de abrir el navegador (`helper_unknown_error: setup refresh had errors`). La captura se hizo con Edge headless sobre el preview local del componente.
- No se ejecutaron tests ni build de producción. `npm ci` instaló las dependencias del lockfile para la inspección visual; su salida reportó 81 avisos de auditoría en dependencias existentes, sin cambios de dependencias en F2.

## Cierre y límite aceptado

El usuario revisó las capturas de dos y tres jugadores y aprobó continuar. El Orquestador cierra F2 con esa aprobación visual y libera F3. Las capturas validan la apariencia del `PlayerBoard` real, pero no simulan una partida; la herramienta CUA falló dos veces antes de abrir el navegador y no se ejecutó una decisión por socket. Esta interacción no se declara aprobada. En F3 se revisará que las ventanas y controles existentes sigan disponibles durante la inspección responsiva de 2..6; si no se puede verificar con la interfaz disponible, se dejará como límite explícito para revisión final.
