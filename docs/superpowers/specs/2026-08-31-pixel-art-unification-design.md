# Unificación visual: Pixel Art (Kenney) + bordes fantasy + fuego con luz + avatares DiceBear

**Fecha:** 2026-08-31
**Estado:** Aprobado (dirección visual — Camino B de la propuesta A/B). Implementación en rama `rework-completo-ui`.

## Contexto

Auditoría visual previa (spec de referencia informal, chat 2026-08-31) detectó que los 13 assets de la tienda (`public/shop/{backgrounds,mats,relics,artifacts}/`) son ilustraciones pintadas/fotoreal de estilo y perspectiva propios, cada una con su propia dirección de luz, puestas con CSS (`object-contain` + `brightness/contrast/sepia`) sobre fondos fotográficos — no leen como un único mundo coherente. Se probó un rediseño flat/vectorial (SVG generado por sharp) sobre el tatami default; el usuario vio la comparación real en la app y no lo convenció como dirección final.

Se evaluaron dos caminos de fondo:
- **Camino A (3D, Spline):** descartado. Bloqueo real: modelar/animar la escena 3D requiere el editor visual de Spline (o su generador de IA, otro servicio de terceros pago) — no es algo que se resuelva escribiendo código. Además, WebGL es más pesado de lo ideal para una PWA mobile que se abre varias veces por día.
- **Camino B (Pixel Art unificado):** elegido. Ejecutable de punta a punta sin dependencias pagas ni bloqueos externos.

Este documento especifica **Camino B**.

## Objetivo

Reemplazar el catálogo visual de la tienda/dojo por un set de sprites pixel-art realmente unificado (misma fuente, misma resolución de grilla, misma paleta por construcción), más:
- Un fuego que ilumine su entorno en vez de solo pintarse encima.
- Paneles/modales con marco "fantasy" en vez de recuadros genéricos de Tailwind.
- Avatares de usuario reales (hoy es un ícono genérico de Lucide) en el mismo estilo pixel.

Deja la puerta abierta a poblar la tienda con más ítems más adelante (pedido explícito del usuario), porque el pack base trae ~1700 tiles, muchos sin usar todavía.

## Fuentes de assets (investigadas y descargadas para inspección, `.asset-research/`, gitignored)

| Pack | Contenido real (verificado visualmente) | Uso |
|---|---|---|
| **Kenney "Roguelike/RPG pack"** (CC0) | ~1700 tiles de 16×16 en un spritesheet único: pisos (madera, piedra, pasto, arena, nieve-azul, "mágico"-púrpura), banderas/estandartes con emblema, fogones con llama animable, botellas/pociones pequeñas, árboles/arbustos, antorchas, cofres, lápidas | Tatamis (pisos), reliquias tipo estandarte, artefactos (bonsái←arbusto/árbol, farol←antorcha, incienso←fogón pequeño) |
| **Kenney "Fantasy UI Borders"** (CC0) | Marcos/bordes 9-slice puros (PNG, pensados para `border-image`), sin JS | Marco de paneles/modales — **reemplaza a NES.css/RPGUI de la propuesta anterior** |
| Kenney "Game Icons (Expansion)" | Verificado: son íconos de prompts de mouse/teclado/gamepad, NO ítems de fantasía | Descartado |
| Kenney "Generic Items" | Verificado: herramientas/oficina/cocina modernas, NO fantasía | Descartado |

**Cambio respecto a lo hablado antes:** NES.css/RPGUI quedan afuera. "Fantasy UI Borders" resuelve lo mismo (marco tipo pergamino/madera para paneles) con CSS puro `border-image`, cero dependencia npm, y encaja mejor temáticamente que el look 8-bit de Famicom de NES.css.

**Lo que el pack no trae:** katanas, máscara oni, incensario, amuleto (streak shield). No encontré un pack CC0 de Kenney con armas/íconos de fantasía específicos (su catálogo no lo cubre). En vez de sumar un pack de un autor de itch.io sin licencia tan clara, los dibujo yo a mano en la misma grilla de 16×16 y la misma paleta plana del pack base (`public/sprites/dojo-custom.png`) — control total, cero riesgo de licencia, y encaja mejor que importar un tercer estilo.

## Modelo de datos / componentes

**`SpriteItem.tsx`** (nuevo, `components/ui/`): recibe `{ sheet: 'kenney' | 'custom', x, y, w, h, scale? }` y renderiza un `div` con `background-image` + `background-position` + `background-size` calculado contra el tamaño natural de la hoja, `image-rendering: pixelated`. Sin dependencias nuevas.

**`lib/constants/items.ts`:** se reemplaza el campo `imageUrl` por `sprite: { sheet, x, y, w, h }` en cada `ShopItem` cosmético. Es un rework completo, no conviven los dos sistemas (no hace falta un fallback: se migran los 13 ítems de una).

**Assets finales en `public/sprites/`:**
- `kenney-roguelike.png` — el spritesheet original de Kenney tal cual (16×16 grid, margen 1px), sin recortar ni repaquetear.
- `dojo-custom.png` — hoja propia, misma grilla, con katanas ×2, máscara oni, incensario, amuleto de persistencia.

**Fondos (`bg_mountain`, `bg_forest`, `bg_temple_fire`):** no se arman con el tileset (es un tileset de piso/pared para escena top-down, no para pintar un paisaje). Pasan a ser **gradientes CSS** por capas (cielo con gradiente por tier + 1-2 siluetas planas en SVG — montaña, bambú, templo) generados por código, no imágenes. Coherente con el resto (flat, sin luz propia inventada) y evita tener que compaginar decenas de tiles a mano.

## El fuego (`StreakFlame.tsx`)

Tres piezas:
1. **Sprite animado**: reemplaza `/fire.gif` (1.9MB, fotoreal) por una hoja pixel de 3-4 frames, animada con `steps()` — mismo estilo que el resto, y de paso baja de 1.9MB a probablemente <50KB.
2. **Luz proyectada**: `radial-gradient` ámbar debajo/alrededor de la llama, `mix-blend-mode: screen`, con 2-3 keyframes de opacidad/escala superpuestos a distinta frecuencia (evita el pulso mecánico de un solo keyframe). Técnica CSS estándar, cero dependencias.
3. **Chispas/embers**: `@tsparticles/react` + `@tsparticles/slim` (bundle liviano, no el engine completo) — un puñado de partículas ámbar subiendo desde la base de la llama con fade-out, cantidad atada a `streak` (más racha, más chispas, mismo criterio que ya usa `StreakFlame` para la escala). Única dependencia nueva de todo este spec; se inicializa una sola vez a nivel de la sección del dojo, no por cada instancia de `StreakFlame` (evita reinicializar el motor de partículas si el componente se remonta).

**Fuera de alcance de esta v1:** afinar physics/comportamiento avanzado de tsParticles (colisiones, interactividad al tocar la pantalla) — arranca con la preset más simple de "emitir hacia arriba y desvanecer", se itera si hace falta.

## Avatares (DiceBear)

`@dicebear/core` + `@dicebear/pixel-art`, self-hosted (no se pega contra `api.dicebear.com` en runtime). Seed = `profile.id` (estable aunque cambie el username). Utilidad nueva `lib/avatar.ts` con una función `avatarSvg(profileId: string): string`.

**Puntos de integración** (hoy renderizan `<User />` de lucide-react genérico): `components/ui/ProfileModal.tsx`, `components/ui/TopUserBar.tsx`, `components/dojo/ScrollWall.tsx`, `app/social/page.tsx`, `app/dojo/[username]/page.tsx`.

## Paneles (`Fantasy UI Borders`)

Un componente `components/ui/FantasyPanel.tsx` que envuelve contenido con el borde 9-slice vía CSS `border-image` (assets de `public/sprites/fantasy-ui-borders/`). Se aplica primero a `LevelUpModal` y `StreakLostModal` (los que más beneficio visual tienen), el resto de modales se migra si el resultado convence.

## Fuera de alcance de este spec

- Play Store / TWA (fase separada, ya acordada, no se toca acá).
- Poblar el shop con ítems nuevos más allá de los 13 actuales — este spec deja la base lista (sprite sheet + `SpriteItem`) para que eso sea rápido después, pero no agrega ítems nuevos todavía.
- Rehacer `ScrollWall`/mecánicas sociales — solo se toca donde hoy hay un ícono de usuario genérico.

## Testing / validación

Sin infraestructura de tests automatizados todavía (deuda conocida del proyecto). Validación manual: cada capa (tatami, reliquia, artefacto, fuego, panel, avatar) se prueba compuesta en la app real corriendo en viewport mobile antes de darla por buena — mismo método que ya usamos para la comparación del tatami. `tsc --noEmit` y `npm run build` antes de mergear.
