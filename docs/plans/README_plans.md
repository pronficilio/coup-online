# Planes de trabajo

Este directorio es el plano de control del proyecto, siguiendo `docs/agentes/ORQUESTADOR.md`.

- `PROJECT_ORCHESTRATION.yaml` guarda el perfil operativo detectado.
- `log/` contiene bitácoras JSONL append-only, una por unidad.
- `inbox/` contiene handoffs listos para el Ejecutor.
- `active/` contiene planes de unidades en curso.

La unidad actual es la issue [#1](https://github.com/pronficilio/coup-online/issues/1). El borrador local inicial se promovió a esa issue después de confirmar GitHub CLI y habilitar Issues en el fork.
