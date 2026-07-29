import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { updateUser, logEvent } from '../services/accountService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('verifyuser')
    .setDescription('Mark a user account as verified.')
    .addUserOption((option) => option.setName('user').setDescription('Target user').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    const user = interaction.client.db.prepare('SELECT * FROM users WHERE discord_id = ?').get(target.id);
    if (!user) return interaction.reply({ embeds: [createEmbed({ title: 'Verify User', description: 'User does not have an account.' })], ephemeral: true });

    updateUser(interaction.client.db, target.id, { verified: 1, verified_at: new Date().toISOString() });
    logEvent(interaction.client.db, 'User Verified', target.id, `Verified by ${interaction.user.id}`);
    await interaction.reply({ embeds: [createEmbed({ title: 'Verify User', description: `${target.tag} is now verified.` })], ephemeral: true });
  },
};
