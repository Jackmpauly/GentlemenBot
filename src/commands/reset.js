module.exports = function() {
    if( !aux.messageSentInGuild(true) ){return}
    if( aux.isModCommand(message.member) ){return}
    muteCooldown.clear();
    muteList.clear();
    deafCooldown.clear();
    deafList.clear();
    bootCooldown.clear();
    muteRandomCooldown.clear();
    nickCooldown.clear();
    msgCooldown.clear();
    return ' :rotating_light: **~COOLDOWNS RESET~** :rotating_light: '
}