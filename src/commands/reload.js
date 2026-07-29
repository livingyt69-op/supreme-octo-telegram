import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { loadCommands } from '../handlers/commandHandler.js';
import { loadEvents } from '../handlers/eventHandler.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reload bot commands and event listeners without restarting.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const commandsLoaded = await loadCommands(interaction.client);
    const eventsLoaded = await loadEvents(interaction.client, console.log);
    await interaction.reply({
      embeds: [createEmbed({ title: 'Reload', description: `Reloaded ${commandsLoaded} commands and ${eventsLoaded} event listeners.` })],
      ephemeral: true,
    });
  },
};
