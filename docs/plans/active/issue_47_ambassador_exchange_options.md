# Handoff Para Agente Ejecutor

**Issue/Ticket:** [#47 — Optimizar y visualizar las opciones de intercambio del Embajador](https://github.com/pronficilio/coup-online/issues/47), `OPEN`, asignada a `pronficilio`.
**Plan:** `docs/plans/ambassador-exchange-options/plan_ambassador_exchange_options.md`.
**Estado del plan:** `ACTIVE`; F2 detectó nombres accesibles duplicados para cartas físicas iguales; F1 reabierta para corrección focalizada.
**Modo de ejecución:** `LIGHT`.
**Nivel de riesgo:** `MEDIUM` (decisión de juego y render privado por asiento).
**Política de verificación:** `FINAL` independiente.
**Verifier requerido ahora:** sí, tras el ajuste F1; repetir F2 focalizada en la identidad accesible de slots repetidos.
**Pregunta de falsificación:** ¿una selección alternante deja menos/más cartas iluminadas que las permitidas, hace inalcanzable una pareja legal, proyecta roles a otro asiento o envía un `choiceId` distinto del caption?
**Fase sugerida:** F1 — añadir posición de slot a cada nombre accesible para distinguir copias con igual rol y origen.
**Por qué esta fase sigue:** el verificador encontró nombres accesibles indistinguibles para slots físicos duplicados; corregir sin alterar la selección aprobada y repetir F2.

**Estado actual F1:** el propietario aceptó visualmente el selector. F2 encontró un defecto accesible en la identidad de slots repetidos; se conserva el diseño y se reabre F1 para una corrección focalizada.

## Fuentes, contrato y alcance

- Plan canónico: `docs/plans/ambassador-exchange-options/plan_ambassador_exchange_options.md`.
- Fuentes de código: `server/game/coup.js::openExchange`, `activateDecision`; `coup-client/src/components/game/Coup.js`, `CoupStyles.css`, `PlayerBoard.js`; `coup-client/src/i18n/translations.json`.
- Generar los subconjuntos legales como ahora y deduplicar por multiconjunto de roles; mantener una combinación representante autorizada para resolver.
- Mostrar cada carta física del pool una sola vez dentro del `ActionDecisionPanel`/`ActionDecisionRail`: cuatro con dos influencias originales, tres con una. Iluminar originales con el rojo neón del turno, draws sin iluminación; alternar slots a reemplazar empezando por B, luego A; caption localizado dinámico abajo y botón de confirmación con ese texto.
- Un clic en una carta ya seleccionada no cambia selección ni cursor; un clic en otra carta reemplaza el slot seleccionado correspondiente al turno alternante. Mantener exactamente `keepCount` iluminadas y permitir llegar a cualquier pareja.
- Preservar las reglas con una influencia y la identidad física de copias con roles repetidos. Solo el jugador elegible recibe el pool privado.
- Proyectar solo los roles necesarios al cliente elegible. Nunca transmitir `value`, `keptIndices`, la mano completa ni datos de opciones a otros asientos. Mantener el envelope y validación del servidor basados en `decisionId`, `stateVersion`, `choiceId`.
- Retirar el renderer textual de exchange en `DecisionsSection`; preservar estados enviados, pausados, inválidos y cerrados.
- No cambiar reglas, elegibilidad, protocolo, timeout o resolución de otras acciones.

## Coordinación con unidades activas

- #43 (`turn-vote-highlights`) toca `Coup.js`/`PlayerBoard.js`; #44 (`player-decisions-layout`) cambia ubicación de decisiones respecto al tablero. Sus ramas/diffs se auditaron antes de implementar; coordinar base si esas unidades reanudan cambios sobre el renderer/layout.
- #45 (`submitted-response-highlight`) cambia resaltado/estado enviado en el renderer genérico. Mantener o integrar su contrato de disabled/selected y secuenciar cambios si editan los mismos nodos.
- El checkout raíz compartido tiene cambios locales ajenos a #47; trabajar solo en `.worktrees/issue-47-ambassador-exchange-options` y no moverlos.

## Criterios de aceptación

1. La pantalla dibuja cada slot del pool una vez; con dos influencias hay cuatro cartas y dos iluminadas inicialmente; con una influencia hay tres cartas y una iluminada.
2. Los clics en cartas no seleccionadas alternan el reemplazo B/A; siempre se conserva el número legal, cualquier pareja es alcanzable y slots repetidos por rol siguen siendo independientes.
3. El caption localizado refleja exactamente la pareja iluminada; pulsarlo confirma y envía el `choiceId` permitido correspondiente al multiconjunto.
4. Las cartas/opciones solo se proyectan al jugador elegible; ningún otro asiento o espectador recibe roles privados.
5. Elegir bloquea/acepta/envía con el envelope actual; pausa, rechazo, cierre de decisión y nuevas decisiones no dejan controles viejos ni duplicados.
6. El panel es accesible y funciona en escritorio/móvil; no quedan controles duplicados u obsoletos.
7. #43/#44/#45 no tienen conflictos no resueltos ni cambios ajenos incluidos en #47.

## Subtareas, evidencia y validación

1. Releer issue #47 y comprobar las ramas/worktrees de #43/#44/#45; el claim y el worktree #47 ya existen.
2. Sincronizar branch con `origin/master` vigente sin perder los commits actuales.
3. Implementar metadata privada de slots original/draw, persistencia en timeout/resume y deduplicación por multiconjunto.
4. Reemplazar galería por cartas individuales, selección inicial, cursor alternante, caption y confirmación; no modificar `ResponseImageButton.js`.
5. Revisar estados, build y hacer walkthrough usando `http://localhost:3103` (backend `3104`); el propietario confirmó el selector y su funcionamiento. No se informó una validación móvil separada.
6. Guardar `docs/plans/ambassador-exchange-options/report_issue_47_F1_v2.md`; conservar el reporte F1 previo como evidencia de la presentación supersedida.
7. Verifier independiente en F2 revisa el commit exacto e intenta falsificar AC1–AC6.

No agregar ni ejecutar tests automatizados. Validación esperada: revisión estática, `git diff --check`, build y recorrido manual móvil/escritorio de selección, alternancia, caption y confirmación.

## Topología y operación

- **Branch destino:** `issue/47-ambassador-exchange-options`.
- **Worktree destino:** `.worktrees/issue-47-ambassador-exchange-options`.
- **Merge target:** `master` de `pronficilio/coup-online`.
- **Bitácora:** `docs/plans/log/issue-47.jsonl`.
- **PR/MR esperado:** una PR a `master`, asociada solo a #47.
- **Estado del reclamo:** issue asignada y claim visible; handoff ya está en `active`; el Alquimista debe sincronizar el branch actual con `origin/master` vigente antes de editar producto.
- **Commits:** `COMMIT_REQUIRED` por fase; mensajes en el plan.
- **Qué actualizar:** issue, plan, bitácora, handoff y reportes F1/F2.
- **Delegación:** delegar subtareas ordinarias según jerarquía/política existente; no inventar roles.
