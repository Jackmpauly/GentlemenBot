const Discord = require('discord.js')
config = require('./config.json') // On Github, this should be replaced by config2.json
client = new Discord.Client()

require('./global.js')

refresh.refreshMemberIDs()

refresh.refresh()

client.on('ready', () =>{
    THEGENTLEMEN_GUILD = client.guilds.cache.get(config.guild)
    client.user.setActivity(config.botActivity, { type: config.botActivityType })
    
    startTime = (new Date()).toLocaleString()
    startTime+=": "

    log.updateLogs( `${startTime.padEnd(27, " ")} Bot online` )
})

const commandHandler = require('./commands')
client.on('message', commandHandler);
client.login(config.token);