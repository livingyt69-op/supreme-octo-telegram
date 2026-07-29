import { ActivityType } from 'discord.js';

export default {
  name: 'ready',
  once: true,
  async execute(client, { logger }) {
    logger('READY received');

    await client.user.setPresence({
      activities: [
        {
          name: 'verification startup',
          type: ActivityType.Watching,
        },
      ],
      status: 'online',
    });

    const memory = process.memoryUsage();
    logger('✓ Connected');
    logger('✓ Ready');
    logger(`Logged in as ${client.user.tag}`);
    logger(`Guild count: ${client.guilds.cache.size}`);
    logger(`Ping: ${client.ws.ping}ms`);
    logger(`Memory usage: ${(memory.rss / 1024 / 1024).toFixed(2)}MB RSS / ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB heap`);
  },
};
