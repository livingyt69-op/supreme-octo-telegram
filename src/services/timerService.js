export function getActiveTimer(db, discordId) {
  return db.prepare('SELECT * FROM timers WHERE discord_id = ?').get(discordId);
}

export function createTimer(db, discordId, durationMinutes) {
  const now = Date.now();
  const expiresAt = now + durationMinutes * 60_000;
  db.prepare(`INSERT OR REPLACE INTO timers (discord_id, expires_at, duration_minutes, started_at) VALUES (?, ?, ?, ?)`)
    .run(discordId, expiresAt, durationMinutes, now);
  return { discordId, durationMinutes, startedAt: now, expiresAt };
}

export function clearTimer(db, discordId) {
  db.prepare('DELETE FROM timers WHERE discord_id = ?').run(discordId);
}
