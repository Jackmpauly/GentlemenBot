function logActivity(){
    let datetime = new Date().toLocaleString()
    datetime+=": "
    let logString = ""
    logString+=`${datetime.padEnd(27, " ")} @${M_AUTHOR.username} called: ${message.content.charAt(0)}${commandCalled}`;
    logString+=commandBody;
    

    updateLogs(logString)
}

function updateLogs(logText){
    logsArray[ logsArray.length ] = logText
    logsArray = logsArray.slice( Math.max(logsArray.length - 10, 0) )
    console.log(logText)
}

function logs(){
    let logsStr = ``
    logsStr+=`${`Been running since`.padEnd(27, " ")} ${startTime}\n`
    logsStr+=`${`Text-to-Speech:`.padEnd(27, " ")} ${textToSpeech}\n`
    logsStr+=`${`Mod Immunity:`.padEnd(27, " ")} ${modImmunity}\n`
    logsStr+=`${`Respond with nickname:`.padEnd(27, " ")} ${respondwNick}\n`
    for(let i=0; i<logsArray.length; ++i){
        logsStr+=`${logsArray[i]}\n`
    }
    logsStr = "`"+logsStr+"`"
    return logsStr
}

module.exports = { logActivity, updateLogs, logs }