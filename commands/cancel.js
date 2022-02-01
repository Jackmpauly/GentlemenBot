module.exports = function(args){
    // Check if the user is in a server for this command to work
    if( !aux.messageSentInGuild(true) ){return}
    if( !aux.canUseBot(message.member) ){return}
    if( aux.isRole(message.member, config.botRole) ){return}
    // Check if the user actually mentioned another user in the message
    if( !aux.hasMentions() ){return}

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
        cancelReason="CANCELED: "+cancelReason+" :bangbang:"
    }

    let personToCancel = message.guild.member( message.mentions.users.first() )
    commandBody = ` on '${personToCancel.user.tag}'`

    // Bot cannot be canceled. This would cause too many feedback loops
    if( !aux.isRole(personToCancel, config.botRole) ){
        canceled.set(personToCancel, cancelReason);
        return `${aux.getTargetName(personToCancel)} has been ${cancelReason}`
    }else{
        return `WHAT! I have been ${cancelReason}`
    }
}