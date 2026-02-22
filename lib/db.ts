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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_modules (
      id            TEXT PRIMARY KEY,
      profile       TEXT NOT NULL,
      language_id   TEXT NOT NULL,
      title         TEXT NOT NULL,
      description   TEXT,
      module_data   JSONB NOT NULL,
      asset_status  TEXT NOT NULL DEFAULT 'pending',
      status        TEXT NOT NULL DEFAULT 'draft',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  // Add assets column if missing
  try {
    await pool.query(`ALTER TABLE user_modules ADD COLUMN IF NOT EXISTS assets JSONB DEFAULT '{}'::jsonb`);
  } catch {
    // Column already exists
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_settings (
      profile   TEXT PRIMARY KEY,
      settings  JSONB NOT NULL DEFAULT '{}'
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

// --- User Settings ---

export async function loadSettings(profile: string): Promise<Record<string, unknown>> {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query('SELECT settings FROM user_settings WHERE profile = $1', [profile]);
  return result.rows.length > 0 ? result.rows[0].settings : {};
}

export async function saveSettings(profile: string, settings: Record<string, unknown>): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  await pool.query(
    `INSERT INTO user_settings (profile, settings)
     VALUES ($1, $2)
     ON CONFLICT (profile) DO UPDATE SET settings = $2`,
    [profile, JSON.stringify(settings)],
  );
}

// --- User Modules ---

export interface ObjectCoords {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LocationAsset {
  imageUrl: string;
  coordinates: Record<string, ObjectCoords>;
}

export interface UserModuleRow {
  id: string;
  profile: string;
  languageId: string;
  title: string;
  description: string | null;
  moduleData: object;
  assetStatus: string;
  assets: Record<string, LocationAsset>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function createModule(
  id: string,
  profile: string,
  languageId: string,
  title: string,
  description: string | null,
  moduleData: object,
): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  await pool.query(
    `INSERT INTO user_modules (id, profile, language_id, title, description, module_data)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, profile, languageId, title, description, JSON.stringify(moduleData)],
  );
}

export async function updateModule(
  id: string,
  updates: { title?: string; description?: string; moduleData?: object; assetStatus?: string; status?: string },
): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  const sets: string[] = ['updated_at = NOW()'];
  const values: unknown[] = [];
  let i = 1;

  if (updates.title !== undefined) { sets.push(`title = $${i++}`); values.push(updates.title); }
  if (updates.description !== undefined) { sets.push(`description = $${i++}`); values.push(updates.description); }
  if (updates.moduleData !== undefined) { sets.push(`module_data = $${i++}`); values.push(JSON.stringify(updates.moduleData)); }
  if (updates.assetStatus !== undefined) { sets.push(`asset_status = $${i++}`); values.push(updates.assetStatus); }
  if (updates.status !== undefined) { sets.push(`status = $${i++}`); values.push(updates.status); }

  values.push(id);
  await pool.query(`UPDATE user_modules SET ${sets.join(', ')} WHERE id = $${i}`, values);
}

export async function getModule(id: string): Promise<UserModuleRow | null> {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query('SELECT * FROM user_modules WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    profile: row.profile,
    languageId: row.language_id,
    title: row.title,
    description: row.description,
    moduleData: row.module_data,
    assetStatus: row.asset_status,
    assets: row.assets || {},
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listModules(profile: string): Promise<UserModuleRow[]> {
  await ensureSchema();
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM user_modules WHERE profile = $1 ORDER BY updated_at DESC',
    [profile],
  );
  return result.rows.map(row => ({
    id: row.id,
    profile: row.profile,
    languageId: row.language_id,
    title: row.title,
    description: row.description,
    moduleData: row.module_data,
    assetStatus: row.asset_status,
    assets: row.assets || {},
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function updateModuleAssets(
  id: string,
  locationId: string,
  imageUrl: string,
  coordinates: Record<string, ObjectCoords>,
): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  const assetData = JSON.stringify({ [locationId]: { imageUrl, coordinates } });
  await pool.query(
    `UPDATE user_modules SET assets = COALESCE(assets, '{}'::jsonb) || $1::jsonb, updated_at = NOW() WHERE id = $2`,
    [assetData, id],
  );
}

export async function updateModuleVignette(
  id: string,
  npcId: string,
  imageUrl: string,
): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  // Ensure _vignettes.npcs structure exists, then set the NPC URL
  await pool.query(
    `UPDATE user_modules SET
       assets = jsonb_set(
         jsonb_set(
           COALESCE(assets, '{}'::jsonb),
           '{_vignettes}',
           COALESCE(assets->'_vignettes', '{"npcs":{}}'::jsonb),
           true
         ),
         ARRAY['_vignettes', 'npcs', $1],
         $2::jsonb,
         true
       ),
       updated_at = NOW()
     WHERE id = $3`,
    [npcId, JSON.stringify(imageUrl), id],
  );
}

export async function updateModuleObjectVignette(
  id: string,
  objectId: string,
  variant: string,
  imageUrl: string,
): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  // Store as flat map: objects.{objectId}.{variant} = imageUrl
  // This makes regeneration idempotent (no duplicate entries)
  // Ensure intermediate keys exist: _vignettes → objects → {objectId} → {variant}
  await pool.query(
    `UPDATE user_modules SET
       assets = jsonb_set(
         jsonb_set(
           jsonb_set(
             jsonb_set(
               COALESCE(assets, '{}'::jsonb),
               '{_vignettes}',
               COALESCE(assets->'_vignettes', '{"npcs":{},"objects":{}}'::jsonb),
               true
             ),
             '{_vignettes,objects}',
             COALESCE(assets->'_vignettes'->'objects', '{}'::jsonb),
             true
           ),
           ARRAY['_vignettes', 'objects', $1],
           COALESCE(assets->'_vignettes'->'objects'->$1, '{}'::jsonb),
           true
         ),
         ARRAY['_vignettes', 'objects', $1, $2],
         $3::jsonb,
         true
       ),
       updated_at = NOW()
     WHERE id = $4`,
    [objectId, variant, JSON.stringify(imageUrl), id],
  );
}
