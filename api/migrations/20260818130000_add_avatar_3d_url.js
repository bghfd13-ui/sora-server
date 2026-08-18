/** Add 3D avatar thumbnail URL to user_avatar. */
exports.up = async (knex) => {
    const exists = await knex.schema.hasColumn('user_avatar', 'thumbnail_3d_url');
    if (!exists) {
        await knex.schema.table('user_avatar', (t) => {
            t.string('thumbnail_3d_url', 255).nullable();
        });
    }
};

exports.down = async (knex) => {
    const exists = await knex.schema.hasColumn('user_avatar', 'thumbnail_3d_url');
    if (exists) {
        await knex.schema.table('user_avatar', (t) => {
            t.dropColumn('thumbnail_3d_url');
        });
    }
};
