const { EmbedBuilder } = require("discord.js");
const { CommandCategory } = require("../../utils/other");
const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");

module.exports = {
  name: "join",
  aliases: [],
  category: CommandCategory.MUSIC,
  description: "Tham gia kênh thoại",
  usage: "join",
  run: async (client, message, args) => {
    const userChannel = message.member.voice.channel;
    const botChannel = message.guild.members.me.voice.channel;

    if (!userChannel) {
      return message.reply({
        content: "Bạn phải vào kênh thoại để sử dụng lệnh này!",
      });
    }

    if (
      !userChannel
        .permissionsFor(message.guild.members.me)
        .has(["Connect", "Speak"])
    ) {
      return message.reply({
        content: "Tôi không có quyền tham gia kênh thoại này!",
      });
    }

    const queue = client.distube.getQueue(message.guild.id);

    if (botChannel && botChannel.id === userChannel.id) {
      return message.reply({
        content: `**${client.user.username}** hiện đang ở cùng phòng với bạn!`,
      });
    }

    if (botChannel && botChannel.id !== userChannel.id) {
      try {
        await message.guild.members.me.voice.setChannel(userChannel);

        if (queue) {
          queue.voiceChannel = userChannel;
        }

        if (!queue?.playing) {
          queue.resume();
        }

        const embed = new EmbedBuilder()
          .setDescription(
            `🔀 \`${client.user.username}\` **đã chuyển nhạc sang phòng** \`${userChannel.name}\`**!**`
          )
          .setColor(client.config.getEmbedConfig().color);

        return message.channel.send({ embeds: [embed] });
      } catch (error) {
        console.error("Error moving to voice channel:", error);
        return message.reply({
          content: "Đã xảy ra lỗi khi chuyển phòng thoại!",
        });
      }
    }

    try {
      await client.distube.voices.join(userChannel);

      const embed = new EmbedBuilder()
        .setDescription(
          `🎵 \`${client.user.username}\` **đã tham gia phòng** \`${userChannel.name}\`**!**`
        )
        .setColor(client.config.getEmbedConfig().color);

      return message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Error joining voice channel:", error);
      return message.reply({
        content: "Đã xảy ra lỗi khi tham gia phòng thoại!",
      });
    }
  },
};
