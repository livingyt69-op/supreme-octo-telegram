import fs from 'fs';
import { randomUUID } from 'crypto';

export function createAccount(db, user, member) {
  const accountId = `ACC-${randomUUID().slice(0, 8).toUpperCase()}`;
  const displayName = member?.displayName || user.username;
  const globalName = user.globalName || '';
  const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 256 });

  db.prepare(`INSERT INTO users (
    discord_id, username, global_name, display_name, avatar_url, created_at, verified_at, account_id, level, xp, coins, total_minutes, total_hours, daily_streak, last_login, last_play, verified
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 0, 0, 0, ?, ?, 1)`)
    .run(user.id, user.username, globalName, displayName, avatarUrl, new Date(user.createdTimestamp).toISOString(), new Date().toISOString(), accountId, new Date().toISOString(), new Date().toISOString());
  return accountId;
}

export function getAccount(db, discordId) {
  return db.prepare('SELECT * FROM users WHERE discord_id = ?').get(discordId);
}

export function getLeaderboard(db, field, limit = 10) {
  return db.prepare(`SELECT username, account_id, ${field} FROM users ORDER BY ${field} DESC LIMIT ?`).all(limit);
}

export function updateUser(db, discordId, updates) {
  const keys = Object.keys(updates);
  if (!keys.length) return;
  const setters = keys.map((key) => `${key} = ?`).join(', ');
  const values = keys.map((key) => updates[key]);
  values.push(discordId);
  db.prepare(`UPDATE users SET ${setters} WHERE discord_id = ?`).run(...values);
}

export function addPlayTime(db, discordId, minutes) {
  const user = getAccount(db, discordId);
  if (!user) return null;
  const additionalXp = minutes;
  const additionalCoins = Math.max(1, Math.floor(minutes / 2));
  const newXp = user.xp + additionalXp;
  const newLevel = calculateLevel(newXp);
  const newTotalMinutes = user.total_minutes + minutes;
  const newTotalHours = Math.floor(newTotalMinutes / 60);

  db.prepare(`UPDATE users SET xp = ?, coins = coins + ?, total_minutes = ?, total_hours = ?, last_play = ?, level = ? WHERE discord_id = ?`)
    .run(newXp, additionalCoins, newTotalMinutes, newTotalHours, new Date().toISOString(), newLevel, discordId);

  return {
    xpEarned: additionalXp,
    coinsEarned: additionalCoins,
    level: newLevel,
    totalMinutes: newTotalMinutes,
    totalHours: newTotalHours,
  };
}

export function calculateLevel(xp) {
  return Math.max(1, Math.floor((Math.sqrt(1 + (8 * xp) / 100) - 1) / 2) + 1);
}

export function setDailyReward(db, discordId, timestamp) {
  const existing = db.prepare('SELECT * FROM daily_rewards WHERE discord_id = ?').get(discordId);
  if (existing) {
    db.prepare('UPDATE daily_rewards SET last_claimed = ?, streak = streak + 1, total_claims = total_claims + 1 WHERE discord_id = ?').run(timestamp, discordId);
  } else {
    db.prepare('INSERT INTO daily_rewards (discord_id, last_claimed, streak, total_claims) VALUES (?, ?, 1, 1)').run(discordId, timestamp);
  }
  return db.prepare('SELECT * FROM daily_rewards WHERE discord_id = ?').get(discordId);
}

export function getDailyReward(db, discordId) {
  return db.prepare('SELECT * FROM daily_rewards WHERE discord_id = ?').get(discordId);
}

export function deleteAccount(db, discordId) {
  db.prepare('DELETE FROM users WHERE discord_id = ?').run(discordId);
}

export function logEvent(db, type, discordId, details) {
  db.prepare('INSERT INTO logs (type, discord_id, details) VALUES (?, ?, ?)').run(type, discordId, details);
}

export function backupDatabase(sourcePath, destinationPath) {
  return new Promise((resolve, reject) => {
    const read = fs.createReadStream(sourcePath);
    const write = fs.createWriteStream(destinationPath);

    read.on('error', reject);
    write.on('error', reject);
    write.on('close', resolve);
    read.pipe(write);
  });
}
