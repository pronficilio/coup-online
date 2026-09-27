# Issue #26 — revalidación F2: overlay solo para responsables

- **Requisito vigente:** aclaración del usuario: solo los asientos humanos pendientes de responder pueden reanudar. El líder no tiene privilegio si no es responsable.
- **Base:** `1ff478c308478af3be61131daa1bd88652bdc77f`; se incorporaron los cambios documentales de cierre de #25 sin conflictos.
- **F1 relacionada:** `report_issue_26_F1_recheck.md`.
- **Implementación:** `server/game/coup.js`; `coup-client/src/components/game/Coup.js`; `CoupStyles.css`; `src/i18n/translations.json`.
- **Commit previo del overlay:** `662125554a76c6724a159a8c572627544a3c19fc` usaba criterio de líder y queda obsoleto. El reporte F3 existente aplica solo a ese commit.
- **Follow-up de respuestas:** el Verifier FINAL reportó en `report_issue_26_F3_recheck.md` que `46b08058096a97539bb2ffbaa52d032beed08ebf` descartaba elecciones aceptadas al reactivar una decisión multi-actor. Ese reporte queda histórico para ese hash y este follow-up corrige el hallazgo.

## Cambio revisable

- En timeout, el servidor calcula responsables exclusivamente desde actores presentes en `activeDecision.allowed` y ausentes de `activeDecision.responses`, los traduce a asientos humanos usando su roster interno y guarda `resumeOwnerSeats` en `pausedDecision`.
- `pause()` guarda una copia de `activeDecision.responses` junto con la decisión. Al reanudar se crea un `decisionId`/`stateVersion` nuevos y se restaura el mapa; `g-decision` y las solicitudes Codex se emiten solo a actores aún sin respuesta. Las elecciones aceptadas no se descartan ni se piden de nuevo.
- La emisión de `g-gamePaused` ahora es individual. Responsables reciben `showOverlay:true` y `canResume:true`; el resto recibe `showOverlay:false`, `canResume:false` y `waitingForOwner:true`. Espectadores tampoco reciben CTA.
- Si no queda humano pendiente (por ejemplo, solo Codex faltaba), no se conserva la decisión recuperable. Las demás pausas y una desconexión continúan sin CTA; una degradación a no recuperable vuelve a mostrar el overlay a todos.
- `g-resume` resuelve el socket entrante al asiento vigente del roster del servidor, rechaza payload y exige pertenencia del asiento a `resumeOwnerSeats`. No confía en un líder ni en identidad enviada por cliente. Ownership está guardado por asiento, no socket ID. La app no admite reingreso después de comenzar; una desconexión invalida la pausa y exige recrear.
- El cliente ya no ata el CTA a `isLeader`. Responsables ven el overlay y botón; los no responsables ven un aviso de espera accesible sin overlay. El copy está localizado en ambos idiomas.

## Validación de la revisión previa (`46b0805`)

- `npm run build` en `coup-client`: exit 0, “Compiled with warnings”. Avisos existentes: imports `logo`/`Link` sin uso en `src/App.js`; postcss-calc no interpreta unidades `dvh` de `ReferencePanel.css`; caniuse-lite desactualizado. El bundle compiló correctamente.
- `git diff --check`: exit 0.
- Diccionario español/inglés: 313/313 claves con paridad de placeholders.
- Revisión estática previa: el permiso comparaba asiento resuelto desde socket server-side con `pausedDecision.resumeOwnerSeats`; el cliente no enviaba identidad y timeout sin humano pendiente no conservaba decisión recuperable. El Verifier identificó que `responses` se reiniciaba durante la reactivación; por ello esa validación no cubre la propiedad añadida por este follow-up.
- No se agregaron ni ejecutaron tests automatizados. No hubo walkthrough visual ni prueba de ataque en navegador.

## Validación del follow-up actual

- `npm run build` en `coup-client`: exit 0, “Compiled with warnings”. Avisos existentes: imports `logo`/`Link` sin uso en `src/App.js`; postcss-calc no interpreta unidades `dvh` de `ReferencePanel.css`; caniuse-lite desactualizado. El bundle compiló correctamente.
- `git diff --check`: exit 0.
- Diccionario español/inglés: 313/313 claves y placeholders.
- Revisión estática: `pausedDecision` recibe `new Map(decision.responses)`; `activateDecision` copia el mapa, emite `g-decision` y re-solicita Codex solo si ese actor no tiene respuesta. Una respuesta aceptada queda protegida por el `prior` de `submitChoice`; IDs y versión sí cambian.
- No se agregaron ni ejecutaron tests automatizados.

La revisión visual de navegador no está disponible en este entorno y no se declara aprobada. Debe hacerse un walkthrough actualizado y Verifier FINAL independiente sobre el commit nuevo, incluyendo conservación de respuestas aceptadas, ausencia de solicitudes repetidas y rechazo de decisiones/versiones antiguas. No abrir PR, mergear, cerrar issue ni desplegar.
