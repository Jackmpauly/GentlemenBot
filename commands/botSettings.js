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
    if( aux.isModCommand(message.member) ){return}
    modImmunity = !modImmunity;
    if( modImmunity ){
        return 'Mod Immunity is **ON**'
    }else{
        return 'Mod Immunity is **OFF**'
    }
}

function usenick(){
    if( !aux.messageSentInGuild(true) ){return}
    if( aux.isModCommand(message.member) ){return}
    respondwNick = !respondwNick;
    if( respondwNick ){
        return 'Respond with nickname is **ON**'
    }else{
        return 'Respond with nickname is **OFF**'
    }
}


module.exports = { tts, immunity, usenick }