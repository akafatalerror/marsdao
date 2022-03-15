const { updateTransactions } = require('../src/service')

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('transactions').del()

  await updateTransactions()
  console.log('finished');
};
