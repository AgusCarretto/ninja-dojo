-- CREATE OR REPLACE FUNCTION no reemplaza una funcion con distinta firma (Postgres la trata
-- como un overload nuevo). La migracion anterior dejo viva la version vieja e insegura
-- buy_item(item_id text, price integer), que confiaba en el precio enviado por el cliente.
DROP FUNCTION IF EXISTS public.buy_item(text, integer);
