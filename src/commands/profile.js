import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { getAccount } from '../services/accountService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your verification profile and statistics.'),
  async execute(interaction) {
    const db = interaction.client.db;
    const user = getAccount(db, interaction.user.id);
    if (!user) {
      return interaction.reply({ embeds: [createEmbed({ title: 'Profile', description: 'No account found. Use /verify first.' })], ephemeral: true });
    }

    const embed = createEmbed({
      title: `${interaction.user.username}'s Profile`,
      description: 'Your verification and game progress summary.',
      fields: [
        { name: 'Verified', value: user.verified ? 'Yes' : 'No', inline: true },
        { name: 'Account ID', value: user.account_id, inline: true },
        { name: 'Level', value: String(user.level), inline: true },
        { name: 'XP', value: String(user.xp), inline: true },
        { name: 'Coins', value: String(user.coins), inline: true },
        { name: 'Daily Streak', value: String(user.daily_streak), inline: true },
        { name: 'Total Hours', value: String(user.total_hours), inline: true },
        { name: 'Total Minutes', value: String(user.total_minutes), inline: true },
        { name: 'Created', value: user.created_at, inline: false },
        { name: 'Last Played', value: user.last_play || 'Never', inline: false },
      ],
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
