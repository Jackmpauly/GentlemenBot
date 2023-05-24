const fs = require('fs')
trk = require('../../txt/tracker.json')
var numDays = trk.jakewebs_mutestreak;
var lastMessageDate = trk.mutestreak_lastmessage

// 129600000 ms = 36 hours
// 57600000 ms = 16 hours
// 259200000 ms = 72 hours

function getMuteStreak() {
    readTrackerFile()
    if (getTimeSinceLastMute() > 129600000) {
        // if time since last mute was more than 36 hours, reset the num days
        writeToJSON(0, new Date( Date.parse(lastMessageDate)))
        readTrackerFile()
    }
    return `Jake Webster has called $mute on Varunjit for **${numDays}** consecutive days`
}

function incrementMuteStreak() {
    readTrackerFile()
    rightNow = new Date( (new Date()).getTime() )
    if ( getTimeSinceLastMute() < 129600000 && getTimeSinceLastMute() > 57600000 ) {
        // Increment and change the last date if the command was entered within 16 to 36 hours of the last command
        // TEMP CHANGE. command is 3 days
        writeToJSON(numDays+1, rightNow)
    }
}

function getTimeSinceLastMute() {
    rightNow = new Date( (new Date()).getTime() )
    lastCall = new Date( Date.parse(lastMessageDate))
    // console.log(rightNow)
    // console.log(lastCall)

    return (rightNow.getTime() - new Date( Date.parse(lastMessageDate)).getTime())
}

function writeToJSON(newNumDays, newDate) {
    const newObject = {
        jakewebs_mutestreak:newNumDays,
        mutestreak_lastmessage:newDate
    }

    fs.writeFile('../txt/tracker.json', JSON.stringify(newObject), err => {
        if (err){
            console.log(err)
        } else {
            console.log('File successfully written!')
        }
    });
}

function readTrackerFile() {
    try {
        const jsonString = fs.readFileSync('../txt/tracker.json', 'utf-8');
        const data = JSON.parse(jsonString);
        numDays = data.jakewebs_mutestreak
        lastMessageDate = data.mutestreak_lastmessage
    } catch (err) {
        console.log(err);
    }
}


module.exports = {getMuteStreak, incrementMuteStreak}