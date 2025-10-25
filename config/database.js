import mysql from 'mysql2/promise';

export async function getConnection() {
    try {
        const connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "1234",
            database: "db_poupeapp"
        });
        console.log('Conectado ao MySQL');
        return connection;
    } catch (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        throw err;
    }
}
