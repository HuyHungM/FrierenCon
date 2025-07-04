const { ApplicationCommandType } = require("discord.js");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "dm-chat",
  category: commandCategory.WAIFU,
  description: "Nhắn riêng với bot",
  type: ApplicationCommandType.ChatInput,
  options: [],
  run: async (client, interaction) => {
    let waifuData = await client.waifuai.find({ ownerID: interaction.user.id });
    if (!waifuData)
      return interaction.reply({
        content: `Bạn chưa khởi tạo waifu cho mình. Vui lòng dùng lênh ${process.env.PREFIX}waifu-create.`,
        flags: 64,
      });

    interaction.user.createDM();
    interaction.reply({
      content: `Bạn có thể qua <@${client.user.id}> để chat tiếp.`,
      flags: 64,
    });
  },
};
