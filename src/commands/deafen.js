function selfDeafen(){
    if( !aux.messageSentInGuild(true) ){return}
    if( !aux.canUseBot(message.member) ){return}
    let selfDeaf = message.guild.members.cache.get(M_AUTHOR.id); // set self as person to deafen

    if( deafList.has(selfDeaf.id )){
        return ':x: user is still on the deafenlist.'
    }

    if( !aux.isInCall(selfDeaf) ) {return}

    selfDeaf.voice.setDeaf( !selfDeaf.voice.serverDeaf );
    if( selfDeaf.voice.serverDeaf ){
        return ':white_check_mark: You are now undeafened'  
    }else{
        return ':white_check_mark: You are now deafened'
    }
}

function deafen(){
    if( !aux.messageSentInGuild(true) ){return}
    if( !aux.canUseBot(message.member) ){return}
    if( aux.isRole(message.member, config.botRole) ){return}
    if( aux.isRole(message.member, config.handicapRole) ){cooldownTime = handicapCooldownTime}

    // If the message does NOT mention someone. Call the roll command for deafen
    if( !aux.hasMentions(false) ){
        return ':x: deafen requires a target'
    }

    if( deafCooldown.has(M_AUTHOR.id) ){
        return `:x: You must wait ${aux.getTimeLeft(M_AUTHOR, deafCooldown)} before using $deafen again.`
    }

    let personToDeaf = message.guild.member( message.mentions.users.first() )

    if( aux.hasModImmunity(personToDeaf, true) ){return}
    if( !aux.isInCall(personToDeaf) ) {return}

    commandBody = ` on '${aux.getTargetName(personToDeaf)}'`
    serverTempDeaf(personToDeaf, '10') // Argument must be '10' and not '10s' for the response formatting to look nice
    
    
    aux.startCoolDown(M_AUTHOR, deafCooldown, cooldownTime)
}

function serverTempDeaf(target, time){
    target.voice.setDeaf(true)
    deafList.set( target.id, new Date() )
    message.channel.send( `'${aux.getTargetName(target)}' has been server deafened for ${time} seconds`)

    setTimeout(function(){
        if( target.voice.channel ){
            target.voice.setDeaf(false)
            deafList.delete( target.id )
            message.channel.send( '\''+aux.getTargetName(target)+'\' has been undeafened')
        }else{
            deafList.delete( target.id )
            message.channel.send( '\''+aux.getTargetName(target)+'\' has been taken off the deafen list')
        }
    }, ms(time+'s') )

    log.logActivity()
}

module.exports = { selfDeafen, deafen }