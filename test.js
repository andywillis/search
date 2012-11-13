/*
* Dependancies */

var vectorSearch = require('./VectorSearch')
	, core = require('core')
//	, log = require('./Log')
	,	moduleName = core.getModuleName(__filename)
	, fn = arguments.callee.name

/*
* Variables */

var cl = core.cl, clear = core.clear, asFormattedArray = core.asFormattedArray, timeFn = core.timeFn
	,	end, post, postArray, hash, query, results, runSearch, sqrtSum, start, time

/*
* Main */

clear()

//log.init({ console: true, clear: true, name: 'Search' })
vectorSearch.init({ name: 'Deviation Vector Search' })

postArray = [
		{ id:'1', title:'One', data:['field','poppy','sandwich bay','walk'], category:'Science Fiction and Fantasy' }
	,	{ id:'2', title:'Two', data:['walk'], category:'Science Fiction and Fantasy' }
	,	{ id:'3', title:'Three', data:['moose','poppy','walk'], category:'Science Fiction and Fantasy' }
	,	{ id:'4', title:'Four',	data:['barney','betty'], category:'Science Fiction and Fantasy' }
	,	{ id:'5', title:'Five',	data:['barney','betty'], category:'Science Fiction and Fantasy' }
	,	{ id:'6', title:'Six',	data:['dog','cat','malcolm','walk','barney','talker'], category:'Science Fiction and Fantasy' }
	,	{ id:'7', title:'Seven', data:['moose','andy'], category:'Science Fiction and Fantasy' }
	,	{ id:'8', title:'Eight', data:['barney','betty','moose'], category:'Science Fiction and Fantasy' }
	,	{ id:'9', title:'Nine',	data:['oyster','pinocle'], category:'Science Fiction and Fantasy' }
]

for ( post in postArray ) {
	vectorSearch.addVector({ object: postArray[ post ] })
}

query = asFormattedArray( 'oyster, betty, pinocle', ',' )
hash 	= vectorSearch.getHash(query)
sqrtSum = vectorSearch.getSumRoot(hash)
console.log(vectorSearch)
runSearch = function runSearch() {
	results = vectorSearch.search({
		hash:hash,
		sqrtsum:sqrtSum
	})
//	log.write({type:'info', module: moduleName, fn: fn, short_message:results})
}

runSearch()

/*
timeFn( runSearch, 'm', function(data) {
	log.write({type:'info', module:moduleName, fn:fn, short_message:data})
})
*/