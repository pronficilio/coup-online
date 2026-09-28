# Verification Report — Issue #49

**Unidad:** #49 — Permitir Coup con 7–9 monedas y corregir el ciclo de selección

**Checkpoint:** FINAL / F3

**Commit:** `0b73305f5be684bb05cc7109701f958c26a98921` (`issue/49-coup-seven-coins`)

**Modo / riesgo / política:** FULL / HIGH / FINAL

**Target:** `master` de `pronficilio/coup-online`

## CLAIM

El servidor acepta Coup con 7–9 monedas, cobra 7 una vez y resuelve la influencia del objetivo; desde 10 solo permite Coup. Los rechazos de decisiones inválidas/obsoletas tienen recuperación visible y Contessa no bloquea Coup.

## CI_GATES: PASS

- `git diff --check 0b73305^ 0b73305`: **PASS**.
- No ejecuté pruebas automatizadas, según instrucción expresa del propietario.
- No cambió cliente; no ejecuté build.
- Arranqué los servicios de desarrollo desde el worktree y commit exactos. La página, bundle y API respondieron HTTP 200 en `127.0.0.1:3000`, `127.0.0.1:3000/static/js/bundle.js` y `127.0.0.1:8011/exists/VERIFY49`.
- No se ejecutaron tests automatizados por instrucción expresa del propietario. No cambió cliente, por lo que el build del cliente no aplica.

## ADVERSARIAL_CHECK: BLOCKED

La inspección independiente del código no encontró una refutación estática. Recibí una observación humana limitada: el propietario reporta que probó Coup con 8 monedas en el preview y que «ahora funciona bien el golpe». Después confirmó «ya hice la verificación» y autorizó seguir al merge. Registro esa declaración como confirmación de que realizó una verificación, pero no comunica resultados por AC ni detalla qué casos/interacciones observó. Por ello, no atribuyo resultados adicionales a AC1, AC2, AC4 o AC5. La sección 8 de `docs/agentes/VERIFICADOR_CI.md` requiere observaciones humanas trazables para los criterios interactivos; la afirmación general de haber verificado no permite comprobar esos resultados.

## VEREDICTO: BLOCKED

### Criterios

- **AC1: BLOCKED (parcialmente observado)** — `actionChoices()` ofrece Coup con saldo ≥7; `beginAction()` fija coste 7 y deduce el coste una vez; `resolveAction()` envía Coup a `loseInfluence(target)`. El propietario reporta que Coup funcionó en una partida con 8 monedas. No comunicó saldo final, pago exacto ni pérdida de influencia específica; tampoco compartió resultados concretos para 7 o 9. La declaración general posterior de que hizo la verificación no especifica si observó esos casos ni sus resultados.
- **AC2: BLOCKED** — estáticamente, `actionChoices()` devuelve solo Coup desde ≥10 y `beginAction()` conserva el rechazo de otras acciones. No se comunicó resultado concreto de un turno con ≥10.
- **AC3: PASS (limitado al caso reportado de 8 monedas)** — estáticamente, el envelope valida `decisionId`, `stateVersion` y `choiceId` contra las opciones emitidas por el servidor, y la elección Coup disponible llega a `beginAction()` sin el guard contradictorio `<10`. El propietario reporta que Coup funcionó en el preview con 8 monedas, cubriendo la selección legal que antes se reiniciaba en el caso observado. Este resultado no afirma observación de 7 o 9 monedas ni agrega detalles no reportados sobre el resultado.
- **AC4: BLOCKED** — el servidor rechaza decisiones stale/no disponibles mediante `g-decisionRejected`; el cliente mapea esos motivos a error visible con `role="alert"`. No se comunicó un resultado concreto de replay stale ni del aviso visible.
- **AC5: BLOCKED** — `BLOCKS` no incluye Coup; `ROLE_BY_ACTION` no asigna reclamo a Coup; `BLOCKS.assassinate` es el que permite Contessa. El Coup de 8 monedas fue reportado como funcional, pero no se compartió resultado sobre la ventana de bloqueo ni sobre Contessa. La ausencia de bloqueo está sustentada estáticamente, pero falta una observación interactiva trazable de este criterio.
- **AC6: PASS (estático)** — el diff no cambia autorización. `submitDecision()` deriva el asiento del socket y `submitChoice()` exige decisión vigente, asiento elegible y opción disponible; coste, objetivo y resolución permanecen en servidor.

### Refutaciones intentadas

1. Comparé opciones emitidas con guards del servidor para saldo 7–9 y 10+: no encontré discrepancia tras retirar el guard `<10`.
2. Seguí el coste desde `beginAction()` a `resolveAction()`: deducción única previa a la ventana de reclamo y pérdida de influencia normal para Coup.
3. Revisé si Coup puede abrir un bloqueo por `BLOCKS` o reclamo por `ROLE_BY_ACTION`: no aparece en ninguno.
4. Contrasté envelope stale/no disponible en `submitChoice()` con el manejador `g-decisionRejected` del cliente; queda pendiente observar aviso runtime.
5. Revisé diff exacto: cambio de producto de una línea, solo elimina `if (action.type === 'coup' && this.players[actor].money < 10) return this.playTurn()`. Los otros cambios del commit son documentación/bitácora F2.

## Recorrido humano: observación recibida y cobertura pendiente

El propietario respondió sobre el preview local: «he comprobado que ahora funciona bien el golpe». Según su aclaración, esto corresponde a Coup con **8 monedas**. Registro solamente que reporta haber observado funcionar el golpe en esa partida/caso previsto. Posteriormente dijo «ya hice la verificación» y autorizó seguir al merge, pero no compartió resultados por criterio. No interpreto esas respuestas como observación del pago, saldo resultante, influencia concreta perdida, Coup con 7/9, obligatoriedad con 10, bloqueo/Contessa o decisión stale.

La revisión humana de Coup con 8 monedas confirma que la selección legal funcionó en el caso reportado (AC3). Para los demás criterios, no recibí resultados humanos específicos. La confirmación general «ya hice la verificación» no indica qué pasos ejecutó ni qué observó, por lo que no sustituye evidencia auditable por AC según la sección 8. No solicito ahora otro recorrido; el veredicto permanece BLOCKED por esa falta de evidencia específica.

## Comandos y evidencia

- Commit exacto de producto inspeccionado: `0b73305f5be684bb05cc7109701f958c26a98921`.
- `git diff 0b73305f5be684bb05cc7109701f958c26a98921 HEAD -- server/game/coup.js` → sin diferencias de producto; HEAD actual `49aff031970686295e5e97cee3c754f9049819d0` agrega documentación.
- `git diff --check 0b73305^ 0b73305` → exit 0.
- `npm ci --ignore-scripts` en `server/` y `coup-client/` para preparar el recorrido; no modificó archivos versionados.
- `PORT=8011 CODEX_DISABLED_FILE=/tmp/coup-issue49-codex-disabled npm start` desde `server/` → `listening on 8011`.
- `PORT=3000 REACT_APP_BACKEND_URL=http://localhost:8011 ./node_modules/.bin/react-scripts start` desde `coup-client/` → servidor iniciado. Comprobaciones HTTP hechas con `127.0.0.1`.
- Puertos 8000 y 8010 estaban ocupados. El primer bind a 8011 desde sandbox falló con `listen EPERM`; el arranque local autorizado fuera del sandbox sí quedó activo.

## Limitaciones y siguiente dueño

No se ejecutaron tests automatizados. Se recibió una observación humana parcial del caso de 8 monedas y una confirmación general de que el propietario realizó la verificación, pero no resultados específicos para los criterios interactivos restantes. Los servicios se levantaron en el worktree exacto para la revisión inicial; las sesiones asociadas fueron server (`90903`) y cliente (`89871`). Para detenerlas, enviar Ctrl-C a ambas sesiones si aún siguen activas.

**Siguiente dueño:** Orquestador/Alquimista para registrar esta evidencia limitada y decidir el próximo paso. Verificador independiente puede reevaluar cuando haya evidencia de los criterios pendientes. No integrar ni cerrar issue con este estado.

## Addendum del Orquestador — autorización explícita del propietario

El 2026-09-28, el propietario confirmó «ya hice la verificacion y adelante con el merge a master». Esta autorización llega después de informar que Coup funciona en el caso de 8 monedas del preview. No especifica resultados por AC; el Orquestador no atribuye observaciones adicionales ni cambia el veredicto `BLOCKED` del Verifier a `PASS`.

Por instrucción explícita del propietario, el Orquestador acepta integrar la corrección pese a que el checkpoint FINAL independiente conserva su bloqueo documental para AC1/AC2/AC4/AC5. Esta es una excepción registrada al gate `FINAL`, no un PASS del Verifier. La revisión del Orquestador queda limitada al diff de producto de una condición y a que la regla de 7 monedas concuerde con las reglas versionadas. No ejecutar pruebas automatizadas.
