const { ChannelType, Events } = require("discord.js");
const { commandCategory } = require("../utils/other");
const { checkSameRoom } = require("../utils/music");

module.exports = (client) => {
  client.on(Events.MessageCreate, (message) => {
    if (message.author.bot) return;

    if (message.channel.type === ChannelType.DM) {
      const args = message.content.trim().split(/ +/g);

      let command = client.commands.get("chat");
      return command.run(client, message, args);
    }

    const prefix = process.env.BOT_PREFIX.toLowerCase();
    if (!message.content.toLowerCase().startsWith(prefix)) return;
    if (!message.guild) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    let command = client.commands.get(cmd);

    if (!command) command = client.commands.get(client.aliases.get(cmd));
    if (command) {
      if (command.category === commandCategory.MUSIC) {
        if (
          checkSameRoom({ message: message, interaction: null, client: client })
        )
          return;
      }
      command.run(client, message, args);
    }
  });
};
