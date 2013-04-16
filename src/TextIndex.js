//TextIndex.js

//Indexes by word. Not the only way to think of text, of course.

/*
var ss = [{text: "Boring sentences are rather as useful as interesting ones."},
			  {text: "Boredom is not, of course, what this is really about."},
			  {text: "Though, I do think that writing tests is rather boring"}],
	itc = new jsonDatabase.TextIndex(ss, { keyExtractor: function(o) { return o.text; } });

	itc.getIndicesForString("rather bori")

	itc.getIndicesForString("bori rather")
*/

;(function (exports) {

	var jsonDatabase;
	if(typeof module !== 'undefined' && module.exports) { // node
		jsonDatabase = {};
		jsonDatabase.sets = require('./sets').sets;
		jsonDatabase.Trie = require('./trie').Trie;
		jsonDatabase.stopWords = require('./stopwords').stopWords;
	} else { // browser
		jsonDatabase = window.jsonDatabase;
	}
	
	//opts = extractKeyFn, tokenizer, wordNormalizer, stopWords
	function TextIndex(arr, opts) {		

		var opts = opts || {};

		this.keyExtractor = opts.keyExtractor || function(o) { return o; };

		this.wordNormalizer = opts.wordNormalizer || function(s) { return s.toLowerCase(); };

		this.tokenizer = opts.tokenizer || 
				function(s) {
			  		return s.split(/\b\s+/)
			  				.map(function(w) { return w.replace(/^[,.;:]*/,"").replace(/[,.;:]*$/,""); });
				};

		this.stopWords = opts.stopWords || jsonDatabase.stopWords.getStopWords("en");

		this.t = new jsonDatabase.Trie();

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

	TextIndex.prototype.select = function() {
		var str = arguments[0];
		var words = this.tokenizer(str).map(this.wordNormalizer);
		for(var result = [], i = 0, n = words.length; i < n; i++) {
			if(this.stopWords[words[i]] !== true) {
				result.push(this.t.findWord(words[i], i !== n - 1).sort(function(a,b) { return a - b}));
			}
		}
		result.sort(function(a,b) { return a.length - b.length; });
		return result.reduce(jsonDatabase.sets.intersection);
	}

	exports.TextIndex = TextIndex;

})(typeof exports === 'undefined' ? this.jsonDatabase : exports);


