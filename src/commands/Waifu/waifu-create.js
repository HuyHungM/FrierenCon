const AIConfig = require("../../config/AIConfig");
const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "waifu-create",
  aliases: ["w-create"],
  category: commandCategory.WAIFU,
  description: "Tạo waifu cho bạn",
  usage: "waifu-create <tên>",
  run: async (client, message, args) => {
    const waifuData = await client.waifuai.find({ ownerID: message.author.id });
    if (waifuData)
      return message.reply(
        "Bạn đã khởi tạo waifu cho riêng mình. Vui lòng dùng lệnh waifu-delete để tạo mới."
      );

    if (args.length == 0)
      return message.reply("Vui lòng đặt tên cho waifu của bạn.");

    try {
      await client.waifuai.create({
        name: args.join(" "),
        ownerID: message.author.id,
        messages: AIConfig.getStarterMessage(message, args),
      });

      message.reply(
        `Đã khởi tạo thành công waifu của bạn với tên \`${args.join(
          " "
        )}\`\nGiờ đây bạn có thể chat với em ấy với lệnh ${
          process.env.BOT_PREFIX
        }chat hoặc <@${client.user.id}>`
      );

      message.author.createDM();
      message.author.send("Chào anh nhé :heart:");
    } catch (error) {
      message.reply("Đã xảy ra lỗi khi khởi tạo waifu cho bạn.");
      console.error(error);
    }
  },
};
