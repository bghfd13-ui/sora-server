const fs = require('fs');
const path = require('path');
const knexLib = require('knex');

const apiRoot = __dirname;
const cfgPath = path.join(apiRoot, 'config.json');

function getConfig() {
  if (!fs.existsSync(cfgPath)) {
    throw new Error('api/config.json not found');
  }

  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const knexCfg = cfg.knex || {};

  // Knex accepts either a connection string or a connection object.
  // Keep the object intact instead of passing it through string parsing.
  let connection = process.env.POSTGRES || knexCfg.connection;

  if (!connection) {
    throw new Error('No knex connection configured');
  }

  return {
    client: knexCfg.client || 'pg',
    connection: connection,
    pool: knexCfg.pool
  };
}

(async function () {
  let db;
  try {
    const cfg = getConfig();
    db = knexLib(cfg);

    const exists = await db.schema.hasColumn('user_avatar', 'thumbnail_3d_url');
    console.log('[AvatarDB] thumbnail_3d_url: ' + (exists ? 'FOUND' : 'MISSING'));

    if (!exists) {
      await db.schema.alterTable('user_avatar', function (t) {
        t.string('thumbnail_3d_url', 255).nullable();
      });
      console.log('[AvatarDB] thumbnail_3d_url: ADDED');
    }

    await db.destroy();
    process.exit(0);
  } catch (e) {
    if (db) {
      try { await db.destroy(); } catch (_) {}
    }
    console.error('[AvatarDB] FAILED: ' + e.message);
    process.exit(1);
  }
})();
