import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { updateUser, calculateLevel, logEvent } from '../services/accountService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setxp')
    .setDescription('Set a user account XP value.')
    .addUserOption((option) => option.setName('user').setDescription('Target user').setRequired(true))
    .addIntegerOption((option) => option.setName('amount').setDescription('New XP amount').setRequired(true).setMinValue(0))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    const xp = interaction.options.getInteger('amount', true);
    const user = interaction.client.db.prepare('SELECT * FROM users WHERE discord_id = ?').get(target.id);
    if (!user) return interaction.reply({ embeds: [createEmbed({ title: 'Set XP', description: 'User does not have an account.' })], ephemeral: true });

    const level = calculateLevel(xp);
    updateUser(interaction.client.db, target.id, { xp, level });
    logEvent(interaction.client.db, 'Set XP', target.id, `Set XP to ${xp} by ${interaction.user.id}`);
    await interaction.reply({ embeds: [createEmbed({ title: 'Set XP', description: `${target.tag}'s XP is now ${xp} and level ${level}.` })], ephemeral: true });
  },
};
