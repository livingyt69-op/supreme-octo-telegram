import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { updateUser, logEvent } from '../services/accountService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setplaytime')
    .setDescription('Set a user account play time in minutes.')
    .addUserOption((option) => option.setName('user').setDescription('Target user').setRequired(true))
    .addIntegerOption((option) => option.setName('minutes').setDescription('Total minutes').setRequired(true).setMinValue(0))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    const minutes = interaction.options.getInteger('minutes', true);
    const user = interaction.client.db.prepare('SELECT * FROM users WHERE discord_id = ?').get(target.id);
    if (!user) return interaction.reply({ embeds: [createEmbed({ title: 'Set Playtime', description: 'User does not have an account.' })], ephemeral: true });

    const hours = Math.floor(minutes / 60);
    updateUser(interaction.client.db, target.id, { total_minutes: minutes, total_hours: hours });
    logEvent(interaction.client.db, 'Set Playtime', target.id, `Set playtime to ${minutes} by ${interaction.user.id}`);
    await interaction.reply({ embeds: [createEmbed({ title: 'Set Playtime', description: `${target.tag}'s total playtime is now ${minutes} minutes (${hours} hours).` })], ephemeral: true });
  },
};
