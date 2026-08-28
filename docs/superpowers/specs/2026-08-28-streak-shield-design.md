# Escudo de Racha + Compra Segura de Tienda

**Fecha:** 2026-08-28
**Estado:** Aprobado

## Contexto

Auditoría previa (Fase 1) detectó que la tienda calcula el descuento de oro en el cliente y lo escribe directo vía `supabase.from('profiles').update(...)`. Introspección de la base confirmó el hueco con evidencia dura:

- `profiles.gold`, `xp`, `level`, `streak_count`, etc. tienen GRANT de `UPDATE` para `authenticated` sin restricción de columna.
- Ya existían `buy_item(item_id, price)` y `equip_item(slot, item_id)` en la base, pero abandonadas: `buy_item` recibe el precio como parámetro del cliente (no lo valida), no chequea nivel requerido, y ambas leen/escriben `profiles.inventory`, columna que el frontend actual no usa (usa `purchased_items`). Ninguna está conectada al código vivo.

Este trabajo tiene dos objetivos combinados: (1) el Escudo de Racha como feature de producto, (2) usarlo como vehículo para migrar toda la compra de la tienda a un flujo server-authoritative, reescribiendo las RPCs existentes en vez de dejarlas huérfanas.

## Objetivo

Un ítem consumible ("Amuleto de Persistencia") que protege la racha del usuario una vez cuando `check_streak_lost` detectaría pérdida. Máximo 1 unidad en posesión a la vez. Precio: 500 oro.

## Modelo de datos

**Tabla nueva `shop_items`** (fuente de verdad server-side de precio/nivel/tipo; hoy solo vive en `lib/constants/items.ts`, invisible para Postgres):

| columna | tipo | notas |
|---|---|---|
| id | text PK | mismo id que usa `lib/constants/items.ts` |
| name | text | |
| price | integer | |
| required_level | integer | default 1 |
| category | text | `'cosmetic'` \| `'consumable'` |
| slot | text | `'background'`\|`'mat'`\|`'relic'`\|`'artifact'`\|null (consumibles no tienen slot) |

Se puebla con los ítems ya existentes en `items.ts` + el nuevo `streak_shield`.

**Columna nueva** `profiles.streak_shields integer default 0` — separada de `purchased_items` porque el escudo se consume y se recompra (no es un unlock permanente como un fondo o reliquia).

## RPCs

**`buy_item(item_id text)`** — reemplaza la versión rota (mismo nombre, ya no recibe `price` por parámetro):
1. Lee precio/nivel/categoría de `shop_items` por `item_id`.
2. Valida `gold >= price` y `level >= required_level`.
3. Si `category = 'cosmetic'`: valida que no esté ya en `purchased_items`, lo agrega, descuenta oro.
4. Si `item_id = 'streak_shield'`: valida `streak_shields < 1` (regla de máximo 1), incrementa `streak_shields`, descuenta oro.
5. Todo en una sola transacción (la función completa).

**`equip_item(slot text, item_id text)`** — reescrita para validar contra `purchased_items` en vez de `inventory`.

**`check_streak_lost()`** — antes de resetear `streak_count`, si `streak_shields > 0`: decrementa el escudo en 1, NO resetea la racha, devuelve `'shielded'` en vez de `true`/`false`. El frontend distingue este caso para mostrar un modal distinto ("tu amuleto te salvó") en lugar de `StreakLostModal`.

## Frontend

- `ShopPage.handleBuy` / `handleEquip`: dejan de hacer `.update()` directo, llaman a `supabase.rpc('buy_item', { item_id })` / `equip_item`.
- `lib/constants/items.ts`: sigue siendo el catálogo visual (nombre, imagen, descripción). El precio mostrado es solo referencia — la validación real ocurre server-side. Se agrega la entrada `streak_shield` con `category: 'consumable'`.
- `StreakWatcher.tsx`: interpreta el nuevo resultado `'shielded'` de `check_streak_lost` y muestra un modal/toast distinto al de `StreakLostModal`.
- `TopUserBar` o similar: indicador visual de si el usuario tiene un escudo activo (icono junto al oro).

## Fuera de alcance

- No se toca la tabla `dojos` (existe, no la usa el frontend actual, parece otro intento abandonado — se deja intacta).
- No se borra la columna `inventory` de `profiles` (queda huérfana por las dudas de que algo más la referencie; limpieza para más adelante).
- Cofres de recompensa y Misiones Diarias son sub-proyectos separados, no entran en este spec.

## Testing

Sin infraestructura de tests todavía (pendiente de Fase 2 del audit). Verificación manual: `tsc --noEmit`, `npm run build`, y prueba funcional en el navegador del flujo de compra del escudo y de la pérdida de racha protegida.
