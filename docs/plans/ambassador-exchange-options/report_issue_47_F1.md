# Reporte F1 — intercambio del Embajador (#47)

**Veredicto:** `BLOCKED`
**Branch / worktree:** `issue/47-ambassador-exchange-options` / `.worktrees/issue-47-ambassador-exchange-options`
**Base usada para comenzar F1:** `origin/master` en `f900c094`; después se incorporó el merge de #46 (`2f45d78`). `origin/master` avanzó a `0a467c1` con documentación de cierre de #46; el branch se rebasó exitosamente sobre esa base después del commit F1.
**Alcance revisado:** `server/game/coup.js`, `Coup.js`, `CoupStyles.css`, `ExchangeDecisionPanel.js`, `translations.json`.

## Resultado de deduplicación

El servidor normaliza cada rol a minúsculas, ordena la pareja y serializa el arreglo como firma. La firma conserva repeticiones (`[a,a]` difiere de `[a,b]`) e ignora el orden. Para cada firma se conserva la primera combinación física válida; sus `keptIndices` privados siguen ligados al `choiceId` que el servidor resuelve.

| Pool disponible | Se conservan | Combinaciones físicas | Firmas distintas | Firmas resultantes |
|---|---:|---:|---:|---|
| A, A, B, B | 2 | 6 | 3 | AA, AB, BB |
| A, B, C, D | 2 | 6 | 6 | AB, AC, AD, BC, BD, CD |
| A, B, C | 1 | 3 | 3 | A, B, C |
| A, A, B, C | 2 | 6 | 4 | AA, AB, AC, BC |
| A, A, A, A | 2 | 6 | 1 | AA |

Las filas demuestran que se colapsan copias físicas y pares espejo sin fusionar multiplicidades ni parejas distintas. `choiceId` se numera solo al agregar una firma nueva, por lo que es único dentro de la decisión.

## Proyección privada y resolución

- `activateDecision` envía al humano elegible una opción Exchange `{choiceId, roles}`. No incluye `label`, `value`, `keptIndices` ni la mano completa.
- La emisión sigue recorriendo las entradas autorizadas de `decision.allowed` y envía a cada socket humano solo su propia opción; los espectadores no reciben `g-decision`.
- El servidor conserva `keptIndices` en `choice.value` y valida la selección contra el mapa permitido del asiento. `submitChoice` mantiene el envelope exacto `{decisionId, stateVersion, choiceId}`; al resolver usa los índices representantes para devolver las otras cartas al mazo.
- El flujo Codex existente deriva su observación de `choice.value.keep` para el propio asiento; el nuevo arreglo de presentación no se usa como dato público ni altera la resolución.

## Interfaz y estados

`ExchangeDecisionPanel` se monta en `ActionDecisionRail` como panel específico de intercambio. Cada botón muestra los assets de rol existentes y una etiqueta localizada debajo; el mismo texto es su nombre accesible. Los botones nativos soportan teclado y muestran foco visible. El grid responde a ancho estrecho, las opciones se deshabilitan tras envío o pausa, y el panel anuncia envío y rechazo.

Las decisiones Exchange dejan de renderizarse en `DecisionsSection`. El flujo existente limpia la decisión y el rail al cerrar, pausar o terminar la partida; una decisión nueva restablece `submitted`. No se tocó `PlayerBoard.js` ni `ResponseImageButton.js`.

## Coordinación #43/#44/#45/#46

- #43 está abierta/asignada; su branch tiene dos commits documentales y ningún diff de producto actual. Su plan prevé `Coup.js`, servidor y `PlayerBoard.js`.
- #44 está abierta/sin asignatario y no tiene branch/worktree local; F1 es de solo lectura y F2 podría cambiar `Coup.js`/`PlayerBoard.js`.
- #45 está abierta/asignada; su diff de producto modifica únicamente `ResponseImageButton.js`. #47 no lo altera ni lo reutiliza.
- Se limitó el cambio compartido de `Coup.js` al registro de Exchange en el rail ya existente y a retirar su segundo renderer textual. Se conservaron los cambios de #46 en `Coup.js` al rebasar sobre su merge; no hay cambios de `PlayerBoard.js`.

## Validación

- `node --check server/game/coup.js`: pasó.
- Parseo de `coup-client/src/i18n/translations.json`: pasó.
- `git diff --check`: pasó.
- No se agregaron ni ejecutaron tests automatizados.
- El primer build con dependencias del checkout principal no pudo resolver `react/jsx-runtime`. Instalé las dependencias fijadas por `package-lock.json` dentro del worktree y `npm run build` terminó con exit 0 (`Compiled with warnings`).
- Quedan warnings preexistentes: imports sin uso en `src/App.js`, mezcla `&&`/`||` en el manejo de desconexión de #46 en `Coup.js:445`, y parseo de unidades `dvh` en `ReferencePanel.css`. No se reportaron warnings ESLint en `ExchangeDecisionPanel.js` ni en los cambios nuevos del rail.
- No se hizo walkthrough visual en navegador/escritorio/móvil; el build produjo el bundle, pero aquí no hay herramienta de navegador para inspeccionarlo.

## Siguiente acción

F1 queda `BLOCKED`: hace falta un navegador accesible o evidencia visual externa para recorrer una pareja duplicada y una distinta en móvil y escritorio. Desbloquea el Orquestador/usuario al proporcionar ese entorno o walkthrough verificable. No iniciar F2 hasta cerrar F1; el Verifier independiente sigue requerido para la verificación FINAL.
