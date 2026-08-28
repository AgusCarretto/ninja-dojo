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

    console.log('=== COLUMNS: profiles ===');
    const profileCols = await client.query(`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
    ORDER BY ordinal_position
  `);
    console.table(profileCols.rows);

    console.log('=== COLUMNS: tasks ===');
    const taskCols = await client.query(`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tasks'
    ORDER BY ordinal_position
  `);
    console.table(taskCols.rows);

    console.log('=== ALL TABLES in public schema ===');
    const tables = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `);
    console.log(tables.rows.map(r => r.table_name).join(', '));

    console.log('=== FUNCTIONS in public schema ===');
    const funcs = await client.query(`
    SELECT proname FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' ORDER BY proname
  `);
    console.log(funcs.rows.map(r => r.proname).join(', '));

    for (const fn of ['complete_task', 'check_streak_lost']) {
        console.log(`\n=== DEFINITION: ${fn} ===`);
        const def = await client.query(`
      SELECT pg_get_functiondef(p.oid) as def
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.proname = $1
    `, [fn]);
        def.rows.forEach(r => console.log(r.def));
    }

    console.log('\n=== RLS POLICIES: profiles, tasks ===');
    const policies = await client.query(`
    SELECT tablename, policyname, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('profiles', 'tasks')
    ORDER BY tablename, policyname
  `);
    console.table(policies.rows);

    await client.end();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
