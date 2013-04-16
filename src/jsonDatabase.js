//jsonDatabase.js

;(function(exports) {

  var jsonDatabase;
  if(typeof module !== 'undefined' && module.exports) { // node

    jsonDatabase = {};
    jsonDatabase.csvToJsonArray = require('./csv-utils.js').csvToJsonArray;
    jsonDatabase.Dataset = require('./Dataset').Dataset;
    jsonDatabase.PreparedStatement = require('./PreparedStatement').PreparedStatement;
    jsonDatabase.Codebook = require('./Codebook').Codebook;
    jsonDatabase.sets = require('./sets').sets;
    jsonDatabase.Trie = require('./Trie').Trie;
    jsonDatabase.NumberIndex = require('./NumberIndex').NumberIndex;
    jsonDatabase.DateIndex = require('./DateIndex').DateIndex;
    jsonDatabase.TextIndex = require('./TextIndex').TextIndex;
    jsonDatabase.stopWords = require('./stopwords').stopWords;  //won't this be required by IndexedTextColumn?
    jsonDatabase.CategoryIndex = require('./CategoryIndex').CategoryIndex;
    jsonDatabase.search = require('./search').search;
    jsonDatabase.Trie = require('./trie').Trie; //??
    jsonDatabase.closureUtils = require('./closure-generation-utils').closureUtils; //??

  } else { // browser
    jsonDatabase = {};
  }

  exports.jsonDatabase = jsonDatabase;
})(typeof exports === 'undefined' ? this : exports);
