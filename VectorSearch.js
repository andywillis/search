var us = require('underscore')
//	,	log = require('./Log')
	, core = require('./core')
	,	moduleName = core.getModuleName(__filename)
	,	cl = core.cl
	,	isObject = core.isObject
	,	pad = core.pad
	,	percent = core.percent

VectorSearch = module.exports = (function() {
	
	var that = {}
//	that.version = 0.1
//	that.type = 'Vector Search'

that.init = function init(args) {
  var fn = arguments.callee.name
    , args = (args) ? args : {}

  that.name = args.name || 'Default Vector Space'
  that.base = (args.base) ? args.base : []
  that.space = (args.space) ? args.space : []
//    log.write({type:'info', module: moduleName, fn: fn, short_message:'VectorSpace initialised.'})
}

  that.addVector = function addVector(args) {
    var fn = 'addVector'
      , vObj = {id: null, title: null, hash: null, sqrsum: null}

    var error = (args.object && args.type)
      ? (isObject(args.object))
        ? (args.object.id)
          ? false
          : true
        : true
      : true

    switch(error) {
      case true:
//        log.write({type:'error', module: moduleName, fn: fn, short_message:'Error: An object with an id and vector-type must be supplied.'})
        break;
      default:
        var data = args.object[args.type]
        for (k in vObj) { vObj[k] = args.object[k] }
        if (this.base.length === 0) {
          this.base = data // .sort()
        } else {
          for (el in data) {
            if (this.base.indexOf(data[el]) === -1) this.base.push(data[el])
          }
        }
        var hash = this.getHash(data)
        var sqrtSum = this.getSumRoot(hash)
        vObj.hash = hash
        vObj.sqrsum =sqrtSum
        this.space.push(vObj)
        break;
    }
  }

  that.getInfo = function getInfo() {
    var info = {}
    info.name = this.name
    info.version = this.version
    info.type = this.type
    info.base = this.base || ''
    info.size = this.space.length || 0
    return info
  }

  that.showSpace = function showSpace() {
    return this.space
  }

  that.getHash = function getHash(arr) {
    var bitArr = []
      , last = 0
      , base = this.base
      , temp = []

    for (var el = 0, len = base.length; el < len; el ++) {
      var pos = base.indexOf(arr[el])
      temp.push(pos.toString())
    }
    temp = temp.sort()
    for (var el = 0, len = base.length; el < len; el ++) {
      if (temp.indexOf(el.toString()) === -1) bitArr.push(0)
      if (temp.indexOf(el.toString()) > -1) bitArr.push(1)
    }
    return bitArr.join('')
  }

  that.search = function search(args) {
    var space = this.space
      , results = []
    for (el in space) {
      var entry = {}
      var innerProduct = that.getInnerProduct(args.hash, space[el].hash)
      var sqrtsum = that.getSumRoot(args.hash)
      var sum = innerProduct / (args.sqrtsum * sqrtsum)
      entry.id = space[el].id
      entry.title = space[el].title
//      entry.innerProduct = innerProduct
//      entry.sqrtsum = sqrtsum
      entry.angle = sum
      entry.percent = percent(sum)
      if (sum > 0) results.push(entry)
    }
    return us.sortBy(results, function(num) { return num.angle }).reverse()
  }

  that.getInnerProduct = function getInnerProduct(queryHash, spaceHash) {
    if (queryHash.length > spaceHash.length) spaceHash = pad(spaceHash, queryHash.length - spaceHash.length)
    if (queryHash.length < spaceHash.length) queryHash = pad(queryHash, spaceHash.length - queryHash.length)
    var ip = 0
    for (lop = 0, len = queryHash.length; lop < len; lop ++) {
      var h = parseInt(queryHash[lop]), s = parseInt(spaceHash[lop])
      ip += h * s
    }

    return ip
  }

  that.getSumRoot = function getSumRoot(hash) {
    var self = this
      , ss = 0, sum = 0
      , results = ''

    for (var el = 0, len = hash.length; el < len; el ++) {
      sum += parseInt(hash[el])
    }

    ss = Math.sqrt(sum)

    return ss

  }


	return that

}())