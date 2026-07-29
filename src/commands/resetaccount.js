import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { deleteAccount, logEvent } from '../services/accountService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('resetaccount')
    .setDescription('Reset a user account back to default values.')
    .addUserOption((option) => option.setName('user').setDescription('User to reset').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    deleteAccount(interaction.client.db, target.id);
    logEvent(interaction.client.db, 'Account Reset', target.id, `Reset by ${interaction.user.id}`);
    await interaction.reply({ embeds: [createEmbed({ title: 'Account Reset', description: `Account for ${target.tag} has been reset.` })], ephemeral: true });
  },
};
