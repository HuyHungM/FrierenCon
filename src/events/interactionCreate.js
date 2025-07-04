const { Events } = require("discord.js");
const { commandCategory } = require("../utils/other");
const { checkSameRoom } = require("../utils/music");

module.exports = (client) => {
  client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isCommand()) return;
    if (!interaction.inGuild())
      return interaction.reply({
        content: "Slash Command chỉ có thể sử dụng trong server",
        flags: 64,
      });

    const { commandName } = interaction;
    const command = client.interactions.get(commandName);
    if (command) {
      if (command.category === commandCategory.MUSIC) {
        if (
          checkSameRoom({
            message: null,
            interaction: interaction,
            client: client,
          })
        )
          return;
      }
      command.run(client, interaction);
    }
  });
};
