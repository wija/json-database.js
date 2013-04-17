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

    function Dataset(resultIndices, datasetObj) {
        this.resultIndices = resultIndices || [];
        this.columnsObj = datasetObj ? datasetObj.columnsObj : {};
        this.completeDataArray = datasetObj ? datasetObj.completeDataArray : [];
    }

    Dataset.prototype.loadData = function(completeDataArray, columnMap, completionCallback) {
        this.columnsObj = {};
        this.completeDataArray = completeDataArray;
        this.resultIndices = "just loaded";

        for(var datum in columnMap) {
            if(columnMap.hasOwnProperty(datum)) {
                this.columnsObj[datum] = new columnMap[datum].columnType(completeDataArray, {keyExtractor: function(o) { return o[datum]; }});
            }
        }

        return this;

        //completionCallback(this);   //not entirely comfortable with this being a passed value
    }

    Dataset.prototype.where = function(columnName, valArr) {
        var colObj = this.columnsObj[columnName];
    	return new Dataset(colObj.select.apply(colObj, valArr), this);	
    }

    Dataset.prototype.intersection = function() {
        var whereObjs = [].slice.call(arguments);
        var whereArrs = whereObjs.map(function(o) { return o.resultIndices; });
        if(whereObjs.length === 0) {
            throw "intersection called without any arguments";
        } else if(!Dataset.prototype.allSameDataSource(whereObjs)) {
            throw "intersection called with datasets referring to a different underlying data array";
        } else {
            return new Dataset(whereArrs.sort(function(a,b) { return a.length - b.length; })
                                        .reduce(jsonDatabase.sets.intersection),
                               arguments[0]);
        }
    }

    Dataset.prototype.union = function() {
        var whereObjs = [].slice.call(arguments);
        var whereArrs = whereObjs.map(function(o) { return o.resultIndices; });
        if(whereObjs.length === 0) {
            throw "union called without any arguments";
        } else if(!Dataset.prototype.allSameDataSource(whereObjs)) {
            throw "union called with datasets referring to a different underlying data array";
        } else {
            return new Dataset(whereArrs.reduce(jsonDatabase.sets.union), arguments[0]);
        }
    }

    Dataset.prototype.allSameDataSource = function(datasetArr) {
        return datasetArr.map(function(o) { return o.completeDataArray; })
                         .reduce(function(a,b) {return a === b ? a : false; });
    }

    Dataset.prototype.get = function() {
        if(this.resultIndices === "just loaded") {
            return this.completeDataArray;
        } else {
            var result = [];
            for(var i = 0, n = this.resultIndices.length; i < n; i++) {
                result.push(this.completeDataArray[this.resultIndices[i]]);
            }
            return result;
        }
    }

    //test of two datasets referrring to same completeDataArray

    exports.Dataset = Dataset;

})(typeof exports === 'undefined' ? this.jsonDatabase : exports);

