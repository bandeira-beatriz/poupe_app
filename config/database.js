import mysql from 'mysql2/promise';

export async function getConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'db_poupeapp'
        });
        console.log('Conectado ao MySQL');
        return connection;
    } catch (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        throw err;
    }
}
