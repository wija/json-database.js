//Dataset.js

//completionCallback = function() { console.log("done"); }

;(function (exports) {

    var jsonDatabase;
    if(typeof module !== 'undefined' && module.exports) { // node
        jsonDatabase = {};
        jsonDatabase.sets = require('./sets').sets;
    } else { // browser
        jsonDatabase = window.jsonDatabase;
    }

    function Dataset(jsonArray, columnMap, completionCallback) {
              	
        this.columnsObj = {};
        this.jsonArray = jsonArray;

        for(var datum in columnMap) {
            if(columnMap.hasOwnProperty(datum)) {
                //generate the optional keyExtractor functions
                this.columnsObj[datum] = new columnMap[datum].columnType(jsonArray, {keyExtractor: function(o) { return o[datum]; }});
            }
        }
       	
        //return this;

        completionCallback(this);   //not entirely comfortable with this being a passed value
    }
    
    Dataset.prototype.where = function(columnName, valArr) {
    	return this.columnsObj[columnName].select.apply(this.columnsObj[columnName], valArr);	
    }

    Dataset.prototype.and = function() {
        var whereArrs = [].slice.call(arguments);
        return whereArrs.sort(function(a,b) { return a.length - b.length; })
                        .reduce(jsonDatabase.sets.intersection);
    }

    Dataset.prototype.or = function() {
        var whereArrs = [].slice.call(arguments);
        return whereArrs.reduce(jsonDatabase.sets.union);
    }

    Dataset.prototype.toJSON = function(indexArr) {
        var result = [];
        for(var i = 0, n = indexArr.length; i < n; i++) {
            result.push(this.jsonArray[indexArr[i]]);
        }
        return result;
    }

    exports.Dataset = Dataset;

})(typeof exports === 'undefined' ? this.jsonDatabase : exports);

