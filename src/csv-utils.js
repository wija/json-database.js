//csv-utils.js
/*

                cb =  { 
                     "etype": {
                                 '1' : 'Organized Demonstration',
                                 '2' : 'Spontaneous Demonstration',
                                 '3' : 'Organized Violent Riot',
                                 '4' : 'Spontaneous Violent Riot',
                                 '5' : 'General Strike',
                                 '6' : 'Limited Strike',
                                 '7' : 'Pro-Government Violence (Repression)',
                                 '8' : 'Anti-Government Violence',
                                 '9' : 'Extra-government Violence',
                                 '10' : 'Intra-government Violence'
                              }
                  }

db.csvToJsonArray("./SCAD_2.0_downloadable_version_v2.csv", cb, function(d) { tstArr = d; })

*/

;(function(exports) {

    var db;
    if(typeof module !== 'undefined' && module.exports) { // node
        db = {};
        db.Codebook = require('./Codebook').Codebook;
        d3 = require('d3');
    } else { // browser
        db = window.db;
    }

    function csvToJsonArray(datasetText, codebook, callback) {
        var cb = new db.Codebook(codebook);
        var parsedCSV = d3.csv.parse(datasetText),
            ks = cb.getKeys();
        for(var j = 0, m = ks.length; j < m; j++) {
            var header = ks[j];
            for(var i = 0, n = parsedCSV.length; i < n; i++) {
                if(parsedCSV[i][header]) {
                    parsedCSV[i][header] = cb.lookupCode(header, parsedCSV[i][header]);
                }
            }
        }
        callback(parsedCSV);
    }

    exports.csvToJsonArray = csvToJsonArray;

})(typeof exports === 'undefined' ? this.db : exports);

