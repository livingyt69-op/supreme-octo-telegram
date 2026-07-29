import { SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { createTimerRows } from '../buttons/playTimerButtons.js';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Start a play timer and earn XP, coins, and time progress.'),
  async execute(interaction) {
    const embed = createEmbed({
      title: 'Play Timer',
      description: 'Choose a play duration and earn rewards automatically once the timer finishes.',
    });

    await interaction.reply({ embeds: [embed], components: createTimerRows(), ephemeral: true });
  },
};
