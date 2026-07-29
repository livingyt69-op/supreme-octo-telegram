import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureEventMap(client) {
  if (!client._loadedEvents) client._loadedEvents = new Map();
  return client._loadedEvents;
}

export async function loadEvents(client, logger) {
  const eventsPath = path.join(__dirname, '..', 'events');
  const entries = await fs.readdir(eventsPath, { withFileTypes: true }).catch(() => []);
  const eventFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.js'));
  const modules = await Promise.all(eventFiles.map((entry) => import(path.join(eventsPath, entry.name))));

  const loadedEvents = ensureEventMap(client);
  for (const module of modules) {
    const event = module.default;
    if (!event?.name || typeof event.execute !== 'function') {
      logger(`Skipped invalid event module: ${module}`);
      continue;
    }

    if (loadedEvents.has(event.name)) {
      const previous = loadedEvents.get(event.name);
      client.off(event.name, previous);
    }

    const listener = (...args) => event.execute(...args, { client, logger });
    loadedEvents.set(event.name, listener);
    if (event.once) client.once(event.name, listener);
    else client.on(event.name, listener);
  }

  return eventFiles.length;
}
