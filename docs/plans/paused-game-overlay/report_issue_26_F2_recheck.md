# Issue #26 — revalidación F2: overlay solo para responsables

- **Requisito vigente:** aclaración del usuario: solo los asientos humanos pendientes de responder pueden reanudar. El líder no tiene privilegio si no es responsable.
- **Base:** `1ff478c308478af3be61131daa1bd88652bdc77f`; se incorporaron los cambios documentales de cierre de #25 sin conflictos.
- **F1 relacionada:** `report_issue_26_F1_recheck.md`.
- **Implementación:** `server/game/coup.js`; `coup-client/src/components/game/Coup.js`; `CoupStyles.css`; `src/i18n/translations.json`.
- **Commit previo del overlay:** `662125554a76c6724a159a8c572627544a3c19fc` usaba criterio de líder y queda obsoleto. El reporte F3 existente aplica solo a ese commit.

## Cambio revisable

- En timeout, el servidor calcula responsables exclusivamente desde actores presentes en `activeDecision.allowed` y ausentes de `activeDecision.responses`, los traduce a asientos humanos usando su roster interno y guarda `resumeOwnerSeats` en `pausedDecision`.
- La emisión de `g-gamePaused` ahora es individual. Responsables reciben `showOverlay:true` y `canResume:true`; el resto recibe `showOverlay:false`, `canResume:false` y `waitingForOwner:true`. Espectadores tampoco reciben CTA.
- Si no queda humano pendiente (por ejemplo, solo Codex faltaba), no se conserva la decisión recuperable. Las demás pausas y una desconexión continúan sin CTA; una degradación a no recuperable vuelve a mostrar el overlay a todos.
- `g-resume` resuelve el socket entrante al asiento vigente del roster del servidor, rechaza payload y exige pertenencia del asiento a `resumeOwnerSeats`. No confía en un líder ni en identidad enviada por cliente. Ownership está guardado por asiento, no socket ID. La app no admite reingreso después de comenzar; una desconexión invalida la pausa y exige recrear.
- El cliente ya no ata el CTA a `isLeader`. Responsables ven el overlay y botón; los no responsables ven un aviso de espera accesible sin overlay. El copy está localizado en ambos idiomas.

## Validación

- `npm run build` en `coup-client`: exit 0, “Compiled with warnings”. Avisos existentes: imports `logo`/`Link` sin uso en `src/App.js`; postcss-calc no interpreta unidades `dvh` de `ReferencePanel.css`; caniuse-lite desactualizado. El bundle compiló correctamente.
- `git diff --check`: exit 0.
- Diccionario español/inglés: 313/313 claves con paridad de placeholders.
- Revisión estática: el permiso compara asiento resuelto desde socket server-side con `pausedDecision.resumeOwnerSeats`; el cliente no envía identidad, los respondedores/leader/terceros quedan fuera salvo que sean owner pendiente, y timeout sin humano pendiente no conserva decisión recuperable.
- No se agregaron ni ejecutaron tests automatizados. No hubo walkthrough visual ni prueba de ataque en navegador.

La revisión visual de navegador no está disponible en este entorno y no se declara aprobada. Debe hacerse un walkthrough actualizado y Verifier FINAL independiente sobre el commit nuevo. No abrir PR, mergear, cerrar issue ni desplegar.
