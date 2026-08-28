const { Client } = require('pg');

const TEST_UID = 'c5eceaee-9345-4f98-9685-bc640dcaa291'; // nuevorecluta2, cuenta de prueba

async function asUser(client, uid) {
    await client.query(`SET LOCAL role authenticated`);
    await client.query(`SELECT set_config('request.jwt.claims', json_build_object('sub', $1::text)::text, true)`, [uid]);
}

async function main() {
    const client = new Client({
        host: process.env.SUPABASE_DB_POOLER_HOST,
        port: 5432,
        database: 'postgres',
        user: process.env.SUPABASE_DB_POOLER_USER,
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    await client.query('BEGIN');

    try {
        await asUser(client, TEST_UID);
        console.log('auth.uid() resuelve a:', (await client.query('SELECT auth.uid()')).rows[0]);

        const before = (await client.query('SELECT gold, streak_shields FROM profiles WHERE id = $1', [TEST_UID])).rows[0];
        console.log('Antes:', before);

        console.log('\n--- Comprar streak_shield (deberia funcionar) ---');
        const buy1 = await client.query('SELECT buy_item($1)', ['streak_shield']);
        console.log(buy1.rows[0]);

        const after1 = (await client.query('SELECT gold, streak_shields FROM profiles WHERE id = $1', [TEST_UID])).rows[0];
        console.log('Despues de comprar 1:', after1);

        console.log('\n--- Comprar un segundo streak_shield (debe fallar: max 1) ---');
        try {
            await client.query('SAVEPOINT sp1');
            await client.query('SELECT buy_item($1)', ['streak_shield']);
            console.log('FALLO: no debio permitir la segunda compra');
        } catch (e) {
            console.log('OK, rechazado:', e.message);
        } finally {
            await client.query('ROLLBACK TO SAVEPOINT sp1');
        }

        console.log('\n--- Comprar item nivel 10 con nivel insuficiente (debe fallar) ---');
        try {
            await client.query('SAVEPOINT sp2');
            await client.query('SELECT buy_item($1)', ['relic_dragon']);
            console.log('FALLO: no debio permitir comprar item de nivel 10');
        } catch (e) {
            console.log('OK, rechazado:', e.message);
        } finally {
            await client.query('ROLLBACK TO SAVEPOINT sp2');
        }

        console.log('\n--- Intentar fijar precio propio (la firma vieja ya no existe) ---');
        try {
            await client.query('SAVEPOINT sp3');
            await client.query('SELECT buy_item($1, $2)', ['relic_dragon', 1]);
            console.log('FALLO: la funcion vieja insegura todavia responde');
        } catch (e) {
            console.log('OK, ya no existe esa firma:', e.message);
        } finally {
            await client.query('ROLLBACK TO SAVEPOINT sp3');
        }

        console.log('\n--- equip_item sobre algo no poseido (debe fallar) ---');
        try {
            await client.query('SAVEPOINT sp4');
            await client.query('SELECT equip_item($1, $2)', ['relic', 'relic_dragon']);
            console.log('FALLO: no debio permitir equipar algo no comprado');
        } catch (e) {
            console.log('OK, rechazado:', e.message);
        } finally {
            await client.query('ROLLBACK TO SAVEPOINT sp4');
        }

        console.log('\n--- equip_item sobre un item gratis (bg_mountain, debe funcionar) ---');
        await client.query('SELECT equip_item($1, $2)', ['background', 'bg_mountain']);
        const eq = (await client.query('SELECT equipped FROM profiles WHERE id = $1', [TEST_UID])).rows[0];
        console.log('OK, equipped ahora:', eq);

        console.log('\n--- check_streak_lost con escudo disponible (racha vencida hace 3 dias) ---');
        await client.query(`UPDATE profiles SET last_active_date = CURRENT_DATE - 3, streak_count = 5 WHERE id = $1`, [TEST_UID]);
        const shieldCheck = await client.query('SELECT check_streak_lost()');
        console.log(shieldCheck.rows[0]);
        const afterShield = (await client.query('SELECT streak_count, streak_shields, last_active_date FROM profiles WHERE id = $1', [TEST_UID])).rows[0];
        console.log('Estado tras el chequeo:', afterShield);

        console.log('\n--- check_streak_lost de nuevo, sin escudo (debe perder la racha) ---');
        await client.query(`UPDATE profiles SET last_active_date = CURRENT_DATE - 3 WHERE id = $1`, [TEST_UID]);
        const lostCheck = await client.query('SELECT check_streak_lost()');
        console.log(lostCheck.rows[0]);

    } finally {
        await client.query('ROLLBACK');
        console.log('\n(ROLLBACK aplicado, nada de esto quedo guardado)');
        await client.end();
    }
}

main().catch(err => { console.error(err); process.exit(1); });
