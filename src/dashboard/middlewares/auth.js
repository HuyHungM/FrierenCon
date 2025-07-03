const client = require("../../app");

const Auth = (req, res, next) => {
  if (!req.isAuthenticated()) return res.redirect("/login");
  else next();
};

const UnAuth = (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect("/servers");
  else next();
};

const validGuild = (req, res, next) => {
  const user = req.user;
  const guildId = req.params.guildId;

  let guild = user.guilds.find((guild) => guild.id === guildId);

  if (!guild || !client.guilds.cache.has(guildId))
    return res.redirect("/servers");
  else next();
};

module.exports = { Auth, UnAuth, validGuild };
