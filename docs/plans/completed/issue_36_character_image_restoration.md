# Handoff final — restauración de personajes — issue #36

- **Issue:** https://github.com/pronficilio/coup-online/issues/36
- **Estado:** COMPLETED; F1 CLOSED (PASS).
- **Plan:** `docs/plans/character-image-restoration/plan_character_image_restoration.md`
- **Bitácora:** `docs/plans/log/issue-36.jsonl`
- **Modo / riesgo / verificación:** LIGHT / LOW / NONE.
- **Verifier:** no requerido.
- **Alcance:** seis WebP bajo `coup-client/src/assets/characters/`.
- **Fuente exacta:** blobs de `be93e975072b364365a90206931f732fb44dc6f1`, primer padre del merge de PR #34.
- **No tocar:** los otros trece WebP optimizados, código, CSS, imágenes de referencias y assets sin uso.
- **Branch / worktree:** `issue/36-character-image-restoration` / `.worktrees/issue-36-character-image-restoration`.
- **Merge target:** `master`.
- **PR:** https://github.com/pronficilio/coup-online/pull/37, integrada en `094a61e4a45b08ffb6aba68098bb424d21b9b7d2`.
- **Criterio:** seis WebP idénticos a la fuente previa al PR #34; ningún otro asset modificado.
- **Validación:** comparar hashes y revisar paths del diff. Sin tests ni build.
- **Commit:** `fix(assets): restore original character image sizes (#36)`.
- **Evidencia:** seis WebP son idénticos a los blobs previos a la PR #34; diff de assets limitado a los seis personajes.
- **Siguiente dueño:** ninguno; issue #36 cerrada.

## Cierre administrativo

La PR #37 se integró en `master` con `094a61e4a45b08ffb6aba68098bb424d21b9b7d2` el 2026-09-27. GitHub cerró #36; la unidad queda `COMPLETED`. Los seis WebP restaurados coinciden byte por byte con su fuente previa a la PR #34, y los otros trece optimizados se conservaron.
