/**
 * Add 3D avatar thumbnail URL to user_avatar
 * @param {import('knex')} knex
 */
exports.up = async (knex) => {
    const hasColumn = await knex.schema.hasColumn('user_avatar', 'thumbnail_3d_url');

    if (!hasColumn) {
        await knex.schema.table('user_avatar', (t) => {
            t.string('thumbnail_3d_url', 255).nullable();
        });
    }
};

/**
 * Remove 3D avatar thumbnail URL
 * @param {import('knex')} knex
 */
exports.down = async (knex) => {
    const hasColumn = await knex.schema.hasColumn('user_avatar', 'thumbnail_3d_url');

    if (hasColumn) {
        await knex.schema.table('user_avatar', (t) => {
            t.dropColumn('thumbnail_3d_url');
        });
    }
};