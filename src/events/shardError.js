export default {
  name: 'shardError',
  once: false,
  async execute(error, { logger }) {
    logger('Shard error', error);
  },
};
