import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { updateUser, calculateLevel, logEvent } from '../services/accountService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addxp')
    .setDescription('Add XP to a user account.')
    .addUserOption((option) => option.setName('user').setDescription('Target user').setRequired(true))
    .addIntegerOption((option) => option.setName('amount').setDescription('XP amount').setRequired(true).setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);
    const user = interaction.client.db.prepare('SELECT * FROM users WHERE discord_id = ?').get(target.id);
    if (!user) return interaction.reply({ embeds: [createEmbed({ title: 'Add XP', description: 'User does not have an account.' })], ephemeral: true });

    const xp = user.xp + amount;
    const level = calculateLevel(xp);
    updateUser(interaction.client.db, target.id, { xp, level });
    logEvent(interaction.client.db, 'Add XP', target.id, `Added ${amount} XP by ${interaction.user.id}`);
    await interaction.reply({ embeds: [createEmbed({ title: 'Add XP', description: `${amount} XP added to ${target.tag}. New level: ${level}.` })], ephemeral: true });
  },
};
