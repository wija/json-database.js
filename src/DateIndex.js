//DateIndex.js

;(function (exports) {

	var jsonDatabase;
	if(typeof module !== 'undefined' && module.exports) { // node
		jsonDatabase = {};
		jsonDatabase.NumberIndex = require('./NumberIndex').NumberIndex;
		d3 = require("d3");
	} else { // browser
		jsonDatabase = window.jsonDatabase;
	}

	function DateIndex(arr, opts) {   		//this should also take a date string format

		var f = d3.time.format("%d-%b-%y");   //MAKE THIS AN ARGUMENT
		opts = opts || {};
		opts.converterToNumber = function(rawDatum) { return f.parse(rawDatum).getTime();}; 
		jsonDatabase.NumberIndex.call(this, arr, opts);

		return this;

	}

	DateIndex.prototype = Object.create(jsonDatabase.NumberIndex.prototype);  //ES5

	exports.DateIndex = DateIndex;

})(typeof exports === 'undefined' ? this.jsonDatabase : exports);
