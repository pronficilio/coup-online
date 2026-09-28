# Issue #47 — Corrección F1 de identidad accesible por slot

**Estado:** corrección implementada, compilada y verificada independientemente en F2 (`PASS`).
**Hallazgo origen:** `docs/plans/ambassador-exchange-options/report_issue_47_F2_verifier.md`, commit `284b8b9`.  
**Alcance:** distinguir cartas físicas que comparten rol y origen en sus nombres accesibles, sin alterar presentación ni comportamiento.

## Corrección

`ExchangeDecisionPanel` añade al `aria-label` de cada carta una posición localizada y única dentro del pool (`Carta 1 de 4`…`Carta 4 de 4`; equivalente en inglés). El nombre sigue incluyendo origen, rol y estado seleccionado. Se conserva `aria-pressed`.

El cambio solo añade atributos accesibles y claves ES/EN. No cambia texto visible, identidad de datos, algoritmo de selección, cursor B/A, multiconjunto elegido, mapeo a `choiceId`, envelope, payload del servidor ni protocolo.

## Validación

| Comprobación | Resultado |
|---|---|
| Identidad única según posición y total del pool | Implementada; cubre slots físicos repetidos con igual rol y origen |
| Origen, rol y estado seleccionado en el nombre accesible | Conservados |
| UI visible, selección, protocolo y servidor | Sin cambios |
| `npm run build` en `coup-client` | PASS, exit 0 |
| `git diff --check` | PASS |
| Tests automatizados | No ejecutados |

El build mantiene advertencias preexistentes en `App.js`, `Coup.js` y el cálculo `dvh` de `ReferencePanel.css`. No hay errores de compilación.

## Siguiente paso

F2 confirmó que dos cartas físicas con el mismo origen y rol tienen nombres accesibles distintos por posición, conservando origen/rol/selección y `aria-pressed`; el reporte final está en `report_issue_47_F2_verifier.md`.
