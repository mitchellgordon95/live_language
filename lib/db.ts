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
      profile      TEXT PRIMARY KEY,
      module       TEXT NOT NULL,
      language_id  TEXT NOT NULL DEFAULT 'spanish',
      state        JSONB NOT NULL,
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
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
     ON CONFLICT (profile) DO UPDATE
     SET state = $4, module = $2, language_id = $3, updated_at = NOW()`,
    [profile, module, languageId, JSON.stringify(state)],
  );
}

export async function loadGame(
  profile: string,
): Promise<{ module: string; languageId: string; state: Record<string, unknown> } | null> {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query(
    'SELECT module, language_id, state FROM game_saves WHERE profile = $1',
    [profile],
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return { module: row.module, languageId: row.language_id, state: row.state };
}

export async function hasSave(profile: string): Promise<{ exists: boolean; module?: string; languageId?: string }> {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query(
    'SELECT module, language_id FROM game_saves WHERE profile = $1',
    [profile],
  );
  if (result.rows.length === 0) return { exists: false };
  return { exists: true, module: result.rows[0].module, languageId: result.rows[0].language_id };
}
