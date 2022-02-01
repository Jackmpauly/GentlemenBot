function check(args){
    if( !aux.messageSentInGuild(true) ){return}
    if( !aux.canUseBot(message.member) ){return}
    if( aux.isRole(message.member, config.botRole) ){return}
    if( aux.isRole(message.member, config.handicapRole) ){cooldownTime = handicapCooldownTime}

    // If the message does NOT mention someone. Call the roll command for boot
    if( !aux.hasMentions(false) ){
        // commandCalled = 'boot (random)'
        // roll('boot')
        return `:x: Random boot has been disabled`
    }
    
    if ( bootCooldown.has(M_AUTHOR.id) ){
        return `:x: You must wait ${aux.getTimeLeft(M_AUTHOR, bootCooldown)} before using $boot again.`
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
        bootMessage = `bye bye ${aux.getTargetName(personToBoot)} :bangbang:`
    }
    

    if( aux.hasModImmunity(personToBoot, true) ){return}
    if( !aux.isInCall(personToBoot) ){return}

    commandBody = ` on '${aux.getTargetName(personToBoot)}'`

    disconnectUser(personToBoot, bootMessage)
    aux.startCoolDown(M_AUTHOR, bootCooldown, cooldownTime)
}

function disconnectUser(target, bootText){
    target.voice.setMute(false)
    target.voice.setChannel(null)
    message.channel.send(bootText)
    log.logActivity()
}

module.exports = { check, disconnectUser }