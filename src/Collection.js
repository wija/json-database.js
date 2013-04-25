//Collection.js

;(function (exports) {

    function Collection(resultIndices, datasetObj) {
        this.resultIndices = resultIndices || [];
        this.indexRegistry = datasetObj ? datasetObj.indexRegistry : {};
        this.completeDataArray = datasetObj ? datasetObj.completeDataArray : [];
    }

    Collection.prototype.loadData = function(completeDataArray, indexMap, completionCallback) {
        this.indexRegistry = {};
        this.completeDataArray = completeDataArray;
        this.resultIndices = "just loaded";

        for(var field in indexMap) {
            if(indexMap.hasOwnProperty(field)) {
                var opts = typeof indexMap[field].opts === "undefined" ? {} : indexMap[field].opts;
                if(typeof opts.keyExtractor === "undefined") {
                    opts.keyExtractor = function(o) { return o[field]; }
                }
                this.indexRegistry[field] = new indexMap[field].index(completeDataArray, opts);
            }
        }

        return this;
    }

    Collection.prototype.where = function(fieldName, queryObject) {
        
        var indexObj = this.indexRegistry[fieldName];
        
        if(indexObj && !queryObject.selectAll && !queryObject.predicate) {

            return new Collection(indexObj.select(queryObject), this);
        
        } else if(queryObject.predicate) {

            //how to properly deal with keyExtractor here?
            var keyExtractor = function(o) { return o[fieldName]; };
            var result = [];
            for(var i = 0, n = this.completeDataArray.length; i < n; i++) {
                if(queryObject.predicate(keyExtractor(this.completeDataArray[i]))) {
                    result.push(i);
                } 
            }
            return new Collection(result, this);

        } else if(queryObject.selectAll) {

            //this is a touch absurd
            var result = [];
            for(var i = 0, n = this.completeDataArray.length; i < n; i++) {
                result.push(i); 
            }
            return new Collection(result, this);
        }
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

    exports.Collection = Collection;

})(typeof exports === 'undefined' ? this.db : exports);

