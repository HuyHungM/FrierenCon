module.exports = {
  name: "close",
  run: async (client, interaction, args) => {
    try {
      await interaction.message.delete();
    } catch (error) {
      console.error(error);
    }
  },
};
