const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { commandCategory } = require("../../utils/other.js");

module.exports = {
  name: "ping",
  category: commandCategory.UTILITY,
  description: "Ping của bot",
  type: ApplicationCommandType.ChatInput,
  options: [],
  run: (client, interaction) => {
    let circles = {
      green: "🟢",
      yellow: "🟡",
      red: "🔴",
    };
    const latency = Date.now() - interaction.createdTimestamp;
    const ws = client.ws.ping;
    const vcLatency = "N/A";

    const embedData = {
      title: ":ping_pong: . . . pong!",
      fields: [
        {
          name: "📶 **|** API",
          value: `${
            latency <= 200
              ? circles.green
              : latency <= 400
              ? circles.yellow
              : circles.red
          } **\`${latency}\`** ms`,
          inline: true,
        },
        {
          name: "🌐 **|** WebSocket",
          value: `${
            ws <= 200 ? circles.green : ws <= 400 ? circles.yellow : circles.red
          } **\`${ws}\`** ms`,
          inline: true,
        },
        {
          name: "🔊 **|** Voice",
          value: `**\`${vcLatency}\`** ms`,
          inline: true,
        },
      ],
      footer: {
        text: `Ping của ${client.user.tag}`,
        iconURL: client.user.displayAvatarURL(),
      },
      timestamp: new Date(),
    };

    const embed = new EmbedBuilder(embedData).setColor(
      client.config.getEmbedConfig().color
    );

    interaction.reply({ embeds: [embed], flags: 64 });
  },
};
