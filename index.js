//configuration
const Discord = require("discord.js");
const Distube = require("distube");
const client = new Discord.Client({disableMentions: "everyone"});
const config ={
    prefix: "?",
    token: process.env.TOKEN

}
const distube = new Distube(client, { searchSongs: true, emitNewSongOnly: false, highWaterMark: 1<<25})
const filters = ["3d","echo","karaoke","nightcore","vaporwave","tremolo","surround","reverse","flanger","gate"];

client.login(config.token);

client.on("ready", () => { //tag = discordusername#1234
    console.log(`Bot has logged in as : ${client.user.tag}`)
    client.user.setActivity("?help",{type: "LISTENING"});
})
//events

client.on("message", message =>{
    if(message.author.bot){ return; }
    if(!message.guild) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift();

    
    if(command === "ping"){
        return embedbuilder(client, message, "BLUE", `PING:`, `\`🏓: ${client.ws.ping} ms\!`)
    }

    if(command === "play" || command === "p") {
        embedbuilder(client, message, "YELLOW", "Searching...", args.join(" "))
        return distube.play(message, args.join(" "));
    }
    if(command === "skip" || command === "fs") {
        embedbuilder(client, message, "YELLOW", "SKIPPED POG!", `Slipped the song`)
        return distube.skip(message);
    }
    if(command === "stop" || command === "leave") {
        embedbuilder(client, message, "RED", "STOPPED!", `Left The Channel`)
        return distube.stop(message);
    }
    if(command === "seek"){
        embedbuilder(client, message, "GREEN", "Seeked!", `seeked the song for \`${args[0]} seconds\``)
        return distube.seek(message, Number(args[0]*1000));
    }
    if(filters.includes(command)){
        let filter = distube.setFilter(message, command);
        embedbuilder(client, message, "YELLOW", "Adding Filter!", filter)
    }
    if(command === "volume" || command === "vol"){

        embedbuilder(client, message, "GREEN", "VOLUME!", `changed volume to \`${args[0]} %\``)
        return distube.setVolume(message, args[0]);
    }
    if (command === "queue" || command === "qu"){
        let queue = distube.getQueue(message);
        
        let curqueue = queue.songs.map((song, id) =>
        `**${id + 1}**. ${song.name} - \`${song.formattedDuration}\``
        ).join("\n");
        return  embedbuilder(client, message, "GREEN", "Current Queue!", curqueue)

    }
    if(command === "loop" || command == "rp"){
        if(0 <= Number(args[0]) && Number(args[0]) <= 2){
            distube.setRepeatMode(message,parseInt(args[0]))
            embedbuilder(client, message, "GREEN", "Loop Mode set to:", `${args[0].replace("0", "OFF").replace("1", "Loop Song").replace("2", "Loop Queue")}`)
        }
        else{
            embedbuilder(client, message, "RED", "ERROR", `Please use a number between **0** and **2**    | *(0: disabled, 1: Repeat a song, 2: Repeat all the queue*`)
        }
        
    }
    if ( command === "jump"){
        let queue = distube.getQueue(message);
        if(0 <= Number(args[0]) && Number(args[0]) <= queue.songs.length){
            embedbuilder(client, message, "RED", "ERROR", `Jumped ${parseInt(args[0])} songs!`)
            return distube.jump(message, parseInt(args[0]))
        }
        else{
            embedbuilder(client, message, "Green", "Jumped!", `Please use a number between **0** and **${DisTube.getQueue(message).length}**   |   *(0: disabled, 1: Repeat a song, 2: Repeat all the queue)*`)
        }
    }

})

//queue
const status = (queue) => `Volume: \`${queue.volume}\` | Filter: \`${queue.filter || "OFF"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode === 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``

//distube
distube
    .on("playSong", (message, queue, song) => {
        embedbuilder(client, message, "GREEN", "Playing new Song!", `Song: \`${song.name}\`  -  \`${song.formattedDuration}\` \n\nRequested by: ${song.user}\n${status(queue)}`)
    })
    .on("addSong", (message, queue, song) => {
        embedbuilder(client, message, "GREEN", "Added a Song POG!", `Song: \`${song.name}\` - \`${song.formattedDuration}\` \n\nRequested by: ${song.user}`)
    })
    .on("playList", (message, queue, playlist, song) => {
        embedbuilder(client, message, "GREEN", "Playing Playlist YEE", `Playlist: \`${playlist.title}\` - \`${playlist.total_items} songs\` \n\nRequested by: ${song.user}\n\n Started to play Song: \`${song.name}\` - \`${song.formattedDuration}\` \n\nRequested by: ${song.user}\n\`${status(queue)}\``)
    })
    .on("addList", (message, queue, song) => {
        embedbuilder(client, message, "GREEN", "Adding A Playlist BRo", `Playlist: \`${playlist.title}\` - \`${playlist.total_items} songs\` \n\nRequested by: ${song.user}\n\n Started to play Song: \`${song.name}\` - \`${song.formattedDuration}\` \n\nRequested by: ${song.user}\``)
    })
    .on("searchResult", (message, result) => {
        let i = 0;
       embedbuilder(client, message, "YELLOW", "", `**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`);
    }) 
    // DisTubeOptions.searchSongs = true
    .on("searchCancel", (message) => embedbuilder(client, message, "RED", `Searching canceled`, "")
    )
    
    .on("error", (message, err) => embedbuilder(client, message, "RED", "An error occured damn that sucks", err)
    )


//function embeds
//embedbuilder(client, message, "RED", "TITLE", "DESCRIPTION")
function embedbuilder(client, message, color, title, description){
    let embed = new Discord.MessageEmbed()
    .setColor(color)
    .setFooter(client.user.username, client.user.displayAvatarURL());
    if(title) embed.setTitle(title);
    if(description) embed.setDescription(description);
    return message.channel.send(embed);
}