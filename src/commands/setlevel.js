import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { updateUser, logEvent } from '../services/accountService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('Set a user account level.')
    .addUserOption((option) => option.setName('user').setDescription('Target user').setRequired(true))
    .addIntegerOption((option) => option.setName('level').setDescription('New level').setRequired(true).setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    const level = interaction.options.getInteger('level', true);
    const user = interaction.client.db.prepare('SELECT * FROM users WHERE discord_id = ?').get(target.id);
    if (!user) return interaction.reply({ embeds: [createEmbed({ title: 'Set Level', description: 'User does not have an account.' })], ephemeral: true });

    updateUser(interaction.client.db, target.id, { level });
    logEvent(interaction.client.db, 'Set Level', target.id, `Set level to ${level} by ${interaction.user.id}`);
    await interaction.reply({ embeds: [createEmbed({ title: 'Set Level', description: `${target.tag}'s level is now ${level}.` })], ephemeral: true });
  },
};
