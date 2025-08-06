const {
  EmbedBuilder,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");
const {
  noMusicEmbed,
  VolumeIcon,
  LoopModeMessage,
  AutoplayModeMessage,
  LoopModeEmote,
} = require("../utils/music");

module.exports = {
  name: "pause-queue",
  run: async (client, interaction, args) => {
    const queue = client.distube.getQueue(interaction);

    if (!queue) return interaction.reply({ embeds: [noMusicEmbed], flags: 64 });

    if (queue.paused) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Bài hát hiện đã tạm dừng!**`,
      }).setColor(client.config.getEmbedConfig().color);

      return interaction.reply({ embeds: [embed], flags: 64 });
    }

    try {
      await queue.pause();

      const song = queue.songs[0];

      const embedData = {
        title: `🎶  Hiện đang phát ♪`,
        description: `[${song.name}](${song.url}) - \`${song.formattedDuration}\` \n**   Yêu cầu bởi:** ${song.user}`,
        fields: [
          {
            name: `${
              queue.volume <= 35
                ? VolumeIcon.low
                : queue.volume <= 70
                ? VolumeIcon.medium
                : VolumeIcon.high
            } Âm lượng: `,
            value: `\`${queue.volume}%\``,
            inline: true,
          },
          {
            name: "Chế độ lặp lại: ",
            value: `\`${LoopModeMessage[queue.repeatMode]}\``,
            inline: true,
          },
          {
            name: "Tự động phát: ",
            value: `\`${AutoplayModeMessage[queue.autoplay]}\``,
            inline: true,
          },
          {
            name: "Filters: ",
            value: `\`${queue.filters.names.join(", ") || "Tắt"}\``,
            inline: true,
          },
        ],
        thumbnail: {
          url: song.thumbnail,
        },
        footer: {
          text: client.config.getEmbedConfig().footer,
          iconURL: client.user.displayAvatarURL(),
        },
        timestamp: new Date(),
      };

      const embed = new EmbedBuilder(embedData).setColor(
        client.config.getEmbedConfig().color
      );

      // Create Button Row
      const rowComponents_1 = [
        new ButtonBuilder({
          custom_id: `autoplay ${queue.id}`,
          emoji: `🔎`,
          style: ButtonStyle.Primary,
        }),
        new ButtonBuilder({
          custom_id: `previous-track ${queue.id}`,
          emoji: "⏮",
          style: ButtonStyle.Primary,
        }),
        new ButtonBuilder({
          custom_id: `${queue.playing ? "pause-queue" : "resume-queue"} ${
            queue.id
          }`,
          emoji: `${queue.playing ? "⏸" : "▶"}`,
          style: ButtonStyle.Primary,
        }),
        new ButtonBuilder({
          custom_id: `next-track ${queue.id}`,
          emoji: "⏮",
          style: ButtonStyle.Primary,
        }),
        new ButtonBuilder({
          custom_id: `loop ${queue.id}`,
          emoji: `${LoopModeEmote[queue.repeatMode]}`,
          style: ButtonStyle.Primary,
        }),
      ];

      const row_1 = new ActionRowBuilder({
        components: rowComponents_1,
      });

      const row_2 = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            custom_id: `stop-queue ${queue.id}`,
            emoji: "🛑",
            style: ButtonStyle.Danger,
          }),
        ],
      });

      //Send Info Message
      interaction.message.delete();
      let msg = await interaction.reply({
        embeds: [embed],
        components: [row_1, row_2],
      });
      client.playingSong.set(queue.textChannel.guildId, msg);
    } catch (error) {
      const embed = new EmbedBuilder({
        description: `${client.config.emotes.error} **Đã xảy ra lỗi!**`,
      }).setColor(client.config.getEmbedConfig().errorColor);
      interaction.reply({ embeds: [embed], flags: 64 });
      console.error(error);
    }
  },
};
