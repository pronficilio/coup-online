# Runbook de la prueba Codex en Hetzner

Esta prueba añade asientos GPT-6 Luna al Coup alojado. El API público no contiene una sesión Codex: un contenedor runner separado guarda el inicio de sesión de ChatGPT y se comunica con el API solo por un socket Unix. El runner no contiene ni monta el checkout, no publica puertos y usa App Server con las herramientas desactivadas. App Server todavía es una interfaz experimental.

## Preparar el release

Empaquetar el commit de esta rama como un release independiente. No modificar el release anterior: queda disponible para rollback. Copiar `deploy/codex-ai.compose.yml` y `deploy/Dockerfile.codex-runner` junto al Compose base instalado. El overlay reutiliza los servicios `coup-api` y `coup-web` existentes.

En el `.env` privado del nuevo release, conservar `COUP_REVISION` y añadir `COUP_AI_ACCESS_CODE` con un valor aleatorio de al menos 24 caracteres. Se puede generar sin imprimirlo con `printf 'COUP_AI_ACCESS_CODE=' >> .env`, `openssl rand -hex 24 >> .env` y luego `chmod 600 .env`. No ponerlo en una URL, log o archivo versionado. El líder del lobby lo introduce en el formulario de IA; el backend no lo registra y permite cinco intentos por socket por minuto.

Desde el directorio `deploy` del release, validar y levantar ambos Compose:

```sh
docker compose -p deploy -f docker-compose.yml -f codex-ai.compose.yml config
docker compose -p deploy -f docker-compose.yml -f codex-ai.compose.yml up -d --build --wait
docker compose -p deploy -f docker-compose.yml -f codex-ai.compose.yml ps
```

El runner solo tiene salida de red para login y servicio Codex; no comparte la red Docker de Coup. Sus volúmenes persistentes contienen la autenticación y el contador de uso; un volumen de control separado comparte únicamente el marcador de apagado con el API. El workspace, runtime y TMPDIR están en un área temporal privada. Los límites iniciales son dos solicitudes simultáneas, doce en cola, 120 llamadas por partida y 240 por hora.

## Autorizar la cuenta y probar

Antes del flujo remoto, habilitar el inicio con código de dispositivo en ChatGPT > Settings > Security (cuenta personal) o en los permisos del workspace. OpenAI documenta que este ajuste es requisito para `codex login --device-auth` en máquinas headless: [autenticación de Codex](https://learn.chatgpt.com/docs/auth). Si el ajuste no está disponible, usa el flujo OAuth normal del navegador que sigue; no copies `auth.json` por el chat.

Si el ajuste aparece, iniciar el flujo de dispositivo dentro del runner:

```sh
docker compose -p deploy -f docker-compose.yml -f codex-ai.compose.yml exec -it coup-codex-runner codex login --device-auth
```

Si el ajuste no aparece, usar el flujo OAuth normal del navegador, con un túnel SSH temporal y un contenedor de login de un solo uso. En el equipo donde se abrirá el navegador, mantener este túnel activo:

```sh
ssh -N -L 1455:localhost:1455 sqf-hetzner
```

En el servidor, ejecutar Codex desde la imagen del runner con acceso directo solo al volumen privado de autenticación. No publicar puertos ni copiar el archivo de sesión:

```sh
docker run --rm -it --network host --read-only \
  --security-opt no-new-privileges --cap-drop ALL --pids-limit 128 \
  --memory 512m --cpus 1 \
  --tmpfs /tmp:rw,noexec,nosuid,nodev,size=64m \
  --volume coup_codex_state:/var/lib/coup-codex:rw \
  --env CODEX_HOME=/var/lib/coup-codex/auth --env HOME=/tmp \
  --user 10001:10002 --entrypoint /usr/local/bin/codex \
  coup-codex-runner:RELEASE_HASH login
```

`RELEASE_HASH` es el valor de `COUP_REVISION` del `.env` privado.

Abrir en el navegador del mismo equipo la URL OAuth que imprime el CLI y completar la autorización. El callback vuelve por el túnel a `localhost:1455`; al terminar, cerrar el túnel. El contenedor de login no monta el código ni los sockets del juego. La imagen del runner debe incluir `ca-certificates` para que Codex pueda completar las solicitudes HTTPS; el Dockerfile comprueba durante el build que el bundle exista.

No copiar `auth.json` fuera del volumen del runner. Comprobar después `codex login status` y el healthcheck del runner, crear una sala, habilitar IA con el código compartido y jugar una mano corta. El primer uso real confirma si la cuenta ofrece `gpt-6-luna` mediante App Server; si el modelo o el login no están disponibles, el turno se pausa y no hay fallback ni API.

Probar en este orden: persona contra una IA, persona contra dos IA, IA contra IA con el creador como espectador, desafío/blocaje, apagado durante un turno y reinicio del servidor. El botón rojo está disponible a cualquier jugador conectado y detiene los procesos activos; no requiere el código compartido.

## Palanca roja y rearme

Al activar la palanca roja, el API pausa partidas con decisiones IA y ambos procesos escriben el marcador persistente compartido. Reiniciar contenedores no reactiva Codex. Para rearmar manualmente desde SSH, quitar el marcador solo cuando quieras volver a permitir el uso:

```sh
docker run --rm --user 0:0 -v coup_codex_control:/control \
  --entrypoint sh node:24-bookworm-slim -c 'rm -f /control/codex-disabled'
docker compose -p deploy -f docker-compose.yml -f codex-ai.compose.yml \
  up -d --force-recreate coup-codex-runner coup-api
```

No existe un evento público de reactivación.

Si el runner no arranca o el modelo no responde, volver al release anterior con el Compose base sin el overlay; `--remove-orphans` retira los servicios IA:

```sh
docker compose -p deploy -f docker-compose.yml up -d --build --wait --remove-orphans
```

Las salas actuales son efímeras y cualquier reinicio del API las cierra. El Compose base conserva el release anterior.

## Retirar la prueba

Volver a desplegar el release anterior sin `codex-ai.compose.yml`. Cuando ya no se necesite la sesión, retirar explícitamente los volúmenes `coup_codex_state`, `coup_codex_socket` y `coup_codex_control`; borrar el primero elimina las credenciales Codex guardadas para esta prueba. El repositorio no contiene secretos.
