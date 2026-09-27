# Issue #26 — reporte independiente F3 FINAL (copy)

- **Unidad:** issue #26 — Hacer visible la pausa de partida y guiar la reanudación.
- **Checkpoint:** F3 FINAL después de simplificar el copy.
- **Branch / HEAD verificado:** `issue/26-paused-game-overlay` / `b7328f7f79e126d66bece9cd80d2b8c43abe1218`.
- **Commit de producto del copy:** `4e3043b4c5d85e63e6aba47b0b5da7f0869ace2f`.
- **Base / target:** `be93e975072b364365a90206931f732fb44dc6f1` / `master` de `pronficilio/coup-online` (`origin`).
- **Modo / riesgo / política:** FULL / HIGH / FINAL.

## Veredicto

**PASS** — además de la inspección estática y los gates, el usuario confirmó que realizó los pasos solicitados y aprobó el resultado.

## CLAIM y revisión estática

El copy reducido da una señal breve: solo quien puede reanudar ve un overlay con «Partida en pausa» y «Reanudar partida»; quienes esperan ven «La partida está en pausa.» en un estado no modal; una pausa no recuperable muestra el título sin CTA.

- `Coup.js:273-289` recibe el estado personalizado del servidor, monta el overlay solo si `showOverlay` es verdadero y enfoca la capa. `Coup.js:465-485` presenta el heading y renderiza el CTA únicamente con `canResume`; un error real del servidor se conserva como `role="alert"`.
- `Coup.js:459` presenta a los demás el único status `game.pause.generic` con `role="status"`; no renderiza overlay para ellos cuando `showOverlay === false`.
- `translations.json:231-233` contiene exactamente los textos ES «Partida en pausa», «La partida está en pausa.» y «Reanudar partida»; EN equivalente en `:525-527`. Paridad actual: ES=292, EN=292, sin claves/placeholders diferentes.
- `CoupStyles.css:285-324` conserva capa `position: fixed; inset: 0` y panel responsive; `Coup.js:344-362` conserva la trampa de Tab. Esto no demuestra su comportamiento visual ni de foco en navegador.
- La inspección del commit `4e3043b` frente a su padre confirma que el cambio de producto se limita a `Coup.js`, estilos de pausa y traducciones; el commit `b7328f7` añade documentación de handoff. `git diff --check be93e97..b7328f7` pasó.

## CI_GATES / ADVERSARIAL_CHECK

- **CI_GATES: PASS.** `npm run build` ejecutado independientemente desde el worktree terminó con código 0 y generó el bundle. CRA emitió los warnings conocidos: imports `logo`/`Link` sin uso en `src/App.js`, `postcss-calc` no interpreta `dvh` de `ReferencePanel.css` y `caniuse-lite` está desactualizado. El diff check pasó y las traducciones tienen paridad.
- **ADVERSARIAL_CHECK: PASS.** La inspección estática no encontró copy explicativo residual en los tres estados previstos; el usuario confirmó que ejecutó los pasos visuales y de interacción listados abajo y que todo funcionó.
- **OVERALL: PASS.** Los criterios estáticos, los gates y el checklist humano solicitado quedaron satisfechos según la aprobación recibida.

## Recorrido humano — aprobado por el usuario

La instancia existente está disponible en **http://localhost:3012**. El backend existente de Socket.IO/API usa el puerto **8012** y `DECISION_TIMEOUT_MS=30000` según la configuración informada por el Orquestador. No inicié ni reinicié servicios duplicados.

Comprobaciones de disponibilidad, sin crear salas ni un socket de juego:

- `curl -I http://localhost:3012` → `HTTP/1.1 200 OK`; la página HTML responde.
- `curl http://localhost:8012/exists/verifier-copy-check` → `{"exists":false}`; ruta del backend responde sin alterar una sala.
- Los procesos ya estaban levantados por el Orquestador y no se iniciaron, reiniciaron ni detuvieron durante esta revisión. Para detenerlos, usar `Ctrl+C` en las terminales originales del cliente y del backend; este Verifier no conserva esas sesiones.

**Actualización operativa posterior a la aprobación:** el Orquestador informa que envió `Ctrl+C` a las sesiones temporales originales después de la prueba aprobada. Actualmente el cliente en el puerto 3012 no acepta conexiones. El Verifier no inició, reinició ni detuvo servicios; este cambio de disponibilidad ocurrió después del recorrido humano y no altera la evidencia ni la aprobación registradas arriba.

**Evidencia humana recibida:** el usuario confirmó: «He realizado los pasos y todo funciona muy bien. Aprobado.» Esto se toma como aprobación global de los cuatro pasos pedidos. No se proporcionaron navegador, capturas ni medidas exactas del viewport, por lo que no atribuyo esos detalles.

1. **Overlay recuperable, responsable:** PASS — cubierto por la confirmación global tras dejar pendiente una respuesta y reanudar desde su CTA.
2. **Otras personas durante pausa recuperable:** PASS — cubierto por la confirmación global del aviso no modal sin overlay para quienes no eran responsables.
3. **Pausa no recuperable:** PASS — cubierto por la confirmación global del caso de pausa no recuperable, con overlay sin CTA.
4. **Teclado y viewport estrecho:** PASS — cubierto por la confirmación global de foco, navegación/activación por teclado y vista estrecha. No se registra una anchura o navegador concretos.

## Limitaciones y siguiente dueño

El Verifier no dispone de navegador propio, así que la evidencia visual proviene de la confirmación del usuario y no de observación directa de esta sesión. La aprobación se limita a los cuatro pasos pedidos; no afirma una combinación concreta de navegador/dispositivo ni evidencia visual adjunta. No queda recorrido obligatorio de F3 pendiente según esa confirmación.

El Verifier no ejecutó tests automatizados, no modificó código de producto, no abrió PR ni inició o detuvo servicios.
