//search.js

;(function(exports) {

	function linearSearch(arr, val) {
		for(var i = 0, n = arr.length; i < n; i++) {
			if(arr[i] === val) return i;
		}
		return -1;
	}

	/*
		binarySearch(sArr, val, lower, upper)

		sArr: array sorted in ascending order [2,5,8,8,10,11,11,13,45]
		val: a value to be found (perhaps 8)

		Returns an object with a found property (true or false) and lower,
		midpoint, and upper properties that contain the values of these 
		internal variables when the search completed. These are used by 
		findIndexRangeForVal and findIndexRangeForValRange to speed up
		searches that are variations on past searches.

		This closely tracks Bentley's implementation.

		The arguments to bitwise operators are treated as signed 32 bit
		integers in big-endian order; the below implementation will,
		thus, break if the length of the array exceeds 2147483648.  
		However, that is also the maximum length of an Array in the
		ECMAScript standard.

	*/

	function binarySearch(sArr, val, lower, upper) {
		
		var lower = lower || 0, 
			upper = upper || sArr.length - 1, 
			midpoint = 0;

		while (lower <= upper) {
			midpoint = lower + ((upper - lower) >> 1);
			if (sArr[midpoint] < val) {
				lower = midpoint + 1;
			} else if (sArr[midpoint] === val) {
				return {"found": true, "lower": lower, "midpoint": midpoint, "upper": upper};
			} else {
				upper = midpoint - 1;
			}
		}
		return {"found": false, "lower": lower, "midpoint": midpoint, "upper": upper};
	}

	//WHAT IF THE VAL IS NOT THERE?
	/*

		findIndexRangeForVal(sArr, val, lower, upper) 

		Required arguments:

		sArr: array sorted in ascending order [2,5,8,8,10,11,11,13,45]
		val: a value to be found (perhaps 8)
		
		There are five possible returns. This is not ideal, but the key point
		is that what is returned by findIndexRangeForVal remain consistent with
		findIndexRangeForValRange's expectations.

		(1) If val exists multiple times in sArr, object literal returned contains:

		found: true
		firstIndex: the first index in sArr where the element appears (2) 
		lastIndex: the last index in sArr where the element appears (3)

		(2) If val exists only once, as above, but firstIndex = lastIndex.

		(3) If val is smaller than any element in sArr, the object literal contains:

		found: false
		firstIndex: -1
		lastIndex: 0

		(4) If val is larger than any element in sArr, the object literal contains:

		found: false
		firstIndex: sArr.length - 1
		lastIndex: sArr.length

		(5) If val is between elements in sArr, the object literal contains:

		found: false
		firstIndex: index of closest smaller
		lastIndex: index of closest larger

	*/

	function findIndexRangeForVal(sArr, val, lower, upper) {

		var searchResult = binarySearch(sArr, val, lower || 0, upper || sArr.length - 1);

		if(searchResult.found === false) 
			return {"found": false, "firstIndex": searchResult.lower - 1, "lastIndex": searchResult.upper + 1};
		
		//for exclude endVal, need to decrement until reach different value
		for(var maxIndex = searchResult.midpoint, 
				beyondMax = searchResult.upper; 
			sArr[maxIndex] === val && maxIndex <= beyondMax; 
			maxIndex++) ;
		
		//for exclude startVal, need to increment until reach different value
		for(var minIndex = searchResult.midpoint, 
				beyondMin = searchResult.lower; 
			sArr[minIndex] === val && minIndex >= beyondMin; 
			minIndex--) ;

		return {"found": true, "firstIndex": minIndex + 1, "lastIndex": maxIndex - 1};

	}
/*
	function findLowerForNextVal(sArr, foundFirstLastObj) {
		if(foundFirstLastObj.found) {
			var val = sArr[foundFirstLastObj.lastIndex];
			for(var i = foundFirstLastObj.lastIndex, n = sArr.length; 
				sArr[i] === val && i < n; 
				i++) ;
			return i;
		} else {
			return foundFirstLastObj.lastIndex; //works for case 4? if so, is this special case even needed?
 		}
	}
*/

	/*
		findIndexRangeForValRange(sArr, val1, val2, lower, upper)

		Required arguments:

		sArr: array sorted in ascending order [2,5,8,8,10,11,11,13,45]
		val1: the first value (perhaps 7)
		val2: the second value - must >= val1 (perhaps 11)

		Called with these, the function returns an object literal with two
		properties:

		firstIndex: the index of the first element of sArr that is >= val1 (2)
		lastIndex: the index of the last element of sArr that is <= val2 (6)
		
		If there is no element that is both >= val1 and <= val2, "false" is
		returned.

		Optional arguments:

		lower: the first index at which either val could possibly appear
		upper: the last index at which either val could possibly appear

		These make sense mainly in the context of IndexedNumericalColumn,
		which uses the result of this function to inform future calls to this
		function.  
	*/

	function findIndexRangeForValRange(sArr, val1, val2, lower, upper) {

		if(typeof lower !== "undefined" && typeof upper !== "undefined") {
			var lowerRange = findIndexRangeForVal(sArr, val1, lower, upper);
			var higherRange = findIndexRangeForVal(sArr, val2, lower, upper);
		} else {
			var lowerRange = findIndexRangeForVal(sArr, val1);
			var higherRange = findIndexRangeForVal(sArr, val2);		
		}

		//While we require that val1 < val2, there is no guarantee that the 
		//index of val1 in sArr < the index of val2 in sArr  BUT ISNT THERE?????? ITS SORTED!!!!
		//and, if not, the final range returned will be incorrect.  Thus, we swap.
		if(lowerRange.firstIndex <= higherRange.firstIndex) {
			//console.log("no swap");
			var lower = lowerRange.found === true ? lowerRange.firstIndex : lowerRange.lastIndex;
			var higher = higherRange.found === true ? higherRange.lastIndex : higherRange.firstIndex;
		} else {
			//console.log("swap");
			var higher = lowerRange.found === true ? lowerRange.lastIndex : lowerRange.firstIndex;
			var lower = higherRange.found === true ? higherRange.firstIndex : higherRange.lastIndex;

		}

		//this happens iff the val1 to val2 range lies completely before or completely after the range of values in sArr
		if(higher < lower) {
			return false;
		} else {
			return {"firstIndex": lower, "lastIndex": higher};
		}
	}

	exports.search = {};
	exports.search.linearSearch = linearSearch;
	exports.search.binarySearch = binarySearch;
	exports.search.findIndexRangeForVal = findIndexRangeForVal;
	exports.search.findIndexRangeForValRange = findIndexRangeForValRange;

})(typeof exports === 'undefined' ? this.jsonDatabase : exports);


