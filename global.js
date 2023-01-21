ms = require('ms') // For nice millisecond to readable time conversions
fs = require('fs') // For file reading

config = require('./config.json') // The config file with specific server details. On Github, this should be replaced by config2.json

// Global scripts used in commands throughout the scope of the bot
aux     = require("./commands/auxillary.js")    // Auxillary commands such as checking validity of message
refresh = require("./commands/refresh.js")      // Refreshing/Fetching the quotes/member ids 
log     = require("./commands/updateLogs.js")   // The command logs
quotes  = require("./commands/quotes.js");      // The quotes

// The Lists/Maps that map users to their time in the map.
// Used for timing out users, cooldown times, etc.
muteCooldown = new Map()
muteList     = new Map()
deafList     = new Map()
remindList   = new Map()
bootCooldown = new Map()
deafCooldown = new Map()
muteRandomCooldown = new Map()
nickCooldown = new Map()
msgCooldown  = new Map()
canceled = new Map()

// Cooldown times for commands
// Handicap cooldown is used to help commonly targeted users
defaultCooldownTime   = ms(config.defaultCooldownTime)
handicapCooldownTime  = ms(config.handicapCooldownTime)
cooldownTime          = defaultCooldownTime

// Bot Settings
textToSpeech = false
modImmunity = false;
respondwNick = true;

startTime = 0   // The starting time for the bot. Should be a Date() object
juevesCount = 0 // A counter for how many times $jueves has been called.

// The two dictionaries storing the quotes as well as member IDs
quotesList_Dict = {}
memberIDs_Dict = {}

// The array for all logs. Should remain throughout time bot is active
logsArray = []