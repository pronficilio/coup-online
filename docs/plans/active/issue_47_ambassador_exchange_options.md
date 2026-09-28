# Handoff Para Agente Ejecutor

**Issue/Ticket:** [#47 — Optimizar y visualizar las opciones de intercambio del Embajador](https://github.com/pronficilio/coup-online/issues/47), `OPEN`, asignada a `pronficilio`.
**Plan:** `docs/plans/ambassador-exchange-options/plan_ambassador_exchange_options.md`.
**Estado del plan:** `BLOCKED`; F1 `BLOCKED` por walkthrough visual pendiente.
**Modo de ejecución:** `LIGHT`.
**Nivel de riesgo:** `MEDIUM` (decisión de juego y render privado por asiento).
**Política de verificación:** `FINAL` independiente.
**Verifier requerido ahora:** no; F1 corresponde al Ejecutor, Verifier requerido en F2.
**Pregunta de falsificación:** ¿un pool válido pierde una pareja distinta, conserva una pareja duplicada, expone roles a otro jugador o permite que lo mostrado no corresponda al resultado resuelto?
**Fase sugerida:** F1 — deduplicación semántica y opciones visuales en el panel de acciones.
**Por qué esta fase sigue:** aún no se modificó el flujo; hay que validar la clave canónica y coordinar el renderer compartido con #44/#45.

## Fuentes, contrato y alcance

- Plan canónico: `docs/plans/ambassador-exchange-options/plan_ambassador_exchange_options.md`.
- Fuentes de código: `server/game/coup.js::openExchange`, `activateDecision`; `coup-client/src/components/game/Coup.js`, `CoupStyles.css`, `PlayerBoard.js`; `coup-client/src/i18n/translations.json`.
- Generar los subconjuntos legales como ahora, deduplicar su resultado por multiconjunto de roles (orden indiferente, multiplicidad conservada) y mantener una combinación de índices representante para resolver.
- Mostrar cada opción Exchange dentro del `ActionDecisionPanel`/`ActionDecisionRail`: imágenes de ambas cartas y etiqueta localizada debajo. Reusar imágenes y traducciones de rol existentes.
- Proyectar solo los roles necesarios al cliente elegible. Nunca transmitir `value`, `keptIndices`, la mano completa ni datos de opciones a otros asientos. Mantener el envelope y validación del servidor basados en `decisionId`, `stateVersion`, `choiceId`.
- Retirar el renderer textual de exchange en `DecisionsSection`; preservar estados enviados, pausados, inválidos y cerrados.
- No cambiar reglas, elegibilidad, protocolo, timeout o resolución de otras acciones.

## Coordinación con unidades activas

- #43 (`turn-vote-highlights`) toca `Coup.js`/`PlayerBoard.js`; #44 (`player-decisions-layout`) cambia ubicación de decisiones respecto al tablero. Revisar issues/branches/diffs antes de tocar `Coup.js` y coordinar base. Evitar integrar dos ediciones concurrentes del renderer/layout.
- #45 (`submitted-response-highlight`) cambia resaltado/estado enviado en el renderer genérico. Mantener o integrar su contrato de disabled/selected y secuenciar cambios si editan los mismos nodos.
- El checkout raíz compartido tiene cambios locales ajenos a #47; trabajar solo en `.worktrees/issue-47-ambassador-exchange-options` y no moverlos.

## Criterios de aceptación

1. Para un mismo multiconjunto de roles conservados existe exactamente una opción, sin importar orden ni qué copia física se conserve; multiconjuntos distintos siguen siendo opciones distintas.
2. `choiceId` es único por decisión y está respaldado por una combinación representativa válida para el estado actual; el motor mantiene la autoridad y resuelve la pareja mostrada.
3. La elección del Embajador aparece dentro del panel/tablero de acciones; cada opción muestra ambas ilustraciones y una etiqueta localizada/accessibile debajo.
4. Las cartas/opciones solo se proyectan al jugador elegible; ningún otro asiento o espectador recibe roles privados.
5. Elegir bloquea/acepta/envía con el envelope actual; pausa, rechazo, cierre de decisión y nuevas decisiones no dejan controles viejos ni duplicados.
6. #44/#45 no tienen conflictos no resueltos ni cambios ajenos incluidos en #47.

## Subtareas, evidencia y validación

1. Confirmar issue/branch/worktree/PR de #47, #43, #44 y #45; reclamar #47 en el fork y releerlo antes de crear/usar worktree.
2. Derivar tabla pequeña de pools representativos (A,A,B,B; A,B,C,D; una influencia; dos iguales) con firmas y conteo esperado de opciones.
3. Implementar proyección privada de roles y deduplicación por multiconjunto; no incluir datos privados no necesarios en evento cliente ni en observaciones de Codex.
4. Extender renderer del panel de acciones para parejas de carta y texto localizado; verificar teclado, foco, aria, estados disabled/submitted y responsive; coordinar #44/#45.
5. Revisar el diff para comprobar que cada choiceId conserva resolución válida y que no cambian los eventos/protocolo.
6. Guardar `docs/plans/ambassador-exchange-options/report_issue_47_F1.md` con tabla de pools, privacidad, archivos/rutas, resultado del build si está disponible y walkthrough manual. No declarar verificaciones no realizadas.
7. Verifier independiente en F2 revisa el commit exacto e intenta falsificar AC1–AC5. El ejecutor corrige cualquier FAIL y solicita re-verificación.

No agregar ni ejecutar tests automatizados. Validación esperada: revisión estática, `git diff --check`, build del cliente/servidor cuando el entorno lo permita y recorrido manual móvil/escritorio con parejas duplicadas/distintas.

## Topología y operación

- **Branch destino:** `issue/47-ambassador-exchange-options`.
- **Worktree destino:** `.worktrees/issue-47-ambassador-exchange-options`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **Bitácora:** `docs/plans/log/issue-47.jsonl`.
- **PR/MR esperado:** una PR a `master`, asociada solo a #47.
- **Secuencia de reclamo:** leer issue y comprobar candidatos; reclamar en issue del fork y releer; crear/confirmar worktree canónico desde `origin/master`; mover handoff `inbox/` → `active/` tras el reclamo; registrar `claim` y `worktree_confirmed`.
- **Commits:** `COMMIT_REQUIRED` por fase; mensajes en el plan.
- **Qué actualizar:** issue, plan, bitácora, handoff y reportes F1/F2.
- **Delegación:** delegar subtareas ordinarias según jerarquía/política existente; no inventar roles.
