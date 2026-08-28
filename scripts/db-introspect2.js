const { Client } = require('pg');

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

    for (const fn of ['buy_item', 'equip_item', 'give_honor', 'get_honor_status', 'search_users', 'get_leaderboard', 'handle_new_user']) {
        console.log(`\n=== DEFINITION: ${fn} ===`);
        const def = await client.query(`
      SELECT pg_get_functiondef(p.oid) as def
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = $1
    `, [fn]);
        def.rows.forEach(r => console.log(r.def));
        if (def.rows.length === 0) console.log('(no encontrada)');
    }

    console.log('\n=== COLUMNS: dojos, honors ===');
    const cols = await client.query(`
    SELECT table_name, column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name IN ('dojos', 'honors')
    ORDER BY table_name, ordinal_position
  `);
    console.table(cols.rows);

    console.log('\n=== RLS POLICIES: dojos, honors, friendships, scrolls ===');
    const policies = await client.query(`
    SELECT tablename, policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('dojos', 'honors', 'friendships', 'scrolls')
    ORDER BY tablename, policyname
  `);
    console.table(policies.rows);

    console.log('\n=== GRANTS on profiles for anon/authenticated ===');
    const grants = await client.query(`
    SELECT grantee, privilege_type, column_name
    FROM information_schema.column_privileges
    WHERE table_schema = 'public' AND table_name = 'profiles' AND grantee IN ('anon', 'authenticated')
    ORDER BY column_name, grantee
  `);
    console.table(grants.rows);

    await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
