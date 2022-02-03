function mute(){
    if( !aux.messageSentInGuild(true) ){return}
    if( !aux.canUseBot(message.member) ){return}
    if( aux.isRole(message.member, config.botRole) ){return}
    if( aux.isRole(message.member, config.handicapRole) ){cooldownTime = handicapCooldownTime}

    // If the message does NOT mention someone. Call the roll command for mute
    if( !aux.hasMentions(false) ){
        commandCalled = 'mute (random)'
        rollMute()
        return
    }

    if( muteCooldown.has(M_AUTHOR.id) ){
        return `:x: You must wait ${getTimeLeft(M_AUTHOR, muteCooldown)} before using $mute again.`
    }

    let personToMute = message.guild.member( message.mentions.users.first() )

    if( aux.hasModImmunity(personToMute, true) ){return}
    if( !aux.isInCall(personToMute) ) {return}

    commandBody = ` on '${aux.getTargetName(personToMute)}'`
    serverTempMute(personToMute, '10') // Argument must be '10' and not '10s' for the response formatting to look nice
    
    aux.startCoolDown(M_AUTHOR, muteCooldown, cooldownTime)
}

function rollMute(){
    if( !aux.messageSentInGuild(true) ){return}
    if( !aux.canUseBot(message.member) ){return}

    // Create a set of channels under the general category (General Alpha, General Bravo, General 杰罗姆)
    const channels = message.guild.channels.cache.filter(c => c.parentID === '419336089166413825' && c.type === 'voice');
    let currentMembersArray = [];
    let allImmune = true;
    // Add members that are in any of these channels to an array currentMembersArray
    // Check each member for mod immunity. If all members are immune, cancel the command
    for( const [channelID, channel] of channels ){
        for( const [memberID, member] of channel.members){
            currentMembersArray.push( member )
            if( !aux.hasModImmunity(member, false) ){
                allImmune = false;
            }
        }
    }

    // If nobody is in the call
    if( currentMembersArray.length == 0 ){
        return ":x: Nobody is in the call D:"
    }

    // If all members in the call are immune
    if( allImmune ){
        return "All call members are immune :sunglasses:"
    }

    // Cooldown messages
    if ( muteRandomCooldown.has(M_AUTHOR.id) ){
        return `:x: You must wait ${aux.getTimeLeft(M_AUTHOR, muteRandomCooldown)} before rolling $mute again.`
    }

    // Get a random number between 0 and the number of users in the call
    let rand = Math.floor(Math.random() * currentMembersArray.length)
    let rollTarget = currentMembersArray[rand]

    // If the user selected for deletion is immune, try again
    while( aux.hasModImmunity(rollTarget, false) ){
        rand = Math.floor(Math.random() * currentMembersArray.length)
        rollTarget = currentMembersArray[rand]
    }

    
    // Mute the user for 20 seconds
    serverTempMute(currentMembersArray[rand], '20') // Argument must be '20' and not '20s' for the response formatting to look nice
    aux.startCoolDown(M_AUTHOR, muteRandomCooldown, defaultCooldownTime)
}

function serverTempMute(target, time){
    target.voice.setMute(true)
    muteList.set( target.id, new Date() )
    message.channel.send( `'${aux.getTargetName(target)}' has been server muted for ${time} seconds`)

    setTimeout(function(){
        if( target.voice.channel ){
            target.voice.setMute(false)
            muteList.delete( target.id )
            message.channel.send( '\''+aux.getTargetName(target)+'\' has been unmuted')
        }else{
            muteList.delete( target.id )
            message.channel.send( '\''+aux.getTargetName(target)+'\' has been taken off the mute list')
        }
    }, ms(time+'s') )

    log.logActivity()
}

module.exports = { mute, serverTempMute }