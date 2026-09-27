# Plan: acceso a referencias desde la partida

**Estado:** `ACTIVE` — F1 en ejecución
**Issue:** https://github.com/pronficilio/coup-online/issues/18
**Origen:** continuación acotada del acceso pendiente de la issue #8; activos y componente aislado integrados por [PR #12](https://github.com/pronficilio/coup-online/pull/12).
**Handoff:** `docs/plans/active/issue_18_reference_access.md`
**Bitácora:** `docs/plans/log/issue-18.jsonl`

## Perfil operativo

- Proyecto/repositorio: `pronficilio/coup-online`; rama base y merge target `master`.
- Ejecutor: Agente Alquimista; Verifier: ninguno.
- Modo/riesgo/verificación: `LIGHT` / `LOW` / `NONE`.
- Branch/worktree únicos: `issue/18-reference-access` / `.worktrees/issue-18-reference-access`.
- Aislamiento: Git worktree. La unidad tendrá un único PR a `master`.
- La issue #8 se cerró al fusionar #12; la auditoría confirmó que #12 agregó activos y el componente `ReferencePanel`, pero no lo montó en `Coup.js`. No reabrir ni reutilizar #8: #18 sigue el trabajo en una integración independiente.

## Objetivo y alcance

Montar dos accesos compactos, en la esquina inferior derecha de la pantalla de partida según la composición de `fotos/mini.png`, para abrir por separado la tarjeta y la tabla de referencia que ya existen en `coup-client/src/components/game/ReferencePanel.js`.

Se conservan los modales e imágenes españolas, reglas del juego, controles actuales, servidor y protocolo. Los dos accesos deben funcionar para los jugadores sin depender de que sea su turno. El PNG de `fotos/mini.png` es una referencia local ignorada y no se versiona.

## Fase F1 — montar los accesos (`READY`)

**Pregunta única:** ¿puede cualquier jugador consultar ambas referencias desde el dock inferior derecho en escritorio y móvil sin cambiar el estado del juego?

- **Entrada:** `ReferencePanel.js/.css`, `Coup.js` y `CoupStyles.css` de `origin/master`; composición local `fotos/mini.png`.
- **Trabajo:** montar el componente; ubicar botones cuadrados con iconos accesibles en el inferior derecho; preservar modal separado, foco, teclado/tacto y cierre por botón/Escape/fondo; evitar tapar controles de decisiones en móviles.
- **Fuera de alcance:** cambiar arte/contenido, reglas, decisiones, Rules, servidor, Socket.IO, añadir dependencias o versionar PNG.
- **Salida/evidencia:** `docs/plans/reference-access/report_issue_18_F1.md`, build y resultados del recorrido manual.
- **Avanzar:** seis criterios en handoff cumplidos con evidencia, build y diff limpios.
- **Pivotar:** ajustar el anclaje/composición del dock si el viewport o panel de decisión lo requieren, manteniendo su esquina inferior derecha.
- **Repetir:** una corrección localizada de posición, foco o control.
- **Bloquear:** solo si no hay espacio móvil seguro sin rediseñar otra superficie o cambiar lógica de juego; devolver el hallazgo y una alternativa al Orquestador.
- **Validación:** `npm run build` desde `coup-client`, `git diff --check`, revisión manual escritorio/móvil con cada modal y prueba de foco/cierre. No añadir ni ejecutar tests automatizados.
- **Commit:** `COMMIT_REQUIRED`; `feat(reference-panel): issue 18 F1 CLOSED ready_review`.

## Riesgo y falsificación

Riesgo `LOW`: cambio visual localizado y reversible en cliente. Verificación independiente `NONE` según el default LIGHT/LOW. Antes de revisión final, intentar refutar: ¿se tapa una decisión en el viewport móvil más estrecho?, ¿abrir/cerrar cambia el turno o una decisión?, ¿se solicita el WebP de la referencia no abierta?, ¿falla la restauración del foco?

## Integración

El ejecutor entrega una sola rama y un PR vinculado a #18 en `WAITING_ORCHESTRATOR`. El Orquestador revisa diff, build, recorrido/evidencia y topología; solo él integra y cierra después de verificar.
