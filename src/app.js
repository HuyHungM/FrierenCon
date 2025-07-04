require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const config = require("./config/config");

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

client.commands = new Collection();
client.aliases = new Collection();
client.interactions = new Collection();
client.interactionButtons = new Collection();
client.categories = readdirSync("./src/commands/");
client.config = config;
module.exports = client;

readdirSync("./src/handlers")
  .filter((file) => file.endsWith(".js"))
  .forEach((handler) => {
    require(`./handlers/${handler}`)(client);
  });

client.login(env.TOKEN);
