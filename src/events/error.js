export default {
  name: 'error',
  once: false,
  async execute(error, { logger }) {
    logger('Discord client error', error);
  },
};
