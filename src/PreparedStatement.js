//PreparedStatement.js

//"prepared statement" can just use a hash from names to returned results

/*
	ps = new jsonDatabase.PreparedStatement.PreparedStatement(
			dataset, 
			jsonDatabase.PreparedStatement.psAnd(
				jsonDatabase.PreparedStatement.psWhere("etype","etype"), 
				jsonDatabase.PreparedStatement.psWhere("countryname","countryname"),
				jsonDatabase.PreparedStatement.psWhere("startdate","startdate"),
				jsonDatabase.PreparedStatement.psWhere("issuenote","issuenote")
				),
			function(resultObj) { 
				cancelAnimationFrame(rafId); 
				redrawTable("dataTable", resultObj);
			});

	ps = new jsonDatabase.PreparedStatement.PreparedStatement(
			dataset, 
			jsonDatabase.PreparedStatement.psAnd("etype", "countryname", "startdate", "issuenote"),
			function(resultObj) { 
				cancelAnimationFrame(rafId); 
				redrawTable("dataTable", resultObj);
			});

*/

;(function (exports) {

    var jsonDatabase;
    if(typeof module !== 'undefined' && module.exports) { // node
        jsonDatabase = {};
        jsonDatabase.sets = require('./sets').sets;
        jsonDatabase.Dataset = require('./Dataset').Dataset;
        //jsonDatabase.lazyRowConstruction = require('./lazyRowConstruction').lazyRowConstruction;
    } else { // browser
        jsonDatabase = window.jsonDatabase;
    }

	function PreparedStatement(dataset, stmt, callback) {

		this.dataset = dataset;
		this.callback = callback;

		this.flattenedStmt = [].concat.apply([],stmt);
		
		this.cache = [];
		this.paramNameToCacheMap = {};
		this.paramNameToColumnNameMap = {};

		for(var i = 0, n = this.flattenedStmt.length; i < n; i++) {
			this.cache[i] = new jsonDatabase.Dataset([], this.dataset);
			if(this.flattenedStmt[i].type === "whereClause") {
				this.paramNameToCacheMap[this.flattenedStmt[i].name] = i; 
				this.paramNameToColumnNameMap[this.flattenedStmt[i].name] = this.flattenedStmt[i].name;
			}
		}
	}

	//NOTE HARDCODING OF "DATASET" BELOW
	//can I actually have "select" interpret the same stmts?
	//can also just have a table of fns to be looked up -- but that would take away the nice interface
	function __psify(fn, name) { return function() { return [].slice.call(arguments).concat(arguments.length).concat({"type": "operator", "name": name, "def": fn}); }; }
	var psIntersection = __psify(jsonDatabase.Dataset.prototype.intersection, "intersection");
	var psUnion = __psify(jsonDatabase.Dataset.prototype.union, "union");
	function psWhere(name, columnName)  { return {"type": "whereClause", "name": name, "columnName": columnName };  }

	PreparedStatement.prototype.evaluate = function(name, argArr) {

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

		//this.cachedRetVal = jsonDatabase.lazyRowConstruction.getCombinedRowIterator({"result": n}, this.dataset);
		
		if(typeof this.callback === "undefined") {
			return n;
		} else {
			this.callback(n);
		}
	}

	exports.PreparedStatement = {};
	exports.PreparedStatement.PreparedStatement = PreparedStatement;
	exports.PreparedStatement.psWhere = psWhere;
	exports.PreparedStatement.psIntersection = psIntersection;
	exports.PreparedStatement.psUnion = psUnion;

})(typeof exports === 'undefined' ? this.jsonDatabase : exports);

