# Cierre de unidad — issue #75

- **Estado:** `COMPLETED`; issue #75 `CLOSED` después de integrar la PR #81.
- **Integración:** [PR #81](https://github.com/pronficilio/coup-online/pull/81), merge commit `98e14cd356778dd0bbb346004a3340dbef854e31` en `master` de `pronficilio/coup-online`.
- **Cambio:** con tres o más asientos, elimina al jugador vivo que se desconecta y permite que los demás continúen. Si la eliminación deja un solo jugador vivo, se usa el flujo normal de `gameover`. Las partidas con menos de tres asientos conservan la disolución previa de #46.
- **Decisiones de alcance:** el umbral cuenta todos los asientos de jugador, incluso los ya eliminados; excluye espectadores. Una pausa preexistente no reanudable con `pausedDecision === null` permanece intacta según el límite documentado en #75.
- **Revisión:** F1 y F2 cerraron `PASS` por revisión estática. El Verifier independiente cerró F3 `PASS` estático sobre `17864e899597f768fffd08dfc7acdde3f3fe8075`, después de que dos hallazgos fueran corregidos en F2. No se ejecutaron pruebas, build ni runtime.
- **Checks de PR:** GitHub no reportó checks configurados para la rama. `git diff --check` pasó antes de integrar.
- **Branch / worktree:** `issue/75-disconnect-elimination` / `.worktrees/issue-75-disconnect-elimination`.
- **Plan / informes:** `docs/plans/disconnect-elimination/plan_disconnect_elimination.md`; informes F1–F3 y checkpoint de correcciones en `docs/plans/disconnect-elimination/`.
- **Bitácora:** `docs/plans/log/issue-75.jsonl`.
