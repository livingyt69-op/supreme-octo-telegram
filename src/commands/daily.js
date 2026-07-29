import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { getDailyReward, setDailyReward, addPlayTime } from '../services/accountService.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export default {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your 24-hour daily reward for coins and XP.'),
  async execute(interaction) {
    const db = interaction.client.db;
    const user = await interaction.client.db.prepare('SELECT * FROM users WHERE discord_id = ?').get(interaction.user.id);
    if (!user) {
      return interaction.reply({ embeds: [createEmbed({ title: 'Daily Reward', description: 'No account found. Use /verify first.' })], ephemeral: true });
    }

    const reward = getDailyReward(db, interaction.user.id);
    const now = Date.now();
    if (reward && now - reward.last_claimed < DAY_MS) {
      const remaining = new Date(reward.last_claimed + DAY_MS - now);
      return interaction.reply({
        embeds: [createEmbed({ title: 'Daily Reward', description: `You already claimed today. Come back in ${remaining.getUTCHours()}h ${remaining.getUTCMinutes()}m.` })],
        ephemeral: true,
      });
    }

    const coins = Math.floor(Math.random() * 25) + 10;
    const xp = Math.floor(Math.random() * 20) + 5;
    setDailyReward(db, interaction.user.id, now);
    db.prepare('UPDATE users SET coins = coins + ?, xp = xp + ? WHERE discord_id = ?').run(coins, xp, interaction.user.id);

    await interaction.reply({
      embeds: [createEmbed({ title: 'Daily Reward', description: `You claimed **${coins} coins** and **${xp} XP** today!` })],
      ephemeral: true,
    });
  },
};
