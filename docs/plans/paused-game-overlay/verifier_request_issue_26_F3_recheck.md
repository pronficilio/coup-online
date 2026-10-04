# Solicitud de Verifier FINAL — issue #26 (criterio vigente)

## Alcance

Revisar de forma independiente el hash nuevo que se consigne en el handoff. Los reportes `report_issue_26_F3.md` (`662125554a76c6724a159a8c572627544a3c19fc`, criterio líder), `report_issue_26_F3_recheck.md` (`46b08058096a97539bb2ffbaa52d032beed08ebf`, respuestas reiniciadas) y `report_issue_26_F3_followup.md` (`9276e0a67ee20844bc04a08804217c0e6acd8650`, preserva respuestas con copy anterior) son históricos para esos hashes y no aplican al HEAD corregido.

## Criterio canónico

- Los responsables de un timeout son únicamente los actores humanos de `activeDecision.allowed` que no figuran en `activeDecision.responses` al vencer el plazo, resueltos a asientos desde el estado server-side.
- Al pausar, las respuestas aceptadas se copian a `pausedDecision.responses`. La reanudación genera ID/versión nuevos y conserva ese mapa; las respuestas anteriores deben seguir aplicadas y no se debe reemitir `g-decision` ni solicitar otra respuesta Codex a esos actores.
- Solo esos asientos pueden recibir overlay/CTA y ejecutar `g-resume`. Ser líder o haber respondido no concede permiso.
- Todo otro jugador recibe un aviso accesible no modal y no recibe overlay. El servidor debe rechazar sus emisiones `g-resume` aunque manipulen el cliente o envíen datos falsos.
- El permiso se persiste por asiento, no por socket ID suministrado/guardado como identidad. No inventar una identidad durante una reconexión: comprobar el comportamiento real del lobby; actualmente bloquea reingreso post-start y desconexión degrada la pausa a no recuperable.
- Si solo queda Codex pendiente no hay responsable humano, no hay CTA y se muestra pausa no recuperable. Disconnect/Codex/error no se deben adjudicar a líder/terceros.
- Cuando la pausa se vuelve no recuperable todos deben recibir overlay sin CTA. La decisión antigua no debe aceptar respuestas.
- Copy mínimo: overlay de responsable y no recuperable muestra solo el heading ES «Partida en pausa» / EN “Game paused”. Solo el responsable ve el botón ES «Reanudar partida» / EN “Resume game”. El status de no responsables es únicamente ES «La partida está en pausa.» / EN “The game is paused.” No mostrar causa, explicación de respuesta pendiente, conectividad ni texto distinto para pausa no recuperable. Conservar únicamente un rechazo real del servidor como `role="alert"`.
- El diálogo conserva `aria-labelledby="PauseOverlayTitle"` y elimina `aria-describedby` al quitar la descripción.

## Ataques y recorrido requeridos

Inspeccionar/recorrer casos de propietario pendiente, líder no propietario, humano que ya respondió (su elección se conserva y no recibe una segunda solicitud), múltiples humanos pendientes, timeout con Codex únicamente, espectador, solicitud `g-resume` con payload/identidad falsos, desconexión durante pausa, error de reanudación, reactivación de decisión con versión nueva, overlay/foco/teclado, aviso no modal mínimo de los demás y el copy exacto del overlay recuperable/no recuperable. Confirmar que no se publica la causa y que solo aparece un error real tras rechazo; confirmar build y diff/i18n reportados por Ejecutor; no ejecutar tests automatizados.

Entregar veredicto `FINAL` explícito sobre el hash exacto. Si no hay navegador, marcar walkthrough visual como bloqueado y no emitir PASS global.
