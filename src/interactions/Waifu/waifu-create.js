const {
  ApplicationCommandType,
  ApplicationCommandOptionType,
} = require("discord.js");
const AIConfig = require("../../config/AIConfig");

module.exports = {
  name: "waifu-create",
  description: "Tạo waifu cho bạn",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "name",
      description: "tên của waifu",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ],
  run: async (client, interaction) => {
    const waifuData = await client.waifuai.find({ ownerID: interaction.id });
    if (waifuData)
      return interaction.reply({
        content:
          "Bạn đã khởi tạo waifu cho riêng mình. Vui lòng dùng lệnh waifu-delete để tạo mới.",
        ephemeral: true,
      });

    try {
      await client.waifuai.create({
        name: interaction.options.get("name").value,
        ownerID: interaction.user.id,
        messages: AIConfig.getStarterMessage(
          interaction,
          interaction.options.get("name").value
        ),
      });

      interaction.reply({
        content: `Đã khởi tạo thành công waifu của bạn với tên \`${
          interaction.options.get("name").value
        }\`\nGiờ đây bạn có thể chat với em ấy với lệnh ${
          process.env.PREFIX
        }chat hoặc <@${client.user.id}>`,
        ephemeral: true,
      });
      interaction.user.createDM();
      interaction.user.send("Chào anh nhé :heart:");
    } catch (error) {
      interaction.reply({
        content: "Đã xảy ra lỗi khi khởi tạo waifu cho bạn.",
        ephemeral: true,
      });
      console.error(error);
    }
  },
};
