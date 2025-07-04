const { commandCategory } = require("../../utils/other");

module.exports = {
  name: "dm-chat",
  aliases: ["dm", "dm-c", "ib"],
  category: commandCategory.WAIFU,
  description: "Nhắn riêng với bot",
  usage: "dm-chat",
  run: async (client, message, args) => {
    let waifuData = await client.waifuai.find({ ownerID: message.author.id });
    if (!waifuData)
      return message.reply(
        `Bạn chưa khởi tạo waifu cho mình. Vui lòng dùng lênh ${process.env.PREFIX}waifu-create.`
      );

    message.author.createDM();
    message.reply(`Bạn có thể qua <@${client.user.id}> để chat tiếp.`);
  },
};
