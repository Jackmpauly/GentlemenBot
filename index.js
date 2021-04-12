const Discord = require('discord.js')
const config = require('./config.json') // On Github, this should be replaced by config2.json
const client = new Discord.Client()

const ms = require('ms')
const fs = require('fs')
const { REPL_MODE_SLOPPY } = require('repl')
const { RSA_PKCS1_OAEP_PADDING } = require('constants')

// COOLDOWN SETS
const muteCooldown = new Map()
const muteList     = new Map()
const bootCooldown = new Map()
const muteRandomCooldown = new Map()
const bootRandomCooldown = new Map()
const nickCooldown = new Map()
const msgCooldown  = new Map()


// COOLDOWN TIMES
const defaultCooldownTime   = ms(config.defaultCooldownTime)
const handicapCooldownTime  = ms(config.handicapCooldownTime)
let cooldownTime            = defaultCooldownTime

var textToSpeech = false
var modImmunity = true; 
var respondwNick = true;
var startTime;

var quotesList_Dict = {}

var logsArray = []
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

function refresh(){
    fs.readFile(config.quotesTxt, 'utf8', (err, data) => {
        if(err) throw err;
        var text = data.toString().split('\n')

        quotesList_Dict = {}
        for(let i=0; i<text.length; ++i){
            quotesList_Dict[ text[i].substring(0, text[i].indexOf(':') ) ] = text[i].substring( text[i].indexOf(':')+1 ).split('|')
        }

    })
    console.clear() // Clears console to avoid issues with communicating with the imgur server, for some reason
}

refresh()


// Function to log the commands in the console and add to logsArray
// Also cuts logsArray to only include the last 10 entries
function updateLogs(logText){
    logsArray[ logsArray.length ] = logText
    logsArray = logsArray.slice( Math.max(logsArray.length - 10, 0) )
    console.log(logText)
}

// Calculates the difference between 2 dates in minutes 
function diff_minutes(dt1, dt2){
    var diff = (dt2.getTime() - dt1.getTime() ) / 1000
    diff /= 60

    return Math.abs( Math.round(diff) )
}


client.on('ready', () =>{
    THEGENTLEMEN_GUILD = client.guilds.cache.get(config.guild)
    client.user.setActivity(config.botActivity, { type: config.botActivityType })
    
    startTime = (new Date()).toLocaleString()
    startTime+=": "

    updateLogs( `${startTime.padEnd(27, " ")} Bot online` )
})


client.on('message', message=>{
    let M_AUTHOR = message.author;
    let args = "null"
    let messageTarget = ""
    cooldownTime = defaultCooldownTime;
    
    if( message.content.charAt(0) == config.prefix || message.content.charAt(0) == config.prefixALT){
        args = message.content.substring(1).split(" ")
    }
    let commandCalled = args[0]

    let response = "" // What the bot should say in response, if anything.

    // function to push activity to the updateLogs() function, which updates them
    function logActivity(){
        let datetime = new Date().toLocaleString()
        datetime+=": "
        let logString = ""
        logString+=`${datetime.padEnd(27, " ")} @${M_AUTHOR.username} called: ${message.content.charAt(0)}${commandCalled}`;
        
        if( messageTarget!="" ){logString+=" on \'"+messageTarget+"\'"}
        
        updateLogs(logString)
    }

    // Function that takes in an array and an index, spits out a string
    function sayQuote(arrayText, sayQuoteArg, quoteSetName){
        var resp = 0
        var sayQuotereply
        let quoteIndex
        if( !Number.isInteger( parseInt(sayQuoteArg) ) && sayQuoteArg!=undefined ){
            if( sayQuoteArg == "length" ){
                return `*${arrayText.length}*`;
            }
            if( sayQuoteArg == "last" ){
                return sayQuote( arrayText, arrayText.length, quoteSetName )
            }
            if( quoteSetName == "jack" ){
                return `They call me ${sayQuoteArg} Pauly`
            }
        }
        
        quoteIndex = parseInt(sayQuoteArg)
        if( !quoteIndex || ((quoteIndex-1) >= arrayText.length) || ((quoteIndex-1) < 0) ){
            resp = Math.floor(Math.random() * arrayText.length)
        }else{
            resp = quoteIndex-1;
        }
        sayQuotereply = arrayText[resp];

        // Account for new lines
        while( sayQuotereply.includes("\\n") ){
            sayQuotereply = sayQuotereply.replace("\\n", "\n")
        }
        return sayQuotereply;
    }


    function roll(rollType){
        if( !messageSentInGuild() ){return}
        if( !canUseBot(message.member) ){return}

        const channels = message.guild.channels.cache.filter(c => c.parentID === '419336089166413825' && c.type === 'voice');
        let currentMembersArray = [];
        let allImmune = true;
        for( const [channelID, channel] of channels ){
            for( const [memberID, member] of channel.members){
                currentMembersArray.push( member )
                if( !hasModImmunity(member, false) ){
                    allImmune = false;
                }
            }
        }

        if( currentMembersArray.length == 0 ){
            response = ":x: Nobody is in the call D:"
            return
        }

        if( allImmune ){
            response = "All call members are immune :sunglasses:"
            return
        }

        if ( rollType == "boot" && bootRandomCooldown.has(M_AUTHOR.id) ){
            response = `:x: You must wait ${getTimeLeft(M_AUTHOR, bootRandomCooldown)} before rolling $boot again.`
            return
        }
        if ( rollType == "mute" && muteRandomCooldown.has(M_AUTHOR.id) ){
            response = `:x: You must wait ${getTimeLeft(M_AUTHOR, muteRandomCooldown)} before rolling $mute again.`
            return
        }

        let rand = Math.floor(Math.random() * currentMembersArray.length)
        // console.log(`rand: ${rand}`)

        let rollTarget = currentMembersArray[rand]

        while( hasModImmunity(rollTarget, false) ){
            rand = Math.floor(Math.random() * currentMembersArray.length)
            rollTarget = currentMembersArray[rand]
        }

        if( rollType == "boot" ){
            currentMembersArray[rand].voice.setMute(false)
            currentMembersArray[rand].voice.setChannel(null)
            response = `bye bye '${getTargetName(currentMembersArray[rand])}' !!`
            startCoolDown(M_AUTHOR, bootRandomCooldown, handicapCooldownTime)
        }else{
            serverTempMute(currentMembersArray[rand], '20')
            startCoolDown(M_AUTHOR, muteRandomCooldown, handicapCooldownTime)
        }
        // Cooldown is half of regular. This is to incentivise people to use the wacky command lol
        return
    }

    // Function that takes in a discord user ID and a message, then sends message
    function sendDM(messageRecipient, messageContent){
        client.users.fetch( messageRecipient ).then((user) => {
            user.send(messageContent);
        }).catch(console.error);
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
        return ( identifier.roles.cache.some(r => r.name === roleName) )
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
    function hasModImmunity(targetPerson, sendMessage){
        if( (isRole(targetPerson, config.adminRole) || isRole(targetPerson, config.botRole) || isRole(targetPerson, config.coAdminRole)) && modImmunity ){
            if(sendMessage){message.channel.send(':x: you can\'t do that to him, he\'s built different')}
            return true
        }
        return false
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

    // Checks to see if the message mentioned anyone.
    function hasMentions(sendMessage){
        if(message.mentions.members.size <= 0){
            if(sendMessage){message.channel.send(':x: You must mention someone for this command to work')}
            return false
        }else{
            return true
        }
    }

    // Returns the name the bot should call the user. If they have a nickname, return the nickname. If not, return the user's tag (Ex: @wavy#3663)
    function getTargetName(target){
        let targetName=``;
        if( target.nickname && respondwNick){
            targetName=`${target.nickname}`
        }else{
            targetName=`${target.user.tag}`
        }
        return targetName
    }

    // Takes in a discord user, the Map they should be added to, the time they should stay in the set, and starts the cooldown for using a command
    // Maps the user to a date when the user is released from the set
    function startCoolDown(target, cooldownSet, time){
        if( cooldownSet.has( target.id ) ){
            cooldownSet.delete( target.id )
        }
        cooldownSet.set( target.id, new Date( (new Date()).getTime() + time) )
        // console.log( cooldownSet.get(target.id).toLocaleString() )
        setTimeout(() => {
            // Removes the target from the set after time
            cooldownSet.delete( target.id )
        }, time)

    }

    // Use diff_minutes to print the time left in a user-friendly, readable format 
    function getTimeLeft(target, cooldownSet){
        let temp = diff_minutes( new Date(), cooldownSet.get(target.id) )
        let ret = ""
        if(temp == 0){
            ret = "less than 1 minute left"
        }else if(temp == 1){
            ret = "1 minute left"
        }else{
            ret = temp+" minutes left"
        }
        return ret;
    }

    // Takes in a discord user, sets their voicestatus to server muted, adds them to a list of people muted, then removes them after 10 seconds
    function serverTempMute(target, time){
        target.voice.setMute(true)
        muteList.set( target.id, new Date() )
        message.channel.send( `'${getTargetName(target)}' has been server muted for ${time} seconds`)

        setTimeout(function(){
            if( target.voice.channel ){
                target.voice.setMute(false)
                muteList.delete( target.id )
                message.channel.send( '\''+getTargetName(target)+'\' has been unmuted')
            }
        }, ms(time+'s') )

        logActivity()
    }

    // Quiet, Dad bot!
    if( M_AUTHOR.id === config.autoReplyID){
        message.channel.send(config.autoReplyContent + `${M_AUTHOR}`);
    }
    // IDEA: make it so that on message send, if the message send was a rhythm bot command (eg: !p ) and it was sent in a channel other than #radio,
    // redirect the user to the radio channel  

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

        case 'immunity':
            if( !messageSentInGuild() ){break}
            if( !isRole(message.member, config.adminRole) && !isRole(message.member, config.botRole) && !isRole(message.member, config.coAdminRole)){break}
            modImmunity = !modImmunity;
            if( modImmunity ){
                response = 'Mod Immunity is **ON**'
            }else{
                response = 'Mod Immunity is **OFF**'
            }
            break

        case 'useNick':
            if( !messageSentInGuild() ){break}
            if( !isRole(message.member, config.adminRole) && !isRole(message.member, config.botRole) && !isRole(message.member, config.coAdminRole)){break}
            respondwNick = !respondwNick;
            if( respondwNick ){
                response = 'Respond with nickname is **ON**'
            }else{
                response = 'Respond with nickname is **OFF**'
            }
            break

        // Prints the user's cooldowns
        case 'cd':
        case 'cooldown':
            let str = ""
            if( muteCooldown.has(M_AUTHOR.id) ){
                str+= "$mute: ".padEnd(11, " ") +getTimeLeft(M_AUTHOR, muteCooldown)+"\n"
            }
            if( bootCooldown.has(M_AUTHOR.id) ){
                str+= "$boot: ".padEnd(11, " ") +getTimeLeft(M_AUTHOR, bootCooldown)+"\n"
            }
            if( muteRandomCooldown.has(M_AUTHOR.id) ){
                str+= "$mute (random): ".padEnd(11, " ") +getTimeLeft(M_AUTHOR, muteRandomCooldown)+"\n"
            }
            if( bootRandomCooldown.has(M_AUTHOR.id) ){
                str+= "$boot (random): ".padEnd(11, " ") +getTimeLeft(M_AUTHOR, bootRandomCooldown)+"\n"
            }
            if( nickCooldown.has(M_AUTHOR.id) ){
                str+= "$setNick: ".padEnd(11, " ") +getTimeLeft(M_AUTHOR, nickCooldown)+"\n"
            }
            if( msgCooldown.has(M_AUTHOR.id) ){
                str+= "$message: ".padEnd(11, " ") +getTimeLeft(M_AUTHOR, msgCooldown)+"\n"
            }

            if(str!=""){
                response = "`"+str+"`"
            }else{
                response = ":x: User doesn't have any cooldowns. Go nuts"
            }

            break
        case config.customMiscCommand:
            let customString = config.customMiscCommandString
            
            let argument = "";
            for(let i=1; i<args.length; i++){
                argument+=args[i]+" "
            }

            if( argument=="" ){
                argument = config.defaultMiscCommandArg;
            }

            response = customString + argument + "!"
            break
        case 'logs':
            let logs = ``
            logs+=`Been Running since ${startTime}\n`
            logs+=`${`Text-to-Speech:`.padEnd(27, " ")} ${textToSpeech}\n`
            logs+=`${`Mod Immunity:`.padEnd(27, " ")} ${modImmunity}\n`
            logs+=`${`Respond with nickname:`.padEnd(27, " ")} ${respondwNick}\n`
            for(let i=0; i<logsArray.length; ++i){
                logs+=`${logsArray[i]}\n`
            }
            response = "`"+logs+"`"
            break

        case 'refresh':
            if( !messageSentInGuild() ){break}
            if( !isRole(message.member, config.adminRole) && !isRole(message.member, config.botRole) ){break}
            response = '**~quotes refreshed~**'
            refresh()
            break
        
        case 'reset':
            if( !messageSentInGuild() ){break}
            if( !isRole(message.member, config.adminRole) && !isRole(message.member, config.botRole) ){break}
            response = ' :rotating_light: **~COOLDOWNS RESET~** :rotating_light: '
            muteCooldown.clear();
            muteList.clear();
            bootCooldown.clear();
            muteRandomCooldown.clear();
            nickCooldown.clear();
            msgCooldown.clear();
            break

        // Make a "repeat after me" function that also deletes the message of the person who called it
        case 'say':
            // Create message to send. If no message body, send random $image
            if( args[1] ){
                for(let i=1; i<args.length; i++){
                    response+=args[i]+" "
                }
            }else{
                response = sayQuote( quotesList_Dict[config.defaultDMMessage], 0 )
            }

            message.delete()
            break
        
        // THE MESSAGE / MUTE / BOOT / SETNICK COMMANDS
        case 'message':
            cooldownTime = ms('2m')
            let messageToSend = ""
            var foundUser = false

            //Check if user calling $message used $message recently
            if( msgCooldown.has(M_AUTHOR.id) ){
                message.channel.send(`:x: You must wait ${getTimeLeft(M_AUTHOR, msgCooldown)} before using $message again.`)
                break
            }

            // Check if the call had a message recipient
            if( !args[1] ){
                response = `you must specify who to DM. Just write their name, don't @ them`
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
                    messageTarget = k
                    sendDM(memberIDs_Dict[k], messageToSend)
                    response = "Message sent!"
                }
            }

            // If the message recipient didn't match anyone in the registry, send error message
            if( !foundUser ){
                response = `:x: could't find user with that name. The bot goes off names, not @'s`
                break
            }

            startCoolDown(M_AUTHOR, msgCooldown, cooldownTime)
            break

        case 'mute':
            if( !messageSentInGuild() ){break}
            if( !canUseBot(message.member) ){break}
            if( isRole(message.member, config.handicapRole) ){cooldownTime = handicapCooldownTime}
            if( !hasMentions(false) ){
                commandCalled = 'mute (random)'
                roll('mute')
                break
            }

            if( muteCooldown.has(M_AUTHOR.id) ){
                response = `:x: You must wait ${getTimeLeft(M_AUTHOR, muteCooldown)} before using $mute again.`
                break
            }

            let personToMute = message.guild.member( message.mentions.users.first() )

            if( hasModImmunity(personToMute, true) ){break}
            if( !isInCall(personToMute) ) {break}

            messageTarget = getTargetName(personToMute)
            serverTempMute(personToMute, '10')
            
            
            startCoolDown(M_AUTHOR, muteCooldown, cooldownTime)
            break;

        case 'boot':
            if( !messageSentInGuild() ){break}
            if( !canUseBot(message.member) ){break}
            if( isRole(message.member, config.handicapRole) ){cooldownTime = handicapCooldownTime}
            if( !hasMentions(false) ){
                commandCalled = 'boot (random)'
                roll('boot')
                break
            }
            
            if ( bootCooldown.has(M_AUTHOR.id) ){
                response = `:x: You must wait ${getTimeLeft(M_AUTHOR, bootCooldown)} before using $boot again.`
                break
            }

            let personToBoot = message.guild.member( message.mentions.users.first() )

            if( hasModImmunity(personToBoot, true) ){break}
            if( !isInCall(personToBoot) ){break}

            messageTarget = getTargetName(personToBoot)
            personToBoot.voice.setMute(false)
            personToBoot.voice.setChannel(null)
            response = `bye bye '${getTargetName(personToBoot)}' !!`

            startCoolDown(M_AUTHOR, bootCooldown, cooldownTime)
            break

        case 'roll':
            response = `Command moved to $mute (with no arguments)`
            break

        case 'roulette':
            response = `Command moved to $boot (with no arguments)`
            break

        case 'setnick':
        case 'setNick':
            cooldownTime = '5m'
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
                message.channel.send(`:x: You must wait ${getTimeLeft(M_AUTHOR, nickCooldown)} before using $setNick again.`)
                break
            }

            let personToChange = message.guild.member( message.mentions.users.first() )

            if( isRole(personToChange, config.botRole) || isRole(personToChange, config.adminRole) ){
                message.channel.send(`:x: you can't do that to him, he's built different`)
                break
            }

            messageTarget = `${personToChange.user.tag}`

            let OGNickName = getTargetName(personToChange)
            personToChange.setNickname( fullNickName )
            if( OGNickName == fullNickName ){
                response = `'${OGNickName}' is still: '${fullNickName}' !!`
                break;
            }
            
            response = `'${OGNickName}' is now: '${fullNickName}' !!`
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
            // console.log("test")

            // TODO: figure out how to make a discord embedded message. Those are cool
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
                    if(args[1] == "all"){
                        if( !messageSentInGuild() ){break}
                        if( !isRole(message.member, config.adminRole) ){ 
                            response = ":x: Only jack can call this command. It's too taxing on the bot for just anyone to use it"
                            break
                        }

                        let index = 1
                        while(index <= quotesList_Dict[key].length){
                            message.channel.send( `.$${key} ${index}: ${sayQuote( quotesList_Dict[key], index, key )}` )
                            ++index
                        }
                        message.channel.send("$refresh")
                        response = ":white_check_mark: **Done**"
                        break
                    }
                    response = sayQuote( quotesList_Dict[key], args[1], key )
                    break
                }
            }
            break
    }

    if( response!="" ){
        message.channel.send(response, {tts: textToSpeech})
        logActivity()
    }
})


client.login(config.token);
