const { EmbedBuilder } = require("discord.js");
const { commandCategory } = require("../../utils/other.js");

module.exports = {
  name: "avatar",
  category: commandCategory.UTILITY,
  aliases: ["ava", "avt"],
  description: "Xem avatar của bạn hoặc người khác",
  usage: "avatar [@user hoặc ID]",
  run: async (client, message, args) => {
    try {
      const member =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[0]) ||
        message.member;

      if (!member) return message.reply("❌ Không tìm thấy người này.");

      const URL = member.user.displayAvatarURL({
        extension: "png",
        dynamic: true,
        size: 1024,
      });

      const embed = new EmbedBuilder()
        .setImage(URL)
        .setURL(URL)
        .setTitle(`🖼 Avatar của ${member.user.username}`)
        .setColor(client.config.getEmbedConfig().color)
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error("Avatar command error:", err);
      return message.reply("❌ Có lỗi xảy ra khi lấy avatar.");
    }
  },
};
