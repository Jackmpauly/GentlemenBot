module.exports = function(){
    // CANCELLED !!
    if( aux.messageSentInGuild(false) && canceled.has( message.guild.members.cache.get(M_AUTHOR.id) ) ){
        message.reply(` you are ${canceled.get(message.guild.members.cache.get(M_AUTHOR.id))}`);
        canceled.delete( message.guild.members.cache.get(M_AUTHOR.id) )
    }

    // PERMISSION !!
    if(  message.content === "Permission" || message.content === "permission" || message.content === "Permission?" || message.content === "permission?" ){
        if( M_AUTHOR.id === config.evanID ){
            message.channel.send("Granted");
        }else{
            message.channel.send("PERMISSION DENIED");
        }
    }
}