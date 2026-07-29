import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { getLeaderboard } from '../services/accountService.js';

const leaderboards = [
  { field: 'xp', title: 'Most XP' },
  { field: 'coins', title: 'Most Coins' },
  { field: 'total_minutes', title: 'Most Playtime' },
];

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top 10 leaderboard for XP, coins, and playtime.'),
  async execute(interaction) {
    const db = interaction.client.db;
    const lines = leaderboards.map((item) => {
      const rows = getLeaderboard(db, item.field, 10).map((entry, index) => `${index + 1}. ${entry.username} — ${entry[item.field]}`).join('\n');
      return `**${item.title}**\n${rows}`;
    });

    const embed = createEmbed({
      title: 'Leaderboard',
      description: lines.join('\n\n'),
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
