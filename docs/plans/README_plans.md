# Planes de trabajo

Este directorio es el plano de control de Coup Online, siguiendo docs/agentes/ORQUESTADOR.md.

- PROJECT_ORCHESTRATION.yaml describe el contrato operativo.
- log/ contiene una bitácora append-only por issue.
- inbox/ contiene handoffs listos para reclamar.
- active/ contiene planes activos.
- blocked/ contiene unidades en espera.

GitHub Issues es el tracker canónico; su estado remoto manda sobre bandejas y copias locales. Las issues #1 y #3 están cerradas. El informe y la verificación FINAL de #3 confirmaron fallos de privacidad y autorización para corregir en unidades separadas.

## Unidades abiertas relevantes

- #13 — Desplegar Coup Online en Hetzner: inventario F0 cerrado; F1 espera fijar un commit/tag limpio. Tras integrar el jugador Codex, el release se coordina por esta misma issue.
- #14 — Integrar jugadores IA con Codex y una palanca de emergencia: F0 READY. Plan: codex-ai-players/plan_codex_ai_players.md. Handoff: inbox/issue_14_codex_ai_players.md. Bitácora: log/issue-14.jsonl. Branch/worktree: issue/14-codex-ai-players / .worktrees/issue-14-codex-ai-players.
- #6, #8 y #9 siguen abiertas y tienen PR #11, #12 y #10 respectivamente. #5 está cerrada. Verifica el tracker antes de reanudar unidades históricas.

La raíz del checkout compartido conserva modificaciones sin commit. El trabajo de #14 usa un worktree limpio desde origin/master y no incorpora esas modificaciones automáticamente.
