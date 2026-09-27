# Handoff de restauración de personajes — issue #36

- **Issue:** https://github.com/pronficilio/coup-online/issues/36
- **Estado:** WAITING_ORCHESTRATOR; F1 CLOSED (PASS).
- **Plan:** `docs/plans/character-image-restoration/plan_character_image_restoration.md`
- **Bitácora:** `docs/plans/log/issue-36.jsonl`
- **Modo / riesgo / verificación:** LIGHT / LOW / NONE.
- **Verifier:** no requerido.
- **Alcance:** seis WebP bajo `coup-client/src/assets/characters/`.
- **Fuente exacta:** blobs de `be93e975072b364365a90206931f732fb44dc6f1`, primer padre del merge de PR #34.
- **No tocar:** los otros trece WebP optimizados, código, CSS, imágenes de referencias y assets sin uso.
- **Branch / worktree:** `issue/36-character-image-restoration` / `.worktrees/issue-36-character-image-restoration`.
- **Merge target:** `master`.
- **Criterio:** seis WebP idénticos a la fuente previa al PR #34; ningún otro asset modificado.
- **Validación:** comparar hashes y revisar paths del diff. Sin tests ni build.
- **Commit:** `fix(assets): restore original character image sizes (#36)`.
- **Evidencia:** seis WebP son idénticos a los blobs previos a la PR #34; diff de assets limitado a los seis personajes.
- **Siguiente dueño:** Orquestador para integrar la PR.
