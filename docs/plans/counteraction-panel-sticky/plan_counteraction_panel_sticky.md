# Plan — issue #82: panel de contraacciones fijo en escritorio

## Estado y clasificación

- Unidad: [issue #82](https://github.com/pronficilio/coup-online/issues/82).
- Estado: `WAITING_ORCHESTRATOR`; F1 `CLOSED`.
- Modo / riesgo / verificación: `LIGHT` / `LOW` / `NONE`.
- Razón: cambio pequeño y reversible de copy, CSS y posicionamiento del panel.
- Siguiente dueño: Orquestador.

## Solicitud y objetivo

En las decisiones compactas fuera del turno, titular el panel «Contraacciones» (o «Counteractions» en inglés), porque presenta una respuesta a la acción en curso. En escritorio, dejar visible el rail de decisiones durante el scroll. Conservar el comportamiento móvil actual.

## Alcance

- Contextualizar el título visible y accesible del panel para `challenge`, `block` y `block_challenge`.
- Fijar el rail de decisiones al viewport en escritorio durante decisiones y acciones del turno.
- Mantener el layout, posición y comportamiento móviles existentes, incluido el caso con el registro de eventos expandido.
- No cambiar reglas, opciones, envío, textos descriptivos ni flujo de servidor.

## Criterios de aceptación

1. `challenge`, `block` y `block_challenge` muestran «Contraacciones» en español y «Counteractions» en inglés. Los demás paneles conservan el título actual.
2. En escritorio, el panel de una acción del turno y el de una contraacción permanecen visibles y operables durante el scroll.
3. En móvil, el panel conserva la disposición actual, también con el registro de eventos expandido.
4. Los controles expandir/colapsar mantienen nombres accesibles coherentes con el panel y el idioma.
5. No cambia ninguna opción ni callback de decisión. Se registran `git diff --check`, build del cliente y revisión responsive que esté disponible; no se añaden ni ejecutan pruebas automatizadas.

## F1 — corregir copy contextual y anclaje responsivo

- Pregunta: ¿el rail identifica la contraacción y permanece accesible en escritorio sin cambiar el comportamiento móvil?
- Entrada: issue #82 y estilos/componentes actuales del rail y registro de eventos.
- Subtareas: contexto ES/EN para título y accesibilidad; posicionamiento fijo desktop con scroll; conservar reglas CSS de móvil; validar los criterios de aceptación.
- Salida: cambios localizados en cliente, evidencia de validación en la bitácora y commit de cierre.
- Avanzar: todos los criterios aplicables pasan y la evidencia se anota en el log/PR.
- Pivote: si el rail fijo se solapa con el registro de eventos o con controles del juego, ajustar offsets sin alterar reglas de producto.
- Repetición acotada: una corrección de layout y una nueva pasada de diff-check/build.
- Bloqueo: solo si el viewport no permite ubicar el rail sin tapar controles esenciales o si falta una dependencia del proyecto.
- Artefactos: `Coup.js`, `CoupStyles.css`, `translations.json`, este plan y la bitácora.
- Política de commit: `COMMIT_REQUIRED`.
- Commit previsto: `fix(counteraction-panel): issue 82 F1 CLOSED ready_review`.
- Validación: `git diff --check`, build del cliente y recorrido responsive disponible; no ejecutar tests automatizados.

## Falsificación

Al desplazarse en escritorio durante una decisión activa, ¿el rail desaparece del viewport o se superpone al registro de eventos? Al volver a móvil, ¿cambió la posición o interacción existentes?

## Integración canónica

- Branch: `issue/82-counteraction-panel-sticky`.
- Worktree: `.worktrees/issue-82-counteraction-panel-sticky`.
- Target: `master` de `pronficilio/coup-online`.
- Handoff: `docs/plans/active/issue_82_counteraction_panel_sticky.md`.
- Bitácora append-only: `docs/plans/log/issue-82.jsonl`.
- PR única: [#83](https://github.com/pronficilio/coup-online/pull/83), `OPEN`, base `master`.
- La revisión visual manual no estuvo disponible: este entorno no tiene navegador ni preview local accesible; no se declara PASS visual.
