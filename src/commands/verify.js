import { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';

export default {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Create your game account and start tracking your progress.'),
  async execute(interaction) {
    const embed = createEmbed({
      title: 'Account Verification',
      description: 'Create your game account to start tracking your progress.',
      fields: [{ name: 'Only one account per user', value: 'Click the button below to verify your account.' }],
    });

    const button = new ButtonBuilder()
      .setCustomId('verify_create_account')
      .setLabel('✅ Create Account')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};
