const { Client } = require('pg');
const fs = require('fs');

async function main() {
    const file = process.argv[2];
    if (!file) {
        console.error('Uso: node scripts/apply-migration.js <archivo.sql>');
        process.exit(1);
    }
    const sql = fs.readFileSync(file, 'utf8');

    const client = new Client({
        host: process.env.SUPABASE_DB_POOLER_HOST,
        port: 5432,
        database: 'postgres',
        user: process.env.SUPABASE_DB_POOLER_USER,
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`OK: ${file} aplicada y commiteada.`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('ERROR, se hizo ROLLBACK. Nada se aplicó:');
        console.error(err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
