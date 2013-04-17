//trie.js

/*

	Stores strings and associated data, permitting efficient retrieval by word or prefix.

	To construct a new trie:

	var t = new Trie()

	To add a word and the object/number/string with which it is associated:
	
	s1 = "hello world"
	s2 = "bye bye world"
	t.addWord("hello", s1);
	t.addWord("world", s1);
	t.addWord("bye", s2);
	t.addWord("world", s2);
	
	addWord returns the trie object on which it was called (here, t).  (Note, however, that it also
	mutates that object.)

	To retrieve (all of) the data associated with a word:

	t.findWord("bye", true)		//["bye bye world"]
	t.findWord("world", true)	//["hello world", "bye bye world"]
	t.findWord("hell", true)	//[]
	t.findWord("hell", false)	//["hello world"]

	The second argument to findWord determines whether only exact matches (true) or prefix
	matches (false) are returned.

	To delete a particular word (as associated with a particular datum): 

	t.deleteWord("hello", "hello world")	//true
	t.findWord("hello", true)				//[]
	t.findWord("world", true)				//["hello world", "bye bye world"]
	t.deleteWord("wor", "hello world")		//false
	t.deleteWord("world", "hello world")	//true
	t.findWord("world", true)				//["bye bye world"]
	
	Note that deletion is only provided for exact matches, not for prefix matches.

*/

;(function(exports) {

	function Trie() {
		this.t = {};
		return this;
	}

	Trie.prototype.addWord = function(w, o) {
		function aw(t, w, o) {
			if(w === "") {
				if(t["objRefs"]) { 
					t["objRefs"].push(o); 
				} else { 
					t["objRefs"] = [o]; 
				}
			} else if(t[w[0]]) {
				aw(t[w[0]], w.slice(1), o);
			} else {
				t[w[0]] = aw({}, w.slice(1), o);
			}
			return t;
		}
		aw(this.t, w, o);
		return this;
	}

	Trie.prototype.deleteWord = function(w, o) {

		function tdw(t, w, parentTrieStack) {
			if(w === "") {
				if(t["objRefs"] && t["objRefs"].indexOf(o) !== -1) {

					t["objRefs"].splice(t["objRefs"].indexOf(o), 1);
					
					//fully deletes by working back up the tree using the stack built on the way down 
					if(t["objRefs"].length === 0) {
						delete t["objRefs"];
						parentTrieStack.push(t);
						for(var i = parentTrieStack.length; i > 0; i--) {  // i > 0 to avoid trying to delete the top
							var count = 0; for(var p in parentTrieStack[i]) { count++; if(count !== 0) break; }
							if(count === 0) { delete parentTrieStack[i - 1][fullWord[i - 1]]; } 
						}
					}
					return true; 
				} else {
					return false;
				}
			} else if (t[w[0]]) {
				parentTrieStack.push(t);
				return tdw(t[w[0]], w.slice(1), parentTrieStack);
			} else {
				return false;
			}
		}
		var fullWord = w;
		return tdw(this.t, w, []);
	}

	Trie.prototype.findWord = function(w, exactp) {

		function fw(t, w, exactp) {
			if(!w) {
				return exactp 
						? t["objRefs"] 
							? t["objRefs"] 
							: []
						: __getObjRefsBeneath(t);
			} else if(t[w[0]]) {
				return fw(t[w[0]], w.slice(1), exactp);
			} else {
				return [];
			}
		}

		function __getObjRefsBeneath(t) {
			var acc = t["objRefs"] ? t["objRefs"]  : [];
			for(var c in t) {
				if(t.hasOwnProperty(c) && c.length === 1) {
					acc = acc.concat(__getObjRefsBeneath(t[c]));
				}
			}
			return acc;
		}

		function removeDups(sArr) {
			var result = [],
				last = undefined;
			for(var i = 0, n = sArr.length; i < n; i++) {
				if(!(sArr[i] === last)) result.push(sArr[i]);
				last = sArr[i];
			}
			return result;
		}

		//The assumption here that the associated data are numbers is problematic.
		//And it's not clear that removeDups should remain here.
		return removeDups(fw(this.t, w, exactp).sort(function(a,b) { return a - b; }));
	}

	exports.Trie = Trie;
 
})(typeof exports === 'undefined' ? this.db : exports);
