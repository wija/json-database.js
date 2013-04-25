//QueryTemplate.js

;(function (exports) {

    var db;
    if(typeof module !== 'undefined' && module.exports) { // node
        db = {};
        db.sets = require('./sets').sets;
        db.Collection = require('./Collection').Collection;
        db.union = require('./operators').union;
        db.intersection = require('./operators').intersection;
    } else { // browser
        db = window.db;
    }

	function QueryTemplate(dataset, stmt, callback) {

		this.dataset = dataset;
		this.callback = callback;

		this.flattenedStmt = [].concat.apply([],stmt);
		
		this.cache = [];
		this.paramNameToCacheMap = {};
		this.paramNameToColumnNameMap = {};

		for(var i = 0, n = this.flattenedStmt.length; i < n; i++) {
			this.cache[i] = new db.Collection([], this.dataset);
			if(this.flattenedStmt[i].type === "whereClause") {
				this.paramNameToCacheMap[this.flattenedStmt[i].name] = i; 
				this.paramNameToColumnNameMap[this.flattenedStmt[i].name] = this.flattenedStmt[i].name;
			}
		}
	}

	function __psify(fn, name) { return function() { return [].slice.call(arguments).concat(arguments.length).concat({"type": "operator", "name": name, "def": fn}); }; }
	var qtIntersect = __psify(db.intersection, "intersection");
	var qtUnion = __psify(db.union, "union");
	function qtField(name)  { return {"type": "whereClause", "name": name };  }

	QueryTemplate.prototype.evaluate = function(name, argArr) {

		var iWhereClause = this.paramNameToCacheMap[name],
			stack = [];

		for(var i = 0, n = this.flattenedStmt.length; i < n; i++) {

			var e = this.flattenedStmt[i];

			if(this.debug) {
				console.log("Code:  ", this.flattenedStmt.slice(0,i), ",**", this.flattenedStmt[i].type === "operator" ? this.flattenedStmt[i].name : this.flattenedStmt[i], "**,", this.flattenedStmt.slice(i+1));
				console.log("Stack: ", stack.slice(0,stack.length-1), ",**", stack[stack.length-1]);
				console.log("Cache: ", this.cache[i]);
				console.log("\n");
			}

			switch(e.type) {

				case "whereClause":
					if(i === iWhereClause) {
						var whereClauseVal = this.dataset.where(name, argArr);  
						stack.push({"value": whereClauseVal, "new": true });  //whereClauseVal.result ==> whereClauseVal
						this.cache[i] = whereClauseVal;  //note that whereClauseVal can be false
					} else {
						stack.push({"value": this.cache[i], "new": false })
					}
					break;

				case "argCount":    //Not actually used - see __psify - should actually wrap argCount into the operator objects
					stack.push(e);
					break;
			
				case "operator":
					for(var args = [], allCached = true, ai = 0, an = stack.pop(); ai < an; ai++) {
						var v = stack.pop();
						if(v.new) allCached = false;
						args.push(v.value);
					}

					if(allCached) {
						if(this.debug || this.debugRecalcs) console.log(this.flattenedStmt[i].name, " took value from cache.");
						stack.push({"value": this.cache[i], "new": false});
					} else {
						if(this.debug || this.debugRecalcs) console.log(this.flattenedStmt[i].name, " recalculated value.");
						this.cache[i] = e.def.apply(null, args); //this.cache[i] = e.def.call(this, args);
						stack.push({"value": this.cache[i], "new":true });
					}
					break;
			
				default:  //see case "argCount": - once made operational, should restore throwing errors here

					stack.push(e);	//this should be an argument count 
			}
		}

		var n = stack.pop().value.get();
		//console.log(n);

		//this.cachedRetVal = db.lazyRowConstruction.getCombinedRowIterator({"result": n}, this.dataset);
		
		if(typeof this.callback === "undefined") {
			return n;
		} else {
			this.callback(n);
		}
	}

	exports.QueryTemplate = QueryTemplate;
	exports.qtField = qtField;
	exports.qtIntersect = qtIntersect;
	exports.qtUnion = qtUnion;

})(typeof exports === 'undefined' ? this.db : exports);

