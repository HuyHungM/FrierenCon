const { Events } = require("discord.js");

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton() || !interaction.inGuild()) return;
    const interactionID = interaction.customId;
    const args = interactionID.trim().split(/ +/g);
    const cmd = args.shift();

    const command = client.interactionButtons.get(cmd);
    if (command) command.run(client, interaction, args);
  });
};
