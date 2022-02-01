ms = require('ms')
fs = require('fs')

config = require('./config.json') // On Github, this should be replaced by config2.json

aux = require("./commands/auxillary.js")
refresh = require("./commands/refresh.js")
log = require("./commands/updateLogs.js")
quotes = require("./commands/quotes.js");

muteCooldown = new Map()
muteList     = new Map()
deafList     = new Map()
bootCooldown = new Map()
deafCooldown = new Map()
muteRandomCooldown = new Map()
nickCooldown = new Map()
msgCooldown  = new Map()
canceled = new Map()

defaultCooldownTime   = ms(config.defaultCooldownTime)
handicapCooldownTime  = ms(config.handicapCooldownTime)
cooldownTime          = defaultCooldownTime

textToSpeech = false
modImmunity = false;
respondwNick = true;
startTime = 0
juevesCount = 0;

quotesList_Dict = {}
memberIDs_Dict = {}

logsArray = []