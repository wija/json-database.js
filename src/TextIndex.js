//TextIndex.js

;(function (exports) {

	var db;
	if(typeof module !== 'undefined' && module.exports) { // node
		db = {};
		db.sets = require('./sets').sets;
		db.Trie = require('./trie').Trie;
		db.stopWords = require('./stopwords').stopWords;
	} else { // browser
		db = window.db;
	}
	
	//opts = extractKeyFn, tokenizer, wordNormalizer, stopWords
	function TextIndex(arr, opts) {		

		this.completeDataArray = arr;

		var opts = opts || {};

		this.keyExtractor = opts.keyExtractor || function(o) { return o; };

		this.wordNormalizer = opts.wordNormalizer || function(s) { return s.toLowerCase(); };

		this.tokenizer = opts.tokenizer || 
				function(s) {
			  		return s.split(/\b\s+/)
			  				.map(function(w) { return w.replace(/^[,.;:]*/,"").replace(/[,.;:]*$/,"").replace(/\|/g," "); });
				};

		this.stopWords = opts.stopWords || db.stopWords.getStopWords("en");

		this.t = new db.Trie();

		for(var i = 0, n = arr.length; i < n; i++) {
			var words = this.tokenizer(this.keyExtractor(arr[i]));
			for(var j = 0, m = words.length; j < m; j++) {
				var nw = this.wordNormalizer(words[j]);
				if(this.stopWords[nw] !== true) {
					this.t.addWord(nw, i);
				}
			}
		}

		return this;
	}

	TextIndex.prototype.select = function(queryObject) {

		if(queryObject.autoCompleteSearch) {

			var str = queryObject.autoCompleteSearch;
			var words = this.tokenizer(str).map(this.wordNormalizer);
			for(var result = [], i = 0, n = words.length; i < n; i++) {
				if(this.stopWords[words[i]] !== true) {
					result.push(this.t.findWord(words[i], i !== n - 1).sort(function(a,b) { return a - b}));
				}
			}
			result.sort(function(a,b) { return a.length - b.length; });
			return result.reduce(db.sets.intersection);

		}
	}

	exports.TextIndex = TextIndex;

})(typeof exports === 'undefined' ? this.db : exports);


