# Issue #26 — revalidación F1: responsables por timeout

- **Fase:** F1 revalidada con la aclaración explícita del usuario; la conclusión anterior que daba permiso al líder queda obsoleta.
- **Base revisada:** `1ff478c308478af3be61131daa1bd88652bdc77f` (`origin/master`, cierre documental de #25); no altera las rutas de pausa revisadas.
- **Criterio vigente:** únicamente los jugadores humanos cuya respuesta seguía pendiente al vencer el temporizador pueden reanudar.
- **Método:** lectura estática de todos los emisores de `g-gamePaused`, `openDecision`, `pause`, `onDisconnect`, `resume`, lobby y cliente. No se ejecutaron tests.

## Autoridad y ownership

`openDecision()` crea `allowed: Map<actorKey, choices>` y `responses: Map<actorKey, response>`. Para el timeout se deben tomar solo las claves de `allowed` que no existen en `responses`, resolverlas contra el roster del servidor y conservar sus números de asiento cuando el controlador sea humano. Los actores Codex no son culpables humanos. Si no queda ningún humano pendiente, el timeout es no recuperable y no debe producir CTA.

La verificación de `g-resume` debe resolver el socket entrante al asiento desde el roster que mantiene el servidor y comparar ese asiento con `resumeOwnerSeats` guardado en `pausedDecision`. No se acepta payload, socket ID, asiento, nombre ni identidad declarada por el cliente. Un respondedor previo, el líder u otro participante no debe obtener permiso por su rol en la sala.

El ownership por número de asiento evita que el permiso dependa de un socket ID antiguo: si el servidor reasigna de forma confiable el socket de un asiento, la lista de responsables conserva el asiento. Sin embargo, el lobby actual rechaza nuevas conexiones una vez iniciada la partida. Una desconexión durante la pausa invalida la decisión recuperable y exige recrear; esta unidad no añade una ruta de reingreso ni confía en una identidad aportada por el cliente.

## Matriz de pausas y visibilidad requerida

| Ruta | Responsable/recuperabilidad | UI por receptor |
| --- | --- | --- |
| Timeout con uno o más humanos pendientes (`allowed - responses`) | Solo esos asientos; se conserva la decisión | Responsables: overlay + CTA. Los demás, incluso el líder y quienes respondieron, solo aviso accesible de espera; sin overlay ni CTA. |
| Timeout en que solo Codex sigue pendiente | Sin responsable humano; no se conserva decisión reanudable | Overlay sin CTA para todos; crear otra partida. |
| Desconexión antes/durante el juego o durante la pausa | No reanudable por este flujo; pausa recuperable invalidada | Overlay sin CTA para todos; recrear. |
| Codex deshabilitado, fallo/stale/elección inválida | No se inventa responsable humano ni se conserva decisión | Overlay explicativo sin CTA para todos. |
| Resolución inconsistente/guardas de ausencia de respuesta o partida sin jugadores activos | No hay decisión segura reanudable | Overlay sin CTA para todos. |

## Resultado

El handler anterior autorizaba `leaderSocketID`, que contradice el requisito vigente. `pause(... recoverable)` retenía `allowed` pero no exponía de forma durable qué jugadores seguían pendientes. El hallazgo requiere owner seats desde `allowed - responses`, emisiones personalizadas por socket, y CTA/modal solo para esos asientos. F2 aplicó esa corrección: actores no responsables borran su decisión local y ven un aviso no modal; si la pausa se degrada por desconexión, todos pasan al overlay sin CTA.

**Veredicto F1 revalidada:** el criterio de servidor anterior queda superseded. Timeout humano con pendiente es recuperable únicamente por ese asiento; timeout sin humano pendiente y demás fallos no son reanudables. La corrección server/client quedó implementada en F2. Revisión visual y ataque de payload quedan para Verifier FINAL nuevo.
