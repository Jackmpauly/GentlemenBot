const restrain = require('./commands/restrain.js')

module.exports = async function (oldState, newState) {
    // console.log('OLD: ', oldState.channelID)
    // console.log('NEW: ', newState.channelID)
    if (newState.channelID != null ) {
        // console.log('user joined or moved channels')
        channel = newState.guild.channels.cache.get(newState.channelID)
        if ( restrainingOrder ) {
            // if the restrainingOrder is active, restrain!
            restrain.restrain(channel)
        }
    }

    // if (newState.channelID === null) {
    //     console.log('user left channel', oldState.channelID);
    // }
    // else {
    //     console.log('user joined or moved channels')
    //     channel = newState.guild.channels.cache.get(newState.channelID)
    //     if ( restrainingOrder ) {
    //         // if the restrainingOrder is active, restrain!
    //         restrain.restrain(channel)
    //     }
    // }

}