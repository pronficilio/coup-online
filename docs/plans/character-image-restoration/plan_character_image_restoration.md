# Restaurar los originales de personajes — issue #36

**Estado:** WAITING_ORCHESTRATOR; F1 CLOSED (PASS).
**Issue:** https://github.com/pronficilio/coup-online/issues/36
**Handoff:** docs/plans/active/issue_36_character_image_restoration.md
**Bitácora:** docs/plans/log/issue-36.jsonl
**Modo / riesgo / verificación:** LIGHT / LOW / NONE.
**Branch / worktree / merge target:** issue/36-character-image-restoration / .worktrees/issue-36-character-image-restoration / master.
**Base:** origin/master en 5fffacfd; originales de personajes tomados de be93e975, primer padre del merge de PR #34.
**PR:** https://github.com/pronficilio/coup-online/pull/37, abierta hacia `master`.
**Siguiente dueño:** Orquestador para integrar la PR.

## Solicitud

Restaurar exactamente los seis WebP de personajes a sus versiones previas al cambio de la PR #34. Mantener las otras trece imágenes optimizadas. No modificar código, CSS, referencias, otros assets ni dependencias.

## Archivos en alcance

| Archivo | Actual en master | Bytes actuales | Restaurar a | Bytes restaurados |
|---|---:|---:|---:|---:|
| `characters/duque.webp` | 268×389 | 41,390 | 840×1220 | 100,648 |
| `characters/capitan.webp` | 268×389 | 38,928 | 840×1220 | 110,444 |
| `characters/asesino.webp` | 268×389 | 31,660 | 840×1220 | 84,110 |
| `characters/condesa.webp` | 268×389 | 32,854 | 840×1220 | 84,712 |
| `characters/embajador.webp` | 268×389 | 32,652 | 840×1220 | 77,322 |
| `characters/reverso.webp` | 268×389 | 53,914 | 840×1220 | 244,482 |
| **Total** |  | **231,398** |  | **701,718** |

Las versiones objetivo son los blobs exactos en `be93e975072b364365a90206931f732fb44dc6f1`, el primer padre del merge commit `27f46f1ca0f1bbb25aa589a39e82aaa15358c737` de la PR #34.

## Criterios de aceptación

1. Los seis archivos son byte por byte iguales a los de `be93e97` y conservan WebP, encuadre, proporción y alfa originales.
2. Ningún otro asset cambia; los trece WebP no correspondientes a personajes conservan el contenido de `origin/master`.
3. El único cambio de producto son estos seis archivos; se entrega en una PR hacia `master`.
4. No se requieren tests, build ni Verifier; la validación se limita a comparar blobs y el alcance del diff.

## F1 — Restaurar las seis imágenes (CLOSED; PASS)

**Pregunta:** ¿se restauraron las imágenes de personajes exactamente al estado previo a la PR #34, sin alterar los otros assets optimizados?

**Entrada:** origin/master 5fffacfd y blobs de `be93e97`.
**Salida:** seis WebP restaurados, evidencia hash/bytes y un commit.
**Avanzar:** los seis blobs coinciden con `be93e97` y solo esas seis imágenes cambian.
**Bloquear:** la fuente previa a la PR #34 no está disponible o alguno de los seis archivos tuvo otra modificación posterior independiente.

**Commit requerido:** `fix(assets): restore original character image sizes (#36)`.
**Validación:** comparación de hashes de los seis archivos contra `be93e97`; inspección de la lista de paths cambiados. Sin tests/build.

### Resultado F1

Los seis WebP se restauraron byte por byte desde `be93e975072b364365a90206931f732fb44dc6f1`. El diff de assets muestra únicamente estos seis paths; los otros trece WebP optimizados y el código permanecen intactos.

| Archivo | Restaurado | Bytes |
|---|---:|---:|
| `characters/duque.webp` | 840×1220 | 100,648 |
| `characters/capitan.webp` | 840×1220 | 110,444 |
| `characters/asesino.webp` | 840×1220 | 84,110 |
| `characters/condesa.webp` | 840×1220 | 84,712 |
| `characters/embajador.webp` | 840×1220 | 77,322 |
| `characters/reverso.webp` | 840×1220 | 244,482 |
| **Total** |  | **701,718** |

No se ejecutaron tests ni build.
