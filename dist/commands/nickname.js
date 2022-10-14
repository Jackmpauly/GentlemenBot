module.exports = function(args){
    // Check if the user is in a server for this command to work
    if( !aux.messageSentInGuild(true) ){return}

    if( !aux.canUseBot(message.member) ){return}
    if( aux.isRole(message.member, config.botRole) ){return}
    // Check if the user actually mentioned another user in the message
    if( !aux.hasMentions() ){return}


    // Check if the user had a nickname to set
    // Creates the full nickname with spaces and all
    let fullNickName = "";
    for(let i=2; i<args.length; i++){
        fullNickName+=args[i]+" "
    }

    fullNickName=fullNickName.trim()
    
    if( fullNickName=="" ){
        message.channel.send(":x: You must specify the target's new name")
        return
    }
    if( !(fullNickName.length<=32) ){
        fullNickName = fullNickName.substring(0, 31);
        // message.channel.send(":x: Nickname must be 32 characters or fewer in length")
        // return
    }
    // Check if user calling $setNick used $setNick recently
    if ( nickCooldown.has(M_AUTHOR.id) ){
        message.channel.send(`:x: You must wait ${aux.getTimeLeft(M_AUTHOR, nickCooldown)} before using $setNick again.`)
        return
    }

    let personToChange = message.guild.member( message.mentions.users.first() )

    if( (aux.isRole(personToChange, config.adminRole) || aux.isRole(personToChange, config.botRole) || aux.isRole(personToChange, config.coAdminRole)) ){
        return `:x: Discord.js literally does not allow for bots to change the nicknames of admins. I've done all I can. Take it up with them. \n https://stackoverflow.com/questions/56117594/discord-js-bot-dosnt-have-permission-to-manage-nicknames`
    }

    commandBody = ` on '${personToChange.user.tag}'`

    let OGNickName = aux.getTargetName(personToChange)
    personToChange.setNickname( fullNickName )

    if( OGNickName == fullNickName ){
        return `'${OGNickName}' is still: '${fullNickName}' !!`
    }
    
    aux.startCoolDown(M_AUTHOR, nickCooldown, ms('2m')) // Cooldown: 2 minutes
    return `'${OGNickName}' is now: '${fullNickName}' !!`
}