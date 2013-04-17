//operators.js

;(function (exports) {

    var db;
    if(typeof module !== 'undefined' && module.exports) { // node
        db = {};
        db.sets = require('./sets').sets;
        db.Collection = require('./Collection').Collection;
    } else { // browser
        db = window.db;
    }

    function intersection() {
        var whereObjs = [].slice.call(arguments);
        var whereArrs = whereObjs.map(function(o) { return o.resultIndices; });
        if(whereObjs.length === 0) {
            throw "intersection called without any arguments";
        } else if(!allSameDataSource(whereObjs)) {
            throw "intersection called with datasets referring to a different underlying data array";
        } else {
            return new db.Collection(whereArrs.sort(function(a,b) { return a.length - b.length; })
                                        .reduce(db.sets.intersection),
                               arguments[0]);
        }
    }

    function union() {
        var whereObjs = [].slice.call(arguments);
        var whereArrs = whereObjs.map(function(o) { return o.resultIndices; });
        if(whereObjs.length === 0) {
            throw "union called without any arguments";
        } else if(!allSameDataSource(whereObjs)) {
            throw "union called with datasets referring to a different underlying data array";
        } else {
            return new db.Collection(whereArrs.reduce(db.sets.union), arguments[0]);
        }
    }

    function allSameDataSource(datasetArr) {
        return datasetArr.map(function(o) { return o.completeDataArray; })
                         .reduce(function(a,b) {return a === b ? a : false; });
    }

    exports.intersection = intersection;
    exports.union = union;

})(typeof exports === 'undefined' ? this.db : exports);


