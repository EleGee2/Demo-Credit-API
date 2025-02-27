import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('wallet_ledger', (table) => {
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
    table
      .uuid('transaction_id')
      .notNullable()
      .references('id')
      .inTable('transactions')
      .onDelete('CASCADE');
    table.enu('type', ['fund', 'transfer', 'withdraw']).notNullable();
    table.enu('direction', ['credit', 'debit']).notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.decimal('previous_balance', 12, 2).notNullable();
    table.decimal('new_balance', 12, 2).notNullable();
    table
      .enu('status', ['pending', 'completed', 'failed'])
      .defaultTo('pending');
    table.string('description').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('wallet_ledger');
}
