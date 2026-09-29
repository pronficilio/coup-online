# Reporte F2 — centralizar decisiones (#56)

**Estado:** `CLOSED (PASS)` por build y aprobación visual del propietario.
**Base:** rebase sobre `origin/master@a421c0e`.
**Rama/worktree:** `issue/56-centralized-decision-panel` / `.worktrees/issue-56-centralized-decision-panel`.

## Cambios

| Control antes | Ubicación anterior | Ubicación actual |
|---|---|---|
| Action | panel existente del turno | panel central «Acciones y contraacciones» |
| Exchange | panel existente del turno | el mismo panel, conserva `ExchangeDecisionPanel` especializado |
| Challenge, pass, block, block challenge | botones gráficos bajo las influencias | opciones de texto en el panel central |
| Prove claim, lose influence | botones planos bajo las influencias | opciones del servidor en el panel central |
| Play Again | botón bajo el tablero para quien puede reiniciar | panel central de resultado |
| emergencia Codex | botón bajo el tablero | utilidad en `GameHeader` |
| espera, pausa, ganador | mensajes bajo el tablero | siguen siendo texto de estado; no son controles de decisión |

Todos los controles de decisión se derivan de `decision.options`; el cliente sigue enviando `{ decisionId, stateVersion, choiceId }`. No se alteraron reglas ni elegibilidad del servidor. La selección enviada se destaca, se deshabilita mientras espera y se limpia cuando el servidor rechaza o reemplaza/cierra la decisión.

El encabezado «Acciones y contraacciones» usa los términos del manual. El texto contextual diferencia acciones con reclamo, bloqueo, desafío, prueba del reclamo y pérdida de influencia. La ayuda de acciones solo menciona bloqueo para Ayuda extranjera, Asesinato y Robo, con los personajes que autoriza el servidor.

## Retiro de recursos

Se eliminaron `ResponseImageButton.js`, sus estilos y los doce WebP de `src/assets/action-buttons/` (pares normal/activo para bloqueo, desafío y pasar, además del par Claim no usado). Se retiraron sus imports y referencias de `Coup.js`; no queda consumidor runtime conocido. Los botones planos de decisión ya no se renderizan en `.DecisionsSection`.

## Evidencia y validación

- `npm run build` en `coup-client`: **exit 0**, build de producción generado. CRA reporta advertencias preexistentes de imports sin uso en `src/App.js`, parseo de `dvh` en `ReferencePanel.css` y datos Browserslist desactualizados; no reporta advertencias de los archivos modificados.
- `git diff --check`: **PASS**.
- El propietario probó el preview en `localhost:4056` y aprobó visualmente la interfaz («quedó padrísimo»). El backend de la partida se levantó en `8001` porque `8000` ya estaba ocupado por un servicio ajeno.
- Búsqueda estática: no quedan referencias a `ResponseImageButton`; `.DecisionsSection` conserva solo estados no accionables.
- No se ejecutaron tests automatizados.
- No se registró una matriz completa de flujos, teclado y móvil; la aprobación del propietario confirma la presentación visual, no cobertura exhaustiva funcional.

## Matriz resumida

| Criterio | Estado | Evidencia |
|---|---|---|
| Un único panel para las decisiones elegibles | `PASS` estático | Renderer común; intercambio especializado dentro del portal |
| Opciones autorizadas por servidor | `PASS` estático | Se mapean `decision.options` sin generar `choiceId` en el cliente |
| Ningún botón de decisión bajo las dos influencias | `PASS` estático | `.DecisionsSection` solo contiene mensajes de estado |
| Imágenes complementarias retiradas | `PASS` estático | 12 assets borrados y referencias runtime retiradas |
| Build de producción | `PASS` | `npm run build`, exit 0 |
| Revisión visual del propietario | `PASS` | Preview del issue #56 aprobado en `localhost:4056` |
| Cobertura exhaustiva de flujos/teclado/móvil | `NOT_RUN` | No se registró recorrido completo de todos los tipos y estados |
| Verifier FINAL independiente | `WAIVED_BY_OWNER` | El propietario autorizó explícitamente merge y cierre |

**Decisión de fase:** F2 cierra con build exitoso y aprobación visual del propietario. Por instrucción explícita del propietario se integra sin veredicto F3 independiente; la dispensa queda registrada como waiver, nunca como `PASS`.
