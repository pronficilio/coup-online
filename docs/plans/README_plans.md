# Planes de trabajo

Este directorio es el plano de control del proyecto, siguiendo `docs/agentes/ORQUESTADOR.md`.

- `PROJECT_ORCHESTRATION.yaml` guarda el perfil operativo detectado.
- `log/` contiene bitácoras JSONL append-only, una por unidad.
- `inbox/` contiene handoffs listos para el Ejecutor.
- `active/` contiene planes de unidades en curso.

GitHub Issues es la fuente de estado de las unidades: la [issue #1](https://github.com/pronficilio/coup-online/issues/1) cerró el trabajo inicial del checkout; la [issue #3](https://github.com/pronficilio/coup-online/issues/3) registra el chequeo de seguridad. Cada unidad tiene su propio plan y bitácora en este plano de control.

La [issue #8 — referencias visuales para la partida](https://github.com/pronficilio/coup-online/issues/8) sigue abierta y asignada a `pronficilio`; F1 está `ACTIVE` tras autorización del usuario para completar la conversión, la implementación y un PR con capturas. Plan: `docs/plans/game-reference-materials/plan_game_reference_materials.md`; handoff: `docs/plans/active/issue_8_game_reference_materials.md`; bitácora: `docs/plans/log/issue-8.jsonl`.
