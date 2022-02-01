module.exports = function(){
    // Check if the user is in a server for this command to work
    if( !aux.messageSentInGuild(true) ){return}
            
    let M_AUTHOR_GUILDMEMBER = message.guild.members.cache.get(M_AUTHOR.id);
    let res = ""

    if( !aux.isInCall(M_AUTHOR_GUILDMEMBER) ){return}

    if( !(M_AUTHOR_GUILDMEMBER.voice.serverMute && !muteList.has(M_AUTHOR_GUILDMEMBER.id)) ){
        message.channel.send(':x: user is already unmuted or is still on the mute list')
    }else{
        M_AUTHOR_GUILDMEMBER.voice.setMute(false);
        res = ':white_check_mark: user has been unmuted'
    }

    if( !(M_AUTHOR_GUILDMEMBER.voice.serverDeaf && !deafList.has(M_AUTHOR_GUILDMEMBER.id)) ){
        message.channel.send(':x: user is already undeafened or is still on the deafen list')
    }else{
        M_AUTHOR_GUILDMEMBER.voice.setDeaf(false);
        res = ':white_check_mark: user has been undeafened'
    }

    return res
}