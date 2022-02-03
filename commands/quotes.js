// Checks if the $ command was a quote key. If it is, do sayQuote? or maybe return true? or maybe return the key
function quote(arg0, arg1){
    response = ""
    // Loop through the qDict. (the keys/ trigger phrases)
    for(let key in quotesList_Dict){
        // If the key was found/ If the $ command used actually had a response...
        if( arg0 == key ){
            // The "all" command
            if( arg1 == "all" ){
                return sayAll(key)
            }

            return sayQuote( quotesList_Dict[key], arg1 )
        }
    }
}

function sayAll(key){
    if( !aux.messageSentInGuild(true) ){return}
    if( !aux.isRole(message.member, config.adminRole) ){ 
        return ":x: Only jack can call this command. It's too taxing on the bot for just anyone to use it"
    }

    let index = 1
    while(index <= quotesList_Dict[key].length){
        message.channel.send( `.$${key} ${index}: ${sayQuote( quotesList_Dict[key], index )}` )
        ++index
    }
    return ":white_check_mark: **Done**"
}

function sayQuote(arrayText, sayQuoteArg){
    var resp = 0
    var sayQuotereply
    let quoteIndex
    if( !Number.isInteger( parseInt(sayQuoteArg) ) && sayQuoteArg!=undefined ){
        if( sayQuoteArg == "length" ){
            return `*${arrayText.length}*`;
        }
        if( sayQuoteArg == "last" ){
            return sayQuote( arrayText, arrayText.length )
        }
    }
    
    quoteIndex = parseInt(sayQuoteArg)
    if( !quoteIndex || ((quoteIndex-1) >= arrayText.length) || ((quoteIndex-1) < 0) ){
        resp = Math.floor(Math.random() * arrayText.length)
    }else{
        resp = quoteIndex-1;
    }
    sayQuotereply = arrayText[resp]

    // Account for new lines
    while( sayQuotereply.includes("\\n") ){
        sayQuotereply = sayQuotereply.replace("\\n", "\n")
    }
    return sayQuotereply;
}


module.exports = { quote, sayQuote }