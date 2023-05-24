function refresh(){
    if( !aux.messageSentInGuild(true) ){return}
    if( !aux.isRole(message.member, config.adminRole) && !aux.isRole(message.member, config.botRole) ){return}
    return refreshQuotes()
}

function refreshMemberIDs(){
    fs.readFile(config.memberIDsTxt, 'utf8', (err, data) => {
        if(err) throw err;
        var text = data.toString().split('\n')

        var tmp;
        for(let i=1; i<text.length; ++i){
            tmp = text[i].split(',')
            memberIDs_Dict[ tmp[0] ] = tmp[1];
        }

    })
}

function refreshQuotes(){
    fs.readFile(config.quotesTxt, 'utf8', (err, data) => {
        if(err) throw err;
        var text = data.toString().split('\n')
        quotesList_Dict = {}
        for(let i=0; i<text.length; ++i){
            quotesList_Dict[ text[i].substring(0, text[i].indexOf(':') ) ] = text[i].substring( text[i].indexOf(':')+1 ).split('|')
        }
    })
    console.clear() // Clears console to avoid issues with communicating with the imgur server, for some reason
    return '**~quotes refreshed~**'
}

function refreshRestrainingOrders(){
    fs.readFile(config.restrainingOrdersCSV, 'utf8', (err, data) => {
        if(err) throw err;
        var text = data.toString().split('\n')
        restraining_orders_Dict = {}
        var tmp;
        for(let i=1; i<text.length; ++i) {
            tmp = text[i].split(',')
            restraining_orders_Dict[tmp[0]] = tmp[1]
        }
        
    })
}

module.exports = { refresh, refreshMemberIDs, refreshQuotes, refreshRestrainingOrders }