# Issue #1: preparar checkout raíz y reglas de exclusión

**Estado:** `ACTIVE`  
**Issue:** https://github.com/pronficilio/coup-online/issues/1  
**Plan:** `docs/plans/active/issue_1_root_checkout_ignore.md`  
**Handoff:** `docs/plans/active/handoff_issue_1_root_checkout_ignore.md`  
**Bitácora:** `docs/plans/log/issue-1.jsonl`

## Objetivo

Dejar el fork ya creado de `https://github.com/Cheneth/coup-online` con su contenido e historial Git en la raíz `E:\dev\coup`, y conservar las carpetas locales `fotos/` y `docs/agentes/` fuera del repositorio mediante `.gitignore`.

## Perfil operativo detectado

- Proyecto destino: `coup-online`.
- Raíz prevista: `E:\dev\coup`.
- Repositorio Git local: checkout de `origin/master` en `E:\dev\coup`, rama raíz `master`.
- Upstream: `https://github.com/Cheneth/coup-online`; rama predeterminada `master`.
- Fork: `https://github.com/pronficilio/coup-online`; creado con rama predeterminada `master`.
- Cuenta GitHub CLI: `pronficilio`; autenticación confirmada.
- Tracker: GitHub Issues habilitado en el fork; issue #1 creada para esta unidad.
- Aislamiento confirmado: `.worktrees/issue-1-root-checkout-ignore`, rama `issue/1-root-checkout-ignore`, creada desde `origin/master`.
- Modo: `LIGHT`.
- Riesgo: `MEDIUM`, porque el checkout contiene carpetas personales locales que no se deben publicar.
- Verificación independiente: `FINAL`, revisión independiente del PR antes de integrarlo.

## Hechos, inferencias y desconocidos

### Hechos

- `E:\dev\coup` contiene el checkout del fork en `master` (commit inicial `64458b7`); `docs/` y `fotos/` locales siguen presentes según comprobación de existencia, sin inspeccionar su contenido.
- `docs/agentes/` existe y contiene instrucciones locales del agente.
- El fork quedó creado bajo `pronficilio/coup-online`.
- `gh auth status` confirmó que la cuenta `pronficilio` está autenticada.
- El upstream y el fork tienen `master` como rama predeterminada.
- Issues estaba deshabilitado en el fork; el usuario lo habilitó y se creó la issue #1.

### Inferencias

- El workspace ya es el destino local del checkout solicitado.

### Desconocidos

- El pull request y el cierre de F1 todavía deben completarse.

## Alcance y aceptación

1. Usar el fork creado en `pronficilio/coup-online` y descargar su historial y contenido en la raíz `E:\dev\coup`, preservando los contenidos locales existentes.
2. Mantener `fotos/` y `docs/agentes/` en el equipo y añadir `/fotos/` y `/docs/agentes/` a `.gitignore` sin eliminar ni inspeccionar su contenido.
3. Configurar `origin` para el fork y `upstream` para `Cheneth/coup-online`.
4. Confirmar con Git que ambas carpetas quedan ignoradas y que ningún archivo de ellas aparece como candidato a commit.
5. Entregar el cambio de `.gitignore` junto con el plan, handoff y evento de cierre requeridos por el protocolo en un único PR a `master`, asociado a la issue #1.

## Fase funcional prevista

### F1 — Preparar el checkout raíz y excluir datos locales (`ACTIVE`)

- **Pregunta:** ¿el checkout del fork quedó en la raíz con las dos carpetas locales protegidas por `.gitignore`?
- **Cierre:** repositorio e historial disponibles en la raíz; remotos correctos; reglas de ignore efectivas; contenido local preservado; PR abierto desde una rama asociada a la issue.
- **Commit:** `COMMIT_REQUIRED` para `.gitignore`, resultado de F1, handoff actualizado y evento `phase_verdict`; mensaje `chore(fork-setup): issue 1 F1 CLOSED advance_review`.
- **Verificación:** el Verifier independiente intenta refutar que solo se publicó `.gitignore` y que ambos directorios locales están ignorados.
- **Veredicto posible:** avanzar a revisión e integración del Orquestador o bloquear ante cualquier archivo personal incluido.

La creación del fork y el acceso al tracker ya están resueltos; el checkout en raíz forma parte del objetivo de esta unidad.

## Estado y siguiente acción

El claim quedó registrado en la issue #1 y en la bitácora; el handoff está en `docs/plans/active/`. La rama y el worktree canónicos están confirmados. Sigue pendiente completar el commit de cierre y abrir el PR a `master`.
