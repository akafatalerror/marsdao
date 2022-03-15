/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    await knex.schema.createTable('logs', function (table) {
        table.increments();
        table.integer('transaction_id').notNullable().index();
        table.string('address',42).notNullable().index();
        table.jsonb('topics');
        table.text('data');
        table.integer('logIndex');
        table.string('operation_type');
        table.float('tokens_number');
        table.timestamp('created_at')
        table.timestamp('updated_at')

        table.foreign('transaction_id').references('transactions.id')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    await knex.schema.dropTable('logs')
};
