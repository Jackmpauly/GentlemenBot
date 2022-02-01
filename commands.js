

const settings = require("./commands/botSettings.js");
const jueves = require("./commands/jueves.js")
const cooldown = require("./commands/cooldown.js")

const reset = require("./commands/reset.js")
const say = require("./commands/say.js")

const directMessage = require("./commands/DM.js")
const mute = require("./commands/mute.js")
const deafen = require("./commands/deafen.js")
const boot = require("./commands/boot.js")
const nickname = require("./commands/nickname.js")

const cancel = require("./commands/cancel.js")

const debug = require("./commands/debug.js")
const test = require("./commands/test.js");

module.exports = async function (msg) {
    // The (mostly) global variables...
    message = msg
    M_AUTHOR = message.author;
    let args = "null"
    commandBody = ""

    if( message.content.charAt(0) == config.prefix || message.content.charAt(0) == config.prefixALT){
        args = message.content.substring(1).split(" ")
    }
    
    commandCalled = args[0]

    let response = "" // What the bot should say in response, if anything.


    // CANCELLED !!
    if( aux.messageSentInGuild(false) && canceled.has( message.guild.members.cache.get(M_AUTHOR.id) ) ){
        message.reply(` you are ${canceled.get(message.guild.members.cache.get(M_AUTHOR.id))}`);
        canceled.delete( message.guild.members.cache.get(M_AUTHOR.id) )
    }

    // PERMISSION !!
    if(  message.content === "Permission" || message.content === "permission" || message.content === "Permission?" || message.content === "permission?" ){
        if( M_AUTHOR.id === config.evanID ){
            message.channel.send("Granted");
        }else{
            message.channel.send("PERMISSION DENIED");
        }
    }

    switch(args[0]){
        case 'tts':
            settings.tts()
            break
        case 'immunity':
            settings.immunity()
            break
        case 'useNick':
        case 'usenick':
            settings.usenick()
            break
        case 'jueves':
            response = jueves()
            break
        case 'cooldown':
        case 'cd':
            response = cooldown.cd()
            break
        case 'cooldowns':
        case 'cds':
            response = cooldown.cds()
            break
        case 'logs':
            response = log.logs()
            break
        case 'refresh':
            response = refresh.check()
            break
        case 'reset':
            response = reset()
            break
        case 'say':
            response = say(args)
            break
        case 'message':
            response = directMessage.DM(args)
            break
        case 'mute':
            response = mute.check()
            break
        case 'selfdeafen':
        case 'deafenme':
            response = deafen.selfDeafen()
            break
        case 'deafen':
            response = deafen.deafen()
            break
        case 'boot':
            response = boot.check(args)
            break
        case 'setNick':
        case 'setnick':
            response = nickname(args)
            break
        case 'cancel':
            response = cancel(args)
            break

        case 'unmute':
        case 'debugme':
            response = debug()
            break
        case 'test':
            response = test.tst()
            break
        default:
            response = quotes.check(args[0], args[1])
            break

    }

    if( response ){
        message.channel.send(response)
        log.logActivity()
    }
}