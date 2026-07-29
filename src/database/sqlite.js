import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databasePath = path.join(__dirname, '..', 'database.sqlite');

export function initDatabase(logger = console.log) {
  const db = new Database(databasePath, { fileMustExist: false, readonly: false });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');

  const createTables = db.transaction(() => {
    db.prepare(`CREATE TABLE IF NOT EXISTS users (
      discord_id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      global_name TEXT,
      display_name TEXT,
      avatar_url TEXT,
      created_at TEXT NOT NULL,
      verified_at TEXT,
      account_id TEXT UNIQUE NOT NULL,
      level INTEGER NOT NULL DEFAULT 1,
      xp INTEGER NOT NULL DEFAULT 0,
      coins INTEGER NOT NULL DEFAULT 0,
      total_minutes INTEGER NOT NULL DEFAULT 0,
      total_hours INTEGER NOT NULL DEFAULT 0,
      daily_streak INTEGER NOT NULL DEFAULT 0,
      last_login TEXT,
      last_play TEXT,
      verified INTEGER NOT NULL DEFAULT 0
    );`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS timers (
      discord_id TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      duration_minutes INTEGER NOT NULL,
      started_at INTEGER NOT NULL,
      FOREIGN KEY(discord_id) REFERENCES users(discord_id) ON DELETE CASCADE
    );`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS daily_rewards (
      discord_id TEXT PRIMARY KEY,
      last_claimed INTEGER NOT NULL,
      streak INTEGER NOT NULL DEFAULT 0,
      total_claims INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(discord_id) REFERENCES users(discord_id) ON DELETE CASCADE
    );`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      discord_id TEXT,
      details TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS leaderboard_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      xp INTEGER NOT NULL DEFAULT 0,
      coins INTEGER NOT NULL DEFAULT 0,
      total_minutes INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    );`).run();
  });

  createTables();
  logger('✓ Database ready');
  return db;
}
