import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary();
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .uuid('wallet_id')
      .notNullable()
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');
    table.enu('type', ['fund', 'transfer', 'withdraw']).notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table
      .enu('status', ['pending', 'completed', 'failed'])
      .defaultTo('pending');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transactions');
}
