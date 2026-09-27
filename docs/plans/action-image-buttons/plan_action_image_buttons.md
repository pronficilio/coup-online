# Botones gráficos de respuesta de partida — issue #21

**Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED`; F2 `CLOSED`; F3 `PENDING`.
**Unidad:** https://github.com/pronficilio/coup-online/issues/21
**Handoff:** `docs/plans/active/issue_21_action_image_buttons.md`
**Bitácora:** `docs/plans/log/issue-21.jsonl`
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
**Branch/worktree/PR:** `issue/21-action-image-buttons` / `.worktrees/issue-21-action-image-buttons` / una PR a `master` de `pronficilio/coup-online`.
**Siguiente dueño:** Verifier independiente para la revisión FINAL F3, bajo coordinación del Orquestador.

## Solicitud y éxito

Preparar los pares gráficos `ba`, `bfa`, `bs`, `pass`, `c` y sus variantes `-active`, reducir cada fuente al 50 % de su tamaño actual manteniendo proporción, exportar WebP y colocarlos en el cliente React. Después del cierre F1 se añadió el par `claim`/`claim-active` para usar `claim` como contexto visual no interactivo. Reemplazar los botones de respuesta correspondientes y animar el cambio visual de estado.

Éxito significa que las cinco acciones usan su ilustración correcta en las ventanas de respuesta, Claim aparece junto al contexto del reclamo y no como una opción, los doce archivos son WebP a la mitad de sus dimensiones de origen, las variantes activas se perciben con una transición breve y las reglas, elegibilidad, opciones y payloads permanecen intactos. La interacción conserva acceso por teclado, foco visible y movimiento reducido.

## Hechos, supuesto y dependencias

- Base detectada: `master`; `origin` es `pronficilio/coup-online`; aislamiento del proyecto: worktree por issue.
- La issue #6 y PR #11 están cerradas/mergeadas. Esta solicitud necesita una unidad propia.
- La PR #23 de #14 ya se integró en `master` en `2d82fa1e0d67ba9e48d7885f9c3ae171360425bd`; el worktree canónico #21 se sincronizó en el merge `b93a67c`. F2 ahora se implementa sobre el renderer genérico de `decision.options` y conserva `g-submitDecision({decisionId,stateVersion,choiceId})`. La PR #22 de #19 no toca `Coup.js` ni cambia este flujo.
- Las fuentes están en `/mnt/e/dev/coup/fotos/`, carpeta ignorada por Git. El Ejecutor debe tratarlas como solo lectura; no sobrescribir los PNG. Crear derivados dentro del worktree y versionar los WebP del cliente.
- Dimensiones fuente: `ba` 2172×724; `bfa` 1024×341; `bs` 1024×341; `pass` 1020×341; `c` 1400×468; `claim` 1400×468 (este último par se agregó después del cierre F1).
- Las fuentes son RGB sin canal alfa; los derivados conservan el canvas y el fondo de cada fuente. F1 solo reduce dimensiones y convierte formato; no extrae mate ni reconstruye el arte.
- Mitad esperada, redondeada al píxel más cercano: `ba` 1086×362; `bfa` 512×171; `bs` 512×171; `pass` 510×171; `c` 700×234; `claim` 700×234. Cada variante activa coincide con su par. F1 cerró sus diez imágenes originales; `claim`/`claim-active` son una adición de alcance procesada durante F2 con el mismo pipeline.

## Alcance

Incluye doce recursos (los diez entregados por F1 más `claim` y `claim-active` añadidos en F2) y los controles de respuesta `Challenge`, `Block Foreign Aid`, `Block Steal`, `Block Assassination` y `Pass`. Mapeo sobre el renderer genérico: `challenge` + choice `challenge` → `c`; choice `pass` → `pass`; tipo `block` + `block:duke` → `bfa`, `block:captain`/`block:ambassador` → `bs` con la elección textual preservada, y `block:contessa` → `ba`. `claim` aparece como recurso no interactivo en el contexto visual de las descripciones `challenge`/`block_challenge`; no crea una opción. Las variantes activas de los botones se usan en hover, foco visible y pulsación, con transición breve.

Fuera de alcance: acciones principales del turno (`Income`, `Foreign Aid`, `Tax`, `Coup`, `Steal`, `Exchange`, `Assassinate`), reglas de juego, servidor, forma de Socket.IO, nombres de eventos/payloads y nueva biblioteca de animación.

## Criterios de aceptación

1. Los diez derivados originales se reducen a 50 % en F1 y el par `claim` se añade durante F2; en total son doce WebP, con relación preservada y cada pareja normal/activa en dimensiones coincidentes.
2. WebP versionados bajo una ruta de assets del cliente; canvas y fondo RGB conservados, sin recorte ni cambio visual deliberado.
3. Cada control visible utiliza el par correcto y conserva botón semántico, acción, destinatario, handlers, evento y payload actuales.
4. La variante activa aparece con una transición perceptible al interactuar; no desplaza el layout ni retrasa la acción/socket.
5. El nombre accesible, foco visible, teclado, contraste/legibilidad, ventana móvil y `prefers-reduced-motion` siguen siendo utilizables.
6. El build de `coup-client` y el recorrido manual de los controles se registran; no agregar ni ejecutar tests automatizados.
7. Verifier independiente FINAL intenta refutar AC1–AC6 y devuelve `PASS`, `FAIL` o `BLOCKED` con evidencia concreta.

## Fases

### F1 — Reducir e importar imágenes WebP (`CLOSED`)

**Pregunta:** ¿se pueden entregar los diez recursos a media resolución y formato WebP, preservando el canvas RGB de las fuentes ignoradas?

**Entrada:** los diez PNG de `/mnt/e/dev/coup/fotos/` y las dimensiones registradas arriba.

**Tareas:** producir copias al 50 % con proporción mantenida, usando redondeo al píxel más cercano (mitades hacia arriba); preservar el canvas/fondo RGB; exportar WebP con herramienta y parámetros reproducibles; guardarlos en `coup-client/src/assets/action-buttons/`; registrar dimensiones, modo, tamaño de archivos y parámetros en el reporte de fase.

**Avanzar:** los diez archivos abren como WebP, tienen dimensiones esperadas y pares coincidentes; modo RGB sin alfa; revisión visual confirma canvas y contenido conservados.
**Pivotar:** si un WebP difiere visualmente por codificación, ajustar calidad del encoder sin recortar ni alterar la fuente.
**Repetir:** una corrección acotada por asset que falle visualmente.
**Bloquear:** no es posible reducir y exportar WebP con herramientas disponibles sin instalar dependencias externas.
**Commit:** `94b1447bb0b5fb1613e3f7cf226993077a2f0da7` — `feat(action-images): issue 21 F1 import optimized webp controls`.
**Validación:** inspección de dimensiones/formato/modo, comparación visual y verificación de fuentes intactas. Sin tests.
**Reporte:** `docs/plans/action-image-buttons/report_issue_21_F1.md`.

### F2 — Integrar controles y transición (`CLOSED`; renderer genérico)

**Pregunta:** ¿la respuesta conserva el comportamiento actual al intercambiar el botón de texto por imagen?

**Entrada:** F1 cerrada; PR #23 de #14 integrada en `origin/master` (`2d82fa1`) y rama canónica #21 sincronizada con merge `b93a67c`. El usuario confirmó el mapeo visual y añadió el par Claim.

**Tareas:** añadir `claim`/`claim-active` WebP al 50 % con LANCZOS, RGB y canvas preservados, quality 95/method 6; mapear recursos en `Coup.js` según `decision.type` y `choiceId`: `c` para Challenge, `bfa` para Block Foreign Aid, `bs` para Block Steal con texto de rol conservado, `ba` para Block Assassination, `pass` para Pass. Mostrar `claim.webp` junto a la descripción de `challenge`/`block_challenge`, no como opción. Mantener los otros tipos de decisión como botones textuales; preservar `decision.options`, la elegibilidad y `g-submitDecision({decisionId,stateVersion,choiceId})`. Añadir transición CSS entre imágenes normal/activa, foco accesible y `prefers-reduced-motion` sin demorar dispatch ni alterar layout.

**Avanzar:** todas las ventanas usan el recurso correcto; respuestas y payloads son iguales antes/después; foco/teclado/móvil/reduced motion son correctos; el panel no se desplaza.
**Pivotar:** si los estados activos no son visibles con click inmediato, mostrar la variante durante hover/foco/pulsación sin retrasar envío.
**Repetir:** una corrección localizada por control.
**Bloquear:** si una opción de servidor no corresponde al mapeo explícito, mantener su etiqueta textual; no inventar choices ni modificar protocolo/reglas.
**Commit:** `COMMIT_REQUIRED`; `feat(action-images): issue 21 F2 image response controls and transition`.
**Validación:** build producción PASS con warnings preexistentes; recorrido manual no disponible por falta de navegador; static audit del contrato completada; sin tests automatizados.

### F3 — Revisión final independiente (`PENDING`)

**Pregunta:** ¿se puede refutar que los recursos y controles son consistentes y utilizables?

**Entrada:** F1/F2 cerradas y diff consolidado.
**Evidencia:** build de producción, dimensiones y tamaños de los doce WebP, recorrido de las cinco respuestas y del contexto Claim en escritorio/móvil, foco/teclado y reduced motion; reporte F3 y dictamen independiente.
**Falsificación:** buscar un par con escala incorrecta, halo o texto ilegible; activar acción con jugador no elegible; encontrar un evento/payload distinto, una respuesta inaccesible, un layout shift o transición que atrase el envío.
**Avanzar:** AC1–AC6 sustentados y Verifier `PASS`; entregar a `WAITING_ORCHESTRATOR` para una PR única.
**Bloquear:** build/recorrido imposible o F2 sigue sin liberar superficies compartidas.
**Commit:** `COMMIT_REQUIRED`; `docs(action-images): issue 21 F3 CLOSED ready_for_review`.

## Decisiones e historial

- 2026-09-27: crear issue #21 porque #6/PR #11 ya están integradas y cerradas.
- 2026-09-27: preservar los diez PNG fuente ignorados; procesar copias para no perder resolución.
- 2026-09-27: corrección de alcance del Orquestador: preservar el fondo RGB de las fuentes; F1 es solo reducción y conversión a WebP.
- 2026-09-27: el usuario ordenó invocar al Alquimista para F2; coordinación registrada en `c7c1a6b`. La inspección comprobó que #14 elimina los componentes heredados y cambia el contrato a `g-decision`/`g-submitDecision(choiceId)`. El Alquimista detuvo cambios de producto; esperar decisión del usuario sobre renderer y posible ampliación de alcance.
- 2026-09-27: #14 PR #23 integrada en `master` en `2d82fa1`; worktree #21 sincronizado con merge `b93a67c`. El usuario confirmó F2 sobre el renderer genérico y añadió `claim`/`claim-active` 1400×468 como contexto no interactivo. Claim se procesa al 50 % con el pipeline F1; diez WebP F1 más dos WebP Claim.
- 2026-09-27: F2 completada en `feat(action-images): issue 21 F2 image response controls and transition`. `npm run build` compiló; no había navegador para recorrido visual, lo cual queda anotado en el reporte. La unidad espera Orquestador/Verifier para F3.

- 2026-09-27 04:42 UTC: Alquimista reclamó #21 mediante comentario, la releyó OPEN y confirmó que no había claim incompatible ni PR candidata; F1 activa en branch/worktree canónicos.

- 2026-09-27: F1 cerrada; diez WebP RGB con canvas/fondo preservado, Pillow 12.0.0/libwebp 1.6.0, LANCZOS, quality 95, method 6. F2 quedó bloqueada tras comprobarse la incompatibilidad del renderer; no hay cambios de producto F2.
