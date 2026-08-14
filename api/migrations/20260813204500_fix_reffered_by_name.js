export async function up(knex) {
    const hasOld = await knex.schema.hasColumn('join_application', 'referred_by');
    const hasExpected = await knex.schema.hasColumn('join_application', 'reffered_by');

    if (hasOld && !hasExpected) {
        await knex.raw('ALTER TABLE "join_application" RENAME COLUMN "referred_by" TO "reffered_by"');
    }
}

export async function down(knex) {
    const hasOld = await knex.schema.hasColumn('join_application', 'reffered_by');
    const hasCorrect = await knex.schema.hasColumn('join_application', 'referred_by');

    if (hasOld && !hasCorrect) {
        await knex.raw('ALTER TABLE "join_application" RENAME COLUMN "reffered_by" TO "referred_by"');
    }
}