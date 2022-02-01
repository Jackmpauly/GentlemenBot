function messageSentInGuild(replyWithMessage){
    if(message.guild != null){
        return true
    }else{
        if(replyWithMessage){message.channel.send(":x: This command must be sent in a server to work")}
        return false
    }
}

function isRole(identifier, roleName){
    return ( identifier.roles.cache.some(r => r.name === roleName) )
}

function canUseBot(identifier){
    if( (identifier.roles.cache.size-1)==0 ){
        message.channel.send(':x: You must have at least 1 role to use this command. This is to counteract throwaway or spam accounts')
        return false;
    }else{
        return true;
    }
}

function hasModImmunity(targetPerson, replyWithMessage){
    if( (isRole(targetPerson, config.adminRole) || isRole(targetPerson, config.botRole) || isRole(targetPerson, config.coAdminRole)) && modImmunity ){
        if(replyWithMessage){message.channel.send(`:x: you can't do that to him, he's built different`)}
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

function isInCall(targetPerson){
    if( !targetPerson.voice.channel ){
        message.channel.send(':x: Target user is not in a voice channel')
        return false
    }else{
        return true
    }
}

function hasMentions(replyWithMessage){
    if(message.mentions.members.size <= 0){
        if(replyWithMessage){message.channel.send(':x: You must mention someone for this command to work')}
        return false
    }else{
        return true
    }
}

function iterateMap( cooldown ){
    let ret = ``;
    if( cooldown.size > 0 ){
        for( let[k, v] of cooldown ){
            let onCD = message.guild.members.cache.get(k).user;
            ret+= `${onCD.username.padEnd(11, " ")} ${getTimeLeft(onCD, cooldown)}\n`;
        }
    }
    return ret;
}

function getTargetName( target ){
    let targetName=``;
        if( target.nickname && respondwNick){
            targetName=`${target.nickname}`
        }else{
            targetName=`${target.user.tag}`
        }
        return targetName
}

function startCoolDown( target, cooldownMap, time ){
    if( cooldownMap.has( target.id ) ){
        cooldownMap.delete( target.id )
    }
    cooldownMap.set( target.id, new Date( (new Date()).getTime() + time) )
    setTimeout(() => {
        // Removes the target from the set after time
        cooldownMap.delete( target.id )
    }, time)
}

function getTimeLeft( target, cooldownSet ){
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

function diff_minutes(dt1, dt2){
    var diff = (dt2.getTime() - dt1.getTime() ) / 1000
    diff /= 60

    return Math.abs( Math.round(diff) )
}


module.exports = { messageSentInGuild, isRole, canUseBot, hasModImmunity, isModCommand, isInCall, hasMentions, iterateMap, getTargetName, startCoolDown, getTimeLeft, diff_minutes }