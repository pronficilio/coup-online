# Reporte F4 — issue #21: corrección visual de fondos WebP

**Estado:** `CLOSED`; unidad `WAITING_ORCHESTRATOR`; F3 permanece `BLOCKED` para el walkthrough amplio de AC6.
**Branch/worktree:** `issue/21-action-image-buttons` / `.worktrees/issue-21-action-image-buttons`.
**Base revisada:** F3 documental `c88a223`; rama #21 conserva el merge de base `b93a67c` que integra #14 PR #23 (`2d82fa1`).
**Motivo:** feedback visual del usuario: eliminar el fondo exterior de las imágenes y conservar todos los bordes y resplandores.

## Cambios

- Regeneré los doce WebP desde las fuentes PNG RGB ignoradas de `/mnt/e/dev/coup/fotos/`. Las fuentes se trataron como solo lectura y no se editaron.
- Matriz de fases: F1 cerró diez recursos en las cinco parejas `ba`, `bfa`, `bs`, `pass` y `c`; Claim se añadió como pareja después del cierre F1, durante F2. F4 reprocesó las seis parejas a RGBA desde las fuentes actuales. Esto actualiza los archivos entregados, sin reescribir los registros históricos F1/F2.
- `c.png`/`c-active.png` actuales miden 1024×342, así que sus WebP actuales son 512×171. F1 conserva el dato histórico de las fuentes usadas entonces (1400×468). No se sobrescribieron PNG.
- Se quitó de `Coup.js` el `<img>` decorativo Claim y de CSS la regla `.DecisionClaimContext`. La descripción textual sigue explicando el reclamo; no hay opción Claim. Los dos archivos WebP Claim permanecen en el inventario sin renderizarse.

## Pipeline e inventario

Para separar fondo de arte, marqué candidatos de color casi neutro (diferencia entre canales ≤60 y canal máximo ≥75), cerré huecos pequeños con filtros morfológicos de 5 px y eliminé solo la región candidata conectada a los bordes. Después redimensioné RGBA con LANCZOS y exporté WebP con quality 95/method 6. Las previews se compusieron sobre slate oscuro para revisar mates y píxeles residuales; están en `/tmp/issue21-bg-review-v3/`.

Pillow reabrió todos los derivados como WebP RGBA con alfa no opaco. Las dimensiones son el 50 % de la fuente actual, con redondeo half-up; las parejas coinciden.

| Archivo | Fuente | WebP actual | Modo | Bytes |
|---|---:|---:|---|---:|
| `ba.webp` | 2172×724 | 1086×362 | RGBA | 109,286 |
| `ba-active.webp` | 2172×724 | 1086×362 | RGBA | 121,316 |
| `bfa.webp` | 1024×341 | 512×171 | RGBA | 26,166 |
| `bfa-active.webp` | 1024×341 | 512×171 | RGBA | 28,590 |
| `bs.webp` | 1024×341 | 512×171 | RGBA | 31,780 |
| `bs-active.webp` | 1024×341 | 512×171 | RGBA | 39,100 |
| `pass.webp` | 1020×341 | 510×171 | RGBA | 23,058 |
| `pass-active.webp` | 1020×341 | 510×171 | RGBA | 29,496 |
| `c.webp` | 1024×342 | 512×171 | RGBA | 23,386 |
| `c-active.webp` | 1024×342 | 512×171 | RGBA | 28,954 |
| `claim.webp` | 1400×468 | 700×234 | RGBA | 40,010 |
| `claim-active.webp` | 1400×468 | 700×234 | RGBA | 46,932 |

## Revisión visual

Inspeccioné los doce previews. Las placas, texto, ornamentos, contornos dorados y resplandores de las variantes activas se conservan. El fondo exterior queda transparente y no aparece un matte rectangular. Los halos de `ba-active`, `bfa-active`, `bs-active`, `pass-active`, `c-active` y `claim-active` siguen visibles. No usé imagegen ni modifiqué las fuentes.

Es una inspección local de previews, no una validación final de la interfaz. El usuario debe revisar visualmente los assets en la app.

## Validación

- Formato, modo, dimensiones, alfa y coincidencia de pares: **PASS** por inspección con Pillow.
- Revisión de las doce previews: **PASS**, sin pérdida visible de halos/bordes ni matte rectangular.
- Claim decorativo y `.DecisionClaimContext`: **PASS**, eliminados; `decision.description` permanece.
- `npm run build` en `coup-client`: **PASS**, `Compiled with warnings`. Warnings preexistentes: imports `logo`/`Link` sin uso en `src/App.js`, parseo de `dvh` en `ReferencePanel.css:100,106`, aviso de `caniuse-lite` y deprecación de `fs.F_OK`; no hubo warnings de los archivos cambiados.
- `git diff --check`: **PASS** después de actualizar documentos.
- No ejecuté tests automatizados. No detuve ni reinicié servidores locales.

## Confirmación visual del usuario

El 2026-09-27, el usuario revisó la instancia corregida en `http://localhost:3001` y confirmó que no ve rectángulos blancos, que la ventana de desafío de Tax muestra solo Pass y Challenge, y que Challenge usa la variante activa actualizada. La URL anterior en el puerto 3000 servía un bundle obsoleto; por eso no reflejaba los cambios. Se comprobó que el bundle del puerto 3001 ya no incluye `DecisionClaimContext` y que los WebP de Pass/Challenge servidos tienen alfa transparente en las esquinas.

## Estado y límite

F4 cierra la corrección local y los tres defectos visuales reportados quedan validados por el usuario. F3 continúa `BLOCKED` hasta completar el walkthrough manual de AC6: las cinco respuestas en escritorio/móvil, teclado/foco y reduced motion. No hice push, PR, merge ni cierre de issue.
