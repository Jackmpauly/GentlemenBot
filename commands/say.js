module.exports = function(args){
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