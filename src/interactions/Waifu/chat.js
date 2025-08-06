const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "chat",
  category: commandCategory.WAIFU,
  description: "Nhắn tin với bot",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "message",
      description: "tin nhắn",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  run: async (client, interaction) => {
    let waifuData = await client.waifuai.find({
      ownerID: interaction.user.id,
    });
    if (!waifuData)
      return interaction.reply({
        content:
          "Bạn chưa khởi tạo waifu cho mình. Vui lòng dùng lênh waifu-create.",
        flags: 64,
      });

    const message = interaction.options.get("message");

    if (message.value.length > 256)
      return interaction.reply({
        content: "Giới hạn kí tự 256.",
        flags: 64,
      });

    if (!waifuData?.isReplied) return;

    try {
      await interaction.deferReply();
      const res = await client.waifuai.createMessage({
        messages: waifuData.messages,
        userMessage: message.value,
        ownerID: interaction.user.id,
      });

      if (!res) return;

      interaction.editReply(res);
    } catch (error) {
      interaction.reply({ content: "Đã xảy ra lỗi", flags: 64 });
      console.error(error);
    }
  },
};
