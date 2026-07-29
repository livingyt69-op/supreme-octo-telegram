export default {
  name: 'guildMemberAdd',
  once: false,
  async execute(member, { logger }) {
    logger('Member Join', member.user.tag);
  },
};
