/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
     await knex.schema.createTable('transactions', function(table) {
        table.increments();
        table.string('hash').notNullable().index();
        table.string('from').notNullable().index();
        table.string('to').notNullable().index();
        table.integer('blockId');
        table.integer('value');
        table.string('operation_type');
        table.integer('tokens_number');
        table.timestamp('created_at')
        table.timestamp('updated_at')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    await knex.schema.dropTable('transactions')
};
