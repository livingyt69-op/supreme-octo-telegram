import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const timerButtons = [
  { label: '1 Minute', value: 1 },
  { label: '2 Minutes', value: 2 },
  { label: '5 Minutes', value: 5 },
  { label: '10 Minutes', value: 10 },
  { label: '15 Minutes', value: 15 },
  { label: '30 Minutes', value: 30 },
  { label: '1 Hour', value: 60 },
  { label: '2 Hours', value: 120 },
  { label: '5 Hours', value: 300 },
];

export function createTimerRows() {
  const rows = [];
  for (let i = 0; i < timerButtons.length; i += 3) {
    const row = new ActionRowBuilder();
    timerButtons.slice(i, i + 3).forEach((button) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`play_timer_${button.value}`)
          .setLabel(`🎮 ${button.label}`)
          .setStyle(ButtonStyle.Primary)
      );
    });
    rows.push(row);
  }
  return rows;
}

export function getTimerValue(customId) {
  const match = customId.match(/play_timer_(\d+)/);
  return match ? Number(match[1]) : null;
}
