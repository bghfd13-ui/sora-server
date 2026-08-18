const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function getConnection() {
  if (process.env.POSTGRES && process.env.POSTGRES.trim()) {
    return process.env.POSTGRES.trim();
  }
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
  return cfg.knex.connection;
}

async function main() {
  const client = new Client({ connectionString: getConnection() });
  await client.connect();
  try {
    const info = await client.query('SELECT current_database() AS db, current_user AS usr');
    console.log(`[AvatarDB] database=${info.rows[0].db} user=${info.rows[0].usr}`);

    const exists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'user_avatar'
          AND column_name = 'thumbnail_3d_url'
      ) AS exists
    `);

    if (!exists.rows[0].exists) {
      await client.query('ALTER TABLE user_avatar ADD COLUMN thumbnail_3d_url VARCHAR(255) NULL');
      console.log('[AvatarDB] Added user_avatar.thumbnail_3d_url');
    } else {
      console.log('[AvatarDB] thumbnail_3d_url already exists');
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[AvatarDB] FAILED:', err.message);
  process.exit(1);
});
