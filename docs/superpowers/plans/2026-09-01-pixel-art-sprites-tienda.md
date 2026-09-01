# Sprites pixel-art Kenney en tienda/dojo (Slice 1 de la unificación visual) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar 6 de los 13 ítems cosméticos de la tienda (los 3 tatamis, el estandarte dorado, el farol y el bonsái) por sprites pixel-art del pack Kenney CC0 "Roguelike/RPG pack", renderizados con un nuevo componente `SpriteItem`, en los 3 lugares donde hoy se pintan (`DojoRoom`, `app/dojo/[username]/page.tsx`, `app/shop/page.tsx`).

**Architecture:** `SpriteItem` es un `div` con `background-image`/`background-position`/`background-size` recortando una región fija de `public/sprites/kenney-roguelike.png` (968×526px, grilla de tiles 16×16 con 1px de margen), con `image-rendering: pixelated`. `ShopItem` gana un campo `sprite` opcional; cada sitio de render usa `SpriteItem` cuando `item.sprite` existe y cae al `<Image imageUrl>` legacy en caso contrario, así los 4 ítems que se migran en la Slice 2 (katanas ×2, máscara, incensario) siguen funcionando sin tocarlos.

**Tech Stack:** Next.js 16.3.3 (App Router), React 19, Tailwind CSS v4, TypeScript. Sin dependencias nuevas en esta slice.

Esta es la **Slice 1 de 6** de `docs/superpowers/specs/2026-08-31-pixel-art-unification-design.md` (Camino B, aprobado). Las siguientes 5 (hoja custom dibujada a mano, fondos como gradientes CSS, fuego con tsParticles, avatares DiceBear, `FantasyPanel`) son plans separados, uno por vez, cada uno revisado antes de arrancar el próximo.

## Global Constraints

- Fuente del spritesheet: `.asset-research/roguelike-rpg-pack/Spritesheet/roguelikeSheet_transparent.png` (CC0, Kenney) — gitignored, ya descargado. Se copia tal cual a `public/sprites/kenney-roguelike.png`, sin recortar ni repaquetear.
- Grilla del spritesheet: tile 16×16px, margen 1px, arranca en (0,0). Coordenada de tile en columna `c`, fila `r` (0-indexed) → píxel `x = c*17, y = r*17`. Sheet completo: 968×526px (57 columnas × 31 filas).
- Next.js 16 deprecó la prop `priority` de `next/image` en favor de `preload` (`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`, sección `priority`). Cualquier `<Image priority />` que se toque en esta slice pasa a `<Image preload />`.
- El proyecto no tiene test automatizado todavía (deuda conocida, documentada en el spec). La verificación de cada task es: `npx tsc --noEmit` limpio + chequeo visual manual corriendo `npm run dev` en viewport mobile. `npm run build` se corre una sola vez al final de la slice completa.
- No se toca `relic_katanas`, `relic_katana_onehanded`, `relic_mask`, `artifact_incense` ni los 3 `background` — quedan con su `imageUrl` legacy intacto (se migran en slices posteriores).
- Los assets `.png` legacy que queden sin ningún `ShopItem` que los referencie después de esta slice se borran de `public/shop/` (evita assets huérfanos).

---

### Task 1: Componente `SpriteItem` + copia del spritesheet

**Files:**
- Create: `components/ui/SpriteItem.tsx`
- Create: `public/sprites/kenney-roguelike.png` (copia de `.asset-research/roguelike-rpg-pack/Spritesheet/roguelikeSheet_transparent.png`)

**Interfaces:**
- Produces: `SpriteItem` (default export), props `{ sheet: 'kenney'; x: number; y: number; w: number; h: number; scale?: number; className?: string; alt: string }`. `scale` default `1`. Tamaño renderizado = `w*scale` × `h*scale`.

- [ ] **Step 1: Copiar el spritesheet a `public/sprites/`**

```bash
mkdir -p public/sprites
cp ".asset-research/roguelike-rpg-pack/Spritesheet/roguelikeSheet_transparent.png" "public/sprites/kenney-roguelike.png"
```

- [ ] **Step 2: Crear `components/ui/SpriteItem.tsx`**

```tsx
'use client'

type SpriteSheet = 'kenney'

interface SpriteItemProps {
    sheet: SpriteSheet
    x: number
    y: number
    w: number
    h: number
    scale?: number
    className?: string
    alt: string
}

const SHEETS: Record<SpriteSheet, { src: string; naturalWidth: number; naturalHeight: number }> = {
    kenney: { src: '/sprites/kenney-roguelike.png', naturalWidth: 968, naturalHeight: 526 },
}

export default function SpriteItem({ sheet, x, y, w, h, scale = 1, className = '', alt }: SpriteItemProps) {
    const { src, naturalWidth, naturalHeight } = SHEETS[sheet]

    return (
        <div
            role="img"
            aria-label={alt}
            className={className}
            style={{
                width: w * scale,
                height: h * scale,
                backgroundImage: `url(${src})`,
                backgroundPosition: `${-x * scale}px ${-y * scale}px`,
                backgroundSize: `${naturalWidth * scale}px ${naturalHeight * scale}px`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
            }}
        />
    )
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos relacionados a `SpriteItem.tsx`.

- [ ] **Step 4: Commit**

```bash
git add components/ui/SpriteItem.tsx public/sprites/kenney-roguelike.png
git commit -m "feat: componente SpriteItem para sprites pixel-art del pack Kenney"
```

---

### Task 2: Migrar 6 ítems de `SHOP_ITEMS` a `sprite`

**Files:**
- Modify: `lib/constants/items.ts`
- Delete: `public/shop/mats/mat_wood-modified.png`, `public/shop/mats/mat_jade-modified.png`, `public/shop/mats/mat_obsidian-modified (1).png`, `public/shop/relics/relic_dragon-modified.png`, `public/shop/artifacts/artifact_lantern-modified.png`, `public/shop/artifacts/artifact_bonsai-modified.png`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `ShopItem.sprite?: { sheet: 'kenney'; x: number; y: number; w: number; h: number }`. Los sitios de render (Task 3-5) leen `item.sprite` y, si existe, usan `<SpriteItem sheet={item.sprite.sheet} x={item.sprite.x} y={item.sprite.y} w={item.sprite.w} h={item.sprite.h} .../>`. `item.cssClass` (campo ya existente en `ShopItem`) se sigue usando como clases CSS extra que el layer le agrega al `SpriteItem` (mismo propósito que ya tenía en el comentario original del tipo).

Coordenadas verificadas visualmente (recorte real del spritesheet, ver `docs/superpowers/plans/2026-09-01-pixel-art-sprites-tienda.md` Global Constraints para la fórmula de grilla):

| Item | col,row | x,y,w,h | Nota |
|---|---|---|---|
| `mat_default` | 8,3 | 136,51,16,16 | piso de tablones de madera |
| `mat_jade` | 10,25 | 170,425,16,16 | relleno plano verde liso (no hay losa de piedra verde en el pack, el pasto con textura orgánica queda peor para "losa") |
| `mat_obsidian` | 0,18 | 0,306,16,16 | piso rocoso oscuro con vetas/brasas naranjas — más fiel a "roca volcánica con magma" que el tile "mágico" púrpura del pack (alternativa descartada) |
| `relic_dragon` | 50,0 | 850,0,16,50 | estandarte con cruz heráldica, **3 tiles de alto** (filas 0-2 en la misma columna). El pack no tiene variante dorada, solo naranja/turquesa/verde — se le suma `cssClass` con `hue-rotate` para acercarlo a "Estandarte Dorado" |
| `artifact_lantern` | 17,7 | 289,119,16,16 | antorcha encendida (proxy más cercano a farol que trae el pack) |
| `artifact_bonsai` | 13,9 | 221,153,16,16 | árbol chico de copa redonda con tronco visible |

- [ ] **Step 1: Actualizar el tipo `ShopItem`**

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
    cssClass?: string // Opcional por si en algún momento querés mezclar CSS con la imagen
    imageUrl?: string // 🔥 La ruta real de la imagen para el motor 2D
    requiredLevel?: number
}
```

por:

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
    requiredLevel?: number
}
```

- [ ] **Step 2: Migrar `mat_default`**

Reemplazar:

```ts
    {
        id: 'mat_default', // Mantenemos este ID por compatibilidad si alguien ya lo equipó
        name: 'Madera de Roble',
        type: 'mat',
        category: 'cosmetic',
        price: 0,
        description: 'Madera resistente y gastada por el entrenamiento.',
        image: '🪵',
        imageUrl: '/shop/mats/mat_wood-modified.png'

    },
```

por:

```ts
    {
        id: 'mat_default', // Mantenemos este ID por compatibilidad si alguien ya lo equipó
        name: 'Madera de Roble',
        type: 'mat',
        category: 'cosmetic',
        price: 0,
        description: 'Madera resistente y gastada por el entrenamiento.',
        image: '🪵',
        sprite: { sheet: 'kenney', x: 136, y: 51, w: 16, h: 16 }
    },
```

- [ ] **Step 3: Migrar `mat_jade`**

Reemplazar:

```ts
    {
        id: 'mat_jade',
        name: 'Losa de Jade',
        type: 'mat',
        category: 'cosmetic',
        price: 400,
        description: 'Piedra preciosa que concentra la energía del dojo.',
        image: '🟩',
        imageUrl: '/shop/mats/mat_jade-modified.png',
        requiredLevel: 3
    },
```

por:

```ts
    {
        id: 'mat_jade',
        name: 'Losa de Jade',
        type: 'mat',
        category: 'cosmetic',
        price: 400,
        description: 'Piedra preciosa que concentra la energía del dojo.',
        image: '🟩',
        sprite: { sheet: 'kenney', x: 170, y: 425, w: 16, h: 16 },
        requiredLevel: 3
    },
```

- [ ] **Step 4: Migrar `mat_obsidian`**

Reemplazar:

```ts
    {
        id: 'mat_obsidian',
        name: 'Cráter de Obsidiana',
        type: 'mat',
        category: 'cosmetic',
        price: 1200,
        description: 'Roca volcánica con magma en su interior.',
        image: '🪨',
        imageUrl: '/shop/mats/mat_obsidian-modified (1).png',
        requiredLevel: 7
    },
```

por:

```ts
    {
        id: 'mat_obsidian',
        name: 'Cráter de Obsidiana',
        type: 'mat',
        category: 'cosmetic',
        price: 1200,
        description: 'Roca volcánica con magma en su interior.',
        image: '🪨',
        sprite: { sheet: 'kenney', x: 0, y: 306, w: 16, h: 16 },
        requiredLevel: 7
    },
```

- [ ] **Step 5: Migrar `relic_dragon`**

Reemplazar:

```ts
    {
        id: 'relic_dragon',
        name: 'Estandarte Dorado',
        type: 'relic',
        category: 'cosmetic',
        price: 1500,
        description: 'El emblema definitivo del clan dragón.',
        image: '🐉',
        imageUrl: '/shop/relics/relic_dragon-modified.png',
        requiredLevel: 10
    },
```

por:

```ts
    {
        id: 'relic_dragon',
        name: 'Estandarte Dorado',
        type: 'relic',
        category: 'cosmetic',
        price: 1500,
        description: 'El emblema definitivo del clan dragón.',
        image: '🐉',
        sprite: { sheet: 'kenney', x: 850, y: 0, w: 16, h: 50 },
        cssClass: 'hue-rotate-[25deg] saturate-150',
        requiredLevel: 10
    },
```

- [ ] **Step 6: Migrar `artifact_lantern`**

Reemplazar:

```ts
    {
        id: 'artifact_lantern',
        name: 'Farol de Papel',
        type: 'artifact',
        category: 'cosmetic',
        price: 100,
        description: 'Ilumina los rincones más oscuros de tu mente.',
        image: '🏮',
        imageUrl: '/shop/artifacts/artifact_lantern-modified.png',
        requiredLevel: 2
    },
```

por:

```ts
    {
        id: 'artifact_lantern',
        name: 'Farol de Papel',
        type: 'artifact',
        category: 'cosmetic',
        price: 100,
        description: 'Ilumina los rincones más oscuros de tu mente.',
        image: '🏮',
        sprite: { sheet: 'kenney', x: 289, y: 119, w: 16, h: 16 },
        requiredLevel: 2
    },
```

- [ ] **Step 7: Migrar `artifact_bonsai`**

Reemplazar:

```ts
    {
        id: 'artifact_bonsai',
        name: 'Bonsái Milenario',
        type: 'artifact',
        category: 'cosmetic',
        price: 350,
        description: 'La paciencia materializada en una planta.',
        image: '🌳',
        imageUrl: '/shop/artifacts/artifact_bonsai-modified.png',
        requiredLevel: 4
    },
```

por:

```ts
    {
        id: 'artifact_bonsai',
        name: 'Bonsái Milenario',
        type: 'artifact',
        category: 'cosmetic',
        price: 350,
        description: 'La paciencia materializada en una planta.',
        image: '🌳',
        sprite: { sheet: 'kenney', x: 221, y: 153, w: 16, h: 16 },
        requiredLevel: 4
    },
```

- [ ] **Step 8: Borrar los assets legacy que quedaron huérfanos**

```bash
git rm "public/shop/mats/mat_wood-modified.png" "public/shop/mats/mat_jade-modified.png" "public/shop/mats/mat_obsidian-modified (1).png" "public/shop/relics/relic_dragon-modified.png" "public/shop/artifacts/artifact_lantern-modified.png" "public/shop/artifacts/artifact_bonsai-modified.png"
```

- [ ] **Step 9: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores. `imageUrl` sigue siendo un campo opcional en `ShopItem`, así que quitarlo de estos 6 objetos no rompe tipos — `DojoRoom.tsx`, `app/dojo/[username]/page.tsx` y `app/shop/page.tsx` todavía compilan, pero **hasta que se hagan los Tasks 3-5, estos 6 ítems no van a renderizar nada** (ni sprite ni imagen) si se corre la app ahora — es un estado intermedio esperado, no hace falta correr `npm run dev` recién en este punto.

- [ ] **Step 10: Commit**

```bash
git add lib/constants/items.ts
git commit -m "feat: migra 6 items cosmeticos a sprites pixel-art Kenney"
```

---

### Task 3: `DojoRoom.tsx` — renderizar `SpriteItem` cuando el item lo tenga

**Files:**
- Modify: `components/dojo/DojoRoom.tsx`

**Interfaces:**
- Consumes: `SpriteItem` (Task 1), `ShopItem.sprite` (Task 2).

- [ ] **Step 1: Importar `SpriteItem`**

Agregar el import junto a los existentes:

```tsx
import SpriteItem from '@/components/ui/SpriteItem'
```

- [ ] **Step 2: `preload` en vez de `priority` en la capa de fondo**

Reemplazar:

```tsx
                        <Image src={bgItem.imageUrl} alt={bgItem.name} fill className="object-cover opacity-90" priority />
```

por:

```tsx
                        <Image src={bgItem.imageUrl} alt={bgItem.name} fill className="object-cover opacity-90" preload />
```

- [ ] **Step 3: Capa reliquia — sprite o legacy**

Reemplazar:

```tsx
                {/* 2. CAPA RELIQUIA (Pared) */}
                {relicItem?.imageUrl && (
                    <div className="absolute top-8 w-48 h-48 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                        {/* Agregamos un filtro ligero para integrarlo */}
                        <Image src={relicItem.imageUrl} alt={relicItem.name} fill className="object-contain brightness-90 contrast-110" />
                    </div>
                )}
```

por:

```tsx
                {/* 2. CAPA RELIQUIA (Pared) */}
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
                            className={`brightness-90 contrast-110 ${relicItem.cssClass || ''}`}
                        />
                    </div>
                ) : relicItem?.imageUrl && (
                    <div className="absolute top-8 w-48 h-48 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                        {/* Agregamos un filtro ligero para integrarlo */}
                        <Image src={relicItem.imageUrl} alt={relicItem.name} fill className="object-contain brightness-90 contrast-110" />
                    </div>
                )}
```

- [ ] **Step 4: Capa tatami — sprite, legacy, o fallback CSS**

Reemplazar:

```tsx
                {/* 3. CAPA TATAMI (Suelo) - 🔥 AJUSTE DE ILUMINACIÓN */}
                {matItem?.imageUrl ? (
                    <div className="absolute bottom-12 w-[240px] h-[140px] drop-shadow-2xl">
                        {/* Le bajamos el brillo y subimos contraste para que parezca iluminado por el fuego */}
                        <Image src={matItem.imageUrl} alt={matItem.name} fill className="object-contain brightness-[0.8] contrast-[1.2]" />
                    </div>
                ) : (
                    <div className={`absolute bottom-12 w-64 h-16 rounded-[100%] blur-[8px] opacity-60 shadow-2xl ${matItem?.cssClass || 'bg-amber-900/50'}`} />
                )}
```

por:

```tsx
                {/* 3. CAPA TATAMI (Suelo) - 🔥 AJUSTE DE ILUMINACIÓN */}
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
                            className={`brightness-[0.8] contrast-[1.2] ${matItem.cssClass || ''}`}
                        />
                    </div>
                ) : matItem?.imageUrl ? (
                    <div className="absolute bottom-12 w-[240px] h-[140px] drop-shadow-2xl">
                        {/* Le bajamos el brillo y subimos contraste para que parezca iluminado por el fuego */}
                        <Image src={matItem.imageUrl} alt={matItem.name} fill className="object-contain brightness-[0.8] contrast-[1.2]" />
                    </div>
                ) : (
                    <div className={`absolute bottom-12 w-64 h-16 rounded-[100%] blur-[8px] opacity-60 shadow-2xl ${matItem?.cssClass || 'bg-amber-900/50'}`} />
                )}
```

- [ ] **Step 5: Capa artefacto — sprite o legacy**

Reemplazar:

```tsx
                {/* 5. CAPA ARTEFACTO (Primer plano) - 🔥 AJUSTE DE ILUMINACIÓN */}
                {artifactItem?.imageUrl && (
                    <div className="absolute bottom-2 left-2 w-40 h-40 z-50 drop-shadow-2xl">
                        {/* Este lo oscurecemos MUCHO más y le damos tono sepia/naranja porque está en la penumbra */}
                        <Image src={artifactItem.imageUrl} alt={artifactItem.name} fill className="object-contain brightness-[0.6] contrast-[1.1] sepia-[0.3]" />
                    </div>
                )}
```

por:

```tsx
                {/* 5. CAPA ARTEFACTO (Primer plano) - 🔥 AJUSTE DE ILUMINACIÓN */}
                {artifactItem?.sprite ? (
                    <div className="absolute bottom-2 left-2 z-50 drop-shadow-2xl">
                        <SpriteItem
                            sheet={artifactItem.sprite.sheet}
                            x={artifactItem.sprite.x}
                            y={artifactItem.sprite.y}
                            w={artifactItem.sprite.w}
                            h={artifactItem.sprite.h}
                            scale={8}
                            alt={artifactItem.name}
                            className={`brightness-[0.6] contrast-[1.1] sepia-[0.3] ${artifactItem.cssClass || ''}`}
                        />
                    </div>
                ) : artifactItem?.imageUrl && (
                    <div className="absolute bottom-2 left-2 w-40 h-40 z-50 drop-shadow-2xl">
                        {/* Este lo oscurecemos MUCHO más y le damos tono sepia/naranja porque está en la penumbra */}
                        <Image src={artifactItem.imageUrl} alt={artifactItem.name} fill className="object-contain brightness-[0.6] contrast-[1.1] sepia-[0.3]" />
                    </div>
                )}
```

- [ ] **Step 6: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores en `DojoRoom.tsx`.

- [ ] **Step 7: Commit**

```bash
git add components/dojo/DojoRoom.tsx
git commit -m "feat: DojoRoom renderiza SpriteItem para los items migrados"
```

---

### Task 4: `app/dojo/[username]/page.tsx` — mismo cambio que Task 3

**Files:**
- Modify: `app/dojo/[username]/page.tsx`

**Interfaces:**
- Consumes: `SpriteItem` (Task 1), `ShopItem.sprite` (Task 2).

Esta página duplica el mismo layout de 4 capas que `DojoRoom.tsx` para el perfil público (`/dojo/[username]`), pero sin los filtros `brightness/contrast/sepia` que tiene `DojoRoom` (esta página los renderiza "planos"). Se mantiene esa diferencia — no se le agregan filtros que hoy no tiene, solo se cambia el mecanismo de render.

- [ ] **Step 1: Importar `SpriteItem`**

```tsx
import SpriteItem from '@/components/ui/SpriteItem'
```

- [ ] **Step 2: `preload` en vez de `priority`**

Reemplazar:

```tsx
                        <Image src={bgItem.imageUrl} alt={bgItem.name} fill className="object-cover opacity-90" priority />
```

por:

```tsx
                        <Image src={bgItem.imageUrl} alt={bgItem.name} fill className="object-cover opacity-90" preload />
```

- [ ] **Step 3: Capa reliquia**

Reemplazar:

```tsx
                {/* 2. CAPA RELIQUIA */}
                {relicItem?.imageUrl && (
                    <div className="absolute top-8 w-48 h-48 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                        <Image src={relicItem.imageUrl} alt={relicItem.name} fill className="object-contain" />
                    </div>
                )}
```

por:

```tsx
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
```

- [ ] **Step 4: Capa tatami**

Reemplazar:

```tsx
                {/* 3. CAPA TATAMI */}
                {matItem?.imageUrl ? (
                    <div className="absolute bottom-12 w-[240px] h-[140px] drop-shadow-2xl">
                        <Image src={matItem.imageUrl} alt={matItem.name} fill className="object-contain" />
                    </div>
                ) : (
                    <div className={`absolute bottom-12 w-64 h-16 rounded-[100%] blur-[8px] opacity-60 shadow-2xl ${matItem?.cssClass || 'bg-amber-900/50'}`} />
                )}
```

por:

```tsx
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
```

- [ ] **Step 5: Capa artefacto**

Reemplazar:

```tsx
                {/* 5. CAPA ARTEFACTO (Izquierda) */}
                {artifactItem?.imageUrl && (
                    <div className="absolute bottom-2 left-2 w-40 h-40 z-50 opacity-90 drop-shadow-2xl">
                        <Image src={artifactItem.imageUrl} alt={artifactItem.name} fill className="object-contain" />
                    </div>
                )}
```

por:

```tsx
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

- [ ] **Step 6: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores en `app/dojo/[username]/page.tsx`.

- [ ] **Step 7: Commit**

```bash
git add "app/dojo/[username]/page.tsx"
git commit -m "feat: perfil publico del dojo renderiza SpriteItem para los items migrados"
```

---

### Task 5: `app/shop/page.tsx` — thumbnail de la grilla de la tienda

**Files:**
- Modify: `app/shop/page.tsx`

**Interfaces:**
- Consumes: `SpriteItem` (Task 1), `ShopItem.sprite` (Task 2).

El contenedor del thumbnail es `w-full h-32` (128px de alto). Los 6 sprites migrados no son todos cuadrados (el estandarte es 16×50), así que la escala se calcula por ítem para que la dimensión más larga entre en ~104px, en vez de un `scale` fijo para todos.

- [ ] **Step 1: Importar `SpriteItem`**

```tsx
import SpriteItem from '@/components/ui/SpriteItem'
```

- [ ] **Step 2: Agregar el helper de escala**

Justo antes de `export default function ShopPage()`, agregar:

```tsx
const fitScale = (w: number, h: number, target = 104) => Math.max(1, Math.floor(target / Math.max(w, h)))
```

- [ ] **Step 3: Renderizar `SpriteItem` en el thumbnail**

Reemplazar:

```tsx
                                <div className="w-full h-32 bg-black/40 rounded-xl mb-4 relative flex items-center justify-center overflow-hidden border border-white/5 group-hover:bg-black/60 transition-colors">
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className={`object-contain p-2 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 
                        ${(!owned || levelLocked) && 'opacity-50 grayscale'}`}
                                        />
                                    ) : (
                                        <span className="text-5xl opacity-50">{item.image}</span>
                                    )}

                                    {(!owned || levelLocked) && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                                            <Lock className="text-white/30" size={32} />
                                        </div>
                                    )}
                                </div>
```

por:

```tsx
                                <div className="w-full h-32 bg-black/40 rounded-xl mb-4 relative flex items-center justify-center overflow-hidden border border-white/5 group-hover:bg-black/60 transition-colors">
                                    {item.sprite ? (
                                        <SpriteItem
                                            sheet={item.sprite.sheet}
                                            x={item.sprite.x}
                                            y={item.sprite.y}
                                            w={item.sprite.w}
                                            h={item.sprite.h}
                                            scale={fitScale(item.sprite.w, item.sprite.h)}
                                            alt={item.name}
                                            className={`drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 ${item.cssClass || ''}
                        ${(!owned || levelLocked) && 'opacity-50 grayscale'}`}
                                        />
                                    ) : item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className={`object-contain p-2 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 
                        ${(!owned || levelLocked) && 'opacity-50 grayscale'}`}
                                        />
                                    ) : (
                                        <span className="text-5xl opacity-50">{item.image}</span>
                                    )}

                                    {(!owned || levelLocked) && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                                            <Lock className="text-white/30" size={32} />
                                        </div>
                                    )}
                                </div>
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: cero errores en todo el proyecto (ya deberían estar resueltos los de Task 2, Step 9).

- [ ] **Step 5: Commit**

```bash
git add app/shop/page.tsx
git commit -m "feat: grilla de la tienda renderiza SpriteItem para los items migrados"
```

---

### Task 6: Verificación visual en la app real + build

**Files:** ninguno (solo verificación).

- [ ] **Step 1: Levantar el dev server**

Run: `npm run dev`

- [ ] **Step 2: Revisar la tienda** (`/shop`, viewport mobile)

Checklist visual:
- Las 4 pestañas de categoría (`Fondos`, `Tatamis`, `Reliquias`, `Artefactos`) muestran los 6 ítems migrados como sprites pixel-art nítidos (sin blur, bordes duros), no como las fotos anteriores.
- `relic_katanas`, `relic_katana_onehanded`, `relic_mask`, `artifact_incense` y los 3 fondos siguen mostrando su imagen legacy sin cambios — no rompieron con la migración parcial.
- El estandarte (`relic_dragon`) se ve completo dentro de la tarjeta (no cortado), con un tono más dorado que el naranja original del tile.
- Los ítems bloqueados por nivel/no comprados siguen mostrando el candado y el `grayscale`.

- [ ] **Step 3: Revisar el dojo propio** (`/dojo` o donde viva `DojoRoom`, equipando cada uno de los 6 ítems migrados)

Checklist visual:
- Tatami se ve como un tile cuadrado nítido debajo de la llama, no estirado ni pixelado de más.
- Reliquia (si se equipa el estandarte) se ve centrada en la pared, proporciones correctas (no aplastada).
- Artefacto (farol o bonsái) se ve en la esquina inferior izquierda con el mismo tratamiento de sombra que antes.
- Nada de la capa de fuego ni del muro de scroll se movió de lugar.

- [ ] **Step 4: Revisar el perfil público de otro usuario** (`/dojo/[username]`, con alguno de los 6 ítems equipado)

Confirmar que se ve igual de bien que en `DojoRoom` (mismo sprite, sin los filtros brightness/contrast que sí tiene el dojo propio — esa diferencia es esperada, ver Task 4).

- [ ] **Step 5: Ajustar si algo no cierra visualmente**

Si algún `scale` queda chico/grande o algún `cssClass` no logra el tono esperado (especialmente el `hue-rotate` del estandarte), ajustar el valor en `lib/constants/items.ts` o en el layer correspondiente y repetir Step 2-4. Es esperable iterar acá — el spec pide validación visual real antes de dar por buena cada capa.

- [ ] **Step 6: Build de producción**

Run: `npm run build`
Expected: build limpio, sin errores ni warnings nuevos relacionados a `SpriteItem`, `items.ts`, `DojoRoom.tsx`, `app/dojo/[username]/page.tsx` o `app/shop/page.tsx`.

- [ ] **Step 7: Commit final si hubo ajustes en Step 5**

```bash
git add -A
git commit -m "fix: ajustes visuales de sprites tras verificacion manual"
```

(Si no hubo ajustes, este step no aplica — no hacer un commit vacío.)
