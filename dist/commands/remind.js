module.exports = function(args){
    let minutesRemind = 0;
    if( Number.isInteger(parseInt(args[1])) ){
        minutesRemind = parseInt(args[1])
    }else{
        message.channel.send(`:x: Must specify time to remind in minutes`);
        return
    }
    remindUser(M_AUTHOR, minutesRemind);
}

function remindUser(target, time){
    if(remindList.has(target.id) ) remindList.delete(target.id);
    remindList.set( target.id, new Date() )
    message.channel.send( `Got it. Tagging in ${time} minutes`)

    setTimeout(function(){
        remindList.delete( target.id )
        message.channel.send(`<@${target.id.toString()}>! Reminder after ${time} minutes!`)
    }, ms(time+'m') )

    log.logActivity()
}