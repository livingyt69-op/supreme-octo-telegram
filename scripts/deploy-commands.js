import fs from 'fs/promises';
import path from 'path';
import { REST, Routes } from 'discord.js';

const configPath = path.join(process.cwd(), 'config.json');
const config = JSON.parse(await fs.readFile(configPath, 'utf8'));

const commandsPath = path.join(process.cwd(), 'src', 'commands');

async function loadCommandData() {
  const entries = await fs.readdir(commandsPath, { withFileTypes: true }).catch(() => []);
  const modules = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
      .map((entry) => import(path.join(commandsPath, entry.name)))
  );

  return modules
    .map((module) => module.default)
    .filter((command) => command?.data?.toJSON)
    .map((command) => command.data.toJSON());
}

async function deploy() {
  const commands = await loadCommandData();
  const rest = new REST({ version: '10' }).setToken(config.token);

  if (!config.guildId) {
    console.error('Missing guildId in config.json');
    process.exit(1);
  }

  console.log(`Deploying ${commands.length} commands to guild ${config.guildId}`);

  await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
    body: commands,
  });

  console.log('Commands deployed successfully.');
}

deploy().catch((error) => {
  console.error('Command deployment failed:', error);
  process.exit(1);
});
