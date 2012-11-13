var vsearch = module.exports = {};

vsearch.addVector = function addVector(args) {
  
  var vObj = {id: null, title: null, hash: null, sqrsum: null}
    , error = false
    , obj = args.object
    , type = args.type
    , data = args.object.data

  error = ((obj && type) && (core.isObject(obj)) && (obj.id)) ? false : true

  if (!error) {

    for (k in obj) {
      vObj[k] = args.object[k];
    }

    if (this.base.length === 0) {
      this.base = data
    } else {
      for (el in data) {
        if (this.base.indexOf(data[el]) === -1) this.base.push(data[el])
      }
    }

    var hash = vsearch.getHash(data)
    var sqrtSum = vsearch.getSumRoot(hash)
    vObj.hash = hash
    vObj.sqrsum =sqrtSum
    vsearch.space.push(vObj)
  }

}

vsearch.getInfo = function getInfo() {
  var info = {}
  info.name = this.name
  info.version = this.version
  info.type = this.type
  info.base = this.base || ''
  info.size = this.space.length || 0
  return info
}

proto.showSpace = function showSpace() {
  return this.space
}

proto.getHash = function getHash(arr) {
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

proto.search = function search(args) {
  var space = this.space
    , results = []
  for (el in space) {
    var entry = {}
    var innerProduct = proto.getInnerProduct(args.hash, space[el].hash)
    var sqrtsum = proto.getSumRoot(args.hash)
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

proto.getInnerProduct = function getInnerProduct(queryHash, spaceHash) {
  if (queryHash.length > spaceHash.length) spaceHash = pad(spaceHash, queryHash.length - spaceHash.length)
  if (queryHash.length < spaceHash.length) queryHash = pad(queryHash, spaceHash.length - queryHash.length)
  var ip = 0
  for (lop = 0, len = queryHash.length; lop < len; lop ++) {
    var h = parseInt(queryHash[lop]), s = parseInt(spaceHash[lop])
    ip += h * s
  }

  return ip
}

proto.getSumRoot = function getSumRoot(hash) {
  var self = this
    , ss = 0, sum = 0
    , results = ''

  for (var el = 0, len = hash.length; el < len; el ++) {
    sum += parseInt(hash[el])
  }

  ss = Math.sqrt(sum)

  return ss

}