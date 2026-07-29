import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { EmbedBuilder } from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, '..', '..', 'config.json');
const config = JSON.parse(await fs.readFile(configPath, 'utf8'));

export function createEmbed({ title, description, fields = [], color = config.embedColor, footer = config.footerText }) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setFooter({ text: footer })
    .addFields(fields);
}

export function createErrorEmbed(message) {
  return createEmbed({
    title: 'Error',
    description: message,
    color: 0xE74C3C,
  });
}

export function createSuccessEmbed(message) {
  return createEmbed({
    title: 'Success',
    description: message,
    color: 0x2ECC71,
  });
}
