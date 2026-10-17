require('dotenv').config();

const { createClient } = require('@libsql/client');

async function testConnection() {
    let db;

    try {
        const url = process.env.DATABASE_URL;
        const token = process.env.TURSO_AUTH_TOKEN;

        console.log('Database URL:', url);
        console.log('Token exists:', Boolean(token));
        console.log('Token length:', token?.length || 0);

        db = createClient({
            url,
            authToken: token
        });

        const result = await db.execute('SELECT 1 AS test');

        console.log('เชื่อมต่อ Turso สำเร็จ!');
        console.log(result.rows);

    } catch (error) {
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        console.error('Cause:', error.cause?.message);
    } finally {
        if (db) db.close();
    }
}

testConnection();