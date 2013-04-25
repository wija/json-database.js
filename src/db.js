//db.js

;(function(exports) {

  var db;
  if(typeof module !== 'undefined' && module.exports) { // node

    db = {};
    //db.csvToJsonArray = require('./csv-utils.js').csvToJsonArray;
    db.Collection = require('./Collection').Collection;
    db.intersection = require('./operators').intersection;
    db.union = require('./operators').union;
    db.QueryTemplate = require('./QueryTemplate').QueryTemplate;
    db.qtField = require('./QueryTemplate').qtField;
    db.qtIntersect = require('./QueryTemplate').qtIntersect;
    db.qtUnion = require('./QueryTemplate').qtUnion;
    //db.Codebook = require('./Codebook').Codebook;
    db.sets = require('./sets').sets;
    db.Trie = require('./Trie').Trie;
    db.NumberIndex = require('./NumberIndex').NumberIndex;
    db.DateIndex = require('./DateIndex').DateIndex;
    db.TextIndex = require('./TextIndex').TextIndex;
    db.stopWords = require('./stopwords').stopWords;
    db.CategoryIndex = require('./CategoryIndex').CategoryIndex;
    db.search = require('./search').search;

  } else { // browser
    db = {};
  }

  exports.db = db;
  
})(typeof window === 'undefined' ? exports : window);
