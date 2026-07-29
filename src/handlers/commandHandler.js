import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands(client) {
  const commandsDirectory = path.join(__dirname, '..', 'commands');
  const entries = await fs.readdir(commandsDirectory, { withFileTypes: true }).catch(() => []);
  const modules = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
      .map((entry) => import(path.join(commandsDirectory, entry.name)))
  );

  const loaded = modules.reduce((count, module) => {
    const command = module.default;
    if (!command?.data?.name) return count;
    client.commands.set(command.data.name, command);
    return count + 1;
  }, 0);

  return loaded;
}
