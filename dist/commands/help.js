hlp = require('../../txt/help.json')

module.exports = function(args) {
    let helpPage = 1

    if ( args[1] && 
        Number.isInteger( parseInt(args[1])) &&
        parseInt(args[1]) > 0 &&
        parseInt(args[1]) <= 4) {
        console.log("here")
        helpPage = parseInt(args[1])
    }

    let helpsheet = `GENTLEMENBOT COMMANDS LIST. PAGE ${helpPage}\nNot including quotes\n\n`
    
    for (let command in hlp[helpPage]) {
        // console.log(command + ": " + hlp[helpPage][command])
        helpsheet += "-- " + command + ":\n " 
        helpsheet +="\t-" + hlp[helpPage][command] + "\n"
    }


    return '`' + helpsheet + '`';
}