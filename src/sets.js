//sets.js

;(function(exports) {

	//the arrays passed must be sorted in ascending order
	function intersection(sArr1, sArr2) {
		
		var i1 = 0,
			i2 = 0, 
			len1 = sArr1.length, 
			len2 = sArr2.length, 
			result = [];
		
		while(i1 < len1 && i2 < len2) {
			if(sArr1[i1] === sArr2[i2]) {
				result.push(sArr1[i1]);
				i1++; 
				i2++;
			} else if(sArr1[i1] < sArr2[i2]) {
				i1++;
			} else {
				i2++;
			}
		}

		return result; 
	}

	//must be passed arrays sorted in ascending order
	function union(sArr1, sArr2) {
		
		var i1 = 0,
			i2 = 0, 
			len1 = sArr1.length, 
			len2 = sArr2.length, 
			result = [];
		
		while(i1 < len1 && i2 < len2) {
			if(sArr1[i1] === sArr2[i2]) {
				result.push(sArr1[i1]);
				i1++; 
				i2++;
			} else if(sArr1[i1] < sArr2[i2]) {
				result.push(sArr1[i1]);
				i1++;
			} else { // sArr1[i1] > sArr2[i2]
				result.push(sArr2[i2]);
				i2++;
			}
		}

		if(i2 < len2) { 
			for(; i2 < len2; i2++) { 
				result.push(sArr2[i2]); 
			}
		} else if (i1 < len1) {
			for(; i1 < len1; i1++) { 
				result.push(sArr1[i1]); 
			}
		}

		return result; 
	}

	//returns elements in sArr2 that are not in sArr1
	function complement(sArr1, sArr2) {

		var i1 = 0,
			i2 = 0, 
			len1 = sArr1.length, 
			len2 = sArr2.length, 
			result = [];
		
		while(i1 < len1 && i2 < len2) {
			if(sArr1[i1] === sArr2[i2]) {
				i1++; 
				i2++;
			} else if(sArr1[i1] < sArr2[i2]) {
				i1++;
			} else {  //sArr1[i1] > sArr2[i2]
				result.push(sArr2[i2]);
				i2++;
			}
		}

		for( ;i2 < len2; i2++) {
			result.push(sArr2[i2]);
		}

		return result; 

	}

	//returns [elements in sArr2 not in sArr1, elements in sArr1 not in sArr2]
	function complements(sArr1, sArr2) {

		var i1 = 0,
			i2 = 0, 
			len1 = sArr1.length, 
			len2 = sArr2.length, 
			result1 = [],
			result2 = [];
		
		while(i1 < len1 && i2 < len2) {
			if(sArr1[i1] === sArr2[i2]) {
				i1++; 
				i2++;
			} else if(sArr1[i1] < sArr2[i2]) {
				result2.push(sArr1[i1]);
				i1++;
			} else {  //sArr1[i1] > sArr2[i2]
				result1.push(sArr2[i2]);
				i2++;
			}
		}

		for( ;i2 < len2; i2++) {
			result1.push(sArr2[i2]);
		}

		for( ;i1 < len1; i1++) {
			result2.push(sArr1[i1]);
		}
		
		return [result1, result2]; 

	}

	exports.sets = {};
	exports.sets.intersection = intersection;
	exports.sets.union = union;
	exports.sets.complement = complement;
	exports.sets.complements = complements;

})(typeof exports === 'undefined' ? this.db : exports);

