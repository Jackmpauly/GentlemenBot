const config = require('../config.json');

module.exports = async function(args){
	// Check if the user is in a server for this command to work
    if( !aux.messageSentInGuild(true) ){return}
	message.delete()

    if( !aux.canUseBot(message.member) ){return}
    if( aux.isRole(message.member, config.botRole) ){return}
    // Check if the user actually mentioned another user in the message
    if( !aux.hasMentions() ){return}

	const guild = client.guilds.cache.get(config.guild);
	let personToMimic = message.guild.member( message.mentions.users.first() );

	
	// Check if the user had a message to mimic
    // Creates the full message with spaces and all
    let mimicMessage = "";
    for(let i=2; i<args.length; i++){
        mimicMessage+=args[i]+" "
    }

    mimicMessage=mimicMessage.trim()
    
	// Don't do anything if no message is given. to prevent embarassment
    if( mimicMessage=="" ){
        return
    }
	commandBody += " "+mimicMessage

	log.logActivity();

	// SEND WEBHOOK HERE
    try {
		const webhooks = await guild.fetchWebhooks();
		const webhook = webhooks.find(wh => wh.token);

		if (!webhook) {
			return console.log('No webhook was found that I can use!');
		}

		// Move to the new channel
        await webhook.edit({
            channel: message.channel,
        });

		await webhook.send({
			content: mimicMessage,
			username: aux.getTargetName(personToMimic),
			avatarURL: personToMimic.user.avatarURL('png', 4096),
		});
	} catch (error) {
		console.error('Error trying to send a message: ', error);
	}
}