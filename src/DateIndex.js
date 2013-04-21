//DateIndex.js

;(function (exports) {

	var db;
	if(typeof module !== 'undefined' && module.exports) { // node
		db = {};
		db.NumberIndex = require('./NumberIndex').NumberIndex;
		//d3 = require('d3');
	} else { // browser
		db = window.db;
	}

	function DateIndex(arr, opts) {   		//this should also take a date string format

		//var f = d3.time.format("%d-%b-%y");   //MAKE THIS AN ARGUMENT
		//function(rawDatum) { return f.parse(rawDatum).getTime();};
		var opts = opts || {};
		opts.converterToNumber = opts.converterToNumber || function(rawDatum) { return new Date(rawDatum).getTime();}; 
		db.NumberIndex.call(this, arr, opts);

		return this;

	}

	DateIndex.prototype = Object.create(db.NumberIndex.prototype);  //ES5

	exports.DateIndex = DateIndex;

})(typeof exports === 'undefined' ? this.db : exports);
