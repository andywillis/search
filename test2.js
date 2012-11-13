// Dependancies
var fs = require('fs')
  , core = require('core')
  , colors = require('colors')
  , data = require('./data')
  , vsearch = require('./search')({ name: 'Vector New' })
  ;

core.clear();

vsearch.extractBase(data, function() {
  for ( obj in data ) { vsearch.addVector({ object: data[ obj ] }) }
  save('export.vse')
})

;(function load() {
  vsearch.importSearchConfig('export.vse', function(retTxt) {
    console.log(retTxt.green);
    main()
  })
}())

function main() {
  query = ['dog', 'cat', 'oyster', 'walk']
  hash  = vsearch.getHash(query)
  sqrtSum = vsearch.getSumRoot(hash)
  results = vsearch.search({
    hash: hash,
    sqrtsum: sqrtSum
  })
  //console.log(results);
  vsearch.chart(results);
}

function save(filename) {
  vsearch.exportSearchConfig(filename, function(retTxt) {
    console.log(retTxt.green);
  })
}