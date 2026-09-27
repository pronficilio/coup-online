# Handoff para Agente Alquimista — issue #25

- **Tracker:** https://github.com/pronficilio/coup-online/issues/25
- **PR:** https://github.com/pronficilio/coup-online/pull/27
- **Plan exacto:** `docs/plans/home-coin-favicon/plan_home_coin_favicon.md`
- **Bitácora exacta:** `docs/plans/log/issue-25.jsonl`
- **Estado:** `COMPLETED`; issue #25 cerrada después de integrar la PR #27 en `master`.
- **Modo/riesgo/verificación:** `LIGHT` / `LOW` / `NONE`.
- **Verifier requerido ahora:** no.
- **Integración:** [PR #27](https://github.com/pronficilio/coup-online/pull/27), merge commit `c601410952184c85f552ee5cbb73ef6fe52519ff`.
- **Siguiente acción:** ninguna; unidad completada.
- **Por qué sigue:** registro histórico del trabajo; no quedan acciones pendientes.
- **Documentos fuente:** issue #25, el plan citado y `coup-client/src/components/Home.js`, `coup-client/src/index.css`, `coup-client/public/favicon.ico`, `coup-client/public/manifest.json`.
- **Fuentes locales:** `/mnt/e/dev/coup/fotos/gif.gif` (256×256, 109,685 bytes) y `/mnt/e/dev/coup/fotos/coin.png` (480×460, 408,320 bytes). Están ignoradas por Git; copiarlas selectivamente al worktree solo después del claim. No versionar los originales.

## Subtareas y validación completadas

1. Reclamar #25 en el tracker, releerla y confirmar el claim; sincronizar con `origin/master` y revisar el `Home.js` integrado por PR #22. **Completado:** issue abierta y asignada a `pronficilio`; branch y worktree únicos desde `5de95ee`.
2. Copiar el GIF al asset del cliente, reemplazar el pollo y ajustar estilo responsivo acotado a la imagen principal. Usar `alt={t('home.coin.alt')}`.
3. Cambiar solo la entrada `home.chicken.alt` por `home.coin.alt` en ambos idiomas de `translations.json`: “Moneda giratoria” (`es`) y “Spinning coin” (`en`). Preservar todas las demás traducciones y la paridad de claves.
4. Generar `public/favicon.ico` desde el PNG fuente con 16×16 y 32×32 px; alinear los tamaños declarados en `manifest.json`.
5. Registrar tamaños finales, revisar la paridad de `translations.json`, compilar el cliente y hacer la revisión visual manual. El usuario revisó la portada en `http://localhost:3003` y aprobó el resultado (“está super bonito”), sin reportar defectos. No agregar ni ejecutar tests automatizados.

**Criterio de cierre F1:** moneda animada visible, favicon válido y compacto, layout móvil sin desbordamiento y controles principales utilizables; build correcto y evidencia registrada.

## Riesgos y límites

- Conservar los textos y atributos de idioma que integró PR #22; si el diff de `origin/master` revela cambios nuevos incompatibles, detenerse y devolver el conflicto al Orquestador.
- El único cambio de idioma autorizado es el `alt` de la moneda en las claves paralelas `es`/`en`; no ajustar copy adicional.
- Mantener el GIF responsivo y conservar su animación. Evitar conversiones que lo vuelvan estático y copias innecesarias de las fuentes.
- Limitar el trabajo a portada y favicon; no cambiar iconos PWA/touch, controles de partida, textos ajenos o reglas.
- La raíz de coordinación tiene cambios locales ajenos a #25. Crear el aislamiento desde `origin/master` actualizado y mover solo los archivos de #25.

## Commits y validación

- Política: `COMMIT_REQUIRED` al cerrar F1; `feat(home): issue 25 animated coin and favicon`.
- Build: `cd coup-client && npm run build`.
- Revisión: formato/dimensiones/tamaño del ICO, GIF final, y portada en escritorio/móvil; registrar resultados en plan/handoff y bitácora. No tests automatizados.

## Entrega al Orquestador

- **AC1–AC4:** implementación y revisión del diff conformes. GIF original preservado (256×256, 6 frames, 109,685 bytes; idéntico por SHA-256); favicon ICO válido de 16×16/32×32 (3,596 bytes); manifest coherente; solo la clave bilingüe de alt cambió con paridad de diccionario.
- **Build:** `npm run build` terminó exit 0 (“Compiled with warnings”). Warnings observados: imports sin uso en `src/App.js` y `postcss-calc`/`dvh` en `game/ReferencePanel.css`; el trabajo de #25 no produjo warnings señalados.
- **AC5:** el usuario revisó la portada desde el navegador conectado al servidor de desarrollo del worktree en el puerto 3003 y aprobó el resultado (“está super bonito”), sin reportar defectos. La revisión visual queda aceptada para F1.
- **Veredicto F1:** `CLOSED`; AC1–AC5 y build completados. El Orquestador revisó la implementación; PR #27 integrada e issue #25 cerrada.

## Reclamo y topología

- **Branch destino:** `issue/25-home-coin-favicon`.
- **Worktree destino:** `.worktrees/issue-25-home-coin-favicon`.
- **Merge target:** `master`; una PR desde la branch #25 al fork.
- **Secuencia:** reclamar #25 en `pronficilio/coup-online`; releer título/cuerpo/estado y confirmar el claim; crear/confirmar branch desde `origin/master` actualizado; crear/entrar al worktree; allí copiar y actualizar estos documentos, registrar `claim` y `worktree_confirmed` y commitear el control antes del código.
- **Decisión de alcance:** el Orquestador actualizó #25 y autorizó cambiar exclusivamente el `alt` a `home.coin.alt`, localizado como “Moneda giratoria” (`es`) y “Spinning coin” (`en`). No modificar ningún otro texto.
- **Bitácora append-only:** `docs/plans/log/issue-25.jsonl`.
- **Delegación:** aplicar solo las reglas de delegación existentes si las subtareas llegan a ser separables; esta fase localizada puede ejecutarse de forma secuencial.
- Unidad completada; mantener la PR #27 como única integración canónica.
