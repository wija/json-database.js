//Collection.js

//completionCallback = function() { console.log("done"); }

;(function (exports) {

    function Collection(resultIndices, datasetObj) {
        this.resultIndices = resultIndices || [];
        this.columnsObj = datasetObj ? datasetObj.columnsObj : {};
        this.completeDataArray = datasetObj ? datasetObj.completeDataArray : [];
    }

    Collection.prototype.loadData = function(completeDataArray, columnMap, completionCallback) {
        this.columnsObj = {};
        this.completeDataArray = completeDataArray;
        this.resultIndices = "just loaded";

        for(var field in columnMap) {
            if(columnMap.hasOwnProperty(field)) {
                var opts = typeof columnMap[field].opts === "undefined" ? {} : columnMap[field].opts;
                if(typeof opts.keyExtractor === "undefined") {
                    opts.keyExtractor = function(o) { return o[field]; }
                }
                this.columnsObj[field] = new columnMap[field].index(completeDataArray, opts);
            }
        }

        return this;
    }

    Collection.prototype.where = function(columnName, valArr) {
        var colObj = this.columnsObj[columnName];
    	return new Collection(colObj.select(valArr), this);	
    }

    Collection.prototype.get = function() {
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

    exports.Collection = Collection;

})(typeof exports === 'undefined' ? this.db : exports);

