export async function up(knex) {
    const hasUserConnections = await knex.schema.hasTable('user_connections');

    if (!hasUserConnections) {
        await knex.schema.createTable('user_connections', (t) => {
            t.bigInteger('user_id').notNullable().unsigned().references('id').inTable('user');
            t.string('discord').nullable().defaultTo(null);
            t.string('twitter').nullable().defaultTo(null);
            t.string('tiktok').nullable().defaultTo(null);
            t.string('twitch').nullable().defaultTo(null);
            t.string('youtube').nullable().defaultTo(null);
            t.string('telegram').nullable().defaultTo(null);
            t.string('github').nullable().defaultTo(null);
            t.string('roblox').nullable().defaultTo(null);
            t.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
            t.dateTime('updated_at').notNullable().defaultTo(knex.fn.now());

            t.unique(['user_id']);
        });
    }

    const hasAvatarPageStyle = await knex.schema.hasColumn('user_settings', 'avatar_page_style');

    if (!hasAvatarPageStyle) {
        await knex.schema.alterTable('user_settings', (t) => {
            t.integer('avatar_page_style').notNullable().unsigned().defaultTo(1);
        });
    }
}

export async function down(knex) {
    const hasAvatarPageStyle = await knex.schema.hasColumn('user_settings', 'avatar_page_style');

    if (hasAvatarPageStyle) {
        await knex.schema.alterTable('user_settings', (t) => {
            t.dropColumn('avatar_page_style');
        });
    }

    const hasUserConnections = await knex.schema.hasTable('user_connections');

    if (hasUserConnections) {
        await knex.schema.dropTable('user_connections');
    }
}