/* 
 * search.js Copyright 2012 Andy Willis
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 * ASE format information from http://www.selapa.net/swatches/colors/fileformats.php#adobe_ase
 */

exports = module.exports = vsearch;

// Dependancies
var fs = require('fs')
  , core = require('core')
  , colors = require('colors')
  , _ = require('underscore')

function vsearch(args) {
  var vs = {}
  vs.name = args.name || 'Default Vector Space'
  vs.version = 0.1
  // base is an array against which all new vectors are measured.
  // Everytime a new vector is added base is updated with the vector' data.
  vs.base = args.base ? args.base : []
  // space is where the vectors live.
  vs.space = args.space ? args.space : []

  // Import search configuration file
  vs.importSearchConfig = function importSearchConfig(filename, callback) {
    var obj, p
    fs.readFile(filename, 'utf-8', function(err, data) {
      if (err) {
        console.log('Error importing configuration file'.red)
      } else {
        obj = JSON.parse(data)
        for (p in obj) {
          vs[p] = obj[p]
        }
        callback('VSearch configuration file imported.')
      }
    });
  }

  // Export search configuration (name, base and space)
  vs.exportSearchConfig = function exportSearchConfig(filename, callback) {
    var xport = {}
    xport.name = vs.name;
    xport.base = vs.base;
    xport.space = vs.space;
    filename = filename || 'export.vse'
    fs.writeFile(filename, JSON.stringify(xport), 'utf-8', function(err) {
      if (err) {
        console.log('Error exporting configuration file'.red)
      } else {
        callback('VSearch configuration file exported.')
      }
    });
  }

  // Takes an array of objects, extracts the data from each
  // and loads it into a base array. The base array is deduped.
  vs.extractBase = function extractBase(array, callback) {
    var base = []
    for ( obj in array ) {
      for ( el in array[obj].data) {
        base.push(array[obj].data[el])
      }
    }
    vs.base = core.dedupe(base)
    callback()
  }

  // Returns information on the search object
  // either as a JS object or JSON string
  vs.getInfo = function getInfo(type) {
    var info = {}
    info.name = vs.name
    info.version = vs.version
    info.baseLength = vs.base.length || 0
    info.vectors = vs.space.length || 0
    //info.space = vs.space
    return type && type.toLowerCase() === 'json' ? JSON.stringify(info) : info
  };

  // Returns a list of the vectors in the search space
  vs.showSpace = function showSpace() {
   return vs.space
  };

  vs.addVector = function addVector(args) {
    var vObj = {}
      , obj = args.object, type = args.type, data = args.object.data
      , hash = vs.getHash(data)
      , sqrtSum = vs.getSumRoot(hash)
      , error = (obj && (core.isObject(obj)) && (obj.id) && (obj.data)) ? false : true
      ;

    // Object must exist, must be a real object
    // and must contain an id property and a data property.
    if (error) {
      console.log('Error loading vector');
    } else {
      for (k in obj) { vObj[k] = args.object[k] }
      if (vs.base.length === 0) {
        vs.base = data
      } else {
        // Add missing data to vs.base
        for (el in data) {
          if (vs.base.indexOf(data[el]) === -1) vs.base.push(data[el])
        }
      }
      vObj.hash = hash
      vObj.sqrsum = sqrtSum
      vs.space.push(vObj)
    }
  }

  // Return object hash
  vs.getHash = function getHash(arr) {
    var bitArr = [], last = 0, base = vs.base, temp = [];
    // Compare object data against base and produce location array
    for (var el = 0, len = base.length; el < len; el ++) {
      var pos = base.indexOf(arr[el])
      temp.push(pos.toString())
    }
    temp = temp.sort()
    // Produce a bit array from the location array
    for (var el = 0, len = base.length; el < len; el ++) {
      if (temp.indexOf(el.toString()) === -1) bitArr.push(0)
      if (temp.indexOf(el.toString()) > -1) bitArr.push(1)
    }
    return bitArr.join('')
  }

  // Return square sum of hash
  vs.getSumRoot = function getSumRoot(hash) {
    var ss = 0, sum = 0, results = '';
    for (var el = 0, len = hash.length; el < len; el ++) { sum += parseInt(hash[el]) };
    ss = Math.sqrt(sum)
    return ss
  }

  // Get inner product between a queried vector hash 
  // and the hash of a vector in the search space
  vs.getInnerProduct = function getInnerProduct(queryHash, spaceHash) {
    if (queryHash.length > spaceHash.length) spaceHash = core.pad(spaceHash, queryHash.length - spaceHash.length)
    if (queryHash.length < spaceHash.length) queryHash = core.pad(queryHash, spaceHash.length - queryHash.length)
    var ip = 0
    for (lop = 0, len = queryHash.length; lop < len; lop ++) {
      var h = parseInt(queryHash[lop]), s = parseInt(spaceHash[lop])
      ip += h * s
    }
    return ip
  }

  // Returns a sorted list of found vectors according to hit percent
  vs.search = function search(args) {
    var space = vs.space, results = [];
    for (el in space) {
      var entry = {}
        , innerProduct = vs.getInnerProduct(args.hash, space[el].hash)
        , sqrtsum = vs.getSumRoot(args.hash)
        , sum = innerProduct / (args.sqrtsum * sqrtsum)
        ;

      entry.id = space[el].id
      entry.title = space[el].title
      entry.angle = sum
      entry.percent = core.percent(sum)
      if (sum > 0) results.push(entry)
    }
    return _.sortBy(results, function(num) { return num.angle }).reverse()
  }

  // Returns a console chart
  vs.chart = function (array) {

    var temp = {}
    for (el in array) {
      temp[array[el].title] = array[el].angle*100
    }

    function values(data) { var values = []; for (key in data) { values.push(data[key]) } return values; }
    function sum(data) { var sum = 0; for (key in data) { sum += data[key] } return sum; }
    var config = { s: 'asc', r: '9', b: 'white,green', p: 'no', l: '4' }

    var chartObject = temp
      ,  sort = config['s']
      ;

    var index = 0
      , textColor = 'grey'
      , barColor = 0
      , chartType = '\u2592'
      , rainbow = ['red', 'green', 'white', 'yellow', 'cyan', 'grey']
      , barColors = (config['b'] === 'rainbow') ? rainbow : config['b'].split(',')
      , labels = Object.keys(temp)
      , values = values(temp)
      , sum = sum(temp)
      , labelLengths = labels.map(function(label) { return label.length; })
      , maxLabelSize = Math.max.apply(null, labelLengths)
      , fill = function(str, num) { var padding = new Array(num).join(str); return padding;  }
      , header = '{columnOne}{columnTwo}{columnThree}'
      ;

    header = header
      .replace('{columnOne}', fill(' ', maxLabelSize - 'OBJID'.length + 4) + 'OBJID')
      .replace('{columnTwo}', fill(' ', 4 - '%'.length + 3) + '%')
      .replace('{columnThree}', fill(' ', 11 - 'INSTANCES'.length + 3) + 'INSTANCES')

    console.log('\n');
    console.log(header);
    console.log(fill('-', 70));

    for (label in labels) {

      var thisLabel = labels[label]
        , thisLabelLen = thisLabel.length
        , diff = maxLabelSize - thisLabelLen
        , paddingRequired = (diff === 0) ? false : true
        , outLabels = ''
        , row = '{outLabels} {percentage}  {data}'
        ;

      outLabels = (paddingRequired) ? fill(' ', diff + 1) + '   ' + thisLabel : '   ' + thisLabel;
      barColor = (barColor === barColors.length - 1) ? 0 : barColor + 1
      data = fill(chartType, Math.floor((values[label] - 1)/2))[barColors[barColor]]
      percentageValue = Math.floor(values[label])
      percentageString = (fill(' ', 6 - (percentageValue.toString().length)) + percentageValue + '% ')[textColor]

      row = row
        .replace('{outLabels}', outLabels[textColor])
        .replace('{data}', data)
        .replace('{percentage}', percentageString)

      console.log(row);

    }

    console.log(fill('-', 70));
    console.log(header);
    console.log('\n');

  };

  return vs
}