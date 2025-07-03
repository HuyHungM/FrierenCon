const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const { model } = require("../../config/AIConfig");
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
        ephemeral: true,
      });

    const message = interaction.options.get("message");

    if (message.value.length > 256)
      return interaction.reply({
        content: "Giới hạn kí tự 256.",
        ephemeral: true,
      });

    if (!waifuData?.isReplied) return;

    try {
      interaction.reply({ content: "`Đang soạn...`", ephemeral: true });
      waifuData.messages.push({ role: "user", content: message.value });
      const res = await client.waifuai.createMessage({
        messages: waifuData.messages,
        waifuName: waifuData.name,
        model: model,
        ownerID: interaction.user.id,
        ownerName: interaction.author.username,
      });

      if (!res) return;

      interaction.editReply(res.choices[0].message.content);
    } catch (error) {
      interaction.reply({ content: "Đã xảy ra lỗi", ephemeral: true });
      console.error(error);
    }
  },
};
