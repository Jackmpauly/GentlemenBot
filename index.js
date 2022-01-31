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
const deafList     = new Map()
const bootCooldown = new Map()
const deafCooldown = new Map()
const timeoutCooldown = new Map()
const muteRandomCooldown = new Map()
const bootRandomCooldown = new Map()
const nickCooldown = new Map()
const msgCooldown  = new Map()
const canceled = new Map()


// COOLDOWN TIMES
const defaultCooldownTime   = ms(config.defaultCooldownTime)
const handicapCooldownTime  = ms(config.handicapCooldownTime)
let cooldownTime            = defaultCooldownTime

var textToSpeech = false
var modImmunity = false;
var respondwNick = true;
var startTime;
let juevesCount = 0;

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

function writeToFile(content){
    // fs.writeFile(config.SkriblTxt, content, err => {
    //     if(err) throw err;

    // })
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
    let commandBody = ""
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
        logString+=commandBody;
        

        updateLogs(logString)
    }

    function iterateMap(cooldown){
        let ret = ``;
        if( cooldown.size > 0 ){
            for( let[k, v] of cooldown ){
                let onCD = message.guild.members.cache.get(k).user;
                ret+= `${onCD.username.padEnd(11, " ")} ${getTimeLeft(onCD, cooldown)}\n`;
            }
        }
        return ret;
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


    // Roll a random mute or boot, depending on rollType
    function roll(rollType){
        if( !messageSentInGuild(true) ){return}
        if( !canUseBot(message.member) ){return}

        // Create a set of channels under the general category (General Alpha, General Bravo, General 杰罗姆)
        const channels = message.guild.channels.cache.filter(c => c.parentID === '419336089166413825' && c.type === 'voice');
        let currentMembersArray = [];
        let allImmune = true;
        // Add members that are in any of these channels to an array currentMembersArray
        // Check each member for mod immunity. If all members are immune, cancel the command
        for( const [channelID, channel] of channels ){
            for( const [memberID, member] of channel.members){
                currentMembersArray.push( member )
                if( !hasModImmunity(member, false) ){
                    allImmune = false;
                }
            }
        }

        // If nobody is in the call
        if( currentMembersArray.length == 0 ){
            response = ":x: Nobody is in the call D:"
            return
        }

        // If all members in the call are immune
        if( allImmune ){
            response = "All call members are immune :sunglasses:"
            return
        }

        // Cooldown messages
        if ( rollType == "boot" && bootRandomCooldown.has(M_AUTHOR.id) ){
            response = `:x: You must wait ${getTimeLeft(M_AUTHOR, bootRandomCooldown)} before rolling $boot again.`
            return
        }
        if ( rollType == "mute" && muteRandomCooldown.has(M_AUTHOR.id) ){
            response = `:x: You must wait ${getTimeLeft(M_AUTHOR, muteRandomCooldown)} before rolling $mute again.`
            return
        }

        // Get a random number between 0 and the number of users in the call
        let rand = Math.floor(Math.random() * currentMembersArray.length)
        // console.log(`rand: ${rand}`)

        let rollTarget = currentMembersArray[rand]

        // If the user selected for deletion is immune, try again
        while( hasModImmunity(rollTarget, false) ){
            rand = Math.floor(Math.random() * currentMembersArray.length)
            rollTarget = currentMembersArray[rand]
        }

        // If the rollType was boot, disconnect the user
        if( rollType == "boot" ){
            disconnectUser(currentMembersArray[rand], `bye bye!!!`);
            startCoolDown(M_AUTHOR, bootRandomCooldown, defaultCooldownTime)
        }
        // If the rollType was mute, mute the user for 20 seconds
        else{
            serverTempMute(currentMembersArray[rand], '20') // Argument must be '20' and not '20s' for the response formatting to look nice
            startCoolDown(M_AUTHOR, muteRandomCooldown, defaultCooldownTime)
        }
        return
    }

    // Function that takes in a discord user ID and a message, then sends message
    function sendDM(messageRecipient, messageContent){
        client.users.fetch( messageRecipient ).then((user) => {
            user.send(messageContent);
        }).catch(console.error);
    }

    // Checks if the message was sent in a guild. If it was, return true, else false
    function messageSentInGuild(sendMessage){
        if(message.guild != null){
            return true
        }else{
            if(sendMessage){message.channel.send(":x: This command must be sent in a server to work")}
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
    // If modImmunity is turned off (false), then it will always return false.
    // Takes in a boolean sendMessage for if it should respond with a message & return t/f or just return t/f
    function hasModImmunity(targetPerson, sendMessage){
        if( (isRole(targetPerson, config.adminRole) || isRole(targetPerson, config.botRole) || isRole(targetPerson, config.coAdminRole)) && modImmunity ){
            if(sendMessage){message.channel.send(`:x: you can't do that to him, he's built different`)}
            return true
        }
        return false
    }

    function isModCommand(targetPerson){
        if( (!isRole(targetPerson, config.adminRole) && !isRole(targetPerson, config.coAdminRole)) || isRole(targetPerson, config.botRole) ){
            message.channel.send(`:x: This is a command only mods can use`)
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
    // If respondwNick is off (false), then it will always return the user's tag
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
    function startCoolDown(target, cooldownMap, time){
        if( cooldownMap.has( target.id ) ){
            cooldownMap.delete( target.id )
        }
        cooldownMap.set( target.id, new Date( (new Date()).getTime() + time) )
        setTimeout(() => {
            // Removes the target from the set after time
            cooldownMap.delete( target.id )
        }, time)

    }

    // Use diff_minutes to print the time left in a user-friendly, readable format 
    function getTimeLeft(target, cooldownSet){
        let temp = diff_minutes( new Date(), cooldownSet.get(target.id) )
        let ret = ""
        if(temp == 0){
            ret = "less than 1 minute"
        }else if(temp == 1){
            ret = "1 minute"
        }else{
            ret = temp+" minutes"
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
            }else{
                muteList.delete( target.id )
                message.channel.send( '\''+getTargetName(target)+'\' has been taken off the mute list')
            }
        }, ms(time+'s') )

        logActivity()
    }

    function serverTempDeaf(target, time){
        target.voice.setDeaf(true)
        deafList.set( target.id, new Date() )
        message.channel.send( `'${getTargetName(target)}' has been server deafened for ${time} seconds`)

        setTimeout(function(){
            if( target.voice.channel ){
                target.voice.setDeaf(false)
                deafList.delete( target.id )
                message.channel.send( '\''+getTargetName(target)+'\' has been undeafened')
            }else{
                deafList.delete( target.id )
                message.channel.send( '\''+getTargetName(target)+'\' has been taken off the deafen list')
            }
        }, ms(time+'s') )

        logActivity()
    }

    function disconnectUser(target, bootText){
        target.voice.setMute(false)
        target.voice.setChannel(null)
        message.channel.send(bootText)
        logActivity()
    }

    // function timeoutUser(target, reason){
    //     target.timeout( ms("10s"), reason )
    //     logActivity()
    // }

    // Quiet, Dad bot!
    if( M_AUTHOR.id === config.autoReplyID){
        message.channel.send(config.autoReplyContent + `${M_AUTHOR}`);
    }

    if(  message.content === "Permission" || message.content === "permission" || message.content === "Permission?" || message.content === "permission?" ){
        if( M_AUTHOR.id === config.evanID ){
            message.channel.send("Granted");
        }else{
            message.channel.send("PERMISSION DENIED");
        }
    }
    

    // Canceled!!!!
    if( messageSentInGuild(false) && canceled.has( message.guild.members.cache.get(M_AUTHOR.id) ) ){
        message.reply(` you are ${canceled.get(message.guild.members.cache.get(M_AUTHOR.id))}`);
        canceled.delete( message.guild.members.cache.get(M_AUTHOR.id) )
    }


    // IDEA: make it so that on message send, if the message send was a rhythm bot command (eg: !p ) and it was sent in a channel other than #radio,
    // redirect the user to the radio channel  

    // SWITCH CASE FOR COMMANDS
    switch(args[0]){

        // Basic commands
        // First 3 (tts, immunity, useNick/usenick) are for turning on/off tts, mod immunity, and responding with nicknames
        case 'tts':
            textToSpeech = !textToSpeech;
            if( textToSpeech ){
                response = 'TTS is **ON**'
            }else{
                response = 'TTS is **OFF**'
            }
            break

        case 'immunity':
            if( !messageSentInGuild(true) ){break}
            if( isModCommand(message.member) ){break}
            modImmunity = !modImmunity;
            if( modImmunity ){
                response = 'Mod Immunity is **ON**'
            }else{
                response = 'Mod Immunity is **OFF**'
            }
            break

        case 'usenick':
        case 'useNick':
            if( !messageSentInGuild(true) ){break}
            if( isModCommand(message.member) ){break}
            respondwNick = !respondwNick;
            if( respondwNick ){
                response = 'Respond with nickname is **ON**'
            }else{
                response = 'Respond with nickname is **OFF**'
            }
            break

        // Misc complicated commands
        case 'jueves':
            let day = new Date().getDay();
            if( day === 4 ){
                if( juevesCount == 0 ){
                    message.channel.send(`🥳🎉🎈 FELIZ JUEVES, GENTLEMEN!!!!! 🎈🎉🥳\n 💃🏼 AFTER 6 LONG DAYS, WE'VE FINALLY MADE IT 💃🏼`);
                }
                juevesCount++;
                response = sayQuote( quotesList_Dict["jueves"], args[1], "jueves" )
                
            }else if( day === 2 || day === 3){
                juevesCount = 0;
                response = 'https://i.imgur.com/scXCY8u.jpg'
            }else{
                juevesCount = 0;
                // response = 'https://i.imgur.com/Ihs2N1T.mp4'
                response = 'https://i.imgur.com/LQ4hXGa.jpg'
            }
            break



        // Prints the user's cooldowns
        case 'cd':
        case 'cooldown':
            if( !messageSentInGuild(true) ){break}
            var str = ""
            if( muteCooldown.has(M_AUTHOR.id) ){
                str+= `${"$mute:".padEnd(11, " ")} ${getTimeLeft(M_AUTHOR, muteCooldown)}\n`
            }
            if( deafCooldown.has(M_AUTHOR.id) ){
                str+= `${"$deafen:".padEnd(11, " ")} ${getTimeLeft(M_AUTHOR, deafCooldown)}\n`
            }
            if( bootCooldown.has(M_AUTHOR.id) ){
                str+= `${"$boot:".padEnd(11, " ")} ${getTimeLeft(M_AUTHOR, bootCooldown)}\n`
            }
            if( muteRandomCooldown.has(M_AUTHOR.id) ){
                str+= `${"$mute (random):".padEnd(11, " ")} ${getTimeLeft(M_AUTHOR, muteRandomCooldown)}\n`
            }
            if( bootRandomCooldown.has(M_AUTHOR.id) ){
                str+= `${"$boot (random):".padEnd(11, " ")} ${getTimeLeft(M_AUTHOR, bootRandomCooldown)}\n`
            }
            if( nickCooldown.has(M_AUTHOR.id) ){
                str+= `${"$setNick:".padEnd(11, " ")} ${getTimeLeft(M_AUTHOR, nickCooldown)}\n`
            }
            if( msgCooldown.has(M_AUTHOR.id) ){
                str+= `${"$message:".padEnd(11, " ")} ${getTimeLeft(M_AUTHOR, msgCooldown)}\n`
            }

            if(str!=""){
                response = "`"+str+"`"
            }else{
                response = ":x: User doesn't have any cooldowns. Go nuts"
            }

            break
        
        case 'cooldowns':
        case 'cds':
        case 'allCD':
            if( !messageSentInGuild(true) ){break}
            let resp = "";
            if( muteCooldown.size > 0 ){
                resp+=`$mute cooldowns:\n`
                resp+=iterateMap( muteCooldown );
            }
            if( deafCooldown.size > 0 ){
                resp+=`$deafen cooldowns:\n`
                resp+=iterateMap( deafCooldown );
            }
            if( bootCooldown.size > 0 ){
                resp+=`$boot cooldowns:\n`
                resp+=iterateMap( bootCooldown );
            }
            if( muteRandomCooldown.size > 0 ){
                resp+=`$mute (random) cooldowns:\n`
                resp+=iterateMap( muteRandomCooldown );
            }
            if( bootRandomCooldown.size > 0 ){
                resp+=`$boot (random) cooldowns:\n`
                resp+=iterateMap( bootRandomCooldown );
            }
            if( nickCooldown.size > 0 ){
                resp+=`$setNick cooldowns:\n`
                resp+=iterateMap( nickCooldown );
            }
            if( msgCooldown.size > 0 ){
                resp+=`$message cooldowns:\n`
                resp+=iterateMap( msgCooldown );
            }

            if(resp!=""){
                response = "`"+resp+"`"
            }else{
                response = ":x: Nobody has any cooldowns :flushed:"
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
            logs+=`${`Been running since`.padEnd(27, " ")} ${startTime}\n`
            logs+=`${`Text-to-Speech:`.padEnd(27, " ")} ${textToSpeech}\n`
            logs+=`${`Mod Immunity:`.padEnd(27, " ")} ${modImmunity}\n`
            logs+=`${`Respond with nickname:`.padEnd(27, " ")} ${respondwNick}\n`
            for(let i=0; i<logsArray.length; ++i){
                logs+=`${logsArray[i]}\n`
            }
            response = "`"+logs+"`"
            break

        case 'refresh':
            if( !messageSentInGuild(true) ){break}
            if( !isRole(message.member, config.adminRole) && !isRole(message.member, config.botRole) ){break}
            response = '**~quotes refreshed~**'
            refresh()
            break
        
        case 'reset':
            if( !messageSentInGuild(true) ){break}
            if( isModCommand(message.member) ){break}
            response = ' :rotating_light: **~COOLDOWNS RESET~** :rotating_light: '
            muteCooldown.clear();
            muteList.clear();
            deafCooldown.clear();
            deafList.clear();
            bootCooldown.clear();
            muteRandomCooldown.clear();
            bootRandomCooldown.clear();
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

            for( var i=1; i<args.length; ++i ){
                commandBody+=" "+args[i]
            }
            message.delete()
            break
        
        // THE MESSAGE / MUTE / BOOT / SETNICK COMMANDS
        case 'message':
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
                    commandBody = ` on '${k}'`
                    sendDM(memberIDs_Dict[k], messageToSend)
                    response = "Message sent!"
                }
            }

            // If the message recipient didn't match anyone in the registry, send error message
            if( !foundUser ){
                response = `:x: could't find user with that name. The bot goes off names, not @'s`
                break
            }

            startCoolDown(M_AUTHOR, msgCooldown, ms('2m'))
            break

        case 'mute':
            if( !messageSentInGuild(true) ){break}
            if( !canUseBot(message.member) ){break}
            if( isRole(message.member, config.botRole) ){break}
            if( isRole(message.member, config.handicapRole) ){cooldownTime = handicapCooldownTime}

            // If the message does NOT mention someone. Call the roll command for mute
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

            commandBody = ` on '${getTargetName(personToMute)}'`
            serverTempMute(personToMute, '10') // Argument must be '10' and not '10s' for the response formatting to look nice
            
            startCoolDown(M_AUTHOR, muteCooldown, cooldownTime)
            break;
        
        case 'selfdeafen':
        case 'deafenme':
            if( !messageSentInGuild(true) ){break}
            if( !canUseBot(message.member) ){break}
            let selfDeaf = message.guild.members.cache.get(M_AUTHOR.id); // set self as person to deafen

            if( deafList.has(selfDeaf.id )){
                response = ':x: user is still on the deafenlist.'
                break;
            }

            if( !isInCall(selfDeaf) ) {break}

            selfDeaf.voice.setDeaf( !selfDeaf.voice.serverDeaf );
            if( selfDeaf.voice.serverDeaf ){
              response = ':white_check_mark: You are now undeafened'  
            }else{
                response = ':white_check_mark: You are now deafened'
            }
            
            break;
        case 'deafen':
            if( !messageSentInGuild(true) ){break}
            if( !canUseBot(message.member) ){break}
            if( isRole(message.member, config.botRole) ){break}
            if( isRole(message.member, config.handicapRole) ){cooldownTime = handicapCooldownTime}

            // If the message does NOT mention someone. Call the roll command for deafen
            if( !hasMentions(false) ){
                response = ':x: deafen requires a target'
                // commandCalled = 'deafen (random)'
                // roll('deafen')
                break
            }

            if( deafCooldown.has(M_AUTHOR.id) ){
                response = `:x: You must wait ${getTimeLeft(M_AUTHOR, deafCooldown)} before using $deafen again.`
                break
            }

            let personToDeaf = message.guild.member( message.mentions.users.first() )

            if( hasModImmunity(personToDeaf, true) ){break}
            if( !isInCall(personToDeaf) ) {break}

            commandBody = ` on '${getTargetName(personToDeaf)}'`
            serverTempDeaf(personToDeaf, '10') // Argument must be '10' and not '10s' for the response formatting to look nice
            
            
            startCoolDown(M_AUTHOR, deafCooldown, cooldownTime)
            break;

        case 'timeout':
            break
            if( !messageSentInGuild(true) ){break}
            if( !canUseBot(message.member) ){break}
            if( isRole(message.member, config.botRole) ){break}
            cooldownTime = ms("2h")
            if( isRole(message.member, config.handicapRole) ){cooldownTime = ms("1h") }

            // If the message does NOT mention someone...
            if( !hasMentions(false) ){
                response = ':x: timeout requires a target'
                break
            }

            if ( timeoutCooldown.has(M_AUTHOR.id) ){
                response = `:x: You must wait ${getTimeLeft(M_AUTHOR, timeoutCooldown)} before using $timeout again.`
                break
            }

            let personToTimeout = message.guild.member( message.mentions.users.first() )

            // Check if the user had a timeout text to set
            // Creates the boot text with spaces and all
            let timeoutMessage = "";
            for(let i=2; i<args.length; i++){
                timeoutMessage+=args[i]+" "
            }

            timeoutMessage=timeoutMessage.trim()
            
            if( timeoutMessage=="" ){
                timeoutMessage = `bye bye ${getTargetName(personToTimeout)} :bangbang:`
            }
            

            if( hasModImmunity(personToTimeout, true) ){break}

            commandBody = ` on '${getTargetName(personToTimeout)}'`

            timeoutUser(personToTimeout, timeoutMessage)
            startCoolDown(M_AUTHOR, timeoutCooldown, cooldownTime)
            break

        case 'boot':
            if( !messageSentInGuild(true) ){break}
            if( !canUseBot(message.member) ){break}
            if( isRole(message.member, config.botRole) ){break}
            if( isRole(message.member, config.handicapRole) ){cooldownTime = handicapCooldownTime}

            // If the message does NOT mention someone. Call the roll command for boot
            if( !hasMentions(false) ){
                // commandCalled = 'boot (random)'
                // roll('boot')
                response = `:x: Random boot has been disabled`
                break
            }
            
            if ( bootCooldown.has(M_AUTHOR.id) ){
                response = `:x: You must wait ${getTimeLeft(M_AUTHOR, bootCooldown)} before using $boot again.`
                break
            }

            let personToBoot = message.guild.member( message.mentions.users.first() )

            // Check if the user had a boot text to set
            // Creates the boot text with spaces and all
            let bootMessage = "";
            for(let i=2; i<args.length; i++){
                bootMessage+=args[i]+" "
            }

            bootMessage=bootMessage.trim()
            
            if( bootMessage=="" ){
                bootMessage = `bye bye ${getTargetName(personToBoot)} :bangbang:`
            }
            

            if( hasModImmunity(personToBoot, true) ){break}
            if( !isInCall(personToBoot) ){break}

            commandBody = ` on '${getTargetName(personToBoot)}'`

            disconnectUser(personToBoot, bootMessage)
            startCoolDown(M_AUTHOR, bootCooldown, cooldownTime)
            break

        case 'setnick':
        case 'setNick':
            // Check if the user is in a server for this command to work
            if( !messageSentInGuild(true) ){break}

            if( !canUseBot(message.member) ){break}
            if( isRole(message.member, config.botRole) ){break}
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

            if( (isRole(personToChange, config.adminRole) || isRole(personToChange, config.botRole) || isRole(personToChange, config.coAdminRole)) ){
                response=`:x: Discord.js literally does not allow for bots to change the nicknames of admins. I've done all I can. Take it up with them. \n https://stackoverflow.com/questions/56117594/discord-js-bot-dosnt-have-permission-to-manage-nicknames`
                break
            }

            commandBody = ` on '${personToChange.user.tag}'`

            let OGNickName = getTargetName(personToChange)
            personToChange.setNickname( fullNickName )

            if( OGNickName == fullNickName ){
                response = `'${OGNickName}' is still: '${fullNickName}' !!`
                break;
            }
            
            response = `'${OGNickName}' is now: '${fullNickName}' !!`
            startCoolDown(M_AUTHOR, nickCooldown, ms('5m')) // Cooldown: 5 minutes
            break;

        // $cancel
        case 'cancel':
            // Check if the user is in a server for this command to work
            if( !messageSentInGuild(true) ){break}
            if( !canUseBot(message.member) ){break}
            if( isRole(message.member, config.botRole) ){break}
            // Check if the user actually mentioned another user in the message
            if( !hasMentions() ){break}

            // Check if the user had a cancel reason to set
            // Creates the cancel reason with spaces and all
            let cancelReason = "";
            for(let i=2; i<args.length; i++){
                cancelReason+=args[i]+" "
            }

            cancelReason=cancelReason.trim()
            
            if( cancelReason=="" ){
                cancelReason = "CANCELED :bangbang:"
            }else{
                if( cancelReason.substr(0, 4) == "for " ){
                    cancelReason = cancelReason.substr(4).trim();
                }
                cancelReason="CANCELED for "+cancelReason+" :bangbang:"
            }

            let personToCancel = message.guild.member( message.mentions.users.first() )
            commandBody = ` on '${personToCancel.user.tag}'`

            // Bot cannot be canceled. This would cause too many feedback loops
            if( !isRole(personToCancel, config.botRole) ){
                canceled.set(personToCancel, cancelReason);
                response = `${getTargetName(personToCancel)} has been ${cancelReason}`
                break;
            }else{
                response = `WHAT! I have been ${cancelReason}`
                break;
            }
            break;

        case 'unmute':
        case 'debugme':
            // Check if the user is in a server for this command to work
            if( !messageSentInGuild(true) ){break}
            
            let M_AUTHOR_GUILDMEMBER = message.guild.members.cache.get(M_AUTHOR.id);
            

            if( !isInCall(M_AUTHOR_GUILDMEMBER) ){break}

            if( !(M_AUTHOR_GUILDMEMBER.voice.serverMute && !muteList.has(M_AUTHOR_GUILDMEMBER.id)) ){
                message.channel.send(':x: user is already unmuted or is still on the mute list')
            }else{
                M_AUTHOR_GUILDMEMBER.voice.setMute(false);
                response = ':white_check_mark: user has been unmuted'
            }

            if( !(M_AUTHOR_GUILDMEMBER.voice.serverDeaf && !deafList.has(M_AUTHOR_GUILDMEMBER.id)) ){
                message.channel.send(':x: user is already undeafened or is still on the deafen list')
            }else{
                M_AUTHOR_GUILDMEMBER.voice.setDeaf(false);
                response = ':white_check_mark: user has been undeafened'
            }

            break;
        case 'test':
            if( isModCommand(message.member) ){break}    
            // response = sayQuote( quotesList_Dict["jueves"], args[1], "jueves" )

            // let crash = message.guild.members.cache.get(M_AUTHOR.id);

            // TODO: figure out how to make a discord embedded message. Those are cool
            // const ListEmbed = new Discord.MessageEmbed()
            // .setTitle('Users with the Gentlemen role:')
            // .setDescription(message.guild.roles.cache.get('693608138615554098').members.map(m=>m.user.tag).join('\n'));
            // message.channel.send(ListEmbed);
            break
        
        // The quotes + simple call and response commands
        default:
            response = ""
            // Loop through the quotesList_Dict. (the keys/ trigger phrases)
            for(let key in quotesList_Dict){
                // If the key was found/ If the $ command used actually had a response...
                if( args[0] == key ){
                    // If the 2nd argument was "all", check if it was me, then print all
                    if(args[1] == "all"){
                        if( !messageSentInGuild(true) ){break}
                        if( !isRole(message.member, config.adminRole) ){ 
                            response = ":x: Only jack can call this command. It's too taxing on the bot for just anyone to use it"
                            break
                        }

                        let index = 1
                        while(index <= quotesList_Dict[key].length){
                            message.channel.send( `.$${key} ${index}: ${sayQuote( quotesList_Dict[key], index, key )}` )
                            ++index
                        }
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
