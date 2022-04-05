// Import/ Require the .js files for each of the commands 
const noprefix      = require("./commands/noPrefix.js")
const settings      = require("./commands/botSettings.js")
const jueves        = require("./commands/jueves.js")
const cooldown      = require("./commands/cooldown.js")

const reset         = require("./commands/reset.js")
const say           = require("./commands/say.js")

const directMessage = require("./commands/DM.js")
const mute          = require("./commands/mute.js")
const deafen        = require("./commands/deafen.js")
const boot          = require("./commands/boot.js")
const nickname      = require("./commands/nickname.js")

const cancel        = require("./commands/cancel.js")

const debug         = require("./commands/debug.js")
const mimic         = require("./commands/mimic.js")

module.exports = async function (msg) {
    // The (mostly) global variables set up upon message sent
    message = msg
    M_AUTHOR = message.author;
    let args = "null"
    commandBody = ""

    // Splitting the message by word
    if( message.content.charAt(0) == config.prefix || message.content.charAt(0) == config.prefixALT){
        args = message.content.substring(1).split(" ")
    }
    
    commandCalled = args[0]

    let response = "" // What the bot should say in response, if anything.

    // Account for bot functions that aren't called by a command (cancelled follow up & permission)
    noprefix()

    // The switch-case 
    switch(args[0]){
        case 'tts': // Modify bot settings
            response = settings.tts()
            break
        case 'immunity':
            response = settings.immunity()
            break
        case 'useNick':
        case 'usenick':
            response = settings.usenick()
            break
        case 'jueves': // Command for jueves, checks if today is Thursday
            response = jueves(args)
            break
        case 'cooldown': // Commands for users to check their cooldowns
        case 'cd':
            response = cooldown.cd()
            break
        case 'cooldowns':
        case 'cds':
            response = cooldown.cds()
            break
        case 'logs': // See the last 10 commands used and who called them
            response = log.logs()
            break
        case 'refresh': // Refresh the quotes
            response = refresh.refresh()
            break
        case 'reset': // Reset all cooldowns
            response = reset()
            break
        case 'say': // Send a message as the bot
            response = say(args)
            break
        case 'mimic': // Send a message as anyone else
            response = mimic(args)
            break
        case 'message': // Have the bot DM someone
            response = directMessage.DM(args)
            break
        case 'mute': // The mute, deafen, boot, and setNick commands
            response = mute.mute()
            break
        case 'selfdeafen':
        case 'deafenme':
            response = deafen.selfDeafen()
            break
        case 'deafen':
            response = deafen.deafen()
            break
        case 'boot':
            response = boot.boot(args)
            break
        case 'setNick':
        case 'setnick':
            response = nickname(args)
            break
        case 'cancel': // Cancelling someone
            response = cancel(args)
            break
        case 'unmute': // Debugging and testing commands
        case 'debugme':
            response = debug()
            break
        case 'test':
            break
        default: // Check if the command is a part of the quotes dictionary
            response = quotes.quote(args[0], args[1])
            break
    }

    // If the user's message results in a command with a valid response, send the response and log the activity
    if( response && (typeof response == "string") ){
        message.channel.send(response)
        log.logActivity()
    }
}