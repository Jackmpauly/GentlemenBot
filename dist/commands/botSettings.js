function tts(){
    textToSpeech = !textToSpeech;
    if( textToSpeech ){
        return 'TTS is **ON**'
    }else{
        return 'TTS is **OFF**'
    }
}

function immunity(){
    if( !aux.messageSentInGuild(true) ){return}
    if( aux.isModCommand(message.member, true) ){return}
    modImmunity = !modImmunity;
    if( modImmunity ){
        return 'Mod Immunity is **ON**'
    }else{
        return 'Mod Immunity is **OFF**'
    }
}

function usenick(){
    if( !aux.messageSentInGuild(true) ){return}
    if( aux.isModCommand(message.member, true) ){return}
    respondwNick = !respondwNick;
    if( respondwNick ){
        return 'Respond with nickname is **ON**'
    }else{
        return 'Respond with nickname is **OFF**'
    }
}

function fileRestrainingOrder(){
    if( !aux.messageSentInGuild(true) ){return}
    if( aux.isModCommand(message.member, false) && message.member.id != '192085682812878848' ){return}
    restrainingOrder = !restrainingOrder;
    if( restrainingOrder ){
        return 'A restraining order has been filed...'
    }else{
        return 'A restraining order has been lifted...'
    }
}


module.exports = { tts, immunity, usenick, fileRestrainingOrder }