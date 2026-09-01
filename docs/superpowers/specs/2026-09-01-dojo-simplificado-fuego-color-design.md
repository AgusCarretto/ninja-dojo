# Sala simplificada + colores de fuego comprables

**Fecha:** 2026-09-01
**Estado:** Aprobado. Implementación en rama `rework-completo-ui`.

## Contexto

Tras la Slice 1 (sprites pixel-art Kenney) y el intento de Slice 3 (fondos como gradiente CSS), el usuario probó la app real y no le convenció: "esta horrible... el fondo rompe con los items". Pidió simplificar en vez de seguir puliendo capas — sacar el tatami/reliquia/artefacto de la sala y dejar solo fondo + fuego, y en cambio invertir en variedad de fondos y en una feature nueva: colores de fuego comprables, con el color base ya escalando automáticamente con la racha.

Aclaraciones del usuario durante la conversación:
- Los tatamis/reliquias/artefactos **no se borran** de la tienda/datos — se ocultan nomás, por si se retoman después con otro enfoque.
- El fuego (`/fire.gif`) **se mantiene tal cual** — nada de rediseño a pixel-art en este slice. Solo se le suma una capa de color por CSS.
- Racha → color es automático y gratis (recompensa por constancia). Comprar un color en la tienda fija ese color sin importar la racha actual (anula el automático).

## Objetivo

1. La sala del dojo (`DojoRoom` y el perfil público `/dojo/[username]`) muestra solo **fondo + fuego con contador de racha** — sin tatami, reliquia ni artefacto.
2. La tienda gana 2 fondos nuevos (mismo sistema de gradiente CSS + silueta SVG ya construido).
3. La tienda gana una categoría nueva **Colores de fuego**: comprar uno fija ese color al fuego, sin importar la racha.
4. Sin comprar nada, el fuego ya cambia de color solo al alcanzar ciertos umbrales de racha.

## Diseño

### 1. Ocultar tatami/reliquia/artefacto

- `app/shop/page.tsx`: la lista de categorías (`FONDOS / TATAMIS / RELIQUIAS / ARTEFACTOS / AMULETOS`) deja de incluir `TATAMIS`, `RELIQUIAS`, `ARTEFACTOS`. El código de esas categorías no se borra (arrays de `SHOP_ITEMS` con `type: 'mat' | 'relic' | 'artifact'` quedan intactos), solo se filtra la navegación.
- `DojoRoom.tsx` y `app/dojo/[username]/page.tsx`: se elimina el render de las capas 2 (reliquia), 3 (tatami) y 5 (artefacto). Queda: capa fondo → capa fuego. `equipped.mat/relic/artifact` en la DB no se tocan (siguen guardados, simplemente no se leen para pintar nada).

### 2. Fondos nuevos

Mismo patrón que `DojoBackground.tsx` (gradiente de cielo + 1 silueta SVG plana, sin imágenes):

- **`bg_starry_night`** ("Noche Estrellada"): cielo azul-negro muy oscuro con un campo de estrellitas (puntitos blancos, tamaño/opacidad variable) + silueta de techos de dojo en la base (reutiliza la silueta de templo, más chica y sin fuego detrás encima). Desbloqueo temprano (nivel bajo), pensado como alternativa nocturna neutra a "Bosque de Bambú".
- **`bg_dawn_mist`** ("Niebla del Alba"): gradiente gris-lavanda suave (amanecer nublado, más sereno que "Amanecer en la Montaña") + 2 capas de montañas en silueta más tenues/desaturadas que las de `sunrise`, dando sensación de niebla. Precio/nivel medio.

### 3. Colores de fuego

**Modelo de datos** (`lib/constants/items.ts`):
- `ShopItem.type` gana `'fire_color'`.
- `ShopItem.flameFilter?: string` — valor CSS `filter` (ej. `'hue-rotate(300deg) saturate(1.2)'`) aplicado directo sobre `<img src="/fire.gif">`.
- 3 ítems comprables:

| id | Nombre | Filter CSS | Precio | Nivel |
|---|---|---|---|---|
| `fire_emerald` | Llama Esmeralda | `hue-rotate(80deg) saturate(1.5)` | 500 | 3 |
| `fire_sakura` | Llama Sakura | `hue-rotate(300deg) saturate(1.2)` | 700 | 5 |
| `fire_shadow` | Llama de las Sombras | `hue-rotate(220deg) saturate(0.6) brightness(0.6)` | 1200 | 8 |

**Tiers automáticos por racha** (gratis, sin comprar nada — nueva constante `lib/constants/flameTiers.ts`):

| Racha | Nombre | Filter CSS |
|---|---|---|
| 0 | (ember, sin cambios) | — |
| 1-9 | Clásica | ninguno (look actual) |
| 10-29 | Azul | `hue-rotate(190deg) saturate(1.3)` |
| 30-59 | Violeta | `hue-rotate(260deg) saturate(1.4)` |
| 60+ | Celestial | `hue-rotate(20deg) saturate(0.4) brightness(1.3)` |

**Resolución de color en `StreakFlame`:**
1. Si `profile.equipped.fireColor` apunta a un `fire_color` comprado → usa su `flameFilter`.
2. Si no → busca el tier automático cuyo `minStreak` más alto sea `<= streak` → usa su filter.
3. `streak === 0` → estado ember actual, sin cambios.

**`EquippedItems`** (`lib/types.ts`) gana `fireColor?: string`. `mat`/`relic`/`artifact` quedan en el tipo (no se borran, aunque no se lean para pintar nada — ver punto 1).

### Fuera de alcance de este slice

- Rediseño visual del fuego en sí (sprite pixel-art, luz proyectada, partículas) — el `/fire.gif` actual queda igual, solo se le suma el filtro de color.
- Volver a mostrar tatami/reliquia/artefacto en la sala — la tienda los sigue vendiendo pero ocultos de la navegación; si se retoman, es una decisión aparte.
- Vista previa animada de cada color de fuego en la tarjeta de la tienda más allá del filtro CSS aplicado al mismo gif chico que ya usa el thumbnail (alcanza con reusar el filtro, no hace falta nada especial).

## Testing / validación

Mismo método que las slices anteriores: sin test automatizado (deuda conocida del proyecto). `npx tsc --noEmit` + `npm run build` limpios, y verificación visual manual en la app real (mobile viewport) — probar cada tier de racha (ajustando el valor manualmente si hace falta para verlo) y cada color comprable antes de dar por bueno.
