const Discord = require('discord.js')
const config = require('./config.json')
const client = new Discord.Client()

const ms = require('ms')
const fs = require('fs')
const { REPL_MODE_SLOPPY } = require('repl')

// COOLDOWN SETS
const muteCooldown = new Set()
const muteList     = new Set()
const bootCooldown = new Set()
const nickCooldown = new Set()
const msgCooldown = new Set()

// COOLDOWN TIMES
const muteTime              = ms('10s')
const defaultCooldownTime   = ms('1h')
const handicapCooldownTime  = ms('30m')
let cooldownTime            = defaultCooldownTime

const PREFIX = '$'
const PREFIX_ALT = '£'
var textToSpeech = false

var quotesList_Dict = {}
var logs = ""

var logUpdateCount = 0
var memberIDs_Dict = {}

function getMemberIDs(){
    fs.readFile(config.memberIDsTxt, 'utf8', (err, data) => {
        if(err) throw err;
        var text = data.toString().split('\n')

        var tmp;
        for(let i=0; i<text.length; ++i){
            tmp = text[i].split('|')
            memberIDs_Dict[ tmp[0] ] = tmp[1];
        }

    })
}

getMemberIDs()

function newRefresh(){
    fs.readFile(config.quotesTxt, 'utf8', (err, data) => {
        if(err) throw err;
        var text = data.toString().split('\n')

        quotesList_Dict = {}
        for(let i=0; i<text.length; ++i){
            quotesList_Dict[ text[i].substring(0, text[i].indexOf(':') ) ] = text[i].substring( text[i].indexOf(':')+1 ).split('|')
        }

    })
    logs = "";
}

newRefresh()


// Function to update the logs in the console and in the logs string
function updateLogs(logText){
    logUpdateCount++;
    if(logUpdateCount >= 10){
        logs = "";
        logUpdateCount = 0;
    }
    logs += logText+"\n";
    
    console.log(logText);
}


client.on('ready', () =>{
    THEGENTLEMEN_GUILD = client.guilds.cache.get(config.guild)
    client.user.setActivity(config.botActivity, { type: 4})

    let datetime = new Date().toLocaleString()
    datetime+=": "
    let logString = datetime.padEnd(27, " ")+'Bot online'

    updateLogs(logString)
})


client.on('message', message=>{
    let M_AUTHOR = message.author;
    let args = "null"
    if( message.content.charAt(0) == PREFIX || message.content.charAt(0) == PREFIX_ALT){
        args = message.content.substring(1).split(" ")
    }

    let response = "" // What the bot should say in response, if anything.

    // function to push activity to the updateLogs() function, which updates them
    function logActivity(){
        let datetime = new Date().toLocaleString()
        datetime+=": "
        let logString = ""
        logString+=( datetime.padEnd(27, " ") )+ "@"+M_AUTHOR.username +" called: $" + args[0];
        updateLogs(logString)
    }

    // Function that takes in an array and an index, spits out a string
    function sayQuote(arrayText, quoteIndex){
        var resp = 0

        if( !quoteIndex || ((quoteIndex-1) >= arrayText.length) || ((quoteIndex-1) < 0) ){
            resp = Math.floor(Math.random() * arrayText.length)
        }else{
            resp = quoteIndex-1;
        }
        return arrayText[resp];

    }

    // Function that takes in a discord user ID and a message, then sends message
    function sendDM(messageRecipient, messageContent){
        client.users.fetch( messageRecipient ).then((user) => {
            user.send(messageContent);
        });
    }

    // Checks if the message was sent in a guild. If it was, return true, else false
    function messageSentInGuild(){
        if(message.guild != null){
            return true
        }else{
            M_AUTHOR.send(":x: This command must be sent in a server to work")
            return false
        }
    }

    // Takes in a discord user and a role name. Checks if user has that role
    function isRole(identifier, roleName){
        if( identifier.roles.cache.some(r => r.name === roleName) ){
            return true
        }else{
            return false
        }
    }

    // Checks if discord user's number of roles. If they have zero roles, return false and send message
    function canUseBot(identifier){
        if( (identifier.roles.cache.size-1)==0 ){
            message.channel.send(':x: You must have at least 1 role to use this command. This is to counteract throwaway or spam accounts')
            return false;
        }else{
            return true;
        }
    }

    // Checks if user is a mod. If user is a mod, return true
    function hasModImmunity(targetPerson){
        if( isRole(targetPerson, config.adminRole) || isRole(targetPerson, "GentlemenBot") || isRole(targetPerson, config.coAdminRole)){
            message.channel.send(':x: you can\'t do that to him, he\'s built different')
            return true
        }
    }

    // Checks if user is in call. If user is not in a call, return false and send message
    function isInCall(targetPerson){
        if( !targetPerson.voice.channel ){
            message.channel.send(':x: Target user is not in a voice channel')
            return false
        }else{
            return true
        }
    }

    // Checks to see if the message mentioned anyone. If 
    function hasMentions(){
        if(message.mentions.members.size <= 0){
            message.channel.send(':x: You must mention someone for this command to work')
            return false
        }else{
            return true
        }
    }

    // Returns the name the bot should call the user. If they have a nickname, return the nickname. If not, return the user's tag (Ex: @wavy#3663)
    function getTargetName(target){
        let targetName=``;
        if( target.nickname ){
            targetName=`${target.nickname}`
        }else{
            targetName=`${target.user.tag}`
        }
        return targetName
    }

    // Takes in a discord user, the Set they should be added to, the time they should stay in the set, and starts the cooldown for using a command
    function startCoolDown(target, cooldownSet, time){
        if( cooldownSet.has( target.id ) ){
            cooldownSet.delete( target.id )
        }
        cooldownSet.add( target.id )
        setTimeout(() => {
            // Removes the target from the set after time
            cooldownSet.delete( target.id )
        }, time)

    }

    // Takes in a discord user, sets their voicestatus to server muted, adds them to a list of people muted, then removes them after 10 seconds
    function serverTempMute(target){
        target.voice.setMute(true)
        muteList.add( target.id )
        message.channel.send( getTargetName(target)+' has been server muted for 10 seconds')

        setTimeout(function(){
            if( target.voice.channel ){
                target.voice.setMute(false)
                muteList.delete( target.id )
                message.channel.send( getTargetName(target)+' has been unmuted')
            }
        }, muteTime)

        logActivity()
    }

    // SWITCH CASE FOR COMMANDS
    switch(args[0]){

        // Basic commands

        case 'tts':
            textToSpeech = !textToSpeech;
            if( textToSpeech ){
                response = 'TTS is **ON**'
            }else{
                response = 'TTS is **OFF**'
            }
            break
        
        case 'theycallme':
            if( args[1] ){
                response = 'They call me '+args[1]+' Pauly'
            }
            break

        case 'logs':
            response = "`"+logs+"`"
            break

        case 'refresh':
            if( !messageSentInGuild() ){break}
            if( !isRole(message.member, config.adminRole) ){break}
            response = '**~quotes refreshed~**'
            refresh()
            break
        
        // THE MUTE / BOOT / BLACKLIST / MESSAGE COMMANDS
        case 'message':
            cooldownTime = ms('2m')
            let messageToSend = ""
            var foundUser = false

            //Check if user calling $message used $message recently
            if( msgCooldown.has(M_AUTHOR.id) ){
                message.channel.send(":x: You must wait before using $message again. (cooldown 2 min)")
                break
            }

            // Check if the call had a message recipient
            if( !args[1] ){
                response = "you must specify who to DM. Just write their name, don\'t @ them"
                break
            }

            // Create message to send. If no message body, send random $image
            if( args[2] ){
                for(let i=2; i<args.length; i++){
                    messageToSend+=args[i]+" "
                }
            }else{
                messageToSend = sayQuote( quotesList_Dict[config.defaultDMMessage], 0 )
            }
            
            // Cycles through the dictionary to see if the user named someone to message
            for(var k in memberIDs_Dict){
                if( args[1] == k || args[1] == "@"+k){
                    foundUser = true
                    sendDM(memberIDs_Dict[k], messageToSend)
                    response = "Message sent!"
                }
            }

            // If the message recipient didn't match anyone in the registry, send error message
            if( !foundUser ){
                response = ":x: could\'t find user with that name"
                break
            }

            startCoolDown(M_AUTHOR, msgCooldown, cooldownTime)
            break

        case 'mute':
            if( !messageSentInGuild() ){break}
            if( !canUseBot(message.member) ){break}
            if( isRole(message.member, config.handicapRole) ){cooldownTime = handicapCooldownTime}
            if( !hasMentions() ){break}

            if( muteCooldown.has(M_AUTHOR.id) ){
                response = ":x: You must wait before using $mute again."
                break
            }

            let personToMute = message.guild.member( message.mentions.users.first() )

            if( hasModImmunity(personToMute) ){break}
            if( !isInCall(personToMute) ) {break}

            serverTempMute(personToMute)
            
            startCoolDown(M_AUTHOR, muteCooldown, cooldownTime)
            break;

        case 'boot':
            if( !messageSentInGuild() ){break}
            if( !canUseBot(message.member) ){break}
            if( isRole(message.member, config.handicapRole) ){cooldownTime = handicapCooldownTime}
            if( !hasMentions() ){break}
            
            if ( bootCooldown.has(M_AUTHOR.id) ){
                response = ":x: You must wait before using $boot again."
                break
            }

            let personToBoot = message.guild.member( message.mentions.users.first() )

            if( hasModImmunity(personToBoot) ){break}
            if( !isInCall(personToBoot) ){break}

            personToBoot.voice.setMute(false)
            personToBoot.voice.setChannel(null)
            response = 'bye bye '+ getTargetName(personToBoot)+' !!'

            startCoolDown(M_AUTHOR, bootCooldown, cooldownTime)
            break

        case 'setNick':
            // Check if the user is in a server for this command to work
            if( !messageSentInGuild() ){break}

            if( !canUseBot(message.member) ){break}
            // Check if the user actually mentioned another user in the message
            if( !hasMentions() ){break}


            // Check if the user had a nickname to set
            // Creates the full nickname with spaces and all
            let fullNickName = "";
            for(let i=2; i<args.length; i++){
                fullNickName+=args[i]+" "
            }

            fullNickName=fullNickName.trim()

            // Prints full Nickname to console
            // console.log(fullNickName);
            if( fullNickName=="" ){
                message.channel.send(":x: You must specify the target's new name")
                break
            }
            if( !(fullNickName.length<=32) ){
                message.channel.send(":x: Nickname must be 32 characters or fewer in length")
                break
            }
            // Check if user calling $setNick used $setNick recently
            if ( nickCooldown.has(M_AUTHOR.id) ){
                message.channel.send(":x: You must wait before using $setNick again.")
                break
            }

            let personToChange = message.guild.member( message.mentions.users.first() )

            if( isRole(message.member, "GentlemenBot") || isRole(message.member, config.adminRole) ){break}

            let OGNickName = getTargetName(personToChange)
            personToChange.setNickname( fullNickName )
            response = OGNickName+ " is now: "+fullNickName+"!!"

            startCoolDown(M_AUTHOR, nickCooldown, cooldownTime)
            break;

        case 'debugme':
            // Check if the user is in a server for this command to work
            if( !messageSentInGuild() ){break}
            
            let debugTarget = message.guild.members.cache.get(M_AUTHOR.id);
            if( !isInCall(debugTarget) ){break}

            if( !(debugTarget.voice.serverMute && !muteList.has(debugTarget.id)) ){
                message.channel.send(':x: user is already unmuted or is still on the mute list')
                break
            }

            debugTarget.voice.setMute(false);
            response = 'user has been unmuted'

            break;
        case 'test':
            // const ListEmbed = new Discord.MessageEmbed()
            // .setTitle('Users with the Gentlemen role:')
            // .setDescription(message.guild.roles.cache.get('693608138615554098').members.map(m=>m.user.tag).join('\n'));
            // message.channel.send(ListEmbed);
            break
        
        // The quotes + simple call and response commands
        default:
            response = ""
            for(let key in quotesList_Dict){
                if( args[0] == key ){
                    response = sayQuote( quotesList_Dict[key], parseInt(args[1]) )
                    break
                }
            }
            break
    }

    if(!(response==="") ){
        message.channel.send(response, {tts: textToSpeech})
        logActivity()
    }
})


client.login(config.token);
