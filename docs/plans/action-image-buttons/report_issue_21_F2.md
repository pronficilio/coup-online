# Reporte F2 — issue #21: controles WebP en renderer genérico

**Estado:** `CLOSED`; unidad `WAITING_ORCHESTRATOR`; F3 `PENDING`.
**Branch/worktree:** `issue/21-action-image-buttons` / `.worktrees/issue-21-action-image-buttons`.
**Base integrada:** PR #23 de #14 en `2d82fa1e0d67ba9e48d7885f9c3ae171360425bd`; rama #21 sincronizada con merge `b93a67c`.
**Alcance agregado:** `claim.png` / `claim-active.png`, incorporado después del cierre de F1 y exportado como WebP en esta fase.

## Recursos Claim

Fuentes `/mnt/e/dev/coup/fotos/claim.png` y `claim-active.png`: PNG RGB, 1400×468. Se conservaron sin cambios. Pillow 12.0.0/libwebp 1.6.0 aplicó LANCZOS, redimensionado half-up al 50 %, RGB/canvas intacto y WebP `quality=95`, `method=6`.

| Derivado | Dimensiones | Modo / alfa | Tamaño |
|---|---:|---|---:|
| `claim.webp` | 700×234 | RGB / sin alfa | 36,732 B |
| `claim-active.webp` | 700×234 | RGB / sin alfa | 43,478 B |

Se reabrieron ambas salidas como WebP para verificar formato, dimensiones y modo. La inspección visual de `claim.webp` confirmó que conserva la placa, rótulo y canvas claro de la fuente. El reporte F1 contiene el inventario original de diez imágenes; tras esta adición la unidad contiene doce archivos WebP en seis parejas.

`claim.webp` aparece como recurso contextual, no como botón, bajo la descripción de decisiones `challenge` y `block_challenge`. La descripción textual ya explica el reclamo, por lo que la imagen es decorativa para lectores de pantalla (`alt=""`, `aria-hidden="true"`) y no recibe foco ni emite eventos. `claim-active.webp` está generado y versionado para completar el par solicitado, pero no se usa: el contexto Claim no es interactivo y no tiene estado hover/focus/pressed.

## Mapeo en el renderer

`Coup.js` inspecciona únicamente `decision.type` y `option.choiceId` en las ventanas de respuesta. Los tipos no mapeados mantienen el botón textual original.

| `decision.type` | `choiceId` | Recurso | Presentación accesible |
|---|---|---|---|
| `challenge`, `block_challenge` | `challenge` | `c.webp` / `c-active.webp` | nombre accesible `Challenge` |
| `challenge`, `block`, `block_challenge` | `pass` | `pass.webp` / `pass-active.webp` | nombre accesible `Pass` |
| `block` | `block:duke` | `bfa.webp` / `bfa-active.webp` | `Block Foreign Aid — Block with Duke` |
| `block` | `block:captain` | `bs.webp` / `bs-active.webp` | imagen Block Steal y texto visible `Block with Captain` |
| `block` | `block:ambassador` | `bs.webp` / `bs-active.webp` | imagen Block Steal y texto visible `Block with Ambassador` |
| `block` | `block:contessa` | `ba.webp` / `ba-active.webp` | `Block Assassination — Block with Contessa` |
| `challenge`, `block_challenge` | contexto en `description` | `claim.webp` | imagen decorativa no interactiva; sin choice Claim |

## Comportamiento y accesibilidad

- `submitChoice(option)` y el evento `g-submitDecision({ decisionId, stateVersion, choiceId })` no cambiaron. La misma opción del servidor se pasa al mismo handler; estado `submitted`, pausa y `disabled` conservan su lógica.
- No se crean ni filtran opciones, y no cambian destinatarios, elegibilidad, reglas, IDs o payloads. Las opciones `Captain`/`Ambassador` mantienen el texto de rol visible. Las elecciones principales, `prove_claim`, reveal, influence y exchange quedan textuales.
- `ResponseImageButton` conserva semántica nativa de `<button type="button">`, etiqueta accesible, `title`, hit area mínima 48 px y foco visible. Las imágenes son decorativas para AT.
- CSS superpone ambas variantes en un marco con relación estable cercana a 3:1; hover, `:focus-visible` y `:active` cruzan opacidad y escala durante 160 ms sin cambiar dimensiones ni demorar el handler. `prefers-reduced-motion: reduce` desactiva la transición.

## Validación

- `npm ci`: completó y restauró las dependencias del cliente.
- `npm run build`: **PASS** (`Compiled with warnings`; el build de producción quedó listo).
- Warnings observados, ajenos a esta modificación: imports `logo` y `Link` sin uso en `src/App.js`; el minificador PostCSS no analiza expresiones `dvh` en `src/components/game/ReferencePanel.css:100` y `:106`; aviso de `caniuse-lite` desactualizado. No hubo warnings de `Coup.js`, `ResponseImageButton.js` ni `CoupStyles.css`.
- Revisión de contrato: se cotejaron los IDs/labels generados por `server/game/coup.js` (`pass`, `challenge`, `block:duke`, `block:contessa`, `block:captain`, `block:ambassador`) con el mapeo anterior y se verificó que `submitChoice` preserva el envelope.
- Recorrido visual manual/headless: **no ejecutado**. No hay Chromium/Chrome/Firefox instalados ni una herramienta de navegador disponible en el entorno; no fue posible abrir una partida y pulsar las cinco acciones. Queda para la revisión F3 si el entorno de integración aporta navegador. No se ejecutaron tests automatizados.
- `git diff --check`: `PASS` antes del commit de F2.

## Entrega

F2 se cierra con el commit canónico `feat(action-images): issue 21 F2 image response controls and transition`. Se deja la unidad `WAITING_ORCHESTRATOR` para F3; no se publica push, PR ni merge y no se cierra la issue.
