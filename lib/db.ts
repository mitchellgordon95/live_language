import 'server-only';
import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

let schemaReady = false;

function getPool(): Pool {
  if (!globalThis._pgPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    globalThis._pgPool = new Pool({ connectionString, max: 5 });
  }
  return globalThis._pgPool;
}

async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS game_saves (
      profile      TEXT NOT NULL,
      module       TEXT NOT NULL,
      language_id  TEXT NOT NULL DEFAULT 'spanish',
      state        JSONB NOT NULL,
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (profile, language_id)
    )
  `);
  // Migrate old schema: widen PK from (profile) to (profile, language_id)
  try {
    await pool.query(`
      ALTER TABLE game_saves DROP CONSTRAINT game_saves_pkey;
      ALTER TABLE game_saves ADD PRIMARY KEY (profile, language_id);
    `);
  } catch {
    // Already migrated — composite PK exists
  }
  schemaReady = true;
}

export async function saveGame(
  profile: string,
  module: string,
  languageId: string,
  state: object,
): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  await pool.query(
    `INSERT INTO game_saves (profile, module, language_id, state, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (profile, language_id) DO UPDATE
     SET state = $4, module = $2, updated_at = NOW()`,
    [profile, module, languageId, JSON.stringify(state)],
  );
}

export async function loadGame(
  profile: string,
  languageId: string,
): Promise<{ module: string; languageId: string; state: Record<string, unknown> } | null> {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query(
    'SELECT module, language_id, state FROM game_saves WHERE profile = $1 AND language_id = $2',
    [profile, languageId],
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return { module: row.module, languageId: row.language_id, state: row.state };
}

export async function listSaves(profile: string): Promise<Array<{ languageId: string; module: string }>> {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query(
    'SELECT language_id, module FROM game_saves WHERE profile = $1 ORDER BY updated_at DESC',
    [profile],
  );
  return result.rows.map(row => ({ languageId: row.language_id, module: row.module }));
}
