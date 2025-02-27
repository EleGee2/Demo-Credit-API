import type { Knex } from 'knex';
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('wallets', (table) => {
    table.uuid('id').primary();
    table
      .uuid('user_id')
      .notNullable()
      .unique()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.decimal('ledger_balance', 12, 2).notNullable().defaultTo(0.0);
    table.decimal('available_balance', 12, 2).notNullable().defaultTo(0.0);
    table.timestamps(true, true);
  });
}
export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('wallets');
}
