const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "waifu-delete",
  aliases: ["w-delete"],
  category: commandCategory.WAIFU,
  description: "Xoá waifu cho bạn",
  usage: "waifu-delete",
  run: async (client, message, args) => {
    const waifuData = await client.waifuai.find({ ownerID: message.author.id });
    if (!waifuData) return message.reply("Waifu của bạn chưa tồn tại");

    await message.author.createDM();
    await message.author.dmChannel?.messages?.fetch().then((messages) => {
      messages
        .filter((message) => message.author.id === client.user.id)
        .forEach(async (msg) => {
          await msg.delete();
        });
    });
    await message.author.deleteDM();

    const deleteWaifuData = await client.waifuai.delete({
      ownerID: message.author.id,
    });

    if (deleteWaifuData == 1) message.reply(`Đã xoá thành công waifu của bạn.`);
    else message.reply("Đã xảy ra lỗi khi xoá waifu cho bạn.");
  },
};
