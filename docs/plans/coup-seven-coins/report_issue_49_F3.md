# Verification Report — Issue #49

**Unidad:** #49 — Permitir Coup con 7–9 monedas y corregir el ciclo de selección

**Checkpoint:** FINAL / F3

**Commit:** `0b73305f5be684bb05cc7109701f958c26a98921` (`issue/49-coup-seven-coins`)

**Modo / riesgo / política:** FULL / HIGH / FINAL

**Target:** `master` de `pronficilio/coup-online`

## CLAIM

El servidor acepta Coup con 7–9 monedas, cobra 7 una vez y resuelve la influencia del objetivo; desde 10 solo permite Coup. Los rechazos de decisiones inválidas/obsoletas tienen recuperación visible y Contessa no bloquea Coup.

## CI_GATES: BLOCKED

- `git diff --check 0b73305^ 0b73305`: **PASS**.
- No ejecuté pruebas automatizadas, según instrucción expresa del propietario.
- No cambió cliente; no ejecuté build.
- Arranqué los servicios de desarrollo desde el worktree y commit exactos. La página, bundle y API respondieron HTTP 200 en `127.0.0.1:3000`, `127.0.0.1:3000/static/js/bundle.js` y `127.0.0.1:8011/exists/VERIFY49`.
- El protocolo `docs/agentes/VERIFICADOR_CI.md`, sección 8, exige observación humana antes de aprobar criterios de Socket.IO/interacción. Aún no recibí esas observaciones.

## ADVERSARIAL_CHECK: BLOCKED

La inspección independiente del código no encontró una refutación estática. El recorrido interactivo con dos jugadores está disponible para revisión humana; hasta observarlo no doy por verificados los efectos runtime ni la presentación de errores.

## VEREDICTO: BLOCKED

### Criterios

- **AC1: BLOCKED** — `actionChoices()` ofrece Coup con saldo ≥7; `beginAction()` fija coste 7, lo deduce una vez y `resolveAction()` envía Coup a `loseInfluence(target)`. No se observó en partida el caso 7/8/9 ni el saldo/resultante.
- **AC2: BLOCKED** — estáticamente, `actionChoices()` devuelve solo Coup desde ≥10 y `beginAction()` conserva el rechazo de otras acciones. Falta observar el control en una partida con ≥10.
- **AC3: BLOCKED** — el envelope de decisión valida `decisionId`, `stateVersion` y `choiceId` contra las opciones de servidor; la elección Coup disponible llega ahora a `beginAction()` sin el guard contradictorio `<10`. No se observó aceptación en cliente/servidor en vivo.
- **AC4: BLOCKED** — el servidor rechaza decisiones stale/no disponibles mediante `g-decisionRejected`; el cliente mapea esos motivos a error visible con `role="alert"`. No se hizo replay manual de una decisión obsoleta.
- **AC5: BLOCKED** — `BLOCKS` no incluye Coup; `ROLE_BY_ACTION` no asigna reclamo a Coup; `BLOCKS.assassinate` es el que permite Contessa. Falta observar que la ventana que recibe el objetivo de Coup sea de pérdida de influencia y no de bloqueo.
- **AC6: PASS (estático)** — el diff no cambia autorización. `submitDecision()` deriva el asiento del socket y `submitChoice()` exige decisión vigente, asiento elegible y opción disponible; coste, objetivo y resolución permanecen en servidor.

### Refutaciones intentadas

1. Comparé opciones emitidas con guards del servidor para saldo 7–9 y 10+: no encontré discrepancia tras retirar el guard `<10`.
2. Seguí el coste desde `beginAction()` a `resolveAction()`: deducción única previa a la ventana de reclamo y pérdida de influencia normal para Coup.
3. Revisé si Coup puede abrir un bloqueo por `BLOCKS` o reclamo por `ROLE_BY_ACTION`: no aparece en ninguno.
4. Contrasté envelope stale/no disponible en `submitChoice()` con el manejador `g-decisionRejected` del cliente; queda pendiente observar aviso runtime.
5. Revisé diff exacto: cambio de producto de una línea, solo elimina `if (action.type === 'coup' && this.players[actor].money < 10) return this.playTurn()`. Los otros cambios del commit son documentación/bitácora F2.

## Recorrido humano solicitado

La app está lista en **http://127.0.0.1:3000/**. Backend Socket.IO local: puerto **8011**. Abrir dos ventanas o perfiles de navegador en la misma máquina.

1. En la primera ventana, crear una partida con **Crear**; en la segunda, unirse con el código mostrado. Iniciar con dos participantes humanos.
2. Acumular monedas con **Impuesto** (Duque), **Ayuda extranjera** o **Ingreso** hasta que el jugador activo empiece turno con exactamente **7** monedas. Pulsar **Golpe**, seleccionar al oponente y confirmar. Observar que no vuelve a «Elige una acción», que el actor queda con 0 y que el oponente debe perder una influencia.
3. Repetir en partidas nuevas con **8** y **9** monedas. En cada caso Coup debe estar disponible y, después de confirmarlo, cobrarse exactamente 7 (saldo final respectivamente 1 y 2) y perder el objetivo una influencia. Registrar si al objetivo le apareció alguna opción de bloqueo; Coup no debe abrirla, incluso si su carta visible es Condesa.
4. Acumular hasta empezar un turno con **10 o más** monedas. Confirmar que solo se ofrece Coup, que acciones distintas están deshabilitadas/ausentes y que no puede seleccionarse otra acción.
5. Si es posible con DevTools, guardar un envelope de `g-submitDecision` y repetirlo después de que cambie `decisionId` o `stateVersion`. Debe llegar `g-decisionRejected` y mostrarse el error recuperable; la selección no debe reiniciar en silencio.

Por favor, reportar por cada paso: saldo antes/después, opciones visibles, texto/ventana que recibió el objetivo y cualquier mensaje mostrado. No emitiré PASS hasta recibir observaciones de los pasos 2–5.

## Comandos y evidencia

- `git rev-parse HEAD` → `0b73305f5be684bb05cc7109701f958c26a98921`.
- `git diff --check 0b73305^ 0b73305` → exit 0.
- `npm ci --ignore-scripts` en `server/` y `coup-client/` para preparar el recorrido; no modificó archivos versionados.
- `PORT=8011 CODEX_DISABLED_FILE=/tmp/coup-issue49-codex-disabled npm start` desde `server/` → `listening on 8011`.
- `PORT=3000 REACT_APP_BACKEND_URL=http://localhost:8011 ./node_modules/.bin/react-scripts start` desde `coup-client/` → servidor iniciado. Comprobaciones HTTP hechas con `127.0.0.1`.
- Puertos 8000 y 8010 estaban ocupados. El primer bind a 8011 desde sandbox falló con `listen EPERM`; el arranque local autorizado fuera del sandbox sí quedó activo.

## Limitaciones y siguiente dueño

No se ejecutaron tests automatizados y no se realizó el recorrido humano. Mantener activos los procesos asociados a las sesiones del servidor (`90903`) y cliente (`89871`) mientras se recoge la observación. Para detenerlos, enviar Ctrl-C a ambas sesiones.

**Siguiente dueño:** Orquestador para coordinar la observación humana; Verificador para actualizar F3 tras recibirla. No integrar ni cerrar issue con este estado.
