//CategoryIndex.js

;(function(exports) {

	var db;
	if(typeof module !== 'undefined' && module.exports) { // node
		db = {};
		db.sets = require('./sets').sets;
	} else { // browser
		db = window.db;
	}

	//add a converter fn (a la codebooks)
	function CategoryIndex(arr, opts) {
		
		var opts = opts || {};
		this.keyExtractor = opts.keyExtractor || function(o) { return o; };

		this.dict = {};
		this.pastResult = {"result": [], "valArr": []};

		for(var i = 0, n  = arr.length; i < n; i++) {
			var key = this.keyExtractor(arr[i]);
			if(this.dict[key]) { 
				this.dict[key].push(i);
			} else {
				this.dict[key] = [i];
			}
		}

		return this;
	}

	//was function(pastResult, valArr)
	CategoryIndex.prototype.select = function(queryObject) {

		if(queryObject.any) {
			
			var valArr = queryObject.any.sort();   //note that valArr, valsRemoved, valsAdded concern *arguments*

			var cs = db.sets.complements(valArr, this.pastResult.valArr);
			var valsRemoved = cs[0], valsAdded = cs[1];

			//these can be folds

			var exit = [];
			for(var i = 0, n = valsRemoved.length; i < n; i++)
				if(this.dict[valsRemoved[i]])
					exit = db.sets.union(this.dict[valsRemoved[i]], exit);
			
			var enter = [];
			for(var i = 0, n = valsAdded.length; i < n; i++)
				if(this.dict[valsAdded[i]])
					enter = db.sets.union(this.dict[valsAdded[i]], enter);

			this.pastResult = 
				{"result": db.sets.union(enter, db.sets.complement(exit, this.pastResult.result)), 
				 "valArr": valArr};

			return this.pastResult.result;
		}
	}

	CategoryIndex.prototype.getValues = function() {
		return Object.keys(this.dict);
	}

	exports.CategoryIndex = CategoryIndex;

})(typeof exports === 'undefined' ? this.db : exports);

