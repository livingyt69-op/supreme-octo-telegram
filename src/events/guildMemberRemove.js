export default {
  name: 'guildMemberRemove',
  once: false,
  async execute(member, { logger }) {
    logger('Member Leave', member.user.tag);
  },
};
