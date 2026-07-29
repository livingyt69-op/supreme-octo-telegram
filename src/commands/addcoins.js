import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { updateUser, logEvent } from '../services/accountService.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addcoins')
    .setDescription('Add coins to a user account.')
    .addUserOption((option) => option.setName('user').setDescription('Target user').setRequired(true))
    .addIntegerOption((option) => option.setName('amount').setDescription('Coin amount').setRequired(true).setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const target = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);
    const user = interaction.client.db.prepare('SELECT * FROM users WHERE discord_id = ?').get(target.id);
    if (!user) return interaction.reply({ embeds: [createEmbed({ title: 'Add Coins', description: 'User does not have an account.' })], ephemeral: true });

    updateUser(interaction.client.db, target.id, { coins: user.coins + amount });
    logEvent(interaction.client.db, 'Add Coins', target.id, `Added ${amount} coins by ${interaction.user.id}`);
    await interaction.reply({ embeds: [createEmbed({ title: 'Add Coins', description: `${amount} coins added to ${target.tag}.` })], ephemeral: true });
  },
};
