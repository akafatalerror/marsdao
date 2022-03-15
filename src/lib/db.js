const Knex = require("knex");

const cfg = {
    pgHost: process.env.DATABASE_HOST,
    pgUser: process.env.DATABASE_USER,
    pgDatabase: process.env.DATABASE_NAME,
    pgPassword: process.env.DATABASE_PASS,
    pgPort: process.env.DATABASE_PORT,
    pgPool: { min: 1, max: 1000 },
}
exports.db = Knex({
    client: 'pg',
    connection: {
        user: cfg.pgUser,
        host: cfg.pgHost,
        database: cfg.pgDatabase,
        password: cfg.pgPassword,
        port: Number(cfg.pgPort),
    },

    pool: { min: cfg.pgPool.min, max: cfg.pgPool.max },
    debug: false,
})
