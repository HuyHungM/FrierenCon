const { readdirSync } = require("fs");

module.exports = (client) => {
  const modules = readdirSync(`./src/events`).filter((file) =>
    file.endsWith(".js")
  );

  for (let file of modules) {
    require(`../events/${file}`)(client);
    console.log(`🟢 [EVENT]: Đã tải event ${file.split(".")[0]}`);
  }
};
