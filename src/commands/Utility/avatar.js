const { EmbedBuilder } = require("discord.js");
const { commandCategory } = require("../../utils/other.js");

module.exports = {
  name: "avatar",
  category: commandCategory.UTILITY,
  aliases: ["ava", "avt"],
  usage: "avatar",
  run: (client, message, args) => {
    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.member;
    const URL = member.user.displayAvatarURL({
      format: "jpg",
      dynamic: true,
      size: 1024,
    });
    const embed = new EmbedBuilder()
      .setImage(URL)
      .setURL(URL)
      .setTitle("Tải ở đây!")
      .setColor(client.config.getEmbedConfig().color)
      .setTimestamp();
    message.channel.send({ embeds: [embed] });
  },
};
