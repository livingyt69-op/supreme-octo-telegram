import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { updateUser, logEvent } from '../services/accountService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unverifyuser')
    .setDescription('Remove verification status from a user account.')
    .addUserOption((option) => option.setName('user').setDescription('Target user').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    const user = interaction.client.db.prepare('SELECT * FROM users WHERE discord_id = ?').get(target.id);
    if (!user) return interaction.reply({ embeds: [createEmbed({ title: 'Unverify User', description: 'User does not have an account.' })], ephemeral: true });

    updateUser(interaction.client.db, target.id, { verified: 0 });
    logEvent(interaction.client.db, 'User Unverified', target.id, `Unverified by ${interaction.user.id}`);
    await interaction.reply({ embeds: [createEmbed({ title: 'Unverify User', description: `${target.tag} is no longer verified.` })], ephemeral: true });
  },
};
