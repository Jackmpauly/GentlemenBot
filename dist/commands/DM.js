require('../global')
function DM(args){
    let messageToSend = ""
    var foundUser = false
    
    if( !aux.messageSentInGuild(true) ){return}

    //Check if user calling $message used $message recently
    if( msgCooldown.has(M_AUTHOR.id) ){
        return `:x: You must wait ${aux.getTimeLeft(M_AUTHOR, msgCooldown)} before using $message again.`
    }
    
    // Check if the call had a message recipient
    if( !args[1] ){
        return `you must specify who to DM. Just write their name, don't @ them`
    }
    
    // Create message to send. If no message body, send random $image
    if( args[2] ){
        for(let i=2; i<args.length; i++){
            messageToSend+=args[i]+" "
        }
    }else{
        messageToSend = quotes.sayQuote( quotesList_Dict[config.defaultDMMessage], 0 )
    }
    
    // Cycles through the dictionary to see if the user named someone to message
    for(var k in memberIDs_Dict){
        if( args[1] == k || args[1] == "@"+k){
            foundUser = true
            commandBody = ` on '${k}'`
            sendDM(memberIDs_Dict[k], messageToSend)
            aux.startCoolDown(M_AUTHOR, msgCooldown, ms('2m'))
            return "Message sent!"
        }
    }
    
    // If the message recipient didn't match anyone in the registry, send error message
    if( !foundUser ){
        return `:x: could't find user with that name. The bot goes off names, not @'s`
    }
}

function sendDM(messageRecipient, messageContent){
    client.users.fetch( messageRecipient ).then((user) => {
        user.send(messageContent);
    }).catch(console.error);
}

module.exports = { DM, sendDM }