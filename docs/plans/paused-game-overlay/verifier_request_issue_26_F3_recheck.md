# Solicitud de Verifier FINAL — issue #26 (criterio vigente)

## Alcance

Revisar de forma independiente el hash nuevo que se consigne en el handoff. El reporte histórico `report_issue_26_F3.md` verifica únicamente `662125554a76c6724a159a8c572627544a3c19fc`, cuyo criterio autorizaba al líder. El reporte `report_issue_26_F3_recheck.md` verifica únicamente `46b08058096a97539bb2ffbaa52d032beed08ebf`; detectó que respuestas aceptadas se reiniciaban al reanudar. Ambos reportes quedan históricos para sus respectivos commits y no deben reutilizarse como veredicto del HEAD corregido.

## Criterio canónico

- Los responsables de un timeout son únicamente los actores humanos de `activeDecision.allowed` que no figuran en `activeDecision.responses` al vencer el plazo, resueltos a asientos desde el estado server-side.
- Al pausar, las respuestas aceptadas se copian a `pausedDecision.responses`. La reanudación genera ID/versión nuevos y conserva ese mapa; las respuestas anteriores deben seguir aplicadas y no se debe reemitir `g-decision` ni solicitar otra respuesta Codex a esos actores.
- Solo esos asientos pueden recibir overlay/CTA y ejecutar `g-resume`. Ser líder o haber respondido no concede permiso.
- Todo otro jugador recibe un aviso accesible no modal y no recibe overlay. El servidor debe rechazar sus emisiones `g-resume` aunque manipulen el cliente o envíen datos falsos.
- El permiso se persiste por asiento, no por socket ID suministrado/guardado como identidad. No inventar una identidad durante una reconexión: comprobar el comportamiento real del lobby; actualmente bloquea reingreso post-start y desconexión degrada la pausa a no recuperable.
- Si solo queda Codex pendiente no hay responsable humano, no hay CTA y se muestra pausa no recuperable. Disconnect/Codex/error no se deben adjudicar a líder/terceros.
- Cuando la pausa se vuelve no recuperable todos deben recibir overlay sin CTA. La decisión antigua no debe aceptar respuestas.

## Ataques y recorrido requeridos

Inspeccionar/recorrer casos de propietario pendiente, líder no propietario, humano que ya respondió (su elección se conserva y no recibe una segunda solicitud), múltiples humanos pendientes, timeout con Codex únicamente, espectador, solicitud `g-resume` con payload/identidad falsos, desconexión durante pausa, error de reanudación, reactivación de decisión con versión nueva, overlay/foco/teclado y aviso no modal de los demás. Confirmar build y diff/i18n reportados por Ejecutor; no ejecutar tests automatizados.

Entregar veredicto `FINAL` explícito sobre el hash exacto. Si no hay navegador, marcar walkthrough visual como bloqueado y no emitir PASS global.
