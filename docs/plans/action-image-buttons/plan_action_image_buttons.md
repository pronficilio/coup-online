# Botones gráficos de respuesta de partida — issue #21

**Estado:** `WAITING_ORCHESTRATOR`; F1 `CLOSED`; F2 `BLOCKED` por incompatibilidad con la arquitectura activa de #14; F3 `PENDING`.
**Unidad:** https://github.com/pronficilio/coup-online/issues/21
**Handoff:** `docs/plans/active/issue_21_action_image_buttons.md`
**Bitácora:** `docs/plans/log/issue-21.jsonl`
**Modo / riesgo / verificación:** `FULL` / `MEDIUM` / `FINAL`.
**Branch/worktree/PR:** `issue/21-action-image-buttons` / `.worktrees/issue-21-action-image-buttons` / una PR a `master` de `pronficilio/coup-online`.
**Siguiente dueño:** Orquestador para resolver con el usuario si F2 espera el merge de #14, se implementa temporalmente sobre el legado, o se amplía para portar/adaptar el renderer genérico.

## Solicitud y éxito

Preparar los pares gráficos `ba`, `bfa`, `bs`, `pass`, `c` y sus variantes `-active`, reducir cada fuente al 50 % de su tamaño actual manteniendo proporción, exportar WebP y colocarlos en el cliente React. Reemplazar los botones de respuesta correspondientes y animar el cambio visual de estado.

Éxito significa que las cinco acciones usan su ilustración correcta en las ventanas de respuesta; los archivos son WebP optimizados a la mitad de sus dimensiones de origen; las variantes activas se perciben con una transición breve; las reglas, elegibilidad, payloads y handlers permanecen intactos; y la interacción conserva acceso por teclado, foco visible y movimiento reducido.

## Hechos, supuesto y dependencias

- Base detectada: `master`; `origin` es `pronficilio/coup-online`; aislamiento del proyecto: worktree por issue.
- La issue #6 y PR #11 están cerradas/mergeadas. Esta solicitud necesita una unidad propia.
- La issue #14 y la #19 están abiertas. La rama local #14 (`issue/14-codex-ai-players`, HEAD `cfad413`, 38 commits delante de su upstream local) modifica `Coup.js` y elimina `BlockChallengeDecision.js`, `BlockDecision.js` y `ChallengeDecision.js`; su nuevo cliente usa un renderer genérico de `decision.options`. La PR #22 de #19 está `DRAFT` en HEAD `81522a4` y su diff actual no toca esos cuatro archivos, pero mantiene la reserva por #14. El usuario autorizó iniciar F2 en el worktree #21; el Alquimista inspeccionó las ramas y comprobó una incompatibilidad arquitectónica concreta. La autorización general no decide qué renderer debe ser objetivo; no importar ni adaptar el protocolo de #14 por inferencia.
- Las fuentes están en `/mnt/e/dev/coup/fotos/`, carpeta ignorada por Git. El Ejecutor debe tratarlas como solo lectura; no sobrescribir los PNG. Crear derivados dentro del worktree y versionar los WebP del cliente.
- Dimensiones fuente vigentes por pareja: `ba` 2172×724; `bfa` 1024×341; `bs` 1024×341; `pass` 1020×341; `c` 1400×468.
- Las fuentes son RGB sin canal alfa; los derivados conservan el canvas y el fondo de cada fuente. F1 solo reduce dimensiones y convierte formato; no extrae mate ni reconstruye el arte.
- Mitad esperada, redondeada al píxel más cercano: `ba` 1086×362; `bfa` 512×171; `bs` 512×171; `pass` 510×171; `c` 700×234. Cada variante activa debe coincidir con las dimensiones de su par.

## Alcance

Incluye los diez recursos y los controles de respuesta `Challenge`, `Block Foreign Aid`, `Block Steal`, `Block Assassination` y `Pass`. `Challenge` usa `c` tanto al desafiar una acción como al desafiar un bloqueo. `Block Steal` mantiene las opciones `Ambassador` y `Captain` como selección textual del reclamo. Las variantes activas se usan en estados interactivos (hover, foco visible, pulsación/selección según el flujo), con transición compositable breve.

Fuera de alcance: acciones principales del turno (`Income`, `Foreign Aid`, `Tax`, `Coup`, `Steal`, `Exchange`, `Assassinate`), reglas de juego, servidor, forma de Socket.IO, nombres de eventos/payloads y nueva biblioteca de animación.

## Criterios de aceptación

1. Los diez derivados se reducen a 50 % en ambos ejes, con relación preservada y redondeo documentado; cada pareja normal/activa tiene dimensiones coincidentes.
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

### F2 — Integrar controles y transición (`BLOCKED`; pendiente decisión de arquitectura)

**Pregunta:** ¿la respuesta conserva el comportamiento actual al intercambiar el botón de texto por imagen?

**Entrada:** F1 cerrada y decisión explícita sobre el renderer objetivo, dado que #14 está reemplazando la arquitectura de respuestas.

**Tareas previstas:** integrar `c` en los dos estados de challenge, `bfa`, `bs`, `ba` en los estados de bloqueo, y `pass` en el control de paso del renderer acordado; definir fallback textual accesible y dimensiones estables; añadir transición corta entre imagen normal/activa mediante opacidad/transform; respetar movimiento reducido y evitar retrasar la respuesta. La ubicación final depende de la decisión de arquitectura.

**Avanzar:** todas las ventanas usan el recurso correcto; respuestas y payloads son iguales antes/después; foco/teclado/móvil/reduced motion son correctos; el panel no se desplaza.
**Pivotar:** si los estados activos no son visibles con click inmediato, mostrar la variante durante hover/foco/pulsación sin retrasar envío.
**Repetir:** una corrección localizada por control.
**Bloquear:** el renderer de destino no está definido; adaptar el protocolo de #14 sin coordinación ampliaría el alcance y cambiaría el contrato de respuestas.
**Commit:** `COMMIT_REQUIRED`; `feat(action-images): issue 21 F2 image response controls and transition`.
**Validación:** build de cliente y recorrido manual; sin tests.

### F3 — Revisión final independiente (`PENDING`)

**Pregunta:** ¿se puede refutar que los recursos y controles son consistentes y utilizables?

**Entrada:** F1/F2 cerradas y diff consolidado.
**Evidencia:** build de producción, dimensiones y tamaños WebP, recorrido de las cinco respuestas en escritorio/móvil, foco/teclado y reduced motion; reporte F3 y dictamen independiente.
**Falsificación:** buscar un par con escala incorrecta, halo o texto ilegible; activar acción con jugador no elegible; encontrar un evento/payload distinto, una respuesta inaccesible, un layout shift o transición que atrase el envío.
**Avanzar:** AC1–AC6 sustentados y Verifier `PASS`; entregar a `WAITING_ORCHESTRATOR` para una PR única.
**Bloquear:** build/recorrido imposible o F2 sigue sin liberar superficies compartidas.
**Commit:** `COMMIT_REQUIRED`; `docs(action-images): issue 21 F3 CLOSED ready_for_review`.

## Decisiones e historial

- 2026-09-27: crear issue #21 porque #6/PR #11 ya están integradas y cerradas.
- 2026-09-27: preservar los diez PNG fuente ignorados; procesar copias para no perder resolución.
- 2026-09-27: corrección de alcance del Orquestador: preservar el fondo RGB de las fuentes; F1 es solo reducción y conversión a WebP.
- 2026-09-27: el usuario ordenó invocar al Alquimista para F2; coordinación registrada en `c7c1a6b`. La inspección comprobó que #14 elimina los componentes heredados y cambia el contrato a `g-decision`/`g-submitDecision(choiceId)`. El Alquimista detuvo cambios de producto; esperar decisión del usuario sobre renderer y posible ampliación de alcance.

- 2026-09-27 04:42 UTC: Alquimista reclamó #21 mediante comentario, la releyó OPEN y confirmó que no había claim incompatible ni PR candidata; F1 activa en branch/worktree canónicos.

- 2026-09-27: F1 cerrada; diez WebP RGB con canvas/fondo preservado, Pillow 12.0.0/libwebp 1.6.0, LANCZOS, quality 95, method 6. F2 quedó bloqueada tras comprobarse la incompatibilidad del renderer; no hay cambios de producto F2.
