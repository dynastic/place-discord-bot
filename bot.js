const Discord = require("discord.js");
const config = require("./config");
const client = new Discord.Client();
let regex = /\([ ]*(\1[0-9]*)[ ]*[|.\-,][ ]*(\2[0-9]*)[ ]*\)+/ig;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.username}!`);
});

client.on('message', msg => {
    let coordResults = regex.exec(msg.cleanContent);
    if(!coordResults) return;
    let x = parseInt(coordResults[1]), y = parseInt(coordResults[2]);
    if(!x || !y || isNaN(x) || isNaN(y)) return;
    let link = `${config.siteURL}/#x=${x}&y=${y}`;
    msg.channel.sendEmbed(new Discord.RichEmbed()
                              .setAuthor(msg.author.username, msg.author.avatarURL)
                              .setTitle("Open in Place 2.0")
                              .setDescription(`[Click here](${link}) to open the coordinates (**${x}**, **${y}**) in Place 2.0.`)
    );
});

client.login(config.discordToken);