# Reducir imágenes sobredimensionadas del cliente — issue #32

**Estado:** ACTIVE; unidad ACTIVE; F1 ACTIVE.
**Issue:** https://github.com/pronficilio/coup-online/issues/32
**Handoff:** docs/plans/inbox/issue_32_client_image_sizes.md
**Bitácora:** docs/plans/log/issue-32.jsonl
**Modo / riesgo / verificación:** LIGHT / LOW / NONE.
**Branch / worktree / merge target:** issue/32-client-image-sizes / .worktrees/issue-32-client-image-sizes / master.
**Siguiente dueño:** un Agente Alquimista.

## Solicitud y definición de éxito

Reducir el peso descargado de las imágenes de interfaz en coup-client que se guardan a mucha más resolución de la que se dibuja, conservando su aspecto, proporción, transparencia y legibilidad en pantallas de alta densidad. El trabajo se limita a redimensionar los WebP importados que exceden su tamaño máximo en pantalla.

El objetivo de bytes parte de 19 archivos usados con un peso actual de **1,602,092 bytes**. La cifra final se medirá sobre los archivos resultantes; no se presupone un ahorro exacto por adelantado.

## Inventario confirmado

Los máximos se derivan de las reglas CSS actuales; las medidas son píxeles CSS en ventana grande, donde las reglas clamp() alcanzan su tope.

### WebP importados que se redimensionan

| Asset | Dimensiones actuales | Bytes actuales | Dibujo máximo | Objetivo a 2× |
|---|---:|---:|---:|---:|
| characters/duque.webp | 840×1220 | 100,648 | 134×197 | 268×389 |
| characters/capitan.webp | 840×1220 | 110,444 | 134×197 | 268×389 |
| characters/asesino.webp | 840×1220 | 84,110 | 134×197 | 268×389 |
| characters/condesa.webp | 840×1220 | 84,712 | 134×197 | 268×389 |
| characters/embajador.webp | 840×1220 | 77,322 | 134×197 | 268×389 |
| characters/reverso.webp | 840×1220 | 244,482 | normalmente 70×103; hasta 134×197 como fallback | 268×389 |
| deck.webp | 1024×1358 | 376,176 | 120×159 | 240×318 |
| player.webp | 460×460 | 13,614 | 17×17 | 34×34 |
| coin.webp | 480×460 | 49,452 | 18×18 | 36×35 |
| action-buttons/ba.webp | 1086×362 | 109,286 | 216×72 | 432×144 |
| action-buttons/ba-active.webp | 1086×362 | 121,316 | 216×72 | 432×144 |
| action-buttons/bfa.webp | 512×171 | 26,166 | 216×72 | 432×144 |
| action-buttons/bfa-active.webp | 512×171 | 28,590 | 216×72 | 432×144 |
| action-buttons/bs.webp | 512×171 | 31,780 | 216×72 | 432×144 |
| action-buttons/bs-active.webp | 512×171 | 39,100 | 216×72 | 432×144 |
| action-buttons/c.webp | 512×171 | 23,386 | 216×72 | 432×144 |
| action-buttons/c-active.webp | 512×171 | 28,954 | 216×72 | 432×144 |
| action-buttons/pass.webp | 510×171 | 23,058 | 216×72 | 432×145 |
| action-buttons/pass-active.webp | 510×171 | 29,496 | 216×72 | 432×145 |

Las cartas propias usan clamp(76px, 10.4vw, 134px) y la carta trasera rival llega a 70 px de ancho; en móvil los límites bajan a 82 px y 42 px. reverso.webp también es el fallback de una carta propia desconocida, por eso su objetivo cubre el máximo de 134 px. El mazo usa un máximo de 120 px en un tablero que nunca supera 900 px. Los controles de respuesta usan clamp(9rem, 36vw, 13.5rem) con proporción 3:1: en una ventana grande se quedan en 216×72 px.

Se conservará la proporción natural de cada archivo; las alturas objetivo indicadas son aproximadas por redondeo. El objetivo de 2× mantiene definición en pantallas de alta densidad sin conservar los originales de 840–1086 px de ancho.

### Otros gráficos revisados

| Asset | Dimensiones / bytes | Dibujo o estado | Veredicto |
|---|---|---|---|
| background.webp | 1024×576 / 224,710 | Fondo fijo con background-size: cover; cubre el viewport y se amplía en ventanas grandes | No reducir: ya es menor que el área dibujada |
| home-coin.gif | 256×256 / 109,685 | Máximo 256×256; se reduce en móvil | Ya coincide con el máximo |
| references/card-es.webp | 1024×1536 / 191,454 | Modal limitado a 1024 px de ancho; en 1600×900 queda en 568×852 | Conservar; contiene texto y ya coincide con el máximo de pantalla grande |
| references/table-es.webp | 1024×768 / 64,214 | Modal limitado a 1024×768 | Conservar |
| public/favicon.ico | iconos 16×16 y 32×32 / 3,596 | Tamaños de pestaña | Conservar |
| CheatSheet.svg, Chicken.svg, src/logo.svg | vectores | Escalables; Chicken no está importado y el logo importado en App.js no se renderiza | Sin redimensionado raster |

También existen, pero no están importados por el cliente y no forman parte de la descarga actual: los cinco WebP ingleses de personajes, references/card-en.webp, references/table-en.webp, action-buttons/claim.webp, action-buttons/claim-active.webp y ChickenJPG.jpg. No optimizarlos ni borrarlos en esta unidad.

## Alcance

Incluye únicamente los 19 WebP de la primera tabla. Mantener sus nombres y rutas, formato WebP, proporción, encuadre y cualquier canal alfa existente.

Excluye JSX, CSS, lógica de carga, otros gráficos, limpieza de archivos sin uso, nuevas dependencias, cambios de contenido y flujo de juego.

## Criterios de aceptación

1. Los seis recursos de cartas quedan en torno a 268×389; el mazo en 240×318; player en 34×34; coin en 36×35; los diez recursos de respuesta en 432 px de ancho con altura ajustada a su proporción.
2. Los 19 siguen siendo WebP; el encuadre, transparencia y apariencia permanecen intactos a los tamaños CSS indicados. No se recorta contenido.
3. Se registra por archivo la dimensión y cantidad de bytes antes/después. El total final de esos 19 archivos es menor a 1,602,092 bytes.
4. El diff del cambio de producto contiene únicamente esos 19 WebP. No se agregan dependencias ni se tocan assets sin uso.
5. El Alquimista confirma formato, dimensiones, transparencia y tamaño final de los archivos. No se requieren tests automatizados, build ni Verifier independiente.

## F1 — Redimensionar los WebP usados (READY)

**Pregunta:** ¿se puede ajustar a 2× el máximo real de dibujo y reducir peso conservando legibilidad, apariencia y alfa?

**Entrada:** issue #32, este inventario, archivos de coup-client/src/assets/ en origin/master.
**Salida:** los 19 WebP redimensionados, registro antes/después por archivo y commit de cierre en la branch única.
**Avanzar:** se cumplen AC1–AC5.
**Pivotar:** si una imagen pierde detalle al tamaño objetivo, una única variante con codificación de mayor calidad manteniendo el mismo límite dimensional.
**Repetir:** una corrección acotada si se pierde transparencia, proporción o legibilidad.
**Bloquear/cancelar:** faltan las fuentes en la base actual o el trabajo requiere cambiar CSS, React o el encuadre.

**Commit:** COMMIT_REQUIRED; mensaje previsto: perf(assets): issue 32 resize oversized coup-client images.
**Validación mínima:** inspección del formato, dimensiones, alfa y bytes finales de los 19 archivos; sin tests/build y sin invocar Verifier.

## Coordinación y topología

El remoto y tracker canónicos son origin y pronficilio/coup-online; la rama base observada es master. La raíz compartida está en master, dos commits locales por delante de origin/master y tiene documentos de otras unidades sin seguimiento. El Alquimista debe crear su branch desde el origin/master actualizado para evitar arrastrar trabajo de otras unidades y copiar a su worktree únicamente los documentos de issue #32.

La unidad tendrá una sola branch issue/32-client-image-sizes, un worktree .worktrees/issue-32-client-image-sizes y una PR hacia master. El Alquimista reclama la issue en el fork, relee título/cuerpo/estado, crea el aislamiento y mueve el handoff a active/. No modificar ni limpiar los cambios previos del checkout compartido.

## Pregunta de falsificación

¿Alguno de los 19 archivos queda por debajo de la proporción o pierde alfa/legibilidad tras redimensionar, o alguno de los 19 supera sus dimensiones objetivo y sigue generando descarga innecesaria?
