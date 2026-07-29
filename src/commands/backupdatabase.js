import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed } from '../embeds/defaultEmbed.js';
import { backupDatabase } from '../services/accountService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  data: new SlashCommandBuilder()
    .setName('backupdatabase')
    .setDescription('Create a backup copy of the SQLite database.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const source = path.join(__dirname, '..', '..', 'database.sqlite');
    const destination = path.join(__dirname, '..', '..', `backup-${Date.now()}.sqlite`);
    await backupDatabase(source, destination);
    await interaction.reply({ embeds: [createEmbed({ title: 'Backup Database', description: `Backup created at ${destination}` })], ephemeral: true });
  },
};
