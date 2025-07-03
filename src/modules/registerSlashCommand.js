const { REST, Routes } = require("discord.js");

module.exports = async (client) => {
  const interactionData = client.interactions.map((interaction) => ({
    name: interaction.name,
    description: interaction.description,
    type: interaction.type,
    options: interaction.options || [],
  }));

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: interactionData,
    });
  } catch (error) {
    console.error(error);
  }
};
