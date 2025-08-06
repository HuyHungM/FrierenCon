const { EmbedBuilder } = require("discord.js");
const { RepeatMode } = require("distube");
const client = require("../app");

const checkSameRoom = ({ message, interaction, client }) => {
  if (message) {
    if (!message.member.voice.channelId) {
      return message.reply({
        content: "Bạn phải vào kênh thoại để sử dụng lệnh này!",
        flags: 64,
      });
    }

    if (
      !client.distube.getQueue(message.guildId)?.voiceChannel?.id ||
      client.distube.getQueue(message.guildId)?.voiceChannel?.id ===
        message.member.voice.channelId
    )
      return;
    else {
      return message.reply({
        content: "Bạn phải vào chung phòng với bot để sử dụng lệnh này!",
        flags: 64,
      });
    }
  } else {
    if (!interaction.member.voice.channelId)
      return interaction.reply({
        content: "Bạn phải vào kênh thoại để sử dụng lệnh này!",
        flags: 64,
      });

    if (
      !client.distube.getQueue(interaction.guildId)?.voiceChannel?.id ||
      client.distube.getQueue(interaction.guildId)?.voiceChannel?.id ===
        interaction.member.voice.channelId
    )
      return;
    else {
      return interaction.reply({
        content: "Bạn phải vào chung phòng với bot để sử dụng lệnh này!",
        flags: 64,
      });
    }
  }
};

const noMusicEmbed = new EmbedBuilder({
  description: `${client.config.emotes.error} **Hiện tại không có bài hát nào đang phát!**`,
}).setColor(client.config.getEmbedConfig().errorColor);

const LoopModeEmote = {
  [RepeatMode.DISABLED]: "⭕",
  [RepeatMode.SONG]: "🔂",
  [RepeatMode.QUEUE]: "🔁",
};

const LoopModeMessage = {
  [RepeatMode.DISABLED]: "Tắt",
  [RepeatMode.SONG]: "Lặp lại bài hát",
  [RepeatMode.QUEUE]: "Lặp lại hàng đợi",
};

const AutoplayModeMessage = {
  [false]: "Tắt",
  [true]: "Bật",
};

const FilterSubCommand = {
  ADD: "add",
  REMOVE: "remove",
  CLEAR: "clear",
  ACTIVES: "actives",
  LIST: "list",
};

const VolumeIcon = {
  low: "🔈",
  medium: "🔉",
  high: "🔊",
};

module.exports = {
  checkSameRoom,
  noMusicEmbed,
  FilterSubCommand,
  LoopModeEmote,
  LoopModeMessage,
  AutoplayModeMessage,
  VolumeIcon,
};
