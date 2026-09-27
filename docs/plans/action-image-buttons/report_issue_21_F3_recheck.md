# Recheck F3 — issue #21: walkthrough confirmado por el usuario

**Veredicto F3 actualizado: `PASS`**

**Unidad:** `WAITING_ORCHESTRATOR`; F1/F2/F4 `CLOSED`; F3 `PASS`.
**Revisión anterior:** `report_issue_21_F3.md`, que conserva el veredicto `BLOCKED` de la primera pasada cuando este agente no pudo iniciar un navegador desde WSL.
**Alcance de esta actualización:** registrar la evidencia posterior, confirmada explícitamente por el usuario, y resolver el bloqueo pendiente de AC5/AC6. No volví a ejecutar build, tests ni walkthrough.

## Procedencia del recorrido

El walkthrough lo ejecutó el usuario en la instancia actualizada `http://localhost:3001`; el verifier no manejó ese navegador ni observó directamente la sesión. Tomo la confirmación del usuario como evidencia reportada, separada de la auditoría estática y del build registrados previamente. La validación anterior en `localhost:3000` servía un bundle antiguo, por lo que esta actualización se apoya en la instancia del puerto 3001.

El usuario confirmó estos resultados:

- Los fondos blancos exteriores ya no aparecen.
- La ventana de desafío de Tax muestra solo Pass y Challenge; no aparece Claim como opción.
- Challenge muestra el arte `c-active` actualizado.
- Pass, Challenge, Block Foreign Aid (BFA), Block Steal (BS) y Block Assassination (BA) se ven bien en escritorio.
- La navegación con Tab funciona y el foco visible se aprecia.
- Al estrechar la ventana no aparecen recortes ni solapamientos; el usuario no indicó el ancho exacto.
- Con reduced motion no se reproduce la transición.

## Criterios cubiertos

- **AC1–AC2:** F4 registró las doce salidas RGBA WebP en dimensiones actuales al 50 %, la inspección de previews y la conservación de bordes/halos sin matte rectangular; la confirmación del usuario en la app corrobora que ya no ve los fondos blancos.
- **AC3:** la F3 inicial cotejó las choices del renderer con `server/game/coup.js`, confirmó que el cliente conserva `decision.options` y `submitChoice`, y que el envelope `g-submitDecision({decisionId,stateVersion,choiceId})` no cambió. El diff de F4 solo retiró la imagen contextual Claim y su regla CSS junto con regenerar recursos; no modificó el envío de respuestas.
- **AC4:** la CSS conserva la transición normal de 160 ms y el marco de proporción fija; el usuario confirmó que `c-active` actualizado aparece en la instancia local. Con reduced motion el usuario confirma que la transición se desactiva.
- **AC5:** el usuario confirma Tab, foco visible y composición en ventana estrecha; la auditoría estática previa registró los botones nativos, sus nombres accesibles y `prefers-reduced-motion`.
- **AC6:** el build de producción pasó en F4; el usuario ejecutó y reportó el recorrido visual de los cinco controles en la instancia vigente, junto con las comprobaciones de Tab y reduced motion. No se ejecutaron tests automatizados.

El recorrido pendiente en la primera pasada queda cubierto por este reporte con la procedencia indicada. El veredicto efectivo de F3 pasa a `PASS`; el reporte F3 original se conserva como registro histórico de la limitación de esa sesión.
