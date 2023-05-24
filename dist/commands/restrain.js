function toggleRestrainingOrder(){
    restrainingOrder = !restrainingOrder
}

function restrain(channel){
    // console.log(channel.members)
    currentMembersArray = []
    for( const [memberID, member] of channel.members){
        currentMembersArray.push( memberID )
        // console.log(member.nickname)
    }

    // console.log(currentMembersArray)
    // console.log('here')
    for ( let restraining in restraining_orders_Dict ) {
        // console.log('restraining', restraining)
        // console.log('restrained', restraining_orders_Dict[restraining])
        if( currentMembersArray.includes(restraining_orders_Dict[restraining]) && currentMembersArray.includes(restraining) ) {
            // console.log(channel.members.get(restraining_orders_Dict[restraining]))
            disconnectUser( channel.members.get(restraining_orders_Dict[restraining]) )
            
            // setTimeout(() => {
            // }, '5s')
        }
    }
}

function disconnectUser(target){
    // target.voice.setMute(false)
    target.voice.setChannel(null)
    // log.logActivity()
}

module.exports = { toggleRestrainingOrder, restrain, disconnectUser }