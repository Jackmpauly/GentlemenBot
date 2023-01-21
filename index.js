const fs = require('fs')

if (process.argv.includes('--dump-config')) {
    console.log(`{
    "token": "<TOKEN>",

    "prefix": "$",
    "prefixALT": "£",
    
    "adminRole": "<NAME OF ADMIN ROLE>",
    "coAdminRole": "<NAME OF CO-ADMIN ROLE>",
    "protectedRole": "<NAME OF PROTECTED ROLE>",
    "botRole": "GentlemenBot",
    "defaultRole": "<NAME OF BASE ROLE>",
    "handicapRole": "<NAME OF HANDICAP ROLE>",

    "autoReplyID": "<ID OF USER TO REPLY TO>",
    "autoReplyContent": "Hi, user!",
    
    "customMiscCommand": "hello",
    "customMiscCommandString": "Hello world! I'm ",
    "defaultMiscCommandArg": "Gentlemen Bot",
    
    "defaultCooldownTime": "1h",
    "handicapCooldownTime": "30m",
    
    "botActivity": "a game right now",
    "botActivityType": "PLAYING",
    
    "memberIDsTxt": "SampleMemberIDs.txt",
    "quotesTxt": "SampleCommands.txt",
    
    "defaultDMMessage": "help"
}`)
    process.exit(0)
}

try {
    config = JSON.parse(fs.readFileSync('config.json'))
} catch (err) {
    console.error('Failed to read config.json:', err)
    console.error('Get a default config by running with --dump-config:')
    console.error('  $ node index.js --dump-config > config.json')
    process.exit(1)
}

const Discord = require('discord.js')
const client = new Discord.Client()

require('./global.js')

// Upon starting the bot, fill these dictionaries
refresh.refreshMemberIDs() // read the member ids text file and store to global variable "memberIDs_Dict"
refresh.refreshQuotes() // read the quotes text file and store to global variable "quotesList_Dict"


client.on('ready', () =>{
    client.user.setActivity(config.botActivity, { type: config.botActivityType })
    
    startTime = (new Date()).toLocaleString()
    startTime+=": "

    log.updateLogs( `${startTime.padEnd(27, " ")} Bot online` )

})

client.on('error', err => {
    console.error(err)
})

const commandHandler = require('./commands')
client.on('message', commandHandler);
client.login(config.token);

process.on('exit', () => {
    console.log('Shutting down...')
})