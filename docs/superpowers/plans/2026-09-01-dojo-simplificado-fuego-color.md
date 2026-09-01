# Sala simplificada (solo fondo+fuego) + colores de fuego comprables — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** La sala del dojo (propia y perfil público) muestra solo fondo + fuego con contador de racha (sin tatami/reliquia/artefacto). La tienda gana 2 fondos nuevos y una categoría "Colores de fuego" que fija un color de llama sin importar la racha; sin comprar nada, el fuego ya cambia de color solo al llegar a ciertos umbrales de racha.

**Architecture:** El `/fire.gif` actual no se toca — se le suma un `filter` CSS (hue-rotate/saturate) resuelto en `StreakFlame` a partir de, en orden de prioridad: (1) un ítem de tipo `flame` equipado, o (2) el tier automático según la racha actual (tabla en `lib/constants/flameTiers.ts`). Los fondos nuevos reusan el sistema de gradiente CSS + silueta SVG de `DojoBackground.tsx` ya construido. Las capas de tatami/reliquia/artefacto se eliminan del render (no de los datos: siguen en `SHOP_ITEMS`, en la tabla `shop_items` de Supabase y en `profile.equipped`, solo dejan de pintarse y de aparecer en la navegación de la tienda).

**Tech Stack:** Next.js 16.3.3 (App Router), React 19, Tailwind CSS v4, TypeScript, Supabase (Postgres + RPC). Sin dependencias npm nuevas.

Esta es la implementación de `docs/superpowers/specs/2026-09-01-dojo-simplificado-fuego-color-design.md` (aprobado).

## Global Constraints

- **La tienda tiene una fuente de verdad server-side.** `buy_item(item_id)` y `equip_item(slot, item_id)` (Postgres, `SECURITY DEFINER`) validan precio/nivel/propiedad contra la tabla `public.shop_items`, no contra `lib/constants/items.ts`. Un ítem nuevo en `items.ts` que no tenga fila en `shop_items` no se puede comprar ni equipar (`buy_item` tira `'Ítem inexistente'`). Toda alta de ítem comprable requiere una migración SQL además del cambio en `items.ts`.
- `equip_item` escribe con `jsonb_set(equipped, ARRAY[slot], to_jsonb(item_id))` — el `slot` que se le pasa (`item.type` desde el frontend) es **literalmente** la clave que queda en `profile.equipped`. Por eso el nuevo tipo de ítem se llama `'flame'` tanto en `ShopItem.type` como en `EquippedItems.flame` — tienen que ser el mismo string exacto.
- El proyecto no tiene test automatizado (deuda conocida). Verificación: `npx tsc --noEmit` + `npm run build` limpios en cada task, y verificación visual manual corriendo `npm run dev` antes de dar la Task 7 por buena.
- No se borra ningún dato ni fila existente de `mat`/`relic`/`artifact` — ni en `lib/constants/items.ts`, ni en la tabla `shop_items`, ni en `profile.equipped`. Solo se deja de leerlos para pintar la sala, y se les saca el botón de navegación en la tienda.
- El CLI de Supabase de este checkout no estaba vinculado al proyecto remoto al escribir este plan. La Task 1 (migración) solo se ejecuta después de que `npx supabase migration list` confirme que el proyecto está vinculado — si no lo está, esa task queda en espera y las demás (2-6, todas frontend puro) se ejecutan igual, ya que no dependen de la migración para compilar ni para that el resto de la app siga funcionando.

---

### Task 1: Migración Supabase — nuevos ítems comprables en `shop_items`

**Files:**
- Create: `supabase/migrations/<timestamp>_add_backgrounds_and_flame_shop_items.sql` (el timestamp lo genera `supabase migration new`, no inventarlo a mano)

**Interfaces:**
- Produces: 5 filas nuevas en `public.shop_items` — `bg_starry_night`, `bg_dawn_mist` (slot `'background'`), `fire_emerald`, `fire_sakura`, `fire_shadow` (slot `'flame'`). Estos 5 `id` tienen que coincidir carácter por carácter con los `id` que Task 2 agrega a `lib/constants/items.ts`.

- [ ] **Step 1: Confirmar que el proyecto está vinculado**

Run: `npx supabase migration list`
Expected: lista de migraciones sin el error `LegacyProjectNotLinkedError`. Si da ese error, **parar acá** y reportar `NEEDS_CONTEXT` — el usuario todavía no corrió `supabase link`, no es un error a resolver por tu cuenta.

- [ ] **Step 2: Generar el archivo de migración**

Run: `npx supabase migration new add_backgrounds_and_flame_shop_items`
Expected: crea `supabase/migrations/<timestamp>_add_backgrounds_and_flame_shop_items.sql` vacío. Anotar el path exacto que imprime.

- [ ] **Step 3: Escribir la migración**

Reemplazar el contenido del archivo creado por:

```sql
-- Fondos nuevos (Noche Estrellada, Niebla del Alba) + categoria "Colores de fuego".
-- Ver docs/superpowers/specs/2026-09-01-dojo-simplificado-fuego-color-design.md

INSERT INTO public.shop_items (id, name, price, required_level, category, slot) VALUES
    ('bg_starry_night', 'Noche Estrellada', 200, 2, 'cosmetic', 'background'),
    ('bg_dawn_mist', 'Niebla del Alba', 600, 6, 'cosmetic', 'background'),
    ('fire_emerald', 'Llama Esmeralda', 500, 3, 'cosmetic', 'flame'),
    ('fire_sakura', 'Llama Sakura', 700, 5, 'cosmetic', 'flame'),
    ('fire_shadow', 'Llama de las Sombras', 1200, 8, 'cosmetic', 'flame')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    required_level = EXCLUDED.required_level,
    category = EXCLUDED.category,
    slot = EXCLUDED.slot;
```

- [ ] **Step 4: Aplicar la migración**

Run: `npx supabase db push`
Expected: confirma el push (puede pedir confirmación interactiva — responder que sí) y termina sin error.

- [ ] **Step 5: Verificar contra la base real**

Run: `npx supabase db query "select id, price, required_level, category, slot from public.shop_items where id in ('bg_starry_night','bg_dawn_mist','fire_emerald','fire_sakura','fire_shadow') order by id;"`
Expected: 5 filas, con los valores exactos de la migración. Si el comando `db query` no existe en esta versión del CLI, usar `npx supabase --help db` para encontrar el equivalente (ej. algunos CLIs exponen esto vía el dashboard únicamente — si no hay forma de correr SQL de lectura desde el CLI, alcanza con confirmar que el Step 4 terminó sin error).

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: agrega fondos nuevos y colores de fuego a la tabla shop_items"
```

---

### Task 2: Modelo de datos — `EquippedItems.flame` + 5 ítems nuevos en `items.ts`

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/constants/items.ts`

**Interfaces:**
- Produces: `EquippedItems.flame?: string`. `ShopItem.type` gana `'flame'`. `ShopItem.flameFilter?: string` (valor crudo de CSS `filter`, ej. `'hue-rotate(80deg) saturate(1.5)'`). Los 5 `id` nuevos coinciden con los de Task 1.

- [ ] **Step 1: `EquippedItems` gana el campo `flame`**

En `lib/types.ts`, reemplazar:

```ts
export interface EquippedItems {
    background?: string
    mat?: string
    relic?: string
    artifact?: string
    title?: string
}
```

por:

```ts
export interface EquippedItems {
    background?: string
    mat?: string
    relic?: string
    artifact?: string
    flame?: string
    title?: string
}
```

- [ ] **Step 2: `ShopItem.type` y campo `flameFilter`**

En `lib/constants/items.ts`, reemplazar:

```ts
export interface ShopItem {
    id: string
    name: string
    type: 'background' | 'mat' | 'relic' | 'artifact' | 'consumable'
    category: 'cosmetic' | 'consumable'
    price: number
    description: string
    image: string // Emoji para la UI de la tienda
    cssClass?: string // Clases CSS extra que se le suman al render (SpriteItem o Image)
    imageUrl?: string // Ruta de imagen legacy (ítems no migrados a sprite todavía)
    sprite?: { sheet: 'kenney'; x: number; y: number; w: number; h: number } // Recorte en el spritesheet pixel-art
    bgVariant?: 'sunrise' | 'bamboo_night' | 'temple_fire' // Fondo generado por código (gradiente + silueta SVG)
    requiredLevel?: number
}
```

por:

```ts
export interface ShopItem {
    id: string
    name: string
    type: 'background' | 'mat' | 'relic' | 'artifact' | 'flame' | 'consumable'
    category: 'cosmetic' | 'consumable'
    price: number
    description: string
    image: string // Emoji para la UI de la tienda
    cssClass?: string // Clases CSS extra que se le suman al render (SpriteItem o Image)
    imageUrl?: string // Ruta de imagen legacy (ítems no migrados a sprite todavía)
    sprite?: { sheet: 'kenney'; x: number; y: number; w: number; h: number } // Recorte en el spritesheet pixel-art
    bgVariant?: 'sunrise' | 'bamboo_night' | 'temple_fire' | 'starry_night' | 'dawn_mist' // Fondo generado por código (gradiente + silueta SVG)
    flameFilter?: string // CSS filter fijo para el fuego (ítems type 'flame'), ej. 'hue-rotate(80deg) saturate(1.5)'
    requiredLevel?: number
}
```

Notar que este Step también agrega `'starry_night' | 'dawn_mist'` al tipo `bgVariant` — son los 2 fondos nuevos de la Task 4.

- [ ] **Step 3: Agregar los 2 fondos nuevos**

En `lib/constants/items.ts`, dentro del bloque `// 🌌 CAPA 0: FONDOS (Backgrounds)`, después del objeto `bg_temple_fire` (antes de la línea `// 🪨 CAPA 3: TATAMIS`), agregar:

```ts
    {
        id: 'bg_starry_night',
        name: 'Noche Estrellada',
        type: 'background',
        category: 'cosmetic',
        price: 200,
        description: 'Un cielo cuajado de estrellas para las noches de entrenamiento silencioso.',
        image: '✨',
        bgVariant: 'starry_night',
        requiredLevel: 2
    },
    {
        id: 'bg_dawn_mist',
        name: 'Niebla del Alba',
        type: 'background',
        category: 'cosmetic',
        price: 600,
        description: 'La calma antes del entrenamiento, entre montañas cubiertas de niebla.',
        image: '🌫️',
        bgVariant: 'dawn_mist',
        requiredLevel: 6
    },
```

- [ ] **Step 4: Agregar la categoría "Colores de fuego" (3 ítems)**

En `lib/constants/items.ts`, después del cierre del bloque `// 🛡️ CONSUMIBLES` (después del objeto `streak_shield`, antes del `]` final de `SHOP_ITEMS`), agregar una coma después de `streak_shield` y el bloque nuevo:

```ts
    {
        id: 'streak_shield',
        name: 'Amuleto de Persistencia',
        type: 'consumable',
        category: 'consumable',
        price: 500,
        description: 'Si un día se te escapa, el amuleto absorbe el golpe y tu racha sigue viva. Máximo 1 a la vez.',
        image: '🛡️'
    },

    // ==========================================
    // 🔥 COLORES DE FUEGO
    // ==========================================
    {
        id: 'fire_emerald',
        name: 'Llama Esmeralda',
        type: 'flame',
        category: 'cosmetic',
        price: 500,
        description: 'Un fuego verde intenso, sin importar tu racha actual.',
        image: '💚',
        flameFilter: 'hue-rotate(80deg) saturate(1.5)',
        requiredLevel: 3
    },
    {
        id: 'fire_sakura',
        name: 'Llama Sakura',
        type: 'flame',
        category: 'cosmetic',
        price: 700,
        description: 'Un fuego rosado, delicado y feroz a la vez.',
        image: '🌸',
        flameFilter: 'hue-rotate(300deg) saturate(1.2)',
        requiredLevel: 5
    },
    {
        id: 'fire_shadow',
        name: 'Llama de las Sombras',
        type: 'flame',
        category: 'cosmetic',
        price: 1200,
        description: 'Un fuego oscuro que arde igual de fuerte.',
        image: '🖤',
        flameFilter: 'hue-rotate(220deg) saturate(0.6) brightness(0.6)',
        requiredLevel: 8
    }
]
```

(Notar el `]` de cierre de `SHOP_ITEMS` movido al final de este bloque — reemplaza el `]` que hoy cierra justo después de `streak_shield`.)

- [ ] **Step 5: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/constants/items.ts
git commit -m "feat: modelo de datos para colores de fuego y 2 fondos nuevos"
```

---

### Task 3: Resolución de color del fuego — `flameTiers.ts` + `StreakFlame.tsx`

**Files:**
- Create: `lib/constants/flameTiers.ts`
- Modify: `components/dojo/StreakFlame.tsx`

**Interfaces:**
- Consumes: `SHOP_ITEMS` (Task 2), específicamente ítems `type: 'flame'` y su `flameFilter`.
- Produces: `getAutoFlameFilter(streak: number): string` (exportado desde `flameTiers.ts`). `StreakFlame` recibe una prop nueva opcional `fireColorId?: string` (el `id` de un `ShopItem` type `'flame'` equipado).

- [ ] **Step 1: Crear `lib/constants/flameTiers.ts`**

```ts
export interface FlameTier {
    minStreak: number
    name: string
    filter: string
}

// De mayor a menor: el primero cuyo minStreak sea <= streak gana.
export const FLAME_TIERS: FlameTier[] = [
    { minStreak: 60, name: 'Celestial', filter: 'hue-rotate(20deg) saturate(0.4) brightness(1.3)' },
    { minStreak: 30, name: 'Violeta', filter: 'hue-rotate(260deg) saturate(1.4)' },
    { minStreak: 10, name: 'Azul', filter: 'hue-rotate(190deg) saturate(1.3)' },
    { minStreak: 1, name: 'Clásica', filter: '' },
]

export function getAutoFlameFilter(streak: number): string {
    const tier = FLAME_TIERS.find(t => streak >= t.minStreak)
    return tier?.filter ?? ''
}
```

- [ ] **Step 2: `StreakFlame.tsx` resuelve y aplica el filtro**

Reemplazar el contenido completo de `components/dojo/StreakFlame.tsx` por:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { SHOP_ITEMS } from '@/lib/constants/items'
import { getAutoFlameFilter } from '@/lib/constants/flameTiers'

interface StreakFlameProps {
    streak: number
    fireColorId?: string
}

export default function StreakFlame({ streak, fireColorId }: StreakFlameProps) {
    const scale = Math.min(1 + (streak * 0.02), 3)

    // Estado para el contador animado
    const [displayStreak, setDisplayStreak] = useState(0)

    useEffect(() => {
        if (streak === 0) {
            setDisplayStreak(0)
            return
        }

        let current = 0
        const incrementTime = Math.max(1000 / streak, 10)

        const timer = setInterval(() => {
            current += 1
            setDisplayStreak(current)
            if (current >= streak) {
                clearInterval(timer)
                setDisplayStreak(streak)
            }
        }, incrementTime)

        return () => clearInterval(timer)
    }, [streak])

    const equippedColor = fireColorId ? SHOP_ITEMS.find(i => i.id === fireColorId && i.type === 'flame') : undefined
    const colorFilter = equippedColor?.flameFilter ?? getAutoFlameFilter(streak)
    const flameFilter = colorFilter ? `contrast(1.5) brightness(0.9) ${colorFilter}` : 'contrast(1.5) brightness(0.9)'

    return (
        <div className="flex flex-col items-center justify-end">

            <div
                className={`relative flex items-end justify-center transition-all duration-1000 ease-in-out ${streak > 0 ? 'mix-blend-screen' : ''}`}
                style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
            >
                {streak > 0 ? (
                    <div className="relative flex items-center justify-center w-24 h-32">
                        <img
                            src="/fire.gif"
                            alt="Llama ardiente"
                            className="relative w-full h-full object-cover"
                            style={{ filter: flameFilter }}
                        />
                    </div>
                ) : (
                    <div className="w-16 h-8 relative flex flex-col items-center justify-center mb-8">
                        <div className="w-full h-full bg-zinc-900 rounded-full blur-[2px] shadow-[inset_0_0_10px_rgba(0,0,0,0.9)]" />
                        <div className="absolute bottom-1 w-3/4 h-1/2 bg-red-900/50 animate-pulse rounded-full blur-[4px]" />
                    </div>
                )}
            </div>

            {/* NÚMEROS */}
            <div className="flex flex-col items-center relative -mt-4">
                <h2 className="text-5xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,1)]">
                    {displayStreak}
                </h2>
                <p className="text-xs font-bold text-white/90 uppercase tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,1)] mt-1">
                    {streak === 1 ? 'Día Racha' : 'Días Racha'}
                </p>
            </div>

        </div>
    )
}
```

Nota importante: las clases Tailwind `contrast-[1.5] brightness-[0.9]` que tenía el `<img>` se sacaron del `className` y se movieron, como valores literales `contrast(1.5) brightness(0.9)`, al **mismo** string de `style.filter` que lleva el color — si quedaran como clases Tailwind aparte, un `style.filter` inline las pisaría por completo (el inline style gana siempre sobre las clases para la misma propiedad CSS), perdiendo el contraste/brillo base cada vez que hay un color aplicado.

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add lib/constants/flameTiers.ts components/dojo/StreakFlame.tsx
git commit -m "feat: StreakFlame resuelve color por racha o por item de tienda equipado"
```

---

### Task 4: 2 fondos nuevos en `DojoBackground.tsx`

**Files:**
- Modify: `components/dojo/DojoBackground.tsx`

**Interfaces:**
- Consumes: nada nuevo (mismo patrón interno).
- Produces: `DojoBackground` acepta `variant: 'sunrise' | 'bamboo_night' | 'temple_fire' | 'starry_night' | 'dawn_mist'` (coincide con el `bgVariant` que Task 2 agregó a `ShopItem`).

- [ ] **Step 1: Reemplazar el archivo completo**

Reemplazar el contenido completo de `components/dojo/DojoBackground.tsx` por:

```tsx
type BgVariant = 'sunrise' | 'bamboo_night' | 'temple_fire' | 'starry_night' | 'dawn_mist'

const SKY: Record<BgVariant, string> = {
    sunrise: 'linear-gradient(to bottom, #1a1330 0%, #4a2145 28%, #b1483d 52%, #e8823a 72%, #f4b860 88%, #2a1f3d 100%)',
    bamboo_night: 'linear-gradient(to bottom, #0a1128 0%, #123349 35%, #1f5568 65%, #2f7a78 100%)',
    temple_fire: 'linear-gradient(to bottom, #0a0503 0%, #2b0a08 28%, #74180f 52%, #c73e1d 74%, #f2994a 90%, #1a0503 100%)',
    starry_night: 'linear-gradient(to bottom, #04050d 0%, #0a0f24 40%, #131b3a 75%, #1a2340 100%)',
    dawn_mist: 'linear-gradient(to bottom, #332f45 0%, #5c5570 35%, #8a8296 65%, #b8aebc 100%)',
}

function Moon() {
    return (
        <div
            className="absolute rounded-full"
            style={{
                top: '12%',
                right: '18%',
                width: '10%',
                aspectRatio: '1 / 1',
                background: '#f5edd6',
                boxShadow: '0 0 40px 10px rgba(245, 237, 214, 0.35)',
            }}
        />
    )
}

function MountainSilhouette({ back = '#2a2140', front = '#150f24' }: { back?: string; front?: string }) {
    return (
        <svg
            className="absolute inset-x-0 bottom-0 w-full h-[45%]"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path
                d="M0,200 L0,140 L100,90 L180,120 L260,70 L340,110 L420,85 L500,130 L580,95 L660,125 L740,80 L800,140 L800,200 Z"
                fill={back}
            />
            <path
                d="M0,200 L0,170 L80,130 L160,160 L240,110 L320,150 L400,120 L480,155 L560,115 L640,150 L720,125 L800,165 L800,200 Z"
                fill={front}
            />
        </svg>
    )
}

function BambooSilhouette() {
    const stalks = [
        { x: 30, top: 90, w: 10 },
        { x: 110, top: 50, w: 8 },
        { x: 190, top: 115, w: 11 },
        { x: 300, top: 70, w: 9 },
        { x: 400, top: 100, w: 10 },
        { x: 490, top: 45, w: 8 },
        { x: 590, top: 85, w: 10 },
        { x: 680, top: 120, w: 9 },
        { x: 760, top: 60, w: 10 },
    ]
    return (
        <svg
            className="absolute inset-x-0 bottom-0 w-full h-[50%]"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            {stalks.map((s, i) => {
                const cx = s.x + s.w / 2
                return (
                    <g key={i} fill="#0a1f14">
                        <rect x={s.x} y={s.top} width={s.w} height={200 - s.top} rx={s.w / 2} />
                        {/* nudos del tallo */}
                        <rect x={s.x - 1} y={s.top + 22} width={s.w + 2} height={3} rx={1.5} />
                        <rect x={s.x - 1} y={s.top + 48} width={s.w + 2} height={3} rx={1.5} />
                        {/* penacho de hojas, angostas y finitas */}
                        <polygon points={`${cx},${s.top - 2} ${cx - 3},${s.top + 14} ${cx + 3},${s.top + 14}`} />
                        <polygon points={`${cx},${s.top} ${cx - 22},${s.top - 10} ${cx - 6},${s.top + 12}`} />
                        <polygon points={`${cx},${s.top} ${cx + 22},${s.top - 6} ${cx + 6},${s.top + 12}`} />
                        <polygon points={`${cx},${s.top + 4} ${cx - 16},${s.top + 18} ${cx - 3},${s.top + 20}`} />
                        <polygon points={`${cx},${s.top + 4} ${cx + 16},${s.top + 22} ${cx + 3},${s.top + 20}`} />
                    </g>
                )
            })}
        </svg>
    )
}

function TempleSilhouette() {
    return (
        <svg
            className="absolute inset-x-0 bottom-0 w-full h-[45%]"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <rect x="0" y="185" width="800" height="15" fill="#0d0403" />
            <rect x="360" y="150" width="80" height="50" fill="#0d0403" />
            <polygon points="320,150 480,150 460,120 340,120" fill="#0d0403" />
            <polygon points="345,120 455,120 435,90 365,90" fill="#0d0403" />
            <rect x="396" y="68" width="8" height="22" fill="#0d0403" />
        </svg>
    )
}

function StarrySilhouette() {
    const stars = [
        { x: 40, y: 25, r: 2 }, { x: 95, y: 70, r: 1.3 }, { x: 150, y: 15, r: 1.8 },
        { x: 210, y: 55, r: 1.3 }, { x: 270, y: 90, r: 2.2 }, { x: 330, y: 30, r: 1.5 },
        { x: 390, y: 65, r: 1.3 }, { x: 450, y: 20, r: 2 }, { x: 510, y: 80, r: 1.5 },
        { x: 570, y: 45, r: 1.8 }, { x: 630, y: 100, r: 1.3 }, { x: 690, y: 35, r: 2.2 },
        { x: 740, y: 70, r: 1.5 }, { x: 770, y: 15, r: 1.8 },
    ]
    return (
        <>
            <svg className="absolute inset-x-0 top-0 w-full h-[70%]" viewBox="0 0 800 200" preserveAspectRatio="none" aria-hidden="true">
                {stars.map((s, i) => (
                    <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#f5f0e0" opacity={0.55 + (i % 3) * 0.15} />
                ))}
            </svg>
            <svg className="absolute inset-x-0 bottom-0 w-full h-[18%]" viewBox="0 0 800 200" preserveAspectRatio="none" aria-hidden="true">
                <rect x="0" y="170" width="800" height="30" fill="#050810" />
                <polygon points="100,170 220,170 200,140 120,140" fill="#050810" />
                <polygon points="500,170 650,170 625,135 525,135" fill="#050810" />
            </svg>
        </>
    )
}

export default function DojoBackground({ variant }: { variant: BgVariant }) {
    return (
        <div className="absolute inset-0" style={{ background: SKY[variant] }}>
            {variant === 'sunrise' && <MountainSilhouette />}
            {variant === 'bamboo_night' && (
                <>
                    <Moon />
                    <BambooSilhouette />
                </>
            )}
            {variant === 'temple_fire' && <TempleSilhouette />}
            {variant === 'starry_night' && <StarrySilhouette />}
            {variant === 'dawn_mist' && <MountainSilhouette back="#4a4558" front="#332f45" />}
        </div>
    )
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add components/dojo/DojoBackground.tsx
git commit -m "feat: agrega fondos Noche Estrellada y Niebla del Alba"
```

---

### Task 5: Simplificar la sala — sacar tatami/reliquia/artefacto, cablear color de fuego

**Files:**
- Modify: `components/dojo/DojoRoom.tsx`
- Modify: `app/dojo/[username]/page.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `StreakFlame` con prop `fireColorId` (Task 3), `EquippedItems.flame` (Task 2).

- [ ] **Step 1: `DojoRoom.tsx` — reemplazar el archivo completo**

```tsx
'use client'

import { SHOP_ITEMS } from '@/lib/constants/items'
import ScrollWall from '@/components/dojo/ScrollWall'
import DojoBackground from '@/components/dojo/DojoBackground'

interface DojoRoomProps {
    equipped: {
        background?: string
    }
    children: React.ReactNode
    dojoOwnerId: string;
    currentUserId: string;
    isSelf: boolean;
}

export default function DojoRoom({ equipped, children, dojoOwnerId, currentUserId, isSelf }: DojoRoomProps) {
    const bgItem = SHOP_ITEMS.find(i => i.id === equipped?.background) || SHOP_ITEMS.find(i => i.id === 'bg_mountain')

    return (
        <div className="flex flex-col w-full">

            <div className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden bg-zinc-950">

                {/* 1. CAPA FONDO */}
                {bgItem?.bgVariant && (
                    <div className="absolute inset-0">
                        <DojoBackground variant={bgItem.bgVariant} />
                        <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
                    </div>
                )}

                {/* 2. CAPA FUEGO */}
                {children}

                {/* HUD LUGAR */}
                <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                        {bgItem?.name}
                    </span>
                </div>
            </div>

            {/* MURO */}
            <div className="w-full bg-background min-h-[50vh] relative z-50 shadow-[0_-20px_40px_rgba(0,0,0,0.9)] border-t border-white/5">
                <ScrollWall dojoOwnerId={dojoOwnerId} currentUserId={currentUserId} isSelf={isSelf} />
            </div>

        </div>
    )
}
```

`DojoRoomProps.equipped` pasa a tener solo `background?: string` — el `EquippedItems` completo que le sigue pasando `app/page.tsx` (`equipped={profile?.equipped}`) sigue siendo estructuralmente compatible (TypeScript permite pasar un objeto con más campos de los que la interfaz pide).

- [ ] **Step 2: `app/page.tsx` — pasar `fireColorId` a `StreakFlame`**

Reemplazar:

```tsx
          <StreakFlame streak={currentStreak} />
```

por:

```tsx
          <StreakFlame streak={currentStreak} fireColorId={profile?.equipped?.flame} />
```

- [ ] **Step 3: `app/dojo/[username]/page.tsx` — sacar las 3 capas y cablear el color**

Reemplazar (nota: `matItem`/`relicItem`/`artifactItem` dejan de calcularse — si algo más abajo en el archivo los usa, no debería, ya que solo se usaban en estas capas):

```tsx
    const bgItem = SHOP_ITEMS.find(i => i.id === profile?.equipped?.background) || SHOP_ITEMS.find(i => i.id === 'bg_mountain')
    const matItem = SHOP_ITEMS.find(i => i.id === profile?.equipped?.mat) || SHOP_ITEMS.find(i => i.id === 'mat_default')
    const relicItem = SHOP_ITEMS.find(i => i.id === profile?.equipped?.relic)
    const artifactItem = SHOP_ITEMS.find(i => i.id === profile?.equipped?.artifact)
```

por:

```tsx
    const bgItem = SHOP_ITEMS.find(i => i.id === profile?.equipped?.background) || SHOP_ITEMS.find(i => i.id === 'bg_mountain')
```

Reemplazar (desde la capa reliquia hasta el cierre de la capa artefacto — todo el bloque entre `{/* 1. CAPA FONDO */}` y `{/* HUD BOTTOM`):

```tsx
                {/* 1. CAPA FONDO */}
                {bgItem?.bgVariant && (
                    <div className="absolute inset-0">
                        <DojoBackground variant={bgItem.bgVariant} />
                        <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
                    </div>
                )}

                {/* 2. CAPA RELIQUIA */}
                {relicItem?.sprite ? (
                    <div className="absolute top-8 w-48 flex justify-center drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                        <SpriteItem
                            sheet={relicItem.sprite.sheet}
                            x={relicItem.sprite.x}
                            y={relicItem.sprite.y}
                            w={relicItem.sprite.w}
                            h={relicItem.sprite.h}
                            scale={4}
                            alt={relicItem.name}
                            className={relicItem.cssClass || ''}
                        />
                    </div>
                ) : relicItem?.imageUrl && (
                    <div className="absolute top-8 w-48 h-48 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                        <Image src={relicItem.imageUrl} alt={relicItem.name} fill className="object-contain" />
                    </div>
                )}

                {/* 3. CAPA TATAMI */}
                {matItem?.sprite ? (
                    <div className="absolute bottom-12 drop-shadow-2xl">
                        <SpriteItem
                            sheet={matItem.sprite.sheet}
                            x={matItem.sprite.x}
                            y={matItem.sprite.y}
                            w={matItem.sprite.w}
                            h={matItem.sprite.h}
                            scale={8}
                            alt={matItem.name}
                            className={matItem.cssClass || ''}
                        />
                    </div>
                ) : matItem?.imageUrl ? (
                    <div className="absolute bottom-12 w-[240px] h-[140px] drop-shadow-2xl">
                        <Image src={matItem.imageUrl} alt={matItem.name} fill className="object-contain" />
                    </div>
                ) : (
                    <div className={`absolute bottom-12 w-64 h-16 rounded-[100%] blur-[8px] opacity-60 shadow-2xl ${matItem?.cssClass || 'bg-amber-900/50'}`} />
                )}

                {/* 4. CAPA FUEGO (GIF ANIMADO) */}
                <div className="absolute bottom-24 flex flex-col items-center justify-center w-full">
                    <StreakFlame streak={profile.streak_count} />
                </div>

                {/* 5. CAPA ARTEFACTO (Izquierda) */}
                {artifactItem?.sprite ? (
                    <div className="absolute bottom-2 left-2 z-50 opacity-90 drop-shadow-2xl">
                        <SpriteItem
                            sheet={artifactItem.sprite.sheet}
                            x={artifactItem.sprite.x}
                            y={artifactItem.sprite.y}
                            w={artifactItem.sprite.w}
                            h={artifactItem.sprite.h}
                            scale={8}
                            alt={artifactItem.name}
                            className={artifactItem.cssClass || ''}
                        />
                    </div>
                ) : artifactItem?.imageUrl && (
                    <div className="absolute bottom-2 left-2 w-40 h-40 z-50 opacity-90 drop-shadow-2xl">
                        <Image src={artifactItem.imageUrl} alt={artifactItem.name} fill className="object-contain" />
                    </div>
                )}
```

por:

```tsx
                {/* 1. CAPA FONDO */}
                {bgItem?.bgVariant && (
                    <div className="absolute inset-0">
                        <DojoBackground variant={bgItem.bgVariant} />
                        <div className="absolute inset-0 bg-black/30 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
                    </div>
                )}

                {/* 2. CAPA FUEGO (GIF ANIMADO) */}
                <StreakFlame streak={profile.streak_count} fireColorId={profile.equipped?.flame} />
```

Los imports `Image` de `next/image` y `SpriteItem` pueden quedar sin uso en este archivo tras el cambio — revisar si algo más en el archivo los sigue usando (ej. el avatar) antes de decidir si se sacan del `import`; si no hay más usos, sacar esas líneas de import para que no quede un import muerto.

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add components/dojo/DojoRoom.tsx "app/dojo/[username]/page.tsx" app/page.tsx
git commit -m "feat: simplifica la sala a solo fondo+fuego, cablea color de fuego equipado"
```

---

### Task 6: Tienda — ocultar Tatamis/Reliquias/Artefactos, agregar pestaña "Colores"

**Files:**
- Modify: `app/shop/page.tsx`

**Interfaces:**
- Consumes: `ShopItem.type === 'flame'` (Task 2).

- [ ] **Step 1: Importar el ícono `Flame`**

Reemplazar:

```tsx
import { Coins, Lock, CheckCircle2, ShoppingBag, LayoutGrid, Image as ImageIcon, Shield, Lamp, Sparkles } from 'lucide-react'
```

por:

```tsx
import { Coins, Lock, CheckCircle2, ShoppingBag, LayoutGrid, Image as ImageIcon, Shield, Lamp, Sparkles, Flame } from 'lucide-react'
```

- [ ] **Step 2: `Category` gana `'flame'`**

Reemplazar:

```tsx
type Category = 'background' | 'mat' | 'relic' | 'artifact' | 'consumable'
```

por:

```tsx
type Category = 'background' | 'mat' | 'relic' | 'artifact' | 'flame' | 'consumable'
```

- [ ] **Step 3: Sacar Tatamis/Reliquias/Artefactos de la navegación, agregar Colores**

Reemplazar:

```tsx
    const categories: { id: Category, label: string, icon: React.ReactNode }[] = [
        { id: 'background', label: 'Fondos', icon: <ImageIcon size={16} /> },
        { id: 'mat', label: 'Tatamis', icon: <LayoutGrid size={16} /> },
        { id: 'relic', label: 'Reliquias', icon: <Shield size={16} /> },
        { id: 'artifact', label: 'Artefactos', icon: <Lamp size={16} /> },
        { id: 'consumable', label: 'Amuletos', icon: <Sparkles size={16} /> },
    ]
```

por:

```tsx
    const categories: { id: Category, label: string, icon: React.ReactNode }[] = [
        { id: 'background', label: 'Fondos', icon: <ImageIcon size={16} /> },
        { id: 'flame', label: 'Colores', icon: <Flame size={16} /> },
        { id: 'consumable', label: 'Amuletos', icon: <Sparkles size={16} /> },
    ]
```

`LayoutGrid`, `Shield` y `Lamp` quedan sin uso tras este cambio — sacarlos del import del Step 1 si no se usan en otra parte del archivo (`Shield` en particular, revisar bien: es un ícono común, puede estar usado en otro lado del archivo con otro propósito).

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add app/shop/page.tsx
git commit -m "feat: tienda oculta tatamis/reliquias/artefactos, agrega pestana Colores de fuego"
```

---

### Task 7: Verificación visual + build

**Files:** ninguno (solo verificación).

- [ ] **Step 1: Levantar el dev server**

Run: `npm run dev`

- [ ] **Step 2: Sala propia** (`/`, viewport mobile)

- Se ve fondo + fuego + contador. Nada de tatami, reliquia ni artefacto.
- El fuego tiene el color que corresponde a la racha actual del usuario (si la racha es baja, va a ser la "Clásica" — para probar los otros tiers hace falta racha alta o ajustar `streak_count` manualmente en la fila del perfil vía Supabase, con cuidado de no tocar nada más del perfil real del usuario).

- [ ] **Step 3: Tienda** (`/shop`)

- Pestañas: Fondos, Colores, Amuletos — nada de Tatamis/Reliquias/Artefactos.
- Fondos: los 5 (3 viejos + Noche Estrellada + Niebla del Alba) renderizan bien, sin overflow ni cortes.
- Colores: los 3 ítems nuevos aparecen (con su emoji, ya que no tienen sprite/imagen — es el comportamiento esperado, ver spec "Fuera de alcance").
- Si la migración de la Task 1 ya se aplicó: comprar y equipar un color de fuego, volver a `/` y confirmar que el fuego usa ESE color en vez del automático por racha.
- Si la Task 1 todavía no se aplicó (usuario no vinculó el CLI todavía): comprar/equipar los 5 ítems nuevos va a fallar con "Ítem inexistente" — es esperado, no es un bug de esta task, es la Task 1 pendiente.

- [ ] **Step 4: Perfil público** (`/dojo/[username]`, de otro usuario o el propio)

Mismo layout simplificado (fondo+fuego), color de fuego acorde a la racha/color equipado de ese perfil.

- [ ] **Step 5: Ajustar si algo no cierra visualmente**

Iterar acá si algún gradiente/silueta nueva no convence, o si algún filtro de color del fuego se ve mal sobre el gif real (los valores de `hue-rotate`/`saturate` de este plan son un punto de partida razonable, no verdad revelada — el gif real puede pedir ajustes finos).

- [ ] **Step 6: Build de producción**

Run: `npm run build`
Expected: build limpio, sin errores.

- [ ] **Step 7: Commit final si hubo ajustes**

```bash
git add -A
git commit -m "fix: ajustes visuales tras verificacion manual"
```

(Si no hubo ajustes, no hacer commit vacío.)
