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
		this.valToRowIndex = {};
		
		this.cachedResult = [];

		//This was always kludgy and inefficient, but does it even make sense after
		//the changes?
		for(var i = 0, n = this.arr2.length; i < n; i++)
			this.arr2[i] = this.converterToNumber(this.keyExtractor(this.arr2[i]));
		addArrayIndicesToElements(this.arr2);  //mutates passed in arr but not this.arr
		this.arr2.sort(function(ia1, ia2) { return ia1[1] - ia2[1]; });
		
		var lastV = undefined;
		for(var i = 0, n = this.arr2.length; i < n; i++) {
			var val = this.arr2[i][1],
				rowIndex = this.arr2[i][0];
			if(val !== lastV) {
				this.sArr.push(val);
				this.valToRowIndex[val] = [rowIndex];
			} else {
				insertInOrder(this.valToRowIndex[val], rowIndex);
			}
			lastV = this.arr2[i][1];
		}

		function insertInOrder(arr, v) {
			for(var i = 0, n = arr.length; i < n; i++) {
				if(v < arr[i]) {
					arr.splice(i,0,v);
					break;
				}
			}
			if(i === n) { arr.push(v); }
		}

		this.cachedValRange = false;

		return this;

	}

	//This assumes that val2 >= val1
	//What is done with the higher and lower halves is symmetric; can try to make this half as long
	NumberIndex.prototype.select = function(queryObject) {

		"use strict";

		if(queryObject.inRange) {

			return selectRange.call(this, this.converterToNumber(queryObject.inRange[0]),
							   			  this.converterToNumber(queryObject.inRange[1]));

		} else if(queryObject.equal) {

			return selectRange.call(this, this.converterToNumber(queryObject.equal),
										  this.converterToNumber(queryObject.equal));

		} else if(queryObject.min) {

			return this.valToRowIndex[this.sArr[0]];
		
		} else if(queryObject.max) {

			return this.valToRowIndex[this.sArr[this.sArr.length - 1]];

		} else if(queryObject.greaterThanOrEqual) {

			return selectRange.call(this, this.converterToNumber(queryObject.greaterThan), this.sArr[this.sArr.length - 1]);

		} else if(queryObject.lessThanOrEqual) {

			return selectRange.call(this, this.sArr[0], this.converterToNumber(queryObject.lessThan));
		
		}

	}

	function selectRange(v1, v2) {

		if(v1 > v2) {
			throw new Error("NumberIndex: first number must be less than or equal to second number"); 
		}
		
		var enterIndices = [],
			exitIndices = [];

		if(this.cachedValRange) {  //CAN'T I GET RID OF THIS SPECIAL CASE

			if(v1 < this.cachedValRange.v1) {
				
				enterIndices = getIndicesForValRange(this.sArr, this.valToRowIndex, v1, this.cachedValRange.v1, {excludeVal2: true});

			} else if(v1 > this.cachedValRange.v1) {

				exitIndices = getIndicesForValRange(this.sArr, this.valToRowIndex, this.cachedValRange.v1, v1, {excludeVal2: true});

			}

			if(v2 < this.cachedValRange.v2) {

				var moreExitIndices = getIndicesForValRange(this.sArr, this.valToRowIndex, v2, this.cachedValRange.v2, {excludeVal1: true});

				exitIndices = exitIndices.length === 0
					? moreExitIndices
					: db.sets.union(exitIndices, moreExitIndices);

			} else if(v2 > this.cachedValRange.v2) {

				var moreEnterIndices = getIndicesForValRange(this.sArr, this.valToRowIndex, this.cachedValRange.v2, v2, {excludeVal1: true});
				
				enterIndices = enterIndices.length === 0
					? moreEnterIndices
					: db.sets.union(enterIndices, moreEnterIndices);
			}

			if(enterIndices.length !== 0) {
				this.cachedResult = db.sets.union(this.cachedResult, enterIndices);
			}

			if(exitIndices.length !== 0) {
				this.cachedResult = db.sets.complement(exitIndices, this.cachedResult);
			}

		} else {

			this.cachedResult = getIndicesForValRange(this.sArr, this.valToRowIndex, v1, v2);

		}
		
		this.cachedValRange = {v1: v1, v2: v2};	
		
		return this.cachedResult;

	}

	//generalize and move to search.js?
	function getIndicesForValRange(sArr, valToRowIndex, val1, val2, opts) {

		var lowerRange = db.search.findIndexRangeForVal(sArr, val1),
			higherRange = db.search.findIndexRangeForVal(sArr, val2);		

		var lower = lowerRange.lastIndex, //lowerRange.found === true ? lowerRange.firstIndex : lowerRange.lastIndex;
			higher = higherRange.firstIndex; //higherRange.found === true ? higherRange.lastIndex : higherRange.firstIndex;

		
		if(higher < lower) { 

			//above true iff val1 to val2 range is completely before or after the
			//range of values in sArr

			return [];

		} else {

			var result = [];

			for(var i = lower, n = higher + 1; i < n; i++) {
				result.push(valToRowIndex[sArr[i]]);
			}

			if((opts && opts.excludeVal1) && (sArr[lower] === val1)) {
				result.splice(0,1);
			}

			if((opts && opts.excludeVal2) && (sArr[higher] === val2) && (result.length !== 0)) {
				result.splice(-1,1);
			}

			return result.length === 0 ? [] : result.reduce(db.sets.union);
		}
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



