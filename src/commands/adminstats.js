import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('adminstats')
    .setDescription('View database and bot statistics.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const db = interaction.client.db;
    const totalUsers = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
    const timers = db.prepare('SELECT COUNT(*) AS count FROM timers').get().count;
    const memory = process.memoryUsage();

    const embed = createEmbed({
      title: 'Admin Stats',
      description: 'Bot internals and database statistics.',
      fields: [
        { name: 'Total Accounts', value: String(totalUsers), inline: true },
        { name: 'Active Timers', value: String(timers), inline: true },
        { name: 'Guilds', value: String(interaction.client.guilds.cache.size), inline: true },
        { name: 'Ping', value: `${interaction.client.ws.ping}ms`, inline: true },
        { name: 'Memory RSS', value: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`, inline: true },
      ],
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
