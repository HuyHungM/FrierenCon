const { readdirSync } = require("fs");

module.exports = (client) => {
  const modules = readdirSync(`./src/modules/`).filter((file) =>
    file.endsWith(".js")
  );

  for (let file of modules) {
    require(`../modules/${file}`)(client);
    console.log(`🟢 [MODULE]: Đã tải module ${file.split(".")[0]}`);
  }
};
