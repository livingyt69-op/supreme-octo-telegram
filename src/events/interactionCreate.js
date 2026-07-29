import { createAccount, getAccount, addPlayTime, logEvent } from '../services/accountService.js';
import { getActiveTimer, createTimer, clearTimer } from '../services/timerService.js';
import { getTimerValue } from '../buttons/playTimerButtons.js';
import { createEmbed } from '../embeds/defaultEmbed.js';

export default {
  name: 'interactionCreate',
  once: false,
  async execute(interaction, { client, logger }) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        logger('Command error', interaction.commandName, error);
        await interaction.reply({ embeds: [createEmbed({ title: 'Error', description: 'An error occurred while executing that command.' })], ephemeral: true });
      }
      return;
    }

    if (!interaction.isButton()) return;

    if (interaction.customId === 'verify_create_account') {
      const existing = getAccount(client.db, interaction.user.id);
      if (existing) {
        return interaction.reply({ embeds: [createEmbed({ title: 'Already Verified', description: 'You already have an account.' })], ephemeral: true });
      }

      const accountId = createAccount(client.db, interaction.user, interaction.member);
      logEvent(client.db, 'Account Created', interaction.user.id, `Account ID ${accountId}`);
      return interaction.update({
        embeds: [createEmbed({ title: 'Account Created', description: `Success! Your account ID is **${accountId}**.` })],
        components: [],
      });
    }

    const timerMinutes = getTimerValue(interaction.customId);
    if (timerMinutes !== null) {
      const existingTimer = getActiveTimer(client.db, interaction.user.id);
      if (existingTimer) {
        return interaction.reply({ embeds: [createEmbed({ title: 'Timer Active', description: 'You already have an active timer.' })], ephemeral: true });
      }

      const timer = createTimer(client.db, interaction.user.id, timerMinutes);
      logEvent(client.db, 'Timer Started', interaction.user.id, `Timer ${timerMinutes} minutes`);
      const message = await interaction.update({
        embeds: [createEmbed({ title: 'Play Timer', description: `Timer started for **${timerMinutes} minutes**.` })],
        components: [],
      });

      const interval = setInterval(async () => {
        const remainingMs = timer.expiresAt - Date.now();
        if (remainingMs <= 0) {
          clearInterval(interval);
          clearTimer(client.db, interaction.user.id);
          const reward = addPlayTime(client.db, interaction.user.id, timerMinutes);
          logEvent(client.db, 'Timer Finished', interaction.user.id, `Earned ${reward.xpEarned} XP and ${reward.coinsEarned} coins`);
          await interaction.followUp({ embeds: [createEmbed({ title: 'Timer Complete', description: `Finished! You earned **${reward.xpEarned} XP** and **${reward.coinsEarned} coins**.` })], ephemeral: true });
          return;
        }

        const seconds = Math.ceil(remainingMs / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const label = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        try {
          await interaction.editReply({
            embeds: [createEmbed({ title: 'Play Timer', description: `Remaining Time\n\n**${label}**` })],
          });
        } catch {
          // ignore edit failures if ephemeral message is unavailable
        }
      }, 1000);
    }
  },
};
