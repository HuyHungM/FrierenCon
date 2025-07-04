const app = require("express").Router();
const ejs = require("ejs");
const { Auth, UnAuth, validGuild } = require("../middlewares/auth");
const client = require("../../app");
const moment = require("moment");
const { PermissionsBitField, ChannelType } = require("discord.js");
const { RepeatMode } = require("distube");

app.get("/", (req, res) => {
  ejs.renderFile(
    "./src/dashboard/views/index.html",
    {
      client,
      moment,
      callbackURL: process.env.DOMAIN + process.env.CALLBACK_URL,
    },
    (err, html) => {
      if (err) {
        console.error(err);
      } else {
        res.status(200).send(html);
      }
    }
  );
});

app.get("/servers", Auth, (req, res) => {
  if (req.query.guild_id) return res.redirect(`/server/${req.query.guild_id}`);

  const user = req.user;

  user.guilds = user.guilds.filter((guild) => {
    const hasPermission = new PermissionsBitField(guild.permissions_new).has(
      PermissionsBitField.Flags.ManageGuild,
      true
    );
    if (hasPermission) {
      guild.inGuild = client.guilds.cache.has(guild.id);
      return guild;
    }
  });

  ejs.renderFile(
    "./src/dashboard/views/servers.html",
    {
      client,
      domain: process.env.DOMAIN,
      user,
      moment,
    },
    (err, html) => {
      if (err) {
        console.error(err);
      } else {
        res.status(200).send(html);
      }
    }
  );
});

app.get("/server/:guildId", Auth, validGuild, (req, res) => {
  const user = req.user;
  const guild = client.guilds.cache.get(req.params.guildId);

  ejs.renderFile(
    "./src/dashboard/views/overview.html",
    { client, guild, user, moment, ChannelType },
    (err, html) => {
      if (err) {
        console.error(err);
      } else {
        res.status(200).send(html);
      }
    }
  );
});

app.get("/server/:guildId/waifu", Auth, validGuild, async (req, res) => {
  const user = req.user;
  const guild = client.guilds.cache.get(req.params.guildId);
  let waifu = await client.waifuai.find({ ownerID: user.id });

  if (waifu) {
    waifu.messages = waifu.messages
      .slice(53)
      .filter((message) => message.role !== "system");
  }

  ejs.renderFile(
    "./src/dashboard/views/waifu.html",
    { client, guild, user, moment, waifu },
    (err, html) => {
      if (err) {
        console.error(err);
      } else {
        res.status(200).send(html);
      }
    }
  );
});

app.get("/server/:guildId/music", Auth, validGuild, (req, res) => {
  const user = req.user;
  const guild = client.guilds.cache.get(req.params.guildId);

  ejs.renderFile(
    "./src/dashboard/views/music.html",
    { client, guild, user, moment, RepeatMode },
    (err, html) => {
      if (err) {
        console.error(err);
      } else {
        res.status(200).send(html);
      }
    }
  );
});

app.get("/server/:guildId/music/search", Auth, validGuild, (req, res) => {
  const user = req.user;
  const guild = client.guilds.cache.get(req.params.guildId);

  ejs.renderFile(
    "./src/dashboard/views/musicSearch.html",
    { client, guild, user, moment, RepeatMode, ChannelType },
    (err, html) => {
      if (err) {
        console.error(err);
      } else {
        res.status(200).send(html);
      }
    }
  );
});

app.get("/server/:guildId/music/queue", Auth, validGuild, (req, res) => {
  const user = req.user;
  const guild = client.guilds.cache.get(req.params.guildId);

  ejs.renderFile(
    "./src/dashboard/views/musicQueue.html",
    { client, guild, user, moment, RepeatMode },
    (err, html) => {
      if (err) {
        console.error(err);
      } else {
        res.status(200).send(html);
      }
    }
  );
});

app.get("/login", UnAuth, (req, res) => {
  ejs.renderFile(
    "./src/dashboard/views/login.html",
    { client, callbackURL: process.env.CALLBACK_URL },
    (err, html) => {
      if (err) {
        console.error(err);
      } else {
        res.status(200).send(html);
      }
    }
  );
});

app.get("/logout", Auth, (req, res) => {
  req.logout(function () {
    res.redirect("/login");
  });
});

module.exports = app;
