const express = require("express");
const { static } = require("express");
const session = require("express-session");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { readdirSync } = require("fs");
const DiscordStrategy = require("passport-discord").Strategy;
const passport = require("passport");
const { OAuth2Scopes, Events } = require("discord.js");

module.exports = (client) => {
  client.once(Events.ClientReady, function () {
    app.use(static("./src/dashboard/public"));

    app.use(bodyParser.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(
      session({
        secret: env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 30,
          httpOnly: true,
        },
      })
    );

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, done) {
      done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
      done(null, obj);
    });

    passport.use(
      new DiscordStrategy(
        {
          clientID: env.CLIENT_ID,
          clientSecret: env.CLIENT_SECRET_ID,
          callbackURL: `${env.DOMAIN}${env.CALLBACK_URL}`,
          scope: `${OAuth2Scopes.Identify} ${OAuth2Scopes.Guilds} ${OAuth2Scopes.GuildsJoin} ${OAuth2Scopes.Email}`,
        },
        function (accessToken, refreshToken, profile, done) {
          process.nextTick(function () {
            return done(null, profile);
          });
        }
      )
    );

    app.get(
      env.CALLBACK_URL,
      passport.authenticate("discord", {
        failureRedirect: env.FAILURE_REDIRECT,
      }),
      function (req, res) {
        res.redirect("/servers");
      }
    );

    const routes = readdirSync("./src/dashboard/routes").filter((file) =>
      file.endsWith(".js")
    );

    for (let file of routes) {
      const route = require(`../dashboard/routes/${file}`);
      app.use("/", route);
    }

    require("../dashboard/api/socket.js")(client, io);

    app.use((req, res, next) => {
      ejs.renderFile(
        "./src/dashboard/views/error.html",
        { client },
        (err, html) => {
          if (err) {
            console.error(err);
            // xử lý lỗi ở đây nếu cần
          } else {
            res.status(404).send(html);
          }
        }
      );
    });

    server.listen(env.PORT, () =>
      console.log(
        `🟢 [DASHBOARD]: Dashboard đã được mở tại địa chỉ ${env.DOMAIN}`
      )
    );
    app.set("view engine", "ejs");
  });
};
