//NumberIndex.js

;(function (exports) {

	var db;
	if(typeof module !== 'undefined' && module.exports) { // node
		db = {};
		db.sets = require('./sets').sets;
		db.search = require('./search').search; 
	} else { // browser
		db = window.db;
	}

	function NumberIndex(arr, opts) {

		var opts = opts || {};
		this.keyExtractor = opts.keyExtractor || function(o) { return o; };
		this.converterToNumber = opts.converterToNumber || function(d) { return +d; };

		this.arr2 = arr.slice(0); 		
		this.sArr = []; 				//values sorted in ascending order
		this.sArrIndexToRowIndex = [];  //row indices corresponding to sorted values
		
		for(var i = 0, n = this.arr2.length; i < n; i++)
			this.arr2[i] = this.converterToNumber(this.keyExtractor(this.arr2[i]));

		//This is a kludgy and inefficient approach; instead, a sort algorithm could be modified
		//to simultaneously generate both arrays
		addArrayIndicesToElements(this.arr2);  //mutates passed in arr but not this.arr
		this.arr2.sort(function(ia1, ia2) { return ia1[1] - ia2[1]; });
		splitArrayIndicesAndElements(this.arr2, this.sArrIndexToRowIndex, this.sArr);

		return this;

	}

	//This assumes that val2 >= val1
	//What is done with the higher and lower halves is symmetric; can try to make this half as long
	NumberIndex.prototype.select = function(val1, val2) {

		"use strict";

		var v1 = this.converterToNumber(val1),
			v2 =  this.converterToNumber(val2);

		if(v1 > v2) {
			throw new Error("NumberIndex: first number must be less than or equal to second number"); 
		}

		var indexRange = db.search.findIndexRangeForValRange(this.sArr, v1, v2);

		if(!indexRange) {
			return [];
		} else {
			return indicesToElements(this.sArrIndexToRowIndex, indexRange.firstIndex, indexRange.lastIndex);
		}

	}

	function indicesToElements(arr, firstIndex, lastIndex) {

		var result = [];

		for(var i = firstIndex, n = lastIndex + 1; i < n; i++)
			result.push(arr[i]);	

		return result.sort(function(a,b) { return a - b; });
	}

	//destructive
	function addArrayIndicesToElements(arr) {
		for(var i = 0, n = arr.length; i < n; i++) {
			arr[i] = [i, arr[i]];
		}
	}

	function splitArrayIndicesAndElements(arr, arrIndices, arrValues) {
		for(var i = 0, n = arr.length; i < n; i++) {
			arrIndices.push(arr[i][0]); //arrIndices.push(arr[i].index);
			arrValues.push(arr[i][1]);  //arrValues.push(arr[i].value);
		}
	}

	exports.NumberIndex = NumberIndex;

})(typeof exports === 'undefined' ? this.db : exports);



