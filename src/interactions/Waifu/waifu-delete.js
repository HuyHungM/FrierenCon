const { ApplicationCommandType } = require("discord.js");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "waifu-delete",
  category: commandCategory.WAIFU,
  description: "Xoá waifu cho bạn",
  type: ApplicationCommandType.ChatInput,
  options: [],
  run: async (client, interaction) => {
    const waifuData = await client.waifuai.find({
      ownerID: interaction.user.id,
    });
    if (!waifuData)
      return interaction.reply({
        content: "Waifu của bạn chưa tồn tại",
        flags: 64,
      });

    try {
      await interaction.user.createDM();
      await interaction.user.dmChannel?.messages?.fetch().then((messages) => {
        messages
          .filter((message) => message.author.id === client.user.id)
          .forEach(async (msg) => {
            await msg.delete();
          });
      });
      await interaction.user.deleteDM();

      const deleteWaifuData = await client.waifuai.delete({
        ownerID: interaction.user.id,
      });

      if (deleteWaifuData == 1)
        interaction.reply({
          content: `Đã xoá thành công waifu của bạn.`,
          flags: 64,
        });
      else
        interaction.reply({
          content: "Đã xảy ra lỗi khi xoá waifu cho bạn.",
          flags: 64,
        });
    } catch (error) {
      interaction.reply({
        content: "Đã xảy ra lỗi khi xoá waifu cho bạn.",
        flags: 64,
      });
      console.error(error);
    }
  },
};
