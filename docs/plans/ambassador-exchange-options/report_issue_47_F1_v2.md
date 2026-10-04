# Issue #47 — Reporte F1 v2: selección de cartas del pool

**Estado:** `PASS`; el propietario confirmó que el selector funciona y pidió avanzar a F2.
**Base:** `origin/master@db1d22c`; branch `issue/47-ambassador-exchange-options`.  
**Diseño:** sustituye la galería del reporte F1 anterior, que queda como evidencia histórica supersedida.

## Cambios revisados

- El servidor deduplica las opciones por multiconjunto canónico de roles y conserva un `choiceId` representante autorizado para cada resultado.
- Solo el asiento elegible recibe `poolSlots` privados con rol y marca original/robada. El payload no incluye `value` ni `keptIndices`. Los slots permanecen dentro de las choices autorizadas, por lo que se conservan al pausar y reactivar la decisión.
- La UI muestra una carta por slot físico: cuatro con dos influencias originales y tres con una. Las originales empiezan seleccionadas con el contorno blanco y brillo rojo del turno; las robadas empiezan sin brillo. Las etiquetas debajo de cada imagen distinguen el rol y el origen físico.
- Con dos influencias, cada clic en una carta no seleccionada sustituye primero el slot seleccionado B, luego A y continúa alternando. Los clics sobre cartas ya seleccionadas no cambian selección ni cursor. Con una influencia se sustituye la única selección.
- El caption localizado se construye desde las cartas iluminadas. Su botón busca el multiconjunto de roles en las opciones permitidas y envía el `choiceId` correspondiente mediante el envelope actual.
- No se modificó `ResponseImageButton.js` ni se alteró el protocolo de envío.

## Evidencia de validación

| Comprobación | Resultado |
|---|---|
| Rebase sobre `origin/master@db1d22c` | PASS, sin conflictos; rama limpia antes de F1 |
| Reauditoría de #43/#44/#45 | PASS; cambios locales observados no incluyen producto conflictivo; `ResponseImageButton.js` intacto |
| Revisión estática de privacidad, slots, alternancia y mapeo a `choiceId` | PASS |
| `node --check server/game/coup.js` | PASS |
| `git diff --check` | PASS |
| `npm run build` en `coup-client` | PASS, exit 0 |
| Advertencias de build | Preexistentes: imports sin uso en `App.js`, operadores mixtos en `Coup.js` y parseo de `dvh` en `ReferencePanel.css` |
| Revisión del propietario en la app actualizada de 3103/3104 | PASS; confirmó que el selector quedó bien y funciona. Una revisión móvil separada no fue reportada |
| Tests automatizados | No agregados ni ejecutados, según el plan |

## Veredicto F1

La implementación, la revisión estática y el build pasan. El propietario confirmó el selector y su funcionamiento tras reiniciar el proceso obsoleto que inicialmente seguía sirviendo el renderer anterior; el bundle nuevo contenía `ExchangePoolCards`. No indicó una revisión móvil separada. F1 queda aceptada por instrucción explícita del propietario; F2 verificará independientemente el commit `3773322` sin ejecutar tests automatizados.
