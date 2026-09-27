# URL de prueba y crédito de la portada — issue #29

**Estado:** `ACTIVE`; F1 `READY`.
**Unidad:** https://github.com/pronficilio/coup-online/issues/29
**Handoff:** `docs/plans/active/issue_29_readme_site_credit.md`
**Bitácora:** `docs/plans/log/issue-29.jsonl`
**Modo / riesgo / verificación:** `LIGHT` / `LOW` / `NONE`.
**Siguiente dueño:** Agente Alquimista.
**Integración única esperada:** `issue/29-readme-site-credit` en `.worktrees/issue-29-readme-site-credit`, una PR a `master`.

## Objetivo y éxito

Indicar en el README que `https://coup.ejele.net` es un sitio donde probar el juego y actualizar el crédito visible de la portada para atribuir la modificación a Pronficilio y conservar el crédito de autor original a Ethan Chen.

## Alcance

- Añadir el enlace de prueba al README y conservar el enlace de alojamiento ya presente.
- Actualizar el pie de la portada en español e inglés, conservando el enlace al perfil original y dando crédito a Pronficilio.
- Actualizar el inventario de cadenas de la issue #19 para reflejar el nuevo crédito.

Fuera de alcance: cambios de reglas o lógica del juego, despliegue, cambios de idioma, y cualquier edición de otras entradas de la issue #19.

## F1 — Actualizar los dos créditos y documentar la URL (`READY`)

**Pregunta:** ¿el README señala `coup.ejele.net` como lugar para probar el juego y la portada identifica a Pronficilio como modificador conservando a Ethan Chen como autor original?

**Entrada:** README actual, `Home.js`, `translations.json` e inventario de cadenas de la issue #19.

**Salida:** copy actualizado en README y portada, traducciones ES/EN coherentes, inventario sincronizado.

**Criterios de cierre:**

1. El README enlaza a `https://coup.ejele.net` y aún presenta el enlace existente a `https://www.chickenkoup.com/`.
2. El crédito visible muestra a Pronficilio como quien modificó el proyecto y conserva a Ethan Chen como autor original, con enlaces de autoría mantenidos.
3. Los textos de crédito están en español e inglés usando el diccionario actual.
4. El inventario de la issue #19 refleja las etiquetas y autores nuevos.

**Validación mínima:** revisar el diff y ejecutar `git diff --check`; no añadir ni ejecutar pruebas automatizadas.
**Riesgo:** `LOW`; cambios localizados de documentación y texto, reversibles.
**Verifier:** no requerido (`NONE`).
**Commit:** `COMMIT_REQUIRED`; cierre previsto `docs(home): issue 29 F1 CLOSED ready_for_review`.

## Falsificación

¿Una revisión del README o de la portada podría mostrar que el nuevo URL falta, que el crédito no menciona a Ethan Chen como autor original, o que alguna traducción deja una etiqueta de crédito contradictoria?
