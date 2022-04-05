function cd(){
    if( !aux.messageSentInGuild(true) ){return}
    var str = ""
    if( muteCooldown.has(M_AUTHOR.id) ){
        str+= `${"$mute:".padEnd(11, " ")} ${aux.getTimeLeft(M_AUTHOR, muteCooldown)}\n`
    }
    if( deafCooldown.has(M_AUTHOR.id) ){
        str+= `${"$deafen:".padEnd(11, " ")} ${aux.getTimeLeft(M_AUTHOR, deafCooldown)}\n`
    }
    if( bootCooldown.has(M_AUTHOR.id) ){
        str+= `${"$boot:".padEnd(11, " ")} ${aux.getTimeLeft(M_AUTHOR, bootCooldown)}\n`
    }
    if( muteRandomCooldown.has(M_AUTHOR.id) ){
        str+= `${"$mute (random):".padEnd(11, " ")} ${aux.getTimeLeft(M_AUTHOR, muteRandomCooldown)}\n`
    }
    // if( bootRandomCooldown.has(M_AUTHOR.id) ){
    //     str+= `${"$boot (random):".padEnd(11, " ")} ${aux.getTimeLeft(M_AUTHOR, bootRandomCooldown)}\n`
    // }
    if( nickCooldown.has(M_AUTHOR.id) ){
        str+= `${"$setNick:".padEnd(11, " ")} ${aux.getTimeLeft(M_AUTHOR, nickCooldown)}\n`
    }
    if( msgCooldown.has(M_AUTHOR.id) ){
        str+= `${"$message:".padEnd(11, " ")} ${aux.getTimeLeft(M_AUTHOR, msgCooldown)}\n`
    }

    if(str!=""){
        return "`"+str+"`"
    }else{
        return ":x: User doesn't have any cooldowns. Go nuts"
    }
}

function cds(){
    if( !aux.messageSentInGuild(true) ){return}
    let resp = "";
    if( muteCooldown.size > 0 ){
        resp+=`$mute cooldowns:\n`
        resp+=aux.iterateMap( muteCooldown );
    }
    if( deafCooldown.size > 0 ){
        resp+=`$deafen cooldowns:\n`
        resp+=aux.iterateMap( deafCooldown );
    }
    if( bootCooldown.size > 0 ){
        resp+=`$boot cooldowns:\n`
        resp+=aux.iterateMap( bootCooldown );
    }
    if( muteRandomCooldown.size > 0 ){
        resp+=`$mute (random) cooldowns:\n`
        resp+=aux.iterateMap( muteRandomCooldown );
    }
    // if( bootRandomCooldown.size > 0 ){
    //     resp+=`$boot (random) cooldowns:\n`
    //     resp+=aux.iterateMap( bootRandomCooldown );
    // }
    if( nickCooldown.size > 0 ){
        resp+=`$setNick cooldowns:\n`
        resp+=aux.iterateMap( nickCooldown );
    }
    if( msgCooldown.size > 0 ){
        resp+=`$message cooldowns:\n`
        resp+=aux.iterateMap( msgCooldown );
    }

    if(resp!=""){
        return "`"+resp+"`"
    }else{
        return ":x: Nobody has any cooldowns :flushed:"
    }
}

module.exports = { cd, cds }