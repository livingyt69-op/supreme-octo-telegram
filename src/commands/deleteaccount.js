import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { deleteAccount, logEvent } from '../services/accountService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('deleteaccount')
    .setDescription('Delete a user account from the database.')
    .addUserOption((option) => option.setName('user').setDescription('User to delete').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    deleteAccount(interaction.client.db, target.id);
    logEvent(interaction.client.db, 'Account Deleted', target.id, `Deleted by ${interaction.user.id}`);
    await interaction.reply({ embeds: [createEmbed({ title: 'Account Deleted', description: `Account for ${target.tag} has been removed.` })], ephemeral: true });
  },
};
