const Discord = require("discord.js");
const config = require("./config");
const request = require("request");
const sharp = require("sharp");

const client = new Discord.Client();
let regex = /\([ ]*(\1-?[0-9]*)[ ]*[|.\-,][ ]*(\2-?[0-9]*)[ ]*\)+/ig;

let canvasSize = config.canvasSize || 1000;
if(!config.siteURL || !config.discordToken) {
    console.log("Please set a site URL and Discord token in the config.");
    process.exit();
}

function getCanvasImage(x, y) {
    return new Promise((resolve, reject) => {
        request({url: `${config.siteURL}/api/board-image`, method: "GET", encoding: null}, (error, response, body) => {
            if(error) return reject(error);
            if(!body) return reject();
            let offset = ~(config.thumbnailSize / 2)
            sharp(body)
                .extract({ left: Math.min(canvasSize - config.thumbnailSize, Math.max(0, x + offset)), top: Math.min(canvasSize - config.thumbnailSize, Math.max(0, y + offset)), width: config.thumbnailSize, height: config.thumbnailSize })
                .toBuffer().then(buffer => resolve(buffer)).catch(err => reject(err));
        });
    });
}

client.on('ready', () => console.log(`Logged in as ${client.user.username}!`));

client.on('message', msg => {
    let coordResults = regex.exec(msg.cleanContent);
    if(!coordResults) return;
    let x = parseInt(coordResults[1]), y = parseInt(coordResults[2]);
    if(x === null || y === null || isNaN(x) || isNaN(y)) return;
    if(x < 0 || y < 0 || x >= canvasSize || y >= canvasSize) return;
    let link = `${config.siteURL}/#x=${x}&y=${y}`;
    let embed = new Discord.RichEmbed()
                              .setAuthor(msg.author.username, msg.author.avatarURL)
                              .setTitle("Open in Place 2.0")
                              .setDescription(`[Click here](${link}) to open the coordinates (**${x}**, **${y}**) in Place 2.0.`);
    getCanvasImage(x, y).then(image => {
        embed.setThumbnail("attachment://pixels.png");
        msg.channel.send({embed: embed, file: { attachment: image, name: "pixels.png" }});
    }).catch(err => {
        console.error("Couldn't get canvas image: " + err);
        msg.channel.sendEmbed(embed);
    })
});

client.login(config.discordToken);