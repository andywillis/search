var fs = require('fs')
	, os = require('os')
	,	colors = require('colors').setTheme({error: 'red'})
	,	core = require('./core')
	,	moduleName = core.getModuleName(__filename)
	,	cl = core.cl
	, async = require('async')
	,	inspect = require('util').inspect

module.exports = Log = (function() {

	var fn = 'Log'
		,	args = (args) ? args : {}
		,	filename = (new Date().getTime()) / 1000 + '.log'
		,	defaultPath = './log/'
		,	log = {}

	log.type = 'Log engine'
	log.version = 0.1
	log.name = 'Default'
	log.filename = filename
	log.path = defaultPath
	log.console = true

	log.init = function(args) {
		
		var msgArr = []

		async.parallel([
			
			function(callback) {
				if (args.clear && args.clear === true) {
					log.clearLog(args, function(status) {
						var msg = 'Log folder cleared.'
						callback( null, msg )
					})
				}
			},
			
			function(callback) {
				if (args.name) log.name = args.name
				if (args.path) log.path = args.path
				if (args.console !== null) log.console = args.console
				var msg = 'Log initialised.\n' + inspect(log.getInfo())
				callback( null, msg )
			}
		],

		function(err, results) {
			log.logFile = fs.createWriteStream(log.path + filename)
			for (msg in results) console.log(results[msg])
		})
	
	}

	log.clearLog = function(args, callback) {
		var dir = fs.readdir(log.path, function(err, files){
			if (err) cl(err)
			else {
				for (file in files) {
					var path = log.path + files[file]
					fs.unlink(path, function(status){
						var error = (status === null) ? false : true
						switch (status) {
							case true:
								cl(status)
								break;
						}
					})
				}
				callback()
			}
		})
	}

	log.getInfo = function() {
		var info = {}
		info.type = log.type
		info.version = log.version
		info.name = log.name
		info.path = log.path
		info.filename = log.filename
		info.console = log.console
		return info
	}

	log.write = function(args) {
		var tempArr = [], logObj
			,	short_message = (typeof args.short_message == 'object') ? JSON.stringify(args.short_message) : args.short_message

		logObj = {
				type: args.type
			,	module: args.module
			,	fn: args.fn
			,	host: os.hostname()
			,	timestamp: (new Date().getTime()) / 1000
			,	short_message: short_message
			,	full_message: null
			,	level: args.level
			,	facility: null
		}
		,	json = JSON.stringify(logObj, null, '\t')
		,	writeToDisk = function writeToDisk(data) {
				log.logFile.write(data + '\n')
			}

		if (log.logFile) {
			writeToDisk(json)
		} else {
			tempArr.push(json)
			setTimeout(function(){
				writeToDisk(tempArr.join())
				tempArr.length = 0
			}, 1000)
		}

		if (log.console) {
			switch(args.type) {
				case 'error':
					cl((short_message).error)
					break;
				default:
					cl(short_message + '\n')
					break;
			}
		}

	}

	return log

}())