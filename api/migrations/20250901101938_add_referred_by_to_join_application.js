export async function up(knex) {
  await knex.schema.alterTable('join_application', (table) => {
    table.bigInteger('referred_by').unsigned().references('id').inTable('user').nullable();
    // ^ adjust type / references depending on your schema
  });
}

export async function down(knex) {
  await knex.schema.alterTable('join_application', (table) => {
    table.dropColumn('referred_by');
  });
}

