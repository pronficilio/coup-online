# Reporte F2 — centralizar decisiones (#56)

**Estado:** implementación terminada; build `PASS`; walkthrough manual `PENDING`.
**Base:** `origin/master@b8df17fd71ad5024228fe7021f8ebb6d3973cff7`.
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
- Búsqueda estática: no quedan referencias a `ResponseImageButton`; `.DecisionsSection` conserva solo estados no accionables.
- No se ejecutaron tests automatizados.
- Walkthrough visual/funcional desktop, móvil y teclado: **PENDING**. No hay navegador ni herramienta visual disponible en este entorno, por lo que no se afirma que los flujos interactivos estén verificados.

## Matriz resumida

| Criterio | Estado | Evidencia |
|---|---|---|
| Un único panel para las decisiones elegibles | `PASS` estático | Renderer común; intercambio especializado dentro del portal |
| Opciones autorizadas por servidor | `PASS` estático | Se mapean `decision.options` sin generar `choiceId` en el cliente |
| Ningún botón de decisión bajo las dos influencias | `PASS` estático | `.DecisionsSection` solo contiene mensajes de estado |
| Imágenes complementarias retiradas | `PASS` estático | 12 assets borrados y referencias runtime retiradas |
| Build de producción | `PASS` | `npm run build`, exit 0 |
| Recorrido visual/funcional | `PENDING` | Requiere navegador y estados de partida representativos |
| Verifier FINAL independiente | `PENDING` | F3 aún no inicia |

**Decisión de fase:** F2 queda implementada y compilada, sin marcar el walkthrough como cerrado. Completar verificación visual antes de comenzar F3 FINAL.
