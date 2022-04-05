module.exports = function(args){
    // Check if the user is in a server for this command to work
    if( !aux.messageSentInGuild(true) ){return}
    message.delete()
    let res = ""
    if( args[1] ){
        for(let i=1; i<args.length; i++){
            res+=args[i]+" "
        }
        commandBody += " "+res
        return res
    }else{
        return quotes.sayQuote( quotesList_Dict["image"], 0 )
    }
}